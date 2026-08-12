import logging
import random
import numpy as np
from ultralytics import YOLO
from paddleocr import PaddleOCR

# Carga Global de Modelos
print("Cargando YOLOv8 Nano...")
model = YOLO("yolov8n.pt")
model.fuse()

model_anpr = YOLO("yolov8n.pt")

print("Cargando Algoritmo Global PaddleOCR...")
try:
    logging.getLogger("ppocr").setLevel(logging.ERROR)
    ocr_global = PaddleOCR(use_textline_orientation=False, lang='en')
    print(" [OK] PaddleOCR listo y optimizado a nivel global.")
except Exception as ocr_init_err:
    ocr_global = None
    print(f" [ERROR] No se pudo precargar PaddleOCR: {ocr_init_err}")

NOMBRES_CLASES = {2: "Auto", 3: "Moto", 5: "Bus", 7: "Camion"}

POLIGONO_A_PORCENTUAL = np.array([
    [0.2026, 0.9792], [0.6148, 0.2708], [0.7705, 0.3167], [0.5621, 0.9938]
], np.float32)

POLIGONO_B_PORCENTUAL = np.array([
    [0.3501, 0.5979], [0.5258, 0.5750], [0.7845, 0.8833], [0.3700, 0.9917]
], np.float32)

def simular_lpr_peruano(tipo_vehiculo: str) -> str:
    letras = ["P", "A", "B", "C", "D", "F", "M"]
    l1 = random.choice(letras)
    l2 = random.choice("ABCDEFGHIJKLMNOPQRSTUVWXYZ")
    l3 = random.choice("ABCDEFGHIJKLMNOPQRSTUVWXYZ")
    
    if tipo_vehiculo == "Moto":
        numeros_moto = ''.join(random.choices('0123456789', k=4))
        return f"{l1}{l2}-{numeros_moto}"
    
    numeros_carro = ''.join(random.choices('0123456789', k=4))
    return f"{l1}{l2}{l3}-{numeros_carro}"