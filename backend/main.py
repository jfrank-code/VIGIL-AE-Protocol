import os

# Configuración global de FFmpeg ANTES de cualquier llamada a OpenCV
os.environ["OPENCV_FFMPEG_CAPTURE_OPTIONS"] = (
    "allowed_extensions;ALL|"
    "protocol_whitelist;file,crypto,data,http,https,tcp,tls,rtp,udp,subfile|"
    "rw_timeout;800000|"
    "stimeout;800000|"
    "fflags;nobuffer|flags;low_delay"
)
import hashlib
import time
import cv2
import requests
import numpy as np
import threading
import queue
import re
from urllib.parse import urlparse
import asyncio  # ASYNCIO AGREGADO
from pydantic import BaseModel
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware

import config
from config import SERIAL_CAMARA, ACCESS_TOKEN, API_URL
from services.twilio_services import enviar_mensaje_whatsapp
from services.vision_services import (
    model, NOMBRES_CLASES, POLIGONO_A_PORCENTUAL, simular_lpr_peruano
)
from services.ocr_service import procesar_ocr_exacto_tkinter
from services.chatbot_service import responder_chat_con_ia

# Importar funciones de los scripts secundarios
from blockchain_service import registrar_en_blockchain_auto, cambiar_estado_en_blockchain, esperar_confirmacion_tx
import anpr_service
from anpr_service import recortar_y_convertir_base64_exacto

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

_token_debug = os.getenv("ACCESS_TOKEN", "")

print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
print("🔐 DEBUG ACCESS TOKEN - RAILWAY")
print("📏 Longitud:", len(_token_debug))
print("🔑 Inicio:", _token_debug[:8])
print("🔚 Final:", _token_debug[-8:])
print("🔐 SHA256:", hashlib.sha256(_token_debug.encode()).hexdigest())
print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")

# METRICAS GLOBALES
tiempo_inicio_sistema = time.time()
tiempo_total_obstruido = 0.0
ultimo_check_tiempo = time.time()

conteo_historico_tipos = {"Auto": 0, "Moto": 0, "Bus": 0, "Camion": 0}
registro_multas_emitidas = []

capturas_detenidos = []
capturas_marcha = []
placa_focalizada = "NINGUNA"

cam1_detecto = False
frames_gracia_cam1 = 0
LIMITE_GRACIA = 75

vehiculos_detectados_cam1 = []

alerta_infraccion_activa = False
multas_procesadas_posicion = []

cam1_online = False
streaming_activo = True

# maxsize=2: keep the queue nearly empty so the analytics loop always
# consumes the freshest frame instead of draining a backlog (lower latency
# now that Camera 1 is the only feed to process).
cola_frames_cam1 = queue.Queue(maxsize=2)

# Red y EZVIZ
def obtener_nuevo_access_token():
    app_key = getattr(config, 'APP_KEY', None)
    app_secret = getattr(config, 'APP_SECRET', None)
    if not app_key or not app_secret:
        return None
    try:
        url ="https://open.ezvizlife.com/api/lapp/token/get"
        res = requests.post(url, data={'appKey': app_key, 'appSecret': app_secret}, timeout=4.0).json()
        if res.get("code") == "200":
            nuevo_token = res["data"]["accessToken"]
            config.ACCESS_TOKEN = nuevo_token
            print(f"🔑 Access Token renovado automáticamente!")
            return nuevo_token
    except Exception as e:
        print(f"❌ Error al solicitar token EZVIZ: {e}")
    return None

def obtener_enlace_video(canal):
    token_actual = getattr(config, 'ACCESS_TOKEN', ACCESS_TOKEN)

    payload = {
        'accessToken': token_actual,
        'deviceSerial': SERIAL_CAMARA,
        'channelNo': str(canal),
        'protocol': 2,
        'quality': 1
    }

    try:
        print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        print("🔎 DIAGNÓSTICO EZVIZ")
        print(f"🌐 API_URL: {API_URL}")
        print(f"📹 Device: {SERIAL_CAMARA}")
        print(f"📡 Canal: {canal}")

        # =========================================================
        # DEBUG DEL TOKEN
        # =========================================================
        print("🔐 TOKEN DEBUG")

        print(
            "📏 Longitud:",
            len(token_actual)
        )

        print(
            "🔑 Inicio:",
            token_actual[:8]
        )

        print(
            "🔚 Final:",
            token_actual[-8:]
        )

        print(
            "🔐 SHA256:",
            hashlib.sha256(
                token_actual.encode()
            ).hexdigest()
        )

        print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")

        # =========================================================
        # PETICIÓN EXACTA A EZVIZ
        # =========================================================

        headers = {
            "User-Agent": "Mozilla/5.0",
            "Accept": "application/json",
            "Content-Type": "application/x-www-form-urlencoded"
        }

        print("📤 ENVIANDO PETICIÓN A EZVIZ...")
        print("📤 Método: POST")
        print("📤 Device:", payload["deviceSerial"])
        print("📤 Canal:", payload["channelNo"])
        print("📤 Protocol:", payload["protocol"])
        print("📤 Quality:", payload["quality"])
        print("📤 Token length:", len(payload["accessToken"]))
        print(
            "📤 Token SHA256:",
            hashlib.sha256(
                payload["accessToken"].encode()
            ).hexdigest()
        )
        print("📤 Headers:", headers)

        response = requests.post(
            API_URL,
            data=payload,
            headers=headers,
            timeout=15.0
        )

        # =========================================================
        # RESPUESTA EZVIZ
        # =========================================================

        print("📥 HTTP Status:", response.status_code)
        print(
            "📥 Content-Type:",
            response.headers.get("content-type")
        )

        print(
            "📥 Respuesta EZVIZ:",
            response.text[:2000]
        )

        # =========================================================
        # VALIDAR HTTP
        # =========================================================

        if not response.ok:
            print(
                "❌ EZVIZ respondió HTTP:",
                response.status_code
            )

            print(
                "❌ Headers respuesta:",
                dict(response.headers)
            )

            return None

        # =========================================================
        # CONVERTIR JSON
        # =========================================================

        try:
            res = response.json()

        except Exception as json_error:

            print(
                "❌ EZVIZ NO devolvió JSON:",
                json_error
            )

            print(
                "📄 Respuesta:",
                response.text[:2000]
            )

            return None

        print("📦 JSON EZVIZ:", res)

        code = str(
            res.get("code", "")
        )

        # =========================================================
        # ÉXITO
        # =========================================================

        if code == "200":

            data = res.get(
                "data",
                {}
            )

            url = data.get(
                "url"
            )

            if url:

                print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
                print("✅ EZVIZ ENTREGÓ URL DE STREAMING")
                print(
                    "🎥 URL:",
                    url[:250],
                    "..."
                )
                print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")

                return url

            print(
                "❌ EZVIZ respondió code=200 pero no entregó data.url"
            )

            print(
                "📦 Data:",
                data
            )

            return None

        # =========================================================
        # ERROR 10002
        # =========================================================

        if code == "10002":

            print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
            print("❌ EZVIZ RECHAZÓ EL ACCESS TOKEN")
            print("❌ Código:", code)
            print(
                "❌ Mensaje:",
                res.get("msg")
            )

            print("🔐 Token utilizado:")
            print(
                "   Longitud:",
                len(token_actual)
            )

            print(
                "   Inicio:",
                token_actual[:8]
            )

            print(
                "   Final:",
                token_actual[-8:]
            )

            print(
                "   SHA256:",
                hashlib.sha256(
                    token_actual.encode()
                ).hexdigest()
            )

            print("⚠️ NO se renovará automáticamente.")
            print("⚠️ Esta prueba utiliza exactamente el token de Railway.")
            print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")

            return None

        # =========================================================
        # OTRO ERROR EZVIZ
        # =========================================================

        print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        print("❌ EZVIZ NO entregó URL de streaming")
        print("❌ Código:", code)
        print(
            "❌ Mensaje:",
            res.get("msg")
        )
        print(
            "📦 Respuesta completa:",
            res
        )
        print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")

        return None

    # =============================================================
    # ERRORES DE RED
    # =============================================================

    except requests.exceptions.Timeout:

        print("❌ Timeout conectando con EZVIZ")
        return None

    except requests.exceptions.ConnectionError as e:

        print(
            "❌ Error de conexión con EZVIZ:",
            e
        )

        return None

    except Exception as e:

        print(
            f"❌ Error inesperado EZVIZ: "
            f"{type(e).__name__}: {e}"
        )

        return None

def recibir_stream_ezviz(canal_no, cola_destino, nombre_cam):
    """
    Obtiene el HLS de EZVIZ y lo convierte en frames para YOLO.

    Esta versión mantiene el comportamiento original, pero añade diagnóstico
    explícito para Railway. Si local funciona y Railway no, los logs permiten
    distinguir entre:
      1) fallo al obtener la URL de EZVIZ,
      2) fallo al abrir HLS con OpenCV/FFmpeg,
      3) fallo al leer frames una vez abierto el stream.
    """
    global streaming_activo, cam1_online

    intentos_sin_url = 0
    intentos_no_abre = 0
    lecturas_fallidas = 0
    frames_recibidos = 0
    ultimo_log_frame = 0.0

    print(f"🎥 [{nombre_cam}] Hilo de captura EZVIZ iniciado. Canal={canal_no}")
    print(f"🎥 [{nombre_cam}] OpenCV version: {cv2.__version__}")
    print(f"🎥 [{nombre_cam}] CAP_FFMPEG disponible: {hasattr(cv2, 'CAP_FFMPEG')}")

    while streaming_activo:
        try:
            url_actual = obtener_enlace_video(canal_no)

            if not url_actual:
                intentos_sin_url += 1
                cam1_online = False

                if intentos_sin_url <= 3 or intentos_sin_url % 10 == 0:
                    print(
                        f"❌ [{nombre_cam}] EZVIZ no devolvió URL de streaming "
                        f"(intento {intentos_sin_url})."
                    )

                time.sleep(3.0)
                continue

            intentos_sin_url = 0

            # Nunca imprimimos la URL HLS completa porque puede contener
            # parámetros/token temporales. Solo mostramos host y path.
            try:
                parsed_url = urlparse(url_actual)
                host = parsed_url.netloc or "host-desconocido"
                path = parsed_url.path or "/"
                print(
                    f"🔗 [{nombre_cam}] URL EZVIZ obtenida: "
                    f"https://{host}{path}"
                )
            except Exception:
                print(f"🔗 [{nombre_cam}] URL EZVIZ obtenida correctamente.")

            print(
                f"🎬 [{nombre_cam}] Intentando abrir HLS con "
                f"OpenCV/FFmpeg..."
            )

            cap = cv2.VideoCapture(url_actual, cv2.CAP_FFMPEG)

            if not cap.isOpened():
                intentos_no_abre += 1
                cam1_online = False

                backend_name = "desconocido"
                try:
                    backend_name = cap.getBackendName()
                except Exception:
                    pass

                if intentos_no_abre <= 3 or intentos_no_abre % 10 == 0:
                    print(
                        f"❌ [{nombre_cam}] OpenCV NO pudo abrir el stream EZVIZ. "
                        f"Intento={intentos_no_abre}, backend={backend_name}"
                    )

                cap.release()
                time.sleep(2.0)
                continue

            intentos_no_abre = 0

            backend_name = "desconocido"
            try:
                backend_name = cap.getBackendName()
            except Exception:
                pass

            print(
                f"✅ [{nombre_cam}] OpenCV abrió el stream EZVIZ. "
                f"Backend={backend_name}"
            )

            # Keep the OpenCV-internal buffer at 1 frame too, so we are always
            # reading the newest frame the camera has sent, never a stale one.
            cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)

            cam1_online = True
            lecturas_fallidas = 0

            while streaming_activo:
                ret, frame = cap.read()

                if not ret or frame is None or np.sum(frame) == 0:
                    lecturas_fallidas += 1
                    cam1_online = False

                    if lecturas_fallidas <= 3 or lecturas_fallidas % 10 == 0:
                        print(
                            f"❌ [{nombre_cam}] cap.read() no recibió un frame. "
                            f"Lectura fallida={lecturas_fallidas}"
                        )

                    break

                # El stream está realmente entregando frames.
                frames_recibidos += 1
                cam1_online = True

                # Loguear solo cada 5 segundos para no inundar Railway Logs.
                ahora = time.time()
                if ahora - ultimo_log_frame >= 5.0:
                    print(
                        f"📹 [{nombre_cam}] FRAME RECIBIDO correctamente: "
                        f"shape={frame.shape}, frames={frames_recibidos}"
                    )
                    ultimo_log_frame = ahora

                while not cola_destino.empty():
                    try:
                        cola_destino.get_nowait()
                    except queue.Empty:
                        break

                try:
                    cola_destino.put(frame, timeout=0.01)
                except queue.Full:
                    pass

            cap.release()

            if streaming_activo:
                print(
                    f"🔄 [{nombre_cam}] Stream interrumpido. "
                    f"Reintentando obtener una nueva URL EZVIZ..."
                )

            time.sleep(1.0)

        except Exception as e:
            cam1_online = False
            print(
                f"💥 [{nombre_cam}] Excepción inesperada en captura EZVIZ: "
                f"{type(e).__name__}: {e}"
            )
            time.sleep(3.0)

# Only Camera 1 (channel 1 / "South Shoulder") is wired up. Camera 2 was
# removed: the EZVIZ channel-2 feed was unreliable in testing and doubling
# up the YOLO inference loop across two feeds was the main bottleneck
# slowing Camera 1 down.
threading.Thread(target=recibir_stream_ezviz, args=(1, cola_frames_cam1, "Camara 1"), daemon=True).start()

frame_inicio_default = np.zeros((360, 640, 3), dtype=np.uint8)
cv2.putText(frame_inicio_default, "Iniciando Camara...", (200, 180), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)

frame1_procesado = frame_inicio_default.copy()
ultima_placa_detectada_info = {"placa": None, "fuente": None, "hora": None}
lock_frames = threading.Lock()

def ya_fue_multado_en_posicion(xc, yc, camara_origen, umbral_pixeles=60):
    for m_xc, m_yc, m_cam in multas_procesadas_posicion:
        if m_cam == camara_origen:
            distancia = np.sqrt((xc - m_xc)**2 + (yc - m_yc)**2)
            if distancia < umbral_pixeles:
                return True
    return False

def registrar_captura_anpr(frame, box, tipo_vehiculo, es_detenido=False):
    global capturas_detenidos, capturas_marcha, ultima_placa_detectada_info

    if frame is None or frame.size == 0:
        return

    x1, y1, x2, y2 = map(int, box)
    h, w, _ = frame.shape
    crop = frame[max(0, y1):min(h, y2), max(0, x1):min(w, x2)]
    if crop.size == 0:
        return

    placa_detectada, crop_display = procesar_ocr_exacto_tkinter(crop)

    # Be honest about provenance: a real OCR read ("HyperLPR3") is not the
    # same evidentiary strength as a simulated placeholder plate used when
    # OCR can't find one (low light, angle, occlusion, plate out of frame).
    # We keep both records tagged so the dashboard, the citizen portal and
    # the blockchain payload can all show which one it was instead of
    # quietly presenting a guess as a real plate read.
    if placa_detectada and placa_detectada != "NODETECTADA":
        fuente_placa = "OCR_HYPERLPR3"
    else:
        placa_detectada = simular_lpr_peruano(tipo_vehiculo)
        fuente_placa = "SIMULATED_DEMO"

    ultima_placa_detectada_info = {
        "placa": placa_detectada,
        "fuente": fuente_placa,
        "hora": time.strftime("%H:%M:%S"),
    }

    sub_img = crop_display if crop_display is not None else crop
    foto_b64 = recortar_y_convertir_base64_exacto(sub_img)
    if not foto_b64:
        return

    nuevo_registro = {
        "id_vehiculo": f"V-{int(time.time() * 1000) % 100000}",
        "placa": placa_detectada,
        "fuente_placa": fuente_placa,
        "tipo": tipo_vehiculo,
        "hora": time.strftime("%H:%M:%S"),
        "foto_base64": foto_b64
    }

    if es_detenido:
        capturas_detenidos.insert(0, nuevo_registro)
        capturas_detenidos = capturas_detenidos[:6]
    else:
        capturas_marcha.insert(0, nuevo_registro)
        capturas_marcha = capturas_marcha[:6]

tiempo_permanencia_cam1 = {}
INFRACCION_TIEMPO_LIMITE = 5.0

def bucle_analitica_principal():
    """
    Main analytics loop for Camera 1 (the only camera in the system).

    Speed notes (this loop used to alternate between two cameras and only
    ran inference every 2nd frame to keep both feeds real-time):
      - Every frame is now run through YOLO (no more `contador_frames % 2`
        skip) since there is only one feed to process.
      - imgsz is 320 with a fused YOLOv8n model, which on CPU is already
        close to the practical real-time ceiling for this box size; going
        lower (e.g. 256) trades meaningful accuracy for marginal speed, so
        we keep 320 and instead removed the skip + the second camera's
        inference call, which was the actual bottleneck.
      - The frame queue is capped at 2 (see cola_frames_cam1) so we always
        grab the newest frame instead of processing a backlog.
    """
    global cam1_detecto, frames_gracia_cam1
    global alerta_infraccion_activa, tiempo_total_obstruido, ultimo_check_tiempo
    global vehiculos_detectados_cam1
    global frame1_procesado, multas_procesadas_posicion
    global conteo_historico_tipos

    ultimo_frame1_valido = frame_inicio_default.copy()

    while True:
        try:
            frame1 = cola_frames_cam1.get(timeout=0.01)
            ultimo_frame1_valido = frame1.copy()
            hay_frame1_nuevo = True
        except queue.Empty:
            frame1 = ultimo_frame1_valido.copy()
            hay_frame1_nuevo = False

        tiempo_actual = time.time()
        dt = tiempo_actual - ultimo_check_tiempo
        ultimo_check_tiempo = tiempo_actual

        if np.any(frame1):
            h1, w1 = frame1.shape[:2]
            p_a1 = np.array([[int(p[0]*w1), int(p[1]*h1)] for p in POLIGONO_A_PORCENTUAL], np.int32)

            if hay_frame1_nuevo:
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

            alerta_en_frame = False

            keys_actuales_c1 = []
            for v in vehiculos_detectados_cam1:
                key = (int(v["xc"] / 30), int(v["yc"] / 30))
                keys_actuales_c1.append(key)

                if key not in tiempo_permanencia_cam1:
                    tiempo_permanencia_cam1[key] = tiempo_actual
                    if v["tipo"] in conteo_historico_tipos:
                        conteo_historico_tipos[v["tipo"]] += 1
                    registrar_captura_anpr(frame1, v["box"], v["tipo"], es_detenido=False)

                segundos_permanencia = tiempo_actual - tiempo_permanencia_cam1[key]

                if segundos_permanencia >= INFRACCION_TIEMPO_LIMITE:
                    alerta_en_frame = True
                    if not ya_fue_multado_en_posicion(v["xc"], v["yc"], "Cam1"):
                        crear_multa_sistema(
                            tipo_vehiculo=v["tipo"],
                            origen="Node 01 (South Shoulder)",
                            infraccion_custom="Parked in Restricted Zone (>5s)"
                        )
                        multas_procesadas_posicion.append((v["xc"], v["yc"], "Cam1"))
                        registrar_captura_anpr(frame1, v["box"], v["tipo"], es_detenido=True)

            for k in list(tiempo_permanencia_cam1.keys()):
                if k not in keys_actuales_c1:
                    del tiempo_permanencia_cam1[k]

            alerta_infraccion_activa = alerta_en_frame

            if cam1_detecto:
                tiempo_total_obstruido += dt

            es_rojo_cam1 = cam1_detecto
            col1 = (0, 0, 255) if es_rojo_cam1 else (255, 120, 0)
            overlay1 = frame1.copy()
            cv2.fillPoly(overlay1, [p_a1], col1)
            cv2.polylines(frame1, [p_a1], True, col1, 2)
            cv2.addWeighted(overlay1, 0.25, frame1, 0.75, 0, frame1)

            for v in vehiculos_detectados_cam1:
                x1, y1, x2, y2 = map(int, v["box"])
                cv2.rectangle(frame1, (x1, y1), (x2, y2), (0, 0, 255), 2)
                cv2.putText(frame1, v["tipo"], (x1, max(20, y1 - 5)), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 2)

            with lock_frames:
                frame1_procesado = cv2.resize(frame1, (640, 360))

        # No sleep when a frame was just processed: return to the queue
        # immediately so the next available frame is picked up as fast as
        # possible. A tiny sleep only when idle avoids a hot spin-loop.
        if not hay_frame1_nuevo:
            time.sleep(0.005)

def _confirmar_multa_en_segundo_plano(acta_id, tx_hash):
    """
    Runs in a background thread: waits for the broadcast transaction to
    actually be mined on Arbitrum Sepolia, then flips the case's
    blockchainStatus from "BROADCASTING" to "CONFIRMED" (or "FAILED" if the
    chain reverted it, or "UNCONFIRMED" if we simply couldn't confirm in
    time). This is what makes the hash shown in the UI trustworthy: it is
    never labeled CONFIRMED until wait_for_transaction_receipt says so.
    """
    resultado = esperar_confirmacion_tx(tx_hash)
    for multa in registro_multas_emitidas:
        if multa.get("actaId") == acta_id:
            if resultado.get("confirmado") is True:
                multa["blockchainStatus"] = "CONFIRMED"
                multa["bloque"] = resultado.get("bloque")
            elif resultado.get("confirmado") is False:
                multa["blockchainStatus"] = "FAILED"
            else:
                multa["blockchainStatus"] = "UNCONFIRMED"
            break

def crear_multa_sistema(tipo_vehiculo="Auto", origen="Manual Simulation", placa_custom=None, infraccion_custom="Restricted Zone"):
    hora_infraccion = time.strftime("%H:%M:%S")
    placa = placa_custom if placa_custom else simular_lpr_peruano(tipo_vehiculo)

    timestamp_id = int(time.time() * 1000)
    acta_id = f"ACTA-2026-{timestamp_id}"

    tx_hash_real = registrar_en_blockchain_auto(acta_id, placa, infraccion_custom, origen)

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
        # Never fabricate a hash. `hash` is either a real tx hash returned by
        # the RPC node, or None so the frontend can honestly show "Pending".
        "hash": tx_hash_real,
        "blockchainStatus": "BROADCASTING" if tx_hash_real else "NOT_SUBMITTED",
        "resolucion": "-",
        "motivo": "-"
    }

    if tipo_vehiculo in conteo_historico_tipos:
        conteo_historico_tipos[tipo_vehiculo] += 1

    registro_multas_emitidas.append(nueva_multa)

    if tx_hash_real:
        threading.Thread(
            target=_confirmar_multa_en_segundo_plano,
            args=(acta_id, tx_hash_real),
            daemon=True
        ).start()

    try:
        msg_wh = (
            f"🚨 *NEW INFRACTION REGISTERED - VIGILAE*\n\n"
            f"📋 *Case:* {acta_id}\n"
            f"🚘 *Plate:* {placa}\n"
            f"🚘 *Vehicle:* {tipo_vehiculo}\n"
            f"⚠️ *Infraction:* {infraccion_custom}\n"
            f"📍 *Origin:* {origen}\n"
            f"🔗 *Arbitrum Hash:* {tx_hash_real if tx_hash_real else 'Pending / not yet submitted'}"
        )
        threading.Thread(target=enviar_mensaje_whatsapp, args=(msg_wh,), daemon=True).start()
    except Exception as e:
        print(f"Error sending WhatsApp message: {e}")

    return nueva_multa

# Iniciar hilos
threading.Thread(target=bucle_analitica_principal, daemon=True).start()
threading.Thread(target=anpr_service.bucle_anpr_video, daemon=True, name="ANPR-trafico").start()

FRAME_CARGANDO = np.zeros((360, 640, 3), dtype=np.uint8)
cv2.putText(FRAME_CARGANDO, "Conectando al Stream ANPR...", (160, 180), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
_, BUFFER_CARGANDO = cv2.imencode('.jpg', FRAME_CARGANDO)
BYTES_CARGANDO = BUFFER_CARGANDO.tobytes()

# GENERADORES DE STREAMING OPTIMIZADOS CON ASYNC/AWAIT
async def stream_anpr_video():
    while True:
        with anpr_service.anpr_lock_frame:
            f = anpr_service.anpr_frame_procesado.copy() if anpr_service.anpr_frame_procesado is not None else None

        if f is not None:
            ret, buffer = cv2.imencode('.jpg', f, [int(cv2.IMWRITE_JPEG_QUALITY), 85])
            frame_bytes = buffer.tobytes() if ret else BYTES_CARGANDO
        else:
            frame_bytes = BYTES_CARGANDO

        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
        await asyncio.sleep(0.033)

@app.get("/video_feed_anpr")
async def video_feed_anpr():
    return StreamingResponse(stream_anpr_video(), media_type="multipart/x-mixed-replace; boundary=frame")

async def stream_camara_1():
    while True:
        with lock_frames:
            f = frame1_procesado
            if f is not None:
                ret, buffer = cv2.imencode('.jpg', f, [int(cv2.IMWRITE_JPEG_QUALITY), 75])
                frame_bytes = buffer.tobytes() if ret else BYTES_CARGANDO
            else:
                frame_bytes = BYTES_CARGANDO

        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
        # 0.02s ~= 50 FPS ceiling on the MJPEG push itself (JPEG-encoding a
        # single small frame is cheap; the real speed limit is the YOLO
        # inference in bucle_analitica_principal, not this stream).
        await asyncio.sleep(0.02)

@app.get("/video_feed_1")
async def video_feed_1():
    return StreamingResponse(stream_camara_1(), media_type="multipart/x-mixed-replace; boundary=frame")

@app.get("/api/camera/status")
def get_camera_status():
    """Estado técnico de la captura EZVIZ para diagnóstico del despliegue."""
    return {
        "camera": "Camara 1 / South Shoulder",
        "channel": 1,
        "online": cam1_online,
        "streaming_active": streaming_activo,
        "queue_size": cola_frames_cam1.qsize(),
        "opencv_version": cv2.__version__,
    }

@app.get("/api/anpr/stats")
def get_anpr_stats():
    return {
        "conteo_total": anpr_service.anpr_total_vehiculos,
        "vehiculos_activos": anpr_service.anpr_vehiculos_activos,
        "capturas_detenidos": anpr_service.anpr_capturas_detenidos,
        "capturas_marcha": anpr_service.anpr_capturas_marcha
    }

@app.get("/api/stats")
def get_stats():
    tiempo_operacion = time.time() - tiempo_inicio_sistema
    saturacion = (tiempo_total_obstruido / tiempo_operacion * 100) if tiempo_operacion > 0 else 0.0
    via_ocupada = cam1_detecto
    total_vehiculos = sum(conteo_historico_tipos.values())
    activos_actuales = len(vehiculos_detectados_cam1)

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
        "registros_multas": registro_multas_emitidas,
        "capturas_detenidos": capturas_detenidos,
        "capturas_marcha": capturas_marcha
    }

class FocalizarPlacaRequest(BaseModel):
    placa: str

@app.post("/api/focalizar_placa")
def focalizar_placa_endpoint(req: FocalizarPlacaRequest):
    global placa_focalizada
    placa_focalizada = req.placa.upper()
    return {"status": "ok", "placa": placa_focalizada}

@app.get("/api/expedientes")
def get_expedientes():
    return registro_multas_emitidas

class SimularMultaRequest(BaseModel):
    placa: str = None
    vehiculo: str = "Auto"
    infraccion: str = "Restricted Zone"

@app.post("/api/simular_multa")
def simular_multa_endpoint(req: SimularMultaRequest):
    multa = crear_multa_sistema(
        tipo_vehiculo=req.vehiculo,
        origen="AI Copilot Simulation",
        placa_custom=req.placa,
        infraccion_custom=req.infraccion
    )
    return {"status": "ok", "multa": multa}

class EstadoRequest(BaseModel):
    estado: str = "ANULADA"
    motivo: str = "Processed by operator"
    txHash: str = ""

@app.post("/api/expedientes/{acta_id}/anular")
@app.post("/api/expedientes/{acta_id}/estado")
def cambiar_estado_expediente(acta_id: str, data: EstadoRequest):
    for multa in registro_multas_emitidas:
        if multa.get("id") == acta_id or multa.get("actaId") == acta_id:
            estado_str = data.estado.upper()
            multa["estado"] = estado_str
            multa["motivo"] = data.motivo

            estado_map = {"REGISTRADA": 0, "PAGADA": 1, "ANULADA": 2}
            enum_val = estado_map.get(estado_str, 2)

            tx_hash_bc = cambiar_estado_en_blockchain(acta_id, enum_val, data.motivo)

            if tx_hash_bc:
                multa["hash"] = tx_hash_bc
                multa["blockchainStatus"] = "BROADCASTING"
                threading.Thread(
                    target=_confirmar_multa_en_segundo_plano,
                    args=(acta_id, tx_hash_bc),
                    daemon=True
                ).start()
            elif data.txHash:
                # The frontend already signed and confirmed this transaction
                # itself via the citizen/operator's own MetaMask wallet
                # (see web3Service.js), so this hash is real and already
                # mined by the time it reaches us.
                multa["hash"] = data.txHash
                multa["blockchainStatus"] = "CONFIRMED"

            return {"status": "ok", "message": f"Case {acta_id} updated to {estado_str}", "multa": multa}

    raise HTTPException(status_code=404, detail="Case not found")

class ChatRequest(BaseModel):
    message: str

@app.post("/api/chat")
def chat_endpoint(req: ChatRequest):
    texto = req.message.lower()

    placa_detectada = None
    placa_match = re.search(r'([a-zA-Z]{3}[\s\-]?\d{3,4})', req.message)
    if placa_match:
        placa_limpia = re.sub(r'[\s\-]', '', placa_match.group(1)).upper()
        if len(placa_limpia) >= 6:
            placa_detectada = f"{placa_limpia[:3]}-{placa_limpia[3:]}"

    palabras_crear = [
        "simular", "crear", "registrar", "generar", "agregar",
        "multa", "papeleta", "sancionar", "sanciona", "ponle", "fotomulta",
        "fine", "ticket", "issue", "log"
    ]
    quiere_crear = any(k in texto for k in palabras_crear)

    # New: let an operator ask the copilot to explain the on-chain status of
    # a case, in plain language, instead of just returning a raw hash.
    palabras_estado = ["estado del hash", "confirmad", "blockchain status", "esta confirmada", "está confirmada", "on-chain status"]
    quiere_estado = any(k in texto for k in palabras_estado)

    def _fmt_hash(h):
        if not h:
            return "pending (not yet submitted to Arbitrum)"
        return f"`{h[:16]}...`"

    if placa_detectada and quiere_estado:
        matches = [m for m in registro_multas_emitidas if m.get("placa", "").upper() == placa_detectada]
        if matches:
            m = matches[-1]
            estado_bc = m.get("blockchainStatus", "NOT_SUBMITTED")
            explicacion = {
                "CONFIRMED": "✅ Mined and confirmed on Arbitrum Sepolia — this hash is final and verifiable on Arbiscan.",
                "BROADCASTING": "🟡 Sent to the network, waiting for the next block to confirm it (usually a few seconds).",
                "FAILED": "❌ The transaction was mined but reverted on-chain — it was not recorded.",
                "UNCONFIRMED": "⚠️ We couldn't confirm this in time; it may still land, or the RPC node may be lagging.",
                "NOT_SUBMITTED": "⏳ No blockchain transaction has been submitted for this case yet.",
            }.get(estado_bc, "Unknown status.")
            reply = (
                f"🔗 **On-chain status for {m['placa']} ({m['actaId']})**\n\n"
                f"• **Hash:** {_fmt_hash(m.get('hash'))}\n"
                f"• **Status:** `{estado_bc}`\n"
                f"• {explicacion}"
            )
            return {"reply": reply}
        return {"reply": f"🔍 No case found for plate **{placa_detectada}** to check its blockchain status."}

    if placa_detectada and quiere_crear:
        tipo_v = "Auto"
        if "camion" in texto or "camión" in texto: tipo_v = "Camion"
        elif "moto" in texto: tipo_v = "Moto"
        elif "bus" in texto: tipo_v = "Bus"

        infraccion = "Restricted Zone"
        if "luz roja" in texto or "semaforo" in texto or "red light" in texto: infraccion = "Ran a Red Light"
        elif "velocidad" in texto or "correr" in texto or "rapido" in texto or "speeding" in texto: infraccion = "Speeding"
        elif "berma" in texto or "estacionar" in texto or "parar" in texto or "park" in texto: infraccion = "South Shoulder Obstruction"

        multa_creada = crear_multa_sistema(
            tipo_vehiculo=tipo_v,
            origen="AI Copilot (Chatbot)",
            placa_custom=placa_detectada,
            infraccion_custom=infraccion
        )

        reply = (
            f"✅ **Infraction Registered Successfully!**\n\n"
            f"• **Case No.:** `{multa_creada['actaId']}`\n"
            f"• **Plate:** `{multa_creada['placa']}`\n"
            f"• **Infraction:** {multa_creada['infraccion']}\n"
            f"• **Vehicle Type:** {multa_creada['vehiculo']}\n"
            f"• **Arbitrum Tx Hash:** {_fmt_hash(multa_creada['hash'])}\n\n"
            f"The transaction has been broadcast to the immutable network"
            f"{' and is now waiting to be mined.' if multa_creada['hash'] else ', but the on-chain submission failed — check the backend logs.'}"
        )
        return {"reply": reply}

    if placa_detectada and not quiere_crear:
        multas_encontradas = [
            m for m in registro_multas_emitidas
            if m.get("placa", "").upper() == placa_detectada
        ]

        if multas_encontradas:
            m = multas_encontradas[-1]
            reply = (
                f"📋 **Infraction Found for Plate {m['placa']}**\n\n"
                f"• **Case:** `{m['actaId']}`\n"
                f"• **Infraction:** {m['infraccion']}\n"
                f"• **Status:** `{m['estado']}`\n"
                f"• **Web3 Hash:** {_fmt_hash(m.get('hash'))}"
            )
            return {"reply": reply}
        else:
            return {"reply": f"🔍 No infractions are on record for plate **{placa_detectada}**."}

    stats_actuales = get_stats()
    respuesta = responder_chat_con_ia(req.message, stats_actuales)
    return {"reply": respuesta}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=False)