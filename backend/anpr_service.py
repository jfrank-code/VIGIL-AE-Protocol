import os
import cv2
import time
import base64
import numpy as np
import threading
from datetime import datetime

from services.vision_services import model_anpr, NOMBRES_CLASES
from services.ocr_service import procesar_ocr_exacto_tkinter

anpr_activo = True
anpr_frame_procesado = None
anpr_lock_frame = threading.Lock()

anpr_total_vehiculos = 0
anpr_vehiculos_activos = 0
anpr_frame_numero = 0

anpr_capturas_marcha = []
anpr_capturas_detenidos = []

ids_marcha_procesados = set()
ids_detenidos_procesados = set()
tiempo_entrada_zona = {}
hilos_ocr_activos = set()

ZONA_PROHIBIDA_BASE = np.array([[20, 70], [530, 70], [450, 570], [10, 570]], np.int32)

def recortar_y_convertir_base64_exacto(sub_img):
    try:
        if sub_img is None or sub_img.size == 0:
            return None
        ret, buffer = cv2.imencode('.jpg', sub_img, [int(cv2.IMWRITE_JPEG_QUALITY), 95])
        if not ret:
            return None
        return f"data:image/jpeg;base64,{base64.b64encode(buffer).decode('utf-8')}"
    except Exception as e:
        print(f"Error convirtiendo imagen a base64: {e}")
        return None

def reconocer_placa_estilo_tkinter(frame_hd, box):
    x1, y1, x2, y2 = map(int, box)
    alto_orig, ancho_orig = frame_hd.shape[:2]

    pad_w = int((x2 - x1) * 0.10)
    pad_h = int((y2 - y1) * 0.10)
    
    x1_m = max(0, x1 - pad_w)
    y1_m = max(0, y1 - pad_h)
    x2_m = min(ancho_orig, x2 + pad_w)
    y2_m = min(alto_orig, y2 + pad_h)

    recorte_carro = frame_hd[y1_m:y2_m, x1_m:x2_m]
    if recorte_carro.size == 0:
        return None, 0.0, None

    placa_detectada, foto_crop_display = procesar_ocr_exacto_tkinter(recorte_carro)
    
    if placa_detectada and placa_detectada != "NODETECTADA":
        return placa_detectada, 0.92, foto_crop_display
        
    h_c, w_c = recorte_carro.shape[:2]
    parachoques_crop = recorte_carro[int(h_c * 0.45):h_c, :]
    
    return None, 0.0, parachoques_crop

def resolver_ruta_video_trafico():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    candidatos = [
        os.path.join(base_dir, "..", "frontend", "public", "trafico.mp4"),
        os.path.join(base_dir, "frontend", "public", "trafico.mp4"),
        os.path.join(base_dir, "public", "trafico.mp4"),
        os.path.abspath("frontend/public/trafico.mp4"),
        os.path.abspath("../frontend/public/trafico.mp4")
    ]
    for ruta in candidatos:
        ruta_abs = os.path.abspath(ruta)
        if os.path.exists(ruta_abs):
            return ruta_abs
    return os.path.abspath(candidatos[0])

ANPR_VIDEO_PATH = resolver_ruta_video_trafico()

def procesar_ocr_asincrono_video(idx_vehiculo, frame_completo_hd, box, tipo_vehiculo, es_detenido):
    global anpr_total_vehiculos, anpr_capturas_marcha, anpr_capturas_detenidos
    try:
        placa_detectada, conf_lpr, crop_placa_display = reconocer_placa_estilo_tkinter(frame_completo_hd, box)
        
        if placa_detectada and placa_detectada != "NODETECTADA" and len(placa_detectada) >= 3:
            placa_final = placa_detectada
            conf_str = f"{conf_lpr * 100:.1f}%"
        else:
            placa_final = "NO DETECTADA"
            conf_str = "0.0%"
        
        foto_b64 = recortar_y_convertir_base64_exacto(crop_placa_display)
        if not foto_b64:
            x1, y1, x2, y2 = map(int, box)
            alto_box = y2 - y1
            y1_parachoques = int(y1 + alto_box * 0.45)
            sub_fallback = frame_completo_hd[max(0, y1_parachoques):min(frame_completo_hd.shape[0], y2), max(0, x1):min(frame_completo_hd.shape[1], x2)]
            foto_b64 = recortar_y_convertir_base64_exacto(sub_fallback)

        if not foto_b64:
            return

        hora_str = datetime.now().strftime("%H:%M:%S")
        
        registro = {
            "id": f"V-{idx_vehiculo}",
            "id_vehiculo": f"ID-{idx_vehiculo}",
            "hora": hora_str,
            "tipo": tipo_vehiculo,
            "placa": placa_final,
            "confianza": conf_str,
            "foto_base64": foto_b64,
            "imagen": foto_b64,
            "es_detenido": es_detenido,
            "metodo": "HyperLPR3"
        }

        if es_detenido:
            anpr_capturas_detenidos = [item for item in anpr_capturas_detenidos if item["id_vehiculo"] != f"ID-{idx_vehiculo}"]
            anpr_capturas_detenidos.insert(0, registro)
            anpr_capturas_detenidos = anpr_capturas_detenidos[:6]
        else:
            anpr_capturas_marcha = [item for item in anpr_capturas_marcha if item["id_vehiculo"] != f"ID-{idx_vehiculo}"]
            anpr_capturas_marcha.insert(0, registro)
            anpr_capturas_marcha = anpr_capturas_marcha[:6]

        anpr_total_vehiculos = len(ids_marcha_procesados.union(ids_detenidos_procesados))

    except Exception as e:
        print(f"Error procesando OCR asíncrono para vehiculo ID {idx_vehiculo}: {e}")
    finally:
        hilos_ocr_activos.discard((idx_vehiculo, "detenido" if es_detenido else "marcha"))

def bucle_anpr_video():
    global anpr_frame_procesado, anpr_vehiculos_activos, anpr_frame_numero
    global ids_marcha_procesados, ids_detenidos_procesados, tiempo_entrada_zona

    while anpr_activo:
        if not os.path.exists(ANPR_VIDEO_PATH):
            time.sleep(1.0)
            continue

        cap = cv2.VideoCapture(ANPR_VIDEO_PATH)
        if not cap.isOpened():
            time.sleep(1.0)
            continue

        ancho_orig = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)) or 1024
        alto_orig = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT)) or 512
        escala_x, escala_y = ancho_orig / 1024.0, alto_orig / 512.0
        
        zona_prohibida_real = np.array([
            [int(p[0] * escala_x), int(p[1] * escala_y)] for p in ZONA_PROHIBIDA_BASE
        ], np.int32)

        while anpr_activo:
            ret, frame = cap.read()

            if not ret or frame is None:
                ids_marcha_procesados.clear()
                ids_detenidos_procesados.clear()
                tiempo_entrada_zona.clear()
                cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                continue

            anpr_frame_numero += 1

            if anpr_frame_numero % 3 == 0:
                results = model_anpr.track(
                    frame,
                    persist=True,
                    classes=[2, 3, 5, 7],
                    conf=0.35,
                    imgsz=512,
                    verbose=False
                )

                ids_en_frame = set()
                boxes_render = []
                anpr_vehiculos_activos = 0

                if results and results[0].boxes is not None and results[0].boxes.id is not None:
                    boxes = results[0].boxes.xyxy.cpu().numpy().astype(int)
                    ids = results[0].boxes.id.cpu().numpy().astype(int)
                    clases = results[0].boxes.cls.cpu().numpy().astype(int)

                    for box, idx, cls_id in zip(boxes, ids, clases):
                        x1, y1, x2, y2 = box
                        cx, cy = (x1 + x2) // 2, (y1 + y2) // 2
                        tipo_vehiculo = NOMBRES_CLASES.get(cls_id, "Auto")

                        ids_en_frame.add(idx)
                        anpr_vehiculos_activos += 1

                        dentro_zona = cv2.pointPolygonTest(zona_prohibida_real, (float(cx), float(cy)), False)
                        
                        if dentro_zona < 0 and (cy > int(180 * escala_y)):
                            if idx not in ids_marcha_procesados and (idx, "marcha") not in hilos_ocr_activos:
                                ids_marcha_procesados.add(idx)
                                hilos_ocr_activos.add((idx, "marcha"))
                                threading.Thread(
                                    target=procesar_ocr_asincrono_video,
                                    args=(idx, frame.copy(), box, tipo_vehiculo, False),
                                    daemon=True
                                ).start()

                        if dentro_zona >= 0:
                            if idx not in tiempo_entrada_zona:
                                tiempo_entrada_zona[idx] = time.time()

                            segundos_quieto = int(time.time() - tiempo_entrada_zona[idx])

                            if segundos_quieto >= 3 and idx not in ids_detenidos_procesados:
                                if (idx, "detenido") not in hilos_ocr_activos:
                                    ids_detenidos_procesados.add(idx)
                                    hilos_ocr_activos.add((idx, "detenido"))
                                    threading.Thread(
                                        target=procesar_ocr_asincrono_video,
                                        args=(idx, frame.copy(), box, tipo_vehiculo, True),
                                        daemon=True
                                    ).start()
                        else:
                            tiempo_entrada_zona.pop(idx, None)

                        boxes_render.append({
                            "box": box,
                            "idx": idx,
                            "tipo": tipo_vehiculo,
                            "es_detenido": idx in ids_detenidos_procesados
                        })

                for k in list(tiempo_entrada_zona.keys()):
                    if k not in ids_en_frame:
                        tiempo_entrada_zona.pop(k, None)

                frame_visual = frame.copy()
                cv2.polylines(frame_visual, [zona_prohibida_real], True, (0, 0, 255), 2)

                for b in boxes_render:
                    x1, y1, x2, y2 = b["box"]
                    es_det = b["es_detenido"]
                    color = (0, 0, 255) if es_det else (0, 255, 0)
                    etiqueta = f"ID:{b['idx']} - {'DETENIDO' if es_det else b['tipo']}"
                    cv2.rectangle(frame_visual, (x1, y1), (x2, y2), color, 2)
                    cv2.putText(frame_visual, etiqueta, (x1, max(18, y1 - 6)), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)

                with anpr_lock_frame:
                    anpr_frame_procesado = cv2.resize(frame_visual, (854, 480))

            time.sleep(0.01)

        cap.release()