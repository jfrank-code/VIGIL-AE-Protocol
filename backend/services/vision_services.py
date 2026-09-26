import logging
import random

import numpy as np
import torch
from ultralytics import YOLO
from paddleocr import PaddleOCR


# ============================================================
# PYTORCH >= 2.6 COMPATIBILITY WITH ULTRALYTICS 8.0.145
# ============================================================
#
# PyTorch 2.6+ changed the default value of weights_only
# in torch.load(). The older Ultralytics versions used by
# this project expect to load the full YOLOv8 checkpoint.
#
# IMPORTANT:
# Only use this with .pt files you trust.
# ============================================================

_original_torch_load = torch.load


def _torch_load_compat(*args, **kwargs):
    kwargs["weights_only"] = False
    return _original_torch_load(*args, **kwargs)


torch.load = _torch_load_compat


# ============================================================
# GLOBAL YOLO MODEL LOADING
# ============================================================

print("Loading YOLOv8 Nano...")

model = YOLO("yolov8n.pt")
model.fuse()

model_anpr = YOLO("yolov8n.pt")


# ============================================================
# GLOBAL PADDLEOCR LOADING
# ============================================================

print("Loading global PaddleOCR engine...")

try:
    logging.getLogger("ppocr").setLevel(logging.ERROR)

    ocr_global = PaddleOCR(
        use_textline_orientation=False,
        lang="en"
    )

    print(" [OK] PaddleOCR ready and optimized globally.")

except Exception as ocr_init_err:
    ocr_global = None

    print(
        f" [ERROR] Could not preload PaddleOCR: "
        f"{ocr_init_err}"
    )


# ============================================================
# YOLO CLASS NAMES
# ============================================================

NOMBRES_CLASES = {
    2: "Auto",
    3: "Moto",
    5: "Bus",
    7: "Camion"
}


# ============================================================
# POLYGON A (Node 01 / South Shoulder — the only camera zone in use)
# Coordinates expressed as a fraction of frame width/height
# ============================================================

POLIGONO_A_PORCENTUAL = np.array(
    [
        [0.2026, 0.9792],
        [0.6148, 0.2708],
        [0.7705, 0.3167],
        [0.5621, 0.9938]
    ],
    np.float32
)


# ============================================================
# SIMULATED PERUVIAN PLATE READ
#
# Used only as a fallback when real OCR (HyperLPR3/PaddleOCR) fails to
# read a plate — e.g. bad angle, low light, plate out of frame. Every
# caller of this function tags the resulting record with
# fuente_placa = "SIMULATED_DEMO" (vs "OCR_HYPERLPR3" for a real read)
# so the dashboard, citizen portal, and blockchain payload never present
# a guess as if it were a verified plate read.
# ============================================================

def simular_lpr_peruano(tipo_vehiculo: str) -> str:
    letras = [
        "P",
        "A",
        "B",
        "C",
        "D",
        "F",
        "M"
    ]

    l1 = random.choice(letras)

    l2 = random.choice(
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    )

    l3 = random.choice(
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    )

    # --------------------------------------------------------
    # MOTORCYCLE PLATE
    # --------------------------------------------------------

    if tipo_vehiculo == "Moto":

        numeros_moto = "".join(
            random.choices(
                "0123456789",
                k=4
            )
        )

        return f"{l1}{l2}-{numeros_moto}"

    # --------------------------------------------------------
    # CAR / GENERAL VEHICLE PLATE
    # --------------------------------------------------------

    numeros_carro = "".join(
        random.choices(
            "0123456789",
            k=4
        )
    )

    return f"{l1}{l2}{l3}-{numeros_carro}"