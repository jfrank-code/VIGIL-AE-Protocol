import cv2
import requests
import time
import os
import numpy as np
import random
import threading
import queue
import logging
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
from paddleocr import PaddleOCR
from twilio.rest import Client

app = FastAPI()

# Permitir conexiones desde React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# CONFIGURACIÓN EXACTA DE TU CÓDIGO BASE
# ==========================================
SERIAL_CAMARA = "D12639530"
ACCESS_TOKEN = "at.dm098wfu7nqzlnrj9w8u7q023msegw88-1vzdcp2c7z-17dnjna-2fyyrir9a"  # <-- Coloca tu Token de EZVIZ aquí
api_url = "https://open.ezvizlife.com/api/lapp/live/address/get"

TWILIO_ACCOUNT_SID = "SID_CUENTA"
TWILIO_AUTH_TOKEN = "Token Especifico"
NUMERO_DESTINO_WHATSAPP = "whatsapp:+5199999999"

try:
    twilio_client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
    print("Twilio WhatsApp configurado correctamente.")
except Exception as e:
    print(f"Aviso: Configura credenciales de Twilio. Error: {e}")

# ==========================================
# FUNCIONES DE TRANSMISIÓN (EZVIZ APIS)
# ==========================================
def obtener_enlace_video(canal):
    payload = {
        'accessToken': ACCESS_TOKEN, 
        'deviceSerial': SERIAL_CAMARA, 
        'channelNo': str(canal), 
        'protocol': 2, 
        'quality': 1
    }
    try:
        res = requests.post(api_url, data=payload, timeout=3).json()
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

def recibir_stream_ezviz(url_actual, cola_destino, nombre_cam):
    global streaming_activo
    if not url_actual:
        return
    os.environ["OPENCV_FFMPEG_CAPTURE_OPTIONS"] = "rtsp_transport;tcp|timeout:2000000"
    cap = cv2.VideoCapture(url_actual, cv2.CAP_FFMPEG)
    if cap.isOpened():
        cap.set(cv2.CAP_PROP_BUFFERSIZE, 2)
        while streaming_activo:
            ret, frame = cap.read()
            if not ret:
                cap.release()
                time.sleep(0.5)
                canal_no = 1 if nombre_cam == "Camara 1" else 2
                nueva_url = obtener_enlace_video(canal_no)
                if nueva_url:
                    cap = cv2.VideoCapture(nueva_url, cv2.CAP_FFMPEG)
                continue
            try:
                cola_destino.put(frame, timeout=0.01)
            except queue.Full:
                try: cola_destino.get_nowait()
                except: pass
                try: cola_destino.put_nowait(frame)
                except: pass
    cap.release()

# Lanza los hilos de captura de EZVIZ
if url_cam1:
    threading.Thread(target=recibir_stream_ezviz, args=(url_cam1, cola_frames_cam1, "Camara 1"), daemon=True).start()
if url_cam2:
    threading.Thread(target=recibir_stream_ezviz, args=(url_cam2, cola_frames_cam2, "Camara 2"), daemon=True).start()

# Modelos AI
print("Cargando YOLOv8 Nano...")
model = YOLO("yolov8n.pt")
model.fuse()

POLIGONO_A_PORCENTUAL = np.array([[0.2026, 0.9792], [0.6148, 0.2708], [0.7705, 0.3167], [0.5621, 0.9938]], np.float32)
POLIGONO_B_PORCENTUAL = np.array([[0.3501, 0.5979], [0.5258, 0.5750], [0.7845, 0.8833], [0.3700, 0.9917]], np.float32)

# ==========================================
# GENERADORES DE STREAMING HTTP PARA REACT
# ==========================================
def generar_stream(cola_frames, poligono, nombre_nodo):
    ultimo_frame = np.zeros((360, 640, 3), dtype=np.uint8)
    
    # Control de FPS (30 FPS = ~0.033 segundos por frame)
    TARGET_FPS = 30
    frame_delay = 1.0 / TARGET_FPS

    while True:
        start_time = time.time()

        try:
            # Extrae el frame más reciente omitiendo congelamientos
            frame = cola_frames.get_nowait()
            ultimo_frame = frame.copy()
        except queue.Empty:
            frame = ultimo_frame.copy()

        if np.any(frame):
            # Reducir resolución de procesamiento para renderizado web ultra rápido (640x360)
            frame_resized = cv2.resize(frame, (640, 360))
            h, w = frame_resized.shape[:2]
            p_a = np.array([[int(p[0]*w), int(p[1]*h)] for p in poligono], np.int32)

            # Capa visual optimizada
            overlay = frame_resized.copy()
            cv2.fillPoly(overlay, [p_a], (0, 0, 255))
            cv2.polylines(frame_resized, [p_a], True, (0, 0, 255), 2)
            cv2.addWeighted(overlay, 0.20, frame_resized, 0.80, 0, frame_resized)

            cv2.putText(frame_resized, f"NODO: {nombre_nodo}", (15, 25), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)

            # Compresión optimizada para Red (Calidad 65 = Máxima fluidez sin lag)
            ret, buffer = cv2.imencode('.jpg', frame_resized, [int(cv2.IMWRITE_JPEG_QUALITY), 65])
            frame_bytes = buffer.tobytes()

            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

        # Liberar la CPU y sincronizar el stream
        elapsed = time.time() - start_time
        time.sleep(max(0, frame_delay - elapsed))

# Endpoints que consumirá la web de React
@app.get("/video_feed_1")
def video_feed_1():
    return StreamingResponse(generar_stream(cola_frames_cam1, POLIGONO_A_PORCENTUAL, "Berma Sur"),
                             media_type="multipart/x-mixed-replace; boundary=frame")

@app.get("/video_feed_2")
def video_feed_2():
    return StreamingResponse(generar_stream(cola_frames_cam2, POLIGONO_B_PORCENTUAL, "Acceso Carga"),
                             media_type="multipart/x-mixed-replace; boundary=frame")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)