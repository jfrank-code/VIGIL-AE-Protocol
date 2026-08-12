import os
from openai import OpenAI

def responder_chat(mensaje_usuario: str, stats_actuales: dict) -> str:
    """Respuesta local/offline por defecto en caso de que falle la IA o no haya internet."""
    saturacion = stats_actuales.get('saturacion_berma', 0)
    total = stats_actuales.get('conteo_total', 0)
    return (
        f"🤖 **[Modo Local VIGIL-AE]**\n"
        f"Actualmente hay **{total}** vehículos registrados y la saturación de la berma es del **{saturacion}%**."
    )

def responder_chat_con_ia(mensaje_usuario: str, stats_actuales: dict) -> str:
    """Llama a la API de OpenAI inyectando el estado real del sistema."""
    api_key = os.getenv("OPENAI_API_KEY")
    
    # Si no hay clave API configurada, usa la respuesta local sin romper el servidor
    if not api_key:
        return responder_chat(mensaje_usuario, stats_actuales)

    multas = stats_actuales.get('registros_multas') or []

    system_prompt = f"""
    Eres el Copiloto VIGIL-AE, un asistente experto para el Centro de Control Vial Portuario.
    Tu objetivo es responder de manera fluida, natural, profesional y detallada al operador.

    MÉTRICAS VIALES EN TIEMPO REAL:
    - Flujo total de vehículos: {stats_actuales.get('conteo_total', 0)}
    - Autos: {stats_actuales.get('autos', 0)} | Camiones: {stats_actuales.get('camiones', 0)}
    - Motos: {stats_actuales.get('motos', 0)} | Buses: {stats_actuales.get('buses', 0)}
    - Vehículos activos en cámara: {stats_actuales.get('vehiculos_activos', 0)}
    - Saturación de la berma: {stats_actuales.get('saturacion_berma', 0)}%
    - Pérdida de capacidad vial: {stats_actuales.get('perdida_capacidad', 0)}%
    - Tiempo total de obstrucción: {stats_actuales.get('tiempo_total_obstruido', 0)} min
    - Total de actas en sistema: {len(multas)}

    INSTRUCCIONES:
    1. Si te piden analizar las estadísticas, ofrece un análisis interpretativo útil.
    2. Mantén un tono natural, conversacional y colaborativo.
    3. Si la consulta no tiene relación con el sistema o métricas viales, indica amablemente que solo atiendes la fiscalización VIGIL-AE.
    """

    try:
        client = OpenAI(api_key=api_key)
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": mensaje_usuario}
            ],
            temperature=0.7,
            timeout=8.0
        )
        return response.choices[0].message.content

    except Exception as e:
        print(f"⚠️ Error en OpenAI API ({e}). Usando fallback local...")
        return responder_chat(mensaje_usuario, stats_actuales)