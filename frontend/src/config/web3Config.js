// src/config/web3Config.js
// Reemplaza esta variable con la dirección completa que copiaste de Remix:
export const CONTRACT_ADDRESS = "0xa95eCCEd4020B098155E13d404BF2d53133bd8Bf";

export const CONTRACT_ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "string", "name": "actaId", "type": "string" },
      { "indexed": false, "internalType": "enum VigilAEProtocol.EstadoActa", "name": "nuevoEstado", "type": "uint8" },
      { "indexed": false, "internalType": "string", "name": "motivo", "type": "string" }
    ],
    "name": "EstadoCambiado",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "string", "name": "actaId", "type": "string" },
      { "indexed": false, "internalType": "string", "name": "placa", "type": "string" },
      { "indexed": false, "internalType": "string", "name": "tipoInfraccion", "type": "string" },
      { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" },
      { "indexed": false, "internalType": "bytes32", "name": "evidenciaHash", "type": "bytes32" }
    ],
    "name": "InfraccionRegistrada",
    "type": "event"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "_actaId", "type": "string" },
      { "internalType": "enum VigilAEProtocol.EstadoActa", "name": "_nuevoEstado", "type": "uint8" },
      { "internalType": "string", "name": "_motivo", "type": "string" }
    ],
    "name": "cambiarEstadoActa",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "", "type": "string" }
    ],
    "name": "expedientes",
    "outputs": [
      { "internalType": "string", "name": "actaId", "type": "string" },
      { "internalType": "string", "name": "placa", "type": "string" },
      { "internalType": "string", "name": "tipoInfraccion", "type": "string" },
      { "internalType": "string", "name": "nodoEmisor", "type": "string" },
      { "internalType": "uint256", "name": "timestamp", "type": "uint256" },
      { "internalType": "enum VigilAEProtocol.EstadoActa", "name": "estado", "type": "uint8" },
      { "internalType": "string", "name": "motivoAnulacion", "type": "string" },
      { "internalType": "bytes32", "name": "evidenciaHash", "type": "bytes32" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "name": "listaActaIds",
    "outputs": [
      { "internalType": "string", "name": "", "type": "string" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "obtenerTotalActas",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      { "internalType": "address", "name": "", "type": "address" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "_actaId", "type": "string" },
      { "internalType": "string", "name": "_placa", "type": "string" },
      { "internalType": "string", "name": "_tipoInfraccion", "type": "string" },
      { "internalType": "string", "name": "_nodoEmisor", "type": "string" },
      { "internalType": "bytes32", "name": "_evidenciaHash", "type": "bytes32" }
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
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];