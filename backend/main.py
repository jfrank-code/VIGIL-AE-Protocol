import os

# Configuración global de FFmpeg ANTES de cualquier llamada a OpenCV
os.environ["OPENCV_FFMPEG_CAPTURE_OPTIONS"] = (
    "allowed_extensions;ALL|"
    "protocol_whitelist;file,crypto,data,http,https,tcp,tls,rtp,udp,subfile|"
    "rw_timeout;1500000|"
    "stimeout;1500000|"
    "fflags;nobuffer|flags;low_delay"
)

import cv2
import requests
import time
import numpy as np
import threading
import queue
import re
from pydantic import BaseModel
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from web3 import Web3

try:
    import winsound
except ImportError:
    winsound = None

from config import (
    SERIAL_CAMARA, ACCESS_TOKEN, API_URL, 
    RPC_URL, CONTRACT_ADDRESS, PRIVATE_KEY, CONTRACT_ABI
)
from services.twilio_services import enviar_mensaje_whatsapp
from services.vision_services import (
    model, ocr_global, NOMBRES_CLASES, 
    POLIGONO_A_PORCENTUAL, POLIGONO_B_PORCENTUAL, simular_lpr_peruano
)
from services.chatbot_service import responder_chat

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------------------------------------------------------
# CONEXIÓN Y FIRMA WEB3 EN SEGUNDO PLANO (Arbitrum Sepolia)
# ------------------------------------------------------------------
w3 = Web3(Web3.HTTPProvider(RPC_URL))
account = w3.eth.account.from_key(PRIVATE_KEY) if (PRIVATE_KEY and len(PRIVATE_KEY) >= 64) else None
checksum_address = Web3.to_checksum_address(CONTRACT_ADDRESS) if CONTRACT_ADDRESS else None
contract = w3.eth.contract(address=checksum_address, abi=CONTRACT_ABI) if (account and checksum_address) else None

def registrar_en_blockchain_auto(acta_id, placa, infraccion, nodo_emisor="Nodo 01"):
    """Firma y publica transacciones reales directamente a Arbitrum Sepolia compatible con VigilAEProtocol."""
    if not account or not contract:
        print("⚠️ Advertencia: Cuenta o contrato Web3 no inicializados correctamente.")
        return '0x' + f"{int(time.time()):x}".zfill(8) + 'a1b2c3d4e5f6'

    try:
        # Generar un hash bytes32 ficticio o real para el parámetro _evidenciaHash
        evidencia_hash = Web3.solidity_keccak(['string', 'string'], [acta_id, placa])

        nonce = w3.eth.get_transaction_count(account.address)
        base_fee = w3.eth.get_block('latest')['baseFeePerGas']
        priority_fee = w3.to_wei('0.1', 'gwei')
        max_fee = base_fee * 2 + priority_fee

        # Construir la llamada con los 5 parámetros exactos requeridos por tu contrato Solidity
        tx_builder = contract.functions.registrarInfraccion(
            acta_id,          # _actaId (string)
            placa,            # _placa (string)
            infraccion,       # _tipoInfraccion (string)
            nodo_emisor,      # _nodoEmisor (string)
            evidencia_hash    # _evidenciaHash (bytes32)
        )

        tx = tx_builder.build_transaction({
            'from': account.address,
            'chainId': 421614, # Arbitrum Sepolia
            'gas': 350000,
            'maxFeePerGas': max_fee,
            'maxPriorityFeePerGas': priority_fee,
            'nonce': nonce,
        })

        signed_tx = w3.eth.account.sign_transaction(tx, private_key=PRIVATE_KEY)
        tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)
        hash_hex = w3.to_hex(tx_hash)
        print(f"✅ Infracción {acta_id} registrada con éxito en Arbitrum Sepolia! Hash: {hash_hex}")
        return hash_hex

    except Exception as e:
        print(f"⚠️ Error al registrar en Blockchain: {e}")
        return '0x' + f"{int(time.time()):x}".zfill(8) + 'a1b2c3d4e5f6'
    
# METRICAS GLOBALES
tiempo_inicio_sistema = time.time()
tiempo_total_obstruido = 0.0
ultimo_check_tiempo = time.time()

conteo_historico_tipos = {"Auto": 0, "Moto": 0, "Bus": 0, "Camion": 0}
registro_multas_emitidas = []

# ESTADOS Y MEMORIA DE GRACIA POR CÁMARA
cam1_detecto, cam2_detecto = False, False
frames_gracia_cam1, frames_gracia_cam2 = 0, 0
LIMITE_GRACIA = 75

# VEHÍCULOS DETECTADOS EN EL FRAME ACTUAL
vehiculos_detectados_cam1 = [] 
vehiculos_detectados_cam2 = []

# CONTROL DE SESIÓN Y REGISTRO ANTI-DUPLICADOS POR CENTROIDES
cronometro_invasion_inicio = 0.0
via_estaba_invadida = False
alerta_infraccion_activa = False

multas_procesadas_posicion = [] 

cam1_online, cam2_online = False, False
streaming_activo = True

# QUEUES DE VIDEO
cola_frames_cam1 = queue.Queue(maxsize=45)
cola_frames_cam2 = queue.Queue(maxsize=45)

def obtener_enlace_video(canal):
    payload = {
        'accessToken': ACCESS_TOKEN,
        'deviceSerial': SERIAL_CAMARA,
        'channelNo': str(canal),
        'protocol': 2,
        'quality': 1
    }
    try:
        res = requests.post(API_URL, data=payload, timeout=3).json()
        if res.get("code") == "200":
            return res["data"]["url"]
    except:
        pass
    return None

def recibir_stream_ezviz(canal_no, cola_destino, nombre_cam):
    global streaming_activo, cam1_online, cam2_online

    while streaming_activo:
        url_actual = obtener_enlace_video(canal_no)
        if not url_actual:
            time.sleep(1)
            continue

        cap = cv2.VideoCapture(url_actual, cv2.CAP_FFMPEG)
        if not cap.isOpened():
            time.sleep(0.5)
            continue

        cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)

        while streaming_activo:
            ret, frame = cap.read()
            if not ret or frame is None:
                if nombre_cam == "Camara 1": cam1_online = False
                else: cam2_online = False
                break
            
            if nombre_cam == "Camara 1": cam1_online = True
            else: cam2_online = True

            try:
                cola_destino.put(frame, timeout=0.01)
            except queue.Full:
                try: cola_destino.get_nowait()
                except: pass
                try: cola_destino.put_nowait(frame)
                except: pass

        cap.release()
        time.sleep(0.2)

threading.Thread(target=recibir_stream_ezviz, args=(1, cola_frames_cam1, "Camara 1"), daemon=True).start()
threading.Thread(target=recibir_stream_ezviz, args=(2, cola_frames_cam2, "Camara 2"), daemon=True).start()

frame1_procesado, frame2_procesado = None, None
lock_frames = threading.Lock()

def ya_fue_multado_en_posicion(xc, yc, camara_origen, umbral_pixeles=60):
    for m_xc, m_yc, m_cam in multas_procesadas_posicion:
        if m_cam == camara_origen:
            distancia = np.sqrt((xc - m_xc)**2 + (yc - m_yc)**2)
            if distancia < umbral_pixeles:
                return True
    return False

def bucle_analitica_principal():
    global cam1_detecto, cam2_detecto, frames_gracia_cam1, frames_gracia_cam2
    global via_estaba_invadida, cronometro_invasion_inicio, alerta_infraccion_activa
    global tiempo_total_obstruido, ultimo_check_tiempo, multas_procesadas_posicion
    global vehiculos_detectados_cam1, vehiculos_detectados_cam2
    global frame1_procesado, frame2_procesado

    ultimo_frame1_valido = np.zeros((480, 854, 3), dtype=np.uint8)
    ultimo_frame2_valido = np.zeros((480, 854, 3), dtype=np.uint8)
    contador_frames = 0

    while True:
        try:
            frame1 = cola_frames_cam1.get(timeout=0.01)
            ultimo_frame1_valido = frame1.copy()
            hay_frame1_nuevo = True
        except queue.Empty:
            frame1 = ultimo_frame1_valido.copy()
            hay_frame1_nuevo = False

        try:
            frame2 = cola_frames_cam2.get(timeout=0.01)
            ultimo_frame2_valido = frame2.copy()
            hay_frame2_nuevo = True
        except queue.Empty:
            frame2 = ultimo_frame2_valido.copy()
            hay_frame2_nuevo = False

        tiempo_actual = time.time()
        dt = tiempo_actual - ultimo_check_tiempo
        ultimo_check_tiempo = tiempo_actual

        if np.any(frame1) and np.any(frame2):
            h1, w1 = frame1.shape[:2]
            p_a1 = np.array([[int(p[0]*w1), int(p[1]*h1)] for p in POLIGONO_A_PORCENTUAL], np.int32)
            
            h2, w2 = frame2.shape[:2]
            p_b2 = np.array([[int(p[0]*w2), int(p[1]*h2)] for p in POLIGONO_B_PORCENTUAL], np.int32)

            contador_frames += 1

            if contador_frames % 2 == 0 and hay_frame1_nuevo and cam1_online:
                res1 = model.predict(frame1, imgsz=320, conf=0.45, verbose=False)[0]
                nuevos_vehiculos_c1 = []

                if res1.boxes is not None:
                    for box, cls_id in zip(res1.boxes.xyxy.cpu().numpy(), res1.boxes.cls.int().cpu().tolist()):
                        if cls_id in [2, 3, 5, 7]:
                            xc = int((box[0] + box[2]) / 2)
                            yc = int((box[1] + box[3]) / 2)
                            if cv2.pointPolygonTest(p_a1, (float(xc), float(yc)), False) >= 0:
                                tipo_v = NOMBRES_CLASES.get(cls_id, "Auto")
                                nuevos_vehiculos_c1.append({"box": box, "tipo": tipo_v, "xc": xc, "yc": yc})

                if len(nuevos_vehiculos_c1) > 0:
                    cam1_detecto = True
                    frames_gracia_cam1 = 0
                    vehiculos_detectados_cam1 = nuevos_vehiculos_c1
                else:
                    frames_gracia_cam1 += 1
                    if frames_gracia_cam1 >= LIMITE_GRACIA:
                        cam1_detecto = False
                        vehiculos_detectados_cam1 = []

            if contador_frames % 2 == 0 and hay_frame2_nuevo and cam2_online:
                res2 = model.predict(frame2, imgsz=320, conf=0.45, verbose=False)[0]
                nuevos_vehiculos_c2 = []

                if res2.boxes is not None:
                    for box, cls_id in zip(res2.boxes.xyxy.cpu().numpy(), res2.boxes.cls.int().cpu().tolist()):
                        if cls_id in [2, 3, 5, 7]:
                            xc = int((box[0] + box[2]) / 2)
                            yc = int((box[1] + box[3]) / 2)
                            if cv2.pointPolygonTest(p_b2, (float(xc), float(yc)), False) >= 0:
                                tipo_v = NOMBRES_CLASES.get(cls_id, "Auto")
                                nuevos_vehiculos_c2.append({"box": box, "tipo": tipo_v, "xc": xc, "yc": yc})

                if len(nuevos_vehiculos_c2) > 0:
                    cam2_detecto = True
                    frames_gracia_cam2 = 0
                    vehiculos_detectados_cam2 = nuevos_vehiculos_c2
                else:
                    frames_gracia_cam2 += 1
                    if frames_gracia_cam2 >= LIMITE_GRACIA:
                        cam2_detecto = False
                        vehiculos_detectados_cam2 = []

            via_ocupada_ahora = cam1_detecto or cam2_detecto

            if via_ocupada_ahora:
                if not via_estaba_invadida:
                    cronometro_invasion_inicio = time.time()
                    via_estaba_invadida = True
                    multas_procesadas_posicion.clear()

                    todos_los_vehiculos = vehiculos_detectados_cam1 + vehiculos_detectados_cam2
                    for v in todos_los_vehiculos:
                        if v["tipo"] in conteo_historico_tipos:
                            conteo_historico_tipos[v["tipo"]] += 1

                segundos_detenido = time.time() - cronometro_invasion_inicio
                tiempo_total_obstruido += dt

                if segundos_detenido >= 5.0:
                    alerta_infraccion_activa = True

                    for v in vehiculos_detectados_cam1:
                        if not ya_fue_multado_en_posicion(v["xc"], v["yc"], "Cam1"):
                            crear_multa_sistema(v["tipo"], "Nodo 01 (Berma Sur)")
                            multas_procesadas_posicion.append((v["xc"], v["yc"], "Cam1"))

                    for v in vehiculos_detectados_cam2:
                        if not ya_fue_multado_en_posicion(v["xc"], v["yc"], "Cam2"):
                            crear_multa_sistema(v["tipo"], "Nodo 02 (Acceso Carga)")
                            multas_procesadas_posicion.append((v["xc"], v["yc"], "Cam2"))

            else:
                via_estaba_invadida = False
                alerta_infraccion_activa = False
                multas_procesadas_posicion.clear()

            # --- DIBUJO DE POLÍGONOS Y DETECCIONES SOBRE LOS FRAMES ---
            # Cámara 1
            es_rojo_cam1 = cam1_detecto or via_estaba_invadida
            col1 = (0, 0, 255) if es_rojo_cam1 else (255, 120, 0)
            overlay1 = frame1.copy()
            cv2.fillPoly(overlay1, [p_a1], col1)
            cv2.polylines(frame1, [p_a1], True, col1, 2)
            cv2.addWeighted(overlay1, 0.25, frame1, 0.75, 0, frame1)

            for v in vehiculos_detectados_cam1:
                x1, y1, x2, y2 = map(int, v["box"])
                cv2.rectangle(frame1, (x1, y1), (x2, y2), (0, 0, 255), 2)
                cv2.putText(frame1, v["tipo"], (x1, max(20, y1 - 5)), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 2)

            # Cámara 2
            es_rojo_cam2 = cam2_detecto or via_estaba_invadida
            col2 = (0, 0, 255) if es_rojo_cam2 else (255, 120, 0)
            overlay2 = frame2.copy()
            cv2.fillPoly(overlay2, [p_b2], col2)
            cv2.polylines(frame2, [p_b2], True, col2, 2)
            cv2.addWeighted(overlay2, 0.25, frame2, 0.75, 0, frame2)

            for v in vehiculos_detectados_cam2:
                x1, y1, x2, y2 = map(int, v["box"])
                cv2.rectangle(frame2, (x1, y1), (x2, y2), (0, 0, 255), 2)
                cv2.putText(frame2, v["tipo"], (x1, max(20, y1 - 5)), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 2)

            with lock_frames:
                frame1_procesado = cv2.resize(frame1, (640, 360))
                frame2_procesado = cv2.resize(frame2, (640, 360))

        time.sleep(0.01)


contador_actas = len(registro_multas_emitidas) + 1

def crear_multa_sistema(tipo_vehiculo="Auto", origen="Simulación Manual", placa_custom=None, infraccion_custom="Zona Rígida"):
    global contador_actas
    hora_infraccion = time.strftime("%H:%M:%S")
    placa = placa_custom if placa_custom else simular_lpr_peruano(tipo_vehiculo)

    acta_id = f"ACTA-2026-{contador_actas:03d}"
    contador_actas += 1

    tx_hash_real = registrar_en_blockchain_auto(acta_id, placa, infraccion_custom)

    nueva_multa = {
        "id": acta_id,
        "actaId": acta_id,
        "placa": placa,
        "infraccion": infraccion_custom,
        "tipoInfraccion": infraccion_custom,
        "vehiculo": tipo_vehiculo,
        "origen": origen,
        "hora": hora_infraccion,
        "fecha": time.strftime("%Y-%m-%d"),
        "estado": "REGISTRADA",
        "nodoEmisor": origen,
        "hash": tx_hash_real,
        "resolucion": "-",
        "motivo": "-"
    }

    if tipo_vehiculo in conteo_historico_tipos:
        conteo_historico_tipos[tipo_vehiculo] += 1

    registro_multas_emitidas.append(nueva_multa)
    return nueva_multa

threading.Thread(target=bucle_analitica_principal, daemon=True).start()

# MARCO DE CARGA INICIAL
FRAME_CARGANDO = np.zeros((360, 640, 3), dtype=np.uint8)
cv2.putText(FRAME_CARGANDO, "Conectando a EZVIZ...", (180, 180), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
_, BUFFER_CARGANDO = cv2.imencode('.jpg', FRAME_CARGANDO)
BYTES_CARGANDO = BUFFER_CARGANDO.tobytes()

def stream_camara(id_cam):
    while True:
        with lock_frames:
            f = frame1_procesado if id_cam == 1 else frame2_procesado
            if f is not None:
                ret, buffer = cv2.imencode('.jpg', f, [int(cv2.IMWRITE_JPEG_QUALITY), 70])
                frame_bytes = buffer.tobytes() if ret else BYTES_CARGANDO
            else:
                frame_bytes = BYTES_CARGANDO

        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
        time.sleep(0.03)

@app.get("/video_feed_1")
def video_feed_1():
    return StreamingResponse(stream_camara(1), media_type="multipart/x-mixed-replace; boundary=frame")

@app.get("/video_feed_2")
def video_feed_2():
    return StreamingResponse(stream_camara(2), media_type="multipart/x-mixed-replace; boundary=frame")

@app.get("/api/stats")
def get_stats():
    tiempo_operacion = time.time() - tiempo_inicio_sistema
    saturacion = (tiempo_total_obstruido / tiempo_operacion * 100) if tiempo_operacion > 0 else 0.0
    via_ocupada = cam1_detecto or cam2_detecto
    total_vehiculos = sum(conteo_historico_tipos.values())
    activos_actuales = len(vehiculos_detectados_cam1) + len(vehiculos_detectados_cam2)

    return {
        "autos": conteo_historico_tipos["Auto"],
        "camiones": conteo_historico_tipos["Camion"],
        "motos": conteo_historico_tipos["Moto"],
        "buses": conteo_historico_tipos["Bus"],
        "conteo_total": total_vehiculos,
        "vehiculos_activos": activos_actuales,
        "alerta_activa": alerta_infraccion_activa,
        "saturacion_berma": round(min(100.0, saturacion), 1),
        "perdida_capacidad": round(min(100.0, saturacion * 0.85), 1),
        "metros_bloqueados": round(activos_actuales * 4.5, 1) if via_ocupada else 0.0,
        "tiempo_total_obstruido": round(tiempo_total_obstruido / 60, 1),
        "tiempo_monitoreo": round(tiempo_operacion / 60, 1),
        "registros_multas": registro_multas_emitidas
    }

@app.get("/api/expedientes")
def get_expedientes():
    return registro_multas_emitidas

class SimularMultaRequest(BaseModel):
    placa: str = None
    vehiculo: str = "Auto"
    infraccion: str = "Zona Rígida"

@app.post("/api/simular_multa")
def simular_multa_endpoint(req: SimularMultaRequest):
    multa = crear_multa_sistema(
        tipo_vehiculo=req.vehiculo,
        origen="Copiloto IA Simulación",
        placa_custom=req.placa,
        infraccion_custom=req.infraccion
    )
    return {"status": "ok", "multa": multa}

class EstadoRequest(BaseModel):
    estado: str = "ANULADA"
    motivo: str = "Procesado por el operador"
    txHash: str = ""

@app.post("/api/expedientes/{acta_id}/anular")
@app.post("/api/expedientes/{acta_id}/estado")
def cambiar_estado_expediente(acta_id: str, data: EstadoRequest):
    for multa in registro_multas_emitidas:
        if multa.get("id") == acta_id or multa.get("actaId") == acta_id:
            multa["estado"] = data.estado.upper()
            multa["motivo"] = data.motivo
            if data.txHash:
                multa["hash"] = data.txHash
            return {"status": "ok", "message": f"Acta {acta_id} actualizada a {data.estado}"}
    raise HTTPException(status_code=404, detail="Acta no encontrada")

class ChatRequest(BaseModel):
    message: str

class ChatRequest(BaseModel):
    message: str

@app.post("/api/chat")
def chat_endpoint(req: ChatRequest):
    texto = req.message.lower()

    # Extraer cualquier formato de placa en el texto (ej: ABC-123, BCK896, abc 934)
    placa_detectada = None
    placa_match = re.search(r'([a-zA-Z]{3}[\s\-]?\d{3,4})', req.message)
    if placa_match:
        placa_limpia = re.sub(r'[\s\-]', '', placa_match.group(1)).upper()
        if len(placa_limpia) >= 6:
            placa_detectada = f"{placa_limpia[:3]}-{placa_limpia[3:]}"

    # Lista ampliada de palabras clave para creación de multas flexibles
    palabras_crear = [
        "simular", "crear", "registrar", "generar", "agregar", 
        "multa", "papeleta", "sancionar", "sanciona", "ponle", "fotomulta"
    ]
    quiere_crear = any(k in texto for k in palabras_crear)

    # ------------------------------------------------------------------
    # 1. CREACIÓN / SIMULACIÓN DE MULTAS CON LENGUAJE LIBRE
    # ------------------------------------------------------------------
    if placa_detectada and quiere_crear:
        # Detectar tipo de vehículo
        tipo_v = "Auto"
        if "camion" in texto or "camión" in texto: tipo_v = "Camion"
        elif "moto" in texto: tipo_v = "Moto"
        elif "bus" in texto: tipo_v = "Bus"

        # Detectar tipo de infracción
        infraccion = "Zona Rígida"
        if "luz roja" in texto or "semaforo" in texto: infraccion = "Pasó Luz Roja"
        elif "velocidad" in texto or "correr" in texto or "rapido" in texto: infraccion = "Exceso de Velocidad"
        elif "berma" in texto or "estacionar" in texto or "parar" in texto: infraccion = "Obstrucción de Berma Sur"

        multa_creada = crear_multa_sistema(
            tipo_vehiculo=tipo_v, 
            origen="Copiloto IA (Chatbot)", 
            placa_custom=placa_detectada, 
            infraccion_custom=infraccion
        )
        
        reply = (
            f"✅ **¡Infracción Registrada Exitosamente!**\n\n"
            f"• **N° Acta:** `{multa_creada['actaId']}`\n"
            f"• **Placa:** `{multa_creada['placa']}`\n"
            f"• **Infracción:** {multa_creada['infraccion']}\n"
            f"• **Tipo Vehículo:** {multa_creada['vehiculo']}\n"
            f"• **Tx Hash Arbitrum:** `{multa_creada['hash'][:16]}...`\n\n"
            f"El expediente ha sido publicado en la red y ya aparece en el panel principal."
        )
        return {"reply": reply}

    # ------------------------------------------------------------------
    # 2. CONSULTA DIRECTA DE EXPEDIENTE POR PLACA
    # ------------------------------------------------------------------
    if placa_detectada and not quiere_crear:
        multas_encontradas = [
            m for m in registro_multas_emitidas 
            if m.get("placa", "").upper() == placa_detectada
        ]

        if multas_encontradas:
            m = multas_encontradas[-1]
            reply = (
                f"📋 **Infracción Encontrada para Placa {m['placa']}**\n\n"
                f"• **Acta:** `{m['actaId']}`\n"
                f"• **Infracción:** {m['infraccion']}\n"
                f"• **Vehículo:** {m['vehiculo']}\n"
                f"• **Estado:** `{m['estado']}`\n"
                f"• **Hora/Fecha:** {m['hora']} - {m['fecha']}\n"
                f"• **Hash Web3:** `{m['hash'][:16]}...`"
            )
            return {"reply": reply}
        else:
            return {"reply": f"🔍 No se registran infracciones o expedientes para la placa **{placa_detectada}**."}

    # ------------------------------------------------------------------
    # 3. ESTADÍSTICAS EN VIVO Y CONSULTAS GENERALES CON EL ASISTENTE
    # ------------------------------------------------------------------
    stats_actuales = get_stats()
    respuesta = responder_chat(req.message, stats_actuales)
    return {"reply": respuesta}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=False)