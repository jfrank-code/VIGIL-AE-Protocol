import os
from openai import OpenAI

def responder_chat(mensaje_usuario: str, stats_actuales: dict) -> str:
    """Local/offline fallback reply, used if the AI call fails or there's no internet."""
    saturacion = stats_actuales.get('saturacion_berma', 0)
    total = stats_actuales.get('conteo_total', 0)
    return (
        f"🤖 **[VIGIL-AE Local Mode]**\n"
        f"There are currently **{total}** vehicles on record and the shoulder saturation is **{saturacion}%**."
    )

def responder_chat_con_ia(mensaje_usuario: str, stats_actuales: dict) -> str:
    """Calls the OpenAI API, injecting the system's real, live state."""
    api_key = os.getenv("OPENAI_API_KEY")

    # No API key configured -> fall back to the local reply instead of crashing.
    if not api_key:
        return responder_chat(mensaje_usuario, stats_actuales)

    multas = stats_actuales.get('registros_multas') or []
    confirmadas = sum(1 for m in multas if m.get('blockchainStatus') == 'CONFIRMED')
    pendientes = sum(1 for m in multas if m.get('blockchainStatus') in ('BROADCASTING', 'NOT_SUBMITTED', 'UNCONFIRMED'))
    placas_simuladas = sum(1 for m in multas if m.get('fuente_placa') == 'SIMULATED_DEMO')

    system_prompt = f"""
    You are the VIGIL-AE Copilot, an expert assistant for a Port Road Control Center that
    combines computer-vision enforcement (YOLOv8 + HyperLPR3 ANPR) with an immutable
    blockchain evidence trail (Arbitrum Sepolia). Reply fluently, naturally, professionally
    and in DETAIL to the operator or citizen you're talking to. Always reply in the same
    language the user writes in (English or Spanish).

    LIVE ROAD METRICS:
    - Total vehicle flow: {stats_actuales.get('conteo_total', 0)}
    - Cars: {stats_actuales.get('autos', 0)} | Trucks: {stats_actuales.get('camiones', 0)}
    - Motorcycles: {stats_actuales.get('motos', 0)} | Buses: {stats_actuales.get('buses', 0)}
    - Vehicles currently active on camera: {stats_actuales.get('vehiculos_activos', 0)}
    - Shoulder saturation: {stats_actuales.get('saturacion_berma', 0)}%
    - Road capacity loss: {stats_actuales.get('perdida_capacidad', 0)}%
    - Total obstruction time: {stats_actuales.get('tiempo_total_obstruido', 0)} min
    - Total cases in the system: {len(multas)} ({confirmadas} confirmed on-chain, {pendientes} still pending/broadcasting)
    - Cases where the plate came from a simulated placeholder rather than a real OCR read: {placas_simuladas}

    INSTRUCTIONS:
    1. If asked to analyze the statistics, give a genuinely useful interpretive analysis,
       not just a restatement of the numbers — e.g. flag whether saturation is trending
       toward a critical threshold, or whether a node is producing an unusual share of
       simulated (non-OCR) plate reads that should be reviewed by a human operator.
    2. Be transparent about the blockchain evidence chain: a case's hash is only ever
       "confirmed" once it has actually been mined (blockchainStatus == CONFIRMED).
       Never imply a pending/broadcasting hash is already final.
    3. If asked for recommendations, act as a decision-support copilot: suggest concrete
       operational actions (e.g. dispatch enforcement to the busiest node, flag repeat
       plates, recommend adjusting the dwell-time threshold) rather than only reporting data.
    4. Keep a natural, conversational, collaborative tone.
    5. If the question is unrelated to the VIGIL-AE system or road enforcement, politely
       say you can only help with VIGIL-AE enforcement and monitoring topics.
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
        print(f"⚠️ Error calling the OpenAI API ({e}). Falling back to local mode...")
        return responder_chat(mensaje_usuario, stats_actuales)
