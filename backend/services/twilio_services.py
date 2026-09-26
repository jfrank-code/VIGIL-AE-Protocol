from twilio.rest import Client
from config import TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, NUMERO_DESTINO_WHATSAPP

try:
    twilio_client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
    print("Twilio WhatsApp configured correctly.")
except Exception as e:
    twilio_client = None
    print(f"Notice: configure your Twilio credentials to enable WhatsApp. Error: {e}")

def enviar_mensaje_whatsapp(mensaje: str):
    if twilio_client and NUMERO_DESTINO_WHATSAPP:
        try:
            twilio_client.messages.create(
                body=mensaje,
                from_="whatsapp:+14155238886",
                to=NUMERO_DESTINO_WHATSAPP
            )
        except Exception as e:
            print(f"Error sending WhatsApp message: {e}")