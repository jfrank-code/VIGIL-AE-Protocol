import cv2
import re
from hyperlpr3 import LicensePlateCatcher

# Initialize the reader once at API startup
lector_placas = LicensePlateCatcher()

def limpiar_patente_hyper(texto_sucio):
    """
    Cleans up the raw string returned by HyperLPR3.

    NOTE: an earlier version of this function also ran
    `.replace('2', '-')`, which silently deleted every literal "2" digit
    from any real plate (e.g. "P3A-291" became "P3A--91"). That was a bug,
    not intentional cleanup — plates routinely contain the digit 2 — so it
    has been removed. Only the OCR engine's own "unknown character"
    placeholder ("???") is normalized to a dash here.
    """
    if not texto_sucio:
        return "NODETECTADA"
    texto = texto_sucio.replace('???', '-')
    texto = re.sub(r'[^a-zA-Z0-9\-]', '', texto).upper()
    return texto

def procesar_ocr_exacto_tkinter(recorte_vehiculo):
    """
    License plate OCR pipeline, run on a cropped vehicle image
    """
    try:
        alto, ancho = recorte_vehiculo.shape[:2]
        if alto == 0 or ancho == 0:
            return None, None

        # --- CROP 1: focus directly on the lower bumper area ---
        recorte_patente_puro = recorte_vehiculo[
            int(alto * 0.50):int(alto * 0.95), 
            int(ancho * 0.10):int(ancho * 0.90)
        ]

        if recorte_patente_puro.size == 0:
            recorte_patente_puro = recorte_vehiculo

        # Attempt 1: run the pipeline on the cropped plate area
        resultados = lector_placas.pipeline(recorte_patente_puro)
        placa_final = "NODETECTADA"

        if resultados and len(resultados) > 0:
            res_principal = resultados[0]
            if isinstance(res_principal, (list, tuple)):
                placa_final = str(res_principal[0]) if len(res_principal) > 0 else "NODETECTADA"
            elif isinstance(res_principal, dict):
                placa_final = res_principal.get('text', res_principal.get('code', "NODETECTADA"))

        # --- FALLBACK: if nothing was found in the tight crop, try the full vehicle ---
        if placa_final == "NODETECTADA" or len(placa_final) < 3:
            resultados_alt = lector_placas.pipeline(recorte_vehiculo)
            if resultados_alt and len(resultados_alt) > 0:
                res_alt = resultados_alt[0]
                if isinstance(res_alt, (list, tuple)):
                    placa_final = str(res_alt[0])
                elif isinstance(res_alt, dict):
                    placa_final = res_alt.get('text', "NODETECTADA")

        # Strip noisy characters
        placa_final = limpiar_patente_hyper(placa_final)

        # Resize the cropped image before storing/sending it to the frontend
        foto_display = cv2.resize(recorte_patente_puro, (250, 95))

        if placa_final != "NODETECTADA":
            return placa_final, foto_display
            
        return None, foto_display

    except Exception as e:
        print(f"Error processing OCR: {e}")
        return None, None