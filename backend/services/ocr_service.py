import cv2
import re
from hyperlpr3 import LicensePlateCatcher

# 1. Inicializar el lector una sola vez en el arranque de la API
lector_placas = LicensePlateCatcher()

def limpiar_patente_hyper(texto_sucio):
    """
    Función de limpieza exacta del script de Tkinter
    """
    if not texto_sucio:
        return "NODETECTADA"
    texto = texto_sucio.replace('???', '-').replace('2', '-')
    texto = re.sub(r'[^a-zA-Z0-9\-]', '', texto).upper()
    return texto

def procesar_ocr_exacto_tkinter(recorte_vehiculo):
    """
    Réplica exacta de la lógica que funciona en el PDF subido
    """
    try:
        alto, ancho = recorte_vehiculo.shape[:2]
        if alto == 0 or ancho == 0:
            return None, None

        # --- RECORTE 1: Enfoque directo en el área baja del parachoques ---
        recorte_patente_puro = recorte_vehiculo[
            int(alto * 0.50):int(alto * 0.95), 
            int(ancho * 0.10):int(ancho * 0.90)
        ]

        if recorte_patente_puro.size == 0:
            recorte_patente_puro = recorte_vehiculo

        # Intento 1: Pipeline sobre la zona recortada de la placa
        resultados = lector_placas.pipeline(recorte_patente_puro)
        placa_final = "NODETECTADA"

        if resultados and len(resultados) > 0:
            res_principal = resultados[0]
            if isinstance(res_principal, (list, tuple)):
                placa_final = str(res_principal[0]) if len(res_principal) > 0 else "NODETECTADA"
            elif isinstance(res_principal, dict):
                placa_final = res_principal.get('text', res_principal.get('code', "NODETECTADA"))

        # --- FALLBACK: Si no detectó en la zona reducida, probar en el carro completo ---
        if placa_final == "NODETECTADA" or len(placa_final) < 3:
            resultados_alt = lector_placas.pipeline(recorte_vehiculo)
            if resultados_alt and len(resultados_alt) > 0:
                res_alt = resultados_alt[0]
                if isinstance(res_alt, (list, tuple)):
                    placa_final = str(res_alt[0])
                elif isinstance(res_alt, dict):
                    placa_final = res_alt.get('text', "NODETECTADA")

        # Limpiar caracteres ruidosos
        placa_final = limpiar_patente_hyper(placa_final)

        # Redimensionar la imagen recortada para guardarla/enviarla al frontend (igual que Tkinter)
        foto_display = cv2.resize(recorte_patente_puro, (250, 95))

        if placa_final != "NODETECTADA":
            return placa_final, foto_display
            
        return None, foto_display

    except Exception as e:
        print(f"Error procesando OCR: {e}")
        return None, None