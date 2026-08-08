import os
from dotenv import load_dotenv

# Carga las variables desde el archivo .env
load_dotenv()

# Configuración Cámara EZVIZ y Servicios
SERIAL_CAMARA = os.getenv("SERIAL_CAMARA", "D12639530")
ACCESS_TOKEN = os.getenv("ACCESS_TOKEN", "")
API_URL = os.getenv("API_URL", "https://open.ezvizlife.com/api/lapp/live/address/get")

# Configuración Twilio WhatsApp
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID", "")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN", "")
NUMERO_DESTINO_WHATSAPP = os.getenv("NUMERO_DESTINO_WHATSAPP", "")

# ------------------------------------------------------------------
# CONFIGURACIÓN WEB3 & SMART CONTRACT (Arbitrum Sepolia)
# ------------------------------------------------------------------
RPC_URL = os.getenv("RPC_URL", "https://sepolia-rollup.arbitrum.io/rpc")
CONTRACT_ADDRESS = os.getenv("CONTRACT_ADDRESS", "0xa95eCCEd4020B098155E13d404BF2d53133bd8Bf")
PRIVATE_KEY = os.getenv("PRIVATE_KEY", "72070153db2ccfc57148bbf7fd790a95c27c3b7ebf620831441aa3a2397190dc")

CONTRACT_ABI = [
    {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": False,
        "inputs": [
            {"indexed": True, "internalType": "string", "name": "actaId", "type": "string"},
            {"indexed": False, "internalType": "enum VigilAEProtocol.EstadoActa", "name": "nuevoEstado", "type": "uint8"},
            {"indexed": False, "internalType": "string", "name": "motivo", "type": "string"}
        ],
        "name": "EstadoCambiado",
        "type": "event"
    },
    {
        "anonymous": False,
        "inputs": [
            {"indexed": True, "internalType": "string", "name": "actaId", "type": "string"},
            {"indexed": False, "internalType": "string", "name": "placa", "type": "string"},
            {"indexed": False, "internalType": "string", "name": "tipoInfraccion", "type": "string"},
            {"indexed": False, "internalType": "uint256", "name": "timestamp", "type": "uint256"},
            {"indexed": False, "internalType": "bytes32", "name": "evidenciaHash", "type": "bytes32"}
        ],
        "name": "InfraccionRegistrada",
        "type": "event"
    },
    {
        "inputs": [
            {"internalType": "string", "name": "_actaId", "type": "string"},
            {"internalType": "enum VigilAEProtocol.EstadoActa", "name": "_nuevoEstado", "type": "uint8"},
            {"internalType": "string", "name": "_motivo", "type": "string"}
        ],
        "name": "cambiarEstadoActa",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "string", "name": "", "type": "string"}
        ],
        "name": "expedientes",
        "outputs": [
            {"internalType": "string", "name": "actaId", "type": "string"},
            {"internalType": "string", "name": "placa", "type": "string"},
            {"internalType": "string", "name": "tipoInfraccion", "type": "string"},
            {"internalType": "string", "name": "nodoEmisor", "type": "string"},
            {"internalType": "uint256", "name": "timestamp", "type": "uint256"},
            {"internalType": "enum VigilAEProtocol.EstadoActa", "name": "estado", "type": "uint8"},
            {"internalType": "string", "name": "motivoAnulacion", "type": "string"},
            {"internalType": "bytes32", "name": "evidenciaHash", "type": "bytes32"}
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "uint256", "name": "", "type": "uint256"}
        ],
        "name": "listaActaIds",
        "outputs": [
            {"internalType": "string", "name": "", "type": "string"}
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "obtenerTotalActas",
        "outputs": [
            {"internalType": "uint256", "name": "", "type": "uint256"}
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "owner",
        "outputs": [
            {"internalType": "address", "name": "", "type": "address"}
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "string", "name": "_actaId", "type": "string"},
            {"internalType": "string", "name": "_placa", "type": "string"},
            {"internalType": "string", "name": "_tipoInfraccion", "type": "string"},
            {"internalType": "string", "name": "_nodoEmisor", "type": "string"},
            {"internalType": "bytes32", "name": "_evidenciaHash", "type": "bytes32"}
        ],
        "name": "registrarInfraccion",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "totalInfracciones",
        "outputs": [
            {"internalType": "uint256", "name": "", "type": "uint256"}
        ],
        "stateMutability": "view",
        "type": "function"
    }
]