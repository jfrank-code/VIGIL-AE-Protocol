import os
from dotenv import load_dotenv

# Carga las variables reales desde el archivo backend/.env
load_dotenv()

# Si no están en el .env, quedarán vacías o con valores neutros
SERIAL_CAMARA = os.getenv("SERIAL_CAMARA", "D12639530")
ACCESS_TOKEN = os.getenv("ACCESS_TOKEN", "")
API_URL = os.getenv("API_URL", "https://open.ezvizlife.com/api/lapp/live/address/get")

TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID", "")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN", "")
NUMERO_DESTINO_WHATSAPP = os.getenv("NUMERO_DESTINO_WHATSAPP", "")