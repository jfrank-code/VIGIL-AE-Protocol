import re

SYSTEM_PROMPT = """
Eres Copiloto VIGIL-AE, el asistente virtual del Centro de Control Vial Portuario.

TUS INSTRUCCIONES ESTRICTAS:
- Responde únicamente consultas relacionadas con las métricas viales del sistema, estado de cámaras, tipos de vehículos detectados, actas emitidas e inmutabilidad en blockchain.
- Rechaza amablemente cualquier pregunta no relacionada con la plataforma respondiendo:
  "Solo puedo responder consultas operativas sobre el sistema de fiscalización VIGIL-AE y métricas viales en tiempo real."

DATOS EN TIEMPO REAL DEL SISTEMA:
{contexto_sistema}
"""

def extraer_placa_texto(texto: str):
    """Detecta formatos de placa flexibles como ABC-123, ABC123, ABC 123, BCK-8964."""
    patron = r'([A-Za-z]{3}[\s\-]?\d{3,4})'
    coincidencia = re.search(patron, texto)
    if coincidencia:
        placa_limpia = re.sub(r'[\s\-]', '', coincidencia.group(1)).upper()
        if len(placa_limpia) >= 6:
            return f"{placa_limpia[:3]}-{placa_limpia[3:]}"
    return None

def responder_chat(mensaje_usuario, stats_actuales):
    """
    Recibe la consulta del usuario y el diccionario de métricas en tiempo real.
    """
    try:
        msg = mensaje_usuario.strip().lower()
        
        # Filtro de seguridad para evitar desvíos fuera del tema
        palabras_clave_sistema = [
            "camara", "cam", "multa", "acta", "placa", "berma", "obstruccion", 
            "vehiculo", "blockchain", "saturacion", "vigil", "hola", "stats", 
            "estadistica", "estadisticas", "resumen", "total", "reporte", "cuantas", 
            "cuantos", "en vivo", "sancion", "papeleta", "fotomulta", "auto", "carro", "bus", "camion", "moto"
        ]
        
        if not any(kw in msg for kw in palabras_clave_sistema):
            return "Solo puedo responder consultas operativas sobre el sistema de fiscalización VIGIL-AE y métricas viales en tiempo real."

        # ------------------------------------------------------------------
        # 1. CONSULTA DE ESTADÍSTICAS EN VIVO
        # ------------------------------------------------------------------
        palabras_stats = ["estadistica", "estadisticas", "resumen", "total", "reporte", "cuantas", "cuantos", "en vivo", "metricas"]
        if any(p in msg for p in palabras_stats):
            multas = stats_actuales.get("registros_multas", [])
            total_multas = len(multas)
            
            # Conteo de estados
            registradas = sum(1 for m in multas if m.get("estado", "REGISTRADA") == "REGISTRADA")
            pagadas = sum(1 for m in multas if m.get("estado") == "PAGADA")
            anuladas = sum(1 for m in multas if m.get("estado") == "ANULADA")

            autos = stats_actuales.get("autos", 0)
            camiones = stats_actuales.get("camiones", 0)
            motos = stats_actuales.get("motos", 0)
            buses = stats_actuales.get("buses", 0)
            conteo_total_v = stats_actuales.get("conteo_total", 0)

            sat = stats_actuales.get("saturacion_berma", 0.0)
            obs = stats_actuales.get("tiempo_total_obstruido", 0.0)

            return (
                f"📊 **Panel de Estadísticas en Vivo (VIGIL-AE):**\n\n"
                f"🚘 **Flujo Vehicular Detectado:** `{conteo_total_v}` vehículos\n"
                f"  • Autos: `{autos}` | Camiones: `{camiones}`\n"
                f"  • Motos: `{motos}` | Buses: `{buses}`\n\n"
                f"📋 **Expedientes de Infracción:** `{total_multas}`\n"
                f"  • 🔴 Pendientes/Registradas: `{registradas}`\n"
                f"  • 🟢 Pagadas: `{pagadas}`\n"
                f"  • ⚪ Anuladas: `{anuladas}`\n\n"
                f"⚠️ **Estado del Carril/Berma:**\n"
                f"  • Saturación: `{sat}%` | Tiempo obstruido: `{obs} min`\n\n"
                f"🌐 *Sincronizado inmutablemente con la red Arbitrum Sepolia.*"
            )

        # ------------------------------------------------------------------
        # 2. CONSULTA DE ESTADO DE VÍAS / BERMA
        # ------------------------------------------------------------------
        if "estado" in msg or "berma" in msg or "saturacion" in msg or "obstruccion" in msg:
            sat = stats_actuales.get("saturacion_berma", 0.0)
            obs = stats_actuales.get("tiempo_total_obstruido", 0.0)
            perdida = stats_actuales.get("perdida_capacidad", 0.0)
            return (
                f"📍 **Estado Operativo de las Vías:**\n\n"
                f"• **Saturación actual de la berma:** `{sat}%`\n"
                f"• **Pérdida de capacidad vial:** `{perdida}%`\n"
                f"• **Tiempo acumulado de obstrucción:** `{obs} min`"
            )

        # ------------------------------------------------------------------
        # 3. SALUDO O MENSAJE GENERAL
        # ------------------------------------------------------------------
        return (
            "Hola, soy el Copiloto VIGIL-AE 🤖.\n\n"
            "Puedes pedirme:\n"
            "• *'Dame las estadísticas en vivo'*\n"
            "• *'Ponle una papeleta al carro ABC-934 por exceso de velocidad'*\n"
            "• *'¿Cuál es el estado de la berma?'*\n"
            "• Consultar el expediente de cualquier placa registrada."
        )

    except Exception as e:
        return f"Error procesando la consulta: {str(e)}"