import cv2
import base64
import numpy as np

try:
    import hyperlpr3 as lpr
    recognizer = lpr.LicensePlateCatcher(detect_level=lpr.DETECT_LEVEL_HIGH)
    HYPERLPR_DISPONIBLE = True
except Exception as e:
    print(f"⚠️ HyperLPR3 no cargado, se usará modo simulación/OCR fallback: {e}")
    HYPERLPR_DISPONIBLE = False

def recortar_y_convertir_base64(frame, box):
    """
    Recorta la región del vehículo o placa especificada por box (x1, y1, x2, y2)
    y la convierte a una cadena de imagen codificada en Base64 para React.
    """
    try:
        if frame is None or frame.size == 0:
            return None

        # Asegurar conversión segura desde arreglos numpy/torch
        if hasattr(box, 'tolist'):
            box = box.tolist()

        x1, y1, x2, y2 = map(int, box)
        h, w, _ = frame.shape
        x1, y1 = max(0, x1), max(0, y1)
        x2, y2 = min(w, x2), min(h, y2)

        if x2 <= x1 or y2 <= y1:
            return None

        crop = frame[y1:y2, x1:x2]
        if crop.size == 0:
            return None

        crop_resized = cv2.resize(crop, (180, 100))
        _, buffer = cv2.imencode('.jpg', crop_resized, [int(cv2.IMWRITE_JPEG_QUALITY), 80])
        base64_str = f"data:image/jpeg;base64,{base64.b64encode(buffer).decode('utf-8')}"
        return base64_str
    except Exception as e:
        print(f"Error al convertir recorte a Base64: {e}")
        return None

def reconocer_placa_hyperlpr3(crop_img):
    """
    Procesa un recorte de imagen con HyperLPR3 para extraer la placa y su nivel de confianza.
    """
    if not HYPERLPR_DISPONIBLE or crop_img is None or crop_img.size == 0:
        return None, 0.0

    try:
        results = recognizer.parse_plate(crop_img)
        if results and len(results) > 0:
            placa_texto = results[0][0]
            confianza = float(results[0][1])
            return placa_texto, confianza
    except Exception as e:
        print(f"Error en HyperLPR3: {e}")

    return None, 0.0

def recortar_y_leer_placa(frame, box, ocr_engine=None):
    """
    Función de compatibilidad con fallback si no hay HyperLPR3 activo.
    """
    if frame is None or frame.size == 0:
        return None

    if hasattr(box, 'tolist'):
        box = box.tolist()

    x1, y1, x2, y2 = map(int, box)
    h, w, _ = frame.shape
    x1, y1 = max(0, x1), max(0, y1)
    x2, y2 = min(w, x2), min(h, y2)

    if x2 <= x1 or y2 <= y1:
        return None

    crop = frame[y1:y2, x1:x2]
    if crop.size == 0:
        return None

    placa_hyper, conf = reconocer_placa_hyperlpr3(crop)
    if placa_hyper and conf > 0.6:
        return placa_hyper

    if ocr_engine is not None:
        try:
            resultado = ocr_engine.ocr(crop, cls=False)
            if resultado and resultado[0]:
                texto_detectado = resultado[0][0][1][0]
                return texto_detectado.upper().replace(" ", "").replace("-", "")
        except Exception as e:
            print(f"Error en extracción OCR alternativo: {e}")

    return None