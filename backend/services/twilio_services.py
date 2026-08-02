from twilio.rest import Client
from config import TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, NUMERO_DESTINO_WHATSAPP

try:
    twilio_client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
    print("Twilio WhatsApp configurado correctamente.")
except Exception as e:
    twilio_client = None
    print(f"Aviso: Configura las credenciales de Twilio para activar WhatsApp. Error: {e}")

def enviar_mensaje_whatsapp(mensaje: str):
    if twilio_client and NUMERO_DESTINO_WHATSAPP:
        try:
            twilio_client.messages.create(
                body=mensaje,
                from_="whatsapp:+14155238886",
                to=NUMERO_DESTINO_WHATSAPP
            )
        except Exception as e:
            print(f"Error enviando mensaje por WhatsApp: {e}")