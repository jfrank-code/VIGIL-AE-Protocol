import json

SYSTEM_PROMPT = """
Eres Copiloto VIGIL-AE, el asistente virtual del Centro de Control Vial Portuario.

TUS INSTRUCCIONES ESTRICTAS:
- Responde únicamente consultas relacionadas con las métricas viales del sistema, estado de cámaras, tipos de vehículos detectados, actas emitiadas e inmutabilidad en blockchain.
- Rechaza amablemente cualquier pregunta no relacionada con la plataforma respondiendo:
  "Solo puedo responder consultas operativas sobre el sistema de fiscalización VIGIL-AE y métricas viales en tiempo real."

DATOS EN TIEMPO REAL DEL SISTEMA:
{contexto_sistema}
"""

def responder_chat(mensaje_usuario, stats_actuales):
    """
    Recibe la consulta del usuario y el diccionario de métricas en tiempo real.
    """
    try:
        msg = mensaje_usuario.strip().lower()
        
        # Filtro directo para evitar desvíos de tema
        palabras_clave_sistema = ["camara", "cam", "multa", "acta", "placa", "berma", "obstruccion", "vehiculo", "blockchain", "saturacion", "vigil", "hola"]
        if not any(kw in msg for kw in palabras_clave_sistema):
            return "Solo puedo responder consultas operativas sobre el sistema de fiscalización VIGIL-AE y métricas viales en tiempo real."

        if "multa" in msg or "acta" in msg or "placa" in msg:
            multas = stats_actuales.get("multas", [])
            if not multas:
                return "En este momento no se registran infracciones o multas activas en el sistema."
            ult = multas[-1]
            return f"Última acta registrada: Placa {ult['placa']} ({ult['vehiculo']}) detectado por {ult['origen']} a las {ult['hora']}."

        if "estado" in msg or "berma" in msg or "saturacion" in msg:
            sat = stats_actuales.get("saturacion_berma", 0.0)
            obs = stats_actuales.get("tiempo_total_obstruido", 0.0)
            return f"Saturación actual de la berma: {sat}%. Tiempo total obstruido: {obs} segundos."

        return "El sistema VIGIL-AE está operando normalmente. ¿Deseas consultar sobre las multas registradas o el nivel de ocupación de las vías?"

    except Exception as e:
        return f"Error procesando la consulta: {str(e)}"