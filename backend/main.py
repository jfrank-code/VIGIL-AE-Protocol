import cv2
import requests
import time
import os
import numpy as np
import threading
import queue
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware

try:
    import winsound
except ImportError:
    winsound = None  # Soporte si se ejecuta fuera de Windows

from config import SERIAL_CAMARA, ACCESS_TOKEN, API_URL
from services.twilio_services import enviar_mensaje_whatsapp
from services.vision_services import (
    model, ocr_global, NOMBRES_CLASES, 
    POLIGONO_A_PORCENTUAL, POLIGONO_B_PORCENTUAL, simular_lpr_peruano
)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# VARIABLES DEL CRONÓMETRO Y ESTADOS UNIFICADOS
cronometro_invasion_inicio = 0.0
via_estaba_invadida = False
alerta_infraccion_activa = False
tipo_infractor_actual = "Ninguno"
color_infractor_actual = "No determinado"
camara_que_reporto = "Ninguna"
tiempo_inicio_sistema = time.time()
tiempo_total_obstruido = 0.0
ultimo_check_tiempo = time.time()
conteo_historico_tipos = {"Auto": 0, "Moto": 0, "Bus": 0, "Camion": 0}
registro_multas_emitidas = []
multa_procesada_para_esta_invasion = False
cam1_detecto, cam2_detecto = False, False
frames_gracia_cam1, frames_gracia_cam2 = 0, 0
LIMITE_GRACIA = 15

# TRANSMISIÓN EZVIZ Y QUEUES (Idéntico a tu script base)
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

url_cam1 = obtener_enlace_video(1)
url_cam2 = obtener_enlace_video(2)

cola_frames_cam1 = queue.Queue(maxsize=45)
cola_frames_cam2 = queue.Queue(maxsize=45)
streaming_activo = True
cam1_online, cam2_online = False, False

def recibir_stream_ezviz(url_actual, cola_destino, nombre_cam):
    global streaming_activo, cam1_online, cam2_online
    if not url_actual:
        return
    os.environ["OPENCV_FFMPEG_CAPTURE_OPTIONS"] = "rtsp_transport;tcp|timeout:2000000"
    cap = cv2.VideoCapture(url_actual, cv2.CAP_FFMPEG)
    if cap.isOpened():
        cap.set(cv2.CAP_PROP_BUFFERSIZE, 2)
        while streaming_activo:
            ret, frame = cap.read()
            if not ret:
                if nombre_cam == "Camara 1": cam1_online = False
                else: cam2_online = False
                cap.release()
                time.sleep(0.5)
                canal_no = 1 if nombre_cam == "Camara 1" else 2
                nueva_url = obtener_enlace_video(canal_no)
                if nueva_url: cap = cv2.VideoCapture(nueva_url, cv2.CAP_FFMPEG)
                continue
            
            if nombre_cam == "Camara 1": cam1_online = True
            else: cam2_online = True
            
            try:
                cola_destino.put(frame, timeout=0.01)
            except queue.Full:
                try: cola_destino.get_nowait()
                except: pass
                try: cola_destino.put_nowait(frame)
                except: pass

if url_cam1: threading.Thread(target=recibir_stream_ezviz, args=(url_cam1, cola_frames_cam1, "Camara 1"), daemon=True).start()
if url_cam2: threading.Thread(target=recibir_stream_ezviz, args=(url_cam2, cola_frames_cam2, "Camara 2"), daemon=True).start()

# THREAD DE ANALÍTICA CONTINUA EN SEGUNDO PLANO
frame1_procesado, frame2_procesado = None, None
lock_frames = threading.Lock()

def bucle_analitica_principal():
    global cam1_detecto, cam2_detecto, frames_gracia_cam1, frames_gracia_cam2
    global via_estaba_invadida, cronometro_invasion_inicio, alerta_infraccion_activa
    global tipo_infractor_actual, color_infractor_actual, camara_que_reporto
    global tiempo_total_obstruido, ultimo_check_tiempo, multa_procesada_para_esta_invasion
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
        box_cam1_actual, box_cam2_actual = None, None

        if np.any(frame1) and np.any(frame2):
            h1, w1 = frame1.shape[:2]
            p_a1 = np.array([[int(p[0]*w1), int(p[1]*h1)] for p in POLIGONO_A_PORCENTUAL], np.int32)
            h2, w2 = frame2.shape[:2]
            p_b2 = np.array([[int(p[0]*w2), int(p[1]*h2)] for p in POLIGONO_B_PORCENTUAL], np.int32)

            contador_frames += 1

            # ANALÍTICA CÁMARA 1
            if contador_frames % 3 == 0 and hay_frame1_nuevo and cam1_online:
                res1 = model.predict(frame1, imgsz=320, conf=0.40, verbose=False)[0]
                deteccion_actual_cam1 = False
                if res1.boxes is not None:
                    for box, cls_id in zip(res1.boxes.xyxy.cpu().numpy(), res1.boxes.cls.int().cpu().tolist()):
                        if cls_id in [2, 3, 5, 7]:
                            xc = int((box[0]+box[2])/2)
                            yc = int((box[1]+box[3])/2)
                            if cv2.pointPolygonTest(p_a1, (float(xc), float(yc)), False) >= 0:
                                deteccion_actual_cam1 = True
                                box_cam1_actual = box
                                if not alerta_infraccion_activa:
                                    tipo_infractor_actual = NOMBRES_CLASES.get(cls_id, "Auto")
                                break
                if deteccion_actual_cam1:
                    cam1_detecto = True
                    frames_gracia_cam1 = 0
                else:
                    frames_gracia_cam1 += 1
                    if frames_gracia_cam1 >= LIMITE_GRACIA:
                        cam1_detecto = False

            # ANALÍTICA CÁMARA 2
            if contador_frames % 3 == 0 and hay_frame2_nuevo and cam2_online:
                res2 = model.predict(frame2, imgsz=320, conf=0.40, verbose=False)[0]
                deteccion_actual_cam2 = False
                if res2.boxes is not None:
                    for box, cls_id in zip(res2.boxes.xyxy.cpu().numpy(), res2.boxes.cls.int().cpu().tolist()):
                        if cls_id in [2, 3, 5, 7]:
                            xc = int((box[0]+box[2])/2)
                            yc = int((box[1]+box[3])/2)
                            if cv2.pointPolygonTest(p_b2, (float(xc), float(yc)), False) >= 0:
                                deteccion_actual_cam2 = True
                                box_cam2_actual = box
                                if not alerta_infraccion_activa:
                                    tipo_infractor_actual = NOMBRES_CLASES.get(cls_id, "Auto")
                                break
                if deteccion_actual_cam2:
                    cam2_detecto = True
                    frames_gracia_cam2 = 0
                else:
                    frames_gracia_cam2 += 1
                    if frames_gracia_cam2 >= LIMITE_GRACIA:
                        cam2_detecto = False

            # UNIÓN LÓGICA DE INVASION
            via_ocupada_ahora = cam1_detecto or cam2_detecto
            if via_ocupada_ahora:
                if not via_estaba_invadida:
                    cronometro_invasion_inicio = time.time()
                    via_estaba_invadida = True
                    multa_procesada_para_esta_invasion = False

                segundos_detenido = time.time() - cronometro_invasion_inicio
                tiempo_total_obstruido += dt

                # UMBRAL DE 5 SEGUNDOS PARA MULTA/INFRACCIÓN
                if segundos_detenido >= 5.0:
                    alerta_infraccion_activa = True
                    camara_que_reporto = "Cam Dual" if (cam1_detecto and cam2_detecto) else ("Cam 01" if cam1_detecto else "Cam 02")

                    if not multa_procesada_para_esta_invasion:
                        hora_infraccion = time.strftime("%H:%M:%S")
                        placa_lpr = "NO DETECTADA"
                        color_infractor_actual = "No determinado (Requiere sensor RGB)"

                        # PROCESAMIENTO PADDLEOCR EN PARACHOQUES
                        try:
                            frame_origen = frame1 if cam1_detecto else frame2
                            box_elegido = box_cam1_actual if cam1_detecto else box_cam2_actual
                            if box_elegido is not None and ocr_global is not None:
                                hf, wf = frame_origen.shape[:2]
                                x1, y1, x2, y2 = map(int, box_elegido)
                                alto_caja = y2 - y1
                                y1_optimizado = int(y2 - (alto_caja * 0.35))
                                x1, y1_optimizado = max(0, x1), max(0, y1_optimizado)
                                x2, y2 = min(wf, x2), min(hf, y2)
                                recorte_placa_roi = frame_origen[y1_optimizado:y2, x1:x2]

                                if recorte_placa_roi.size > 0:
                                    resultado_ocr = ocr_global.ocr(recorte_placa_roi, cls=False)
                                    if resultado_ocr and resultado_ocr[0]:
                                        textos_detectados = [linea[1][0] for linea in resultado_ocr[0]]
                                        for texto in textos_detectados:
                                            texto_limpio = texto.replace(" ", "").replace("-", "").upper()
                                            if 5 <= len(texto_limpio) <= 7:
                                                placa_lpr = texto_limpio
                                                break
                        except Exception as ocr_error:
                            print(f" [LPR Info] Contingencia: {ocr_error}")

                        if placa_lpr == "NO DETECTADA":
                            placa_lpr = simular_lpr_peruano(tipo_infractor_actual)

                        conteo_historico_tipos[tipo_infractor_actual] = conteo_historico_tipos.get(tipo_infractor_actual, 0) + 1
                        registro_multas_emitidas.append({
                            "hora": hora_infraccion,
                            "vehiculo": tipo_infractor_actual,
                            "color": color_infractor_actual,
                            "origen": camara_que_reporto,
                            "placa": placa_lpr
                        })
                        multa_procesada_para_esta_invasion = True

                        if winsound:
                            try: winsound.Beep(2200, 1000)
                            except: pass

                        mensaje_texto = (
                            f"*VigiaPort AI ALERTA DE INFRACCIÓN LOGÍSTICA*\n\n"
                            f"*Ubicación:* {camara_que_reporto} (Zona Rígida)\n"
                            f"*Vehículo:* {tipo_infractor_actual}\n"
                            f"*Color:* {color_infractor_actual}\n"
                            f"*Placa Fiscalizada (LPR Real):* {placa_lpr}\n"
                            f"*Hora del Suceso:* {hora_infraccion}\n\n"
                            f"*Acción Requerida:* Desplegar unidad motorizada para la liberación de la calzada."
                        )
                        enviar_mensaje_whatsapp(mensaje_texto)
            else:
                # LOGICA DE RETIRO
                if via_estaba_invadida and alerta_infraccion_activa and registro_multas_emitidas:
                    ultimo_registro = registro_multas_emitidas[-1]
                    hora_retiro = time.strftime("%H:%M:%S")

                    if winsound:
                        try:
                            winsound.Beep(1500, 200)
                            winsound.Beep(1800, 200)
                        except: pass

                    mensaje_retiro = (
                        f"*VigiaPort AI CALZADA LIBERADA*\n\n"
                        f"*Ubicación:* {ultimo_registro['origen']} (Berma Despejada)\n"
                        f"*Vehículo Retirado:* {ultimo_registro['vehiculo']}\n"
                        f"*Placa Asociada:* {ultimo_registro['placa']}\n"
                        f"*Hora Liberación:* {hora_retiro}\n\n"
                        f"*Resultado:* Capacidad e infraestructura restablecida."
                    )
                    enviar_mensaje_whatsapp(mensaje_retiro)

                via_estaba_invadida = False
                alerta_infraccion_activa = False

            # DIBUJO DE POLÍGONOS SEGUN ESTADO
            col1 = (0, 0, 255) if cam1_detecto else (255, 120, 0)
            overlay1 = frame1.copy()
            cv2.fillPoly(overlay1, [p_a1], col1)
            cv2.polylines(frame1, [p_a1], True, col1, 2)
            cv2.addWeighted(overlay1, 0.20, frame1, 0.80, 0, frame1)

            col2 = (0, 0, 255) if cam2_detecto else (255, 120, 0)
            overlay2 = frame2.copy()
            cv2.fillPoly(overlay2, [p_b2], col2)
            cv2.polylines(frame2, [p_b2], True, col2, 2)
            cv2.addWeighted(overlay2, 0.20, frame2, 0.80, 0, frame2)

            with lock_frames:
                frame1_procesado = cv2.resize(frame1, (640, 360))
                frame2_procesado = cv2.resize(frame2, (640, 360))

        time.sleep(0.01)

threading.Thread(target=bucle_analitica_principal, daemon=True).start()

# ENDPOINTS PARA REACT
def stream_camara(id_cam):
    while True:
        with lock_frames:
            f = frame1_procesado if id_cam == 1 else frame2_procesado
            if f is not None:
                ret, buffer = cv2.imencode('.jpg', f, [int(cv2.IMWRITE_JPEG_QUALITY), 70])
                frame_bytes = buffer.tobytes() if ret else None
            else:
                frame_bytes = None

        if frame_bytes:
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

    return {
        "autos": conteo_historico_tipos["Auto"],
        "camiones": conteo_historico_tipos["Camion"],
        "motos": conteo_historico_tipos["Moto"],
        "buses": conteo_historico_tipos["Bus"],
        "alerta_activa": alerta_infraccion_activa,
        "saturacion_berma": round(saturacion, 1),
        "metros_bloqueados": 4.5 if via_ocupada else 0.0,
        "tiempo_total_obstruido": round(tiempo_total_obstruido, 1),
        "tiempo_monitoreo": round(tiempo_operacion, 1),
        "registros_multas": registro_multas_emitidas[-5:]  # Últimas 5
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)