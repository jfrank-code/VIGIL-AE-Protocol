import { ethers } from 'ethers';

// Dirección del Smart Contract desplegado en Arbitrum Sepolia
const CONTRACT_ADDRESS = "0xa95eCCEd4020B098155E13d404BF2d53133bd8Bf";

// ABI actualizado con las funciones del Smart Contract (Registrar, Anular, Pagar y Consultar)
const CONTRACT_ABI = [
  "function registrarInfraccion(string _actaId, string _placa, string _infraccion) public",
  "function anularActa(string _actaId, string _motivo) public",
  "function pagarActa(string _actaId) public",
  "function cambiarEstadoActa(string _actaId, uint8 _nuevoEstado, string _motivo) public",
  "function obtenerExpediente(string _actaId) public view returns (string, string, string, string)"
];

/**
 * Verifica y conmuta automáticamente la red de MetaMask a Arbitrum Sepolia (ChainID: 421614 / 0x66eee)
 */
export const asegurarRedArbitrumSepolia = async () => {
  if (!window.ethereum) throw new Error("MetaMask no está instalado en el navegador.");
  
  const chainId = await window.ethereum.request({ method: 'eth_chainId' });
  const ARBITRUM_SEPOLIA_CHAIN_ID = '0x66eee'; // 421614 en hexadecimal

  if (chainId !== ARBITRUM_SEPOLIA_CHAIN_ID) {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: ARBITRUM_SEPOLIA_CHAIN_ID }],
      });
    } catch (switchError) {
      // Si la red no está agregada en MetaMask (error 4902), la añade automáticamente
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: ARBITRUM_SEPOLIA_CHAIN_ID,
            chainName: 'Arbitrum Sepolia',
            nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
            rpcUrls: ['https://sepolia-rollup.arbitrum.io/rpc'],
            blockExplorerUrls: ['https://sepolia.arbiscan.io/']
          }]
        });
      } else {
        throw switchError;
      }
    }
  }
};

/**
 * Obtiene el Signer y calcula las tarifas de gas dinámicas con un margen del +25%
 * para evitar el error 'max fee per gas less than block base fee'
 */
const getSignerAndOverrides = async () => {
  await asegurarRedArbitrumSepolia();
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  const feeData = await provider.getFeeData();
  const overrides = {};

  // Colchón del 25% para fluctuaciones de gas en bloques rápidos de Arbitrum
  if (feeData.maxFeePerGas) {
    overrides.maxFeePerGas = (feeData.maxFeePerGas * 125n) / 100n;
  }
  if (feeData.maxPriorityFeePerGas) {
    overrides.maxPriorityFeePerGas = (feeData.maxPriorityFeePerGas * 125n) / 100n;
  }

  return { signer, overrides };
};

/**
 * 1. Registrar Infracción Real en Blockchain mediante MetaMask
 */
export const registrarInfraccionOnChain = async (actaId, placa, infraccion) => {
  try {
    const { signer, overrides } = await getSignerAndOverrides();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    
    const tx = await contract.registrarInfraccion(actaId, placa, infraccion, overrides);
    console.log("Transacción enviada:", tx.hash);
    
    const receipt = await tx.wait();
    return receipt;
  } catch (error) {
    console.error("Error al registrar infracción en Blockchain:", error);
    throw error;
  }
};

/**
 * 2. Anular Acta Real en Blockchain con firma digital del usuario
 */
export const anularActaOnChain = async (actaId, motivo) => {
  try {
    const { signer, overrides } = await getSignerAndOverrides();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    
    let tx;
    try {
      tx = await contract.anularActa(actaId, motivo, overrides);
    } catch (err) {
      // Fallback a enum uint8 (2 = ANULADA)
      tx = await contract.cambiarEstadoActa(actaId, 2, motivo, overrides);
    }

    console.log("Transacción de anulación enviada:", tx.hash);
    const receipt = await tx.wait();
    return receipt;
  } catch (error) {
    console.error("Error al anular acta en Blockchain:", error);
    throw error;
  }
};

/**
 * 3. Pagar Acta Real en Blockchain con firma digital del usuario
 */
export const pagarActaOnChain = async (actaId) => {
  try {
    const { signer, overrides } = await getSignerAndOverrides();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    
    let tx;
    try {
      tx = await contract.pagarActa(actaId, overrides);
    } catch (err) {
      // Fallback a enum uint8 (1 = PAGADA)
      tx = await contract.cambiarEstadoActa(actaId, 1, "Pago voluntario registrado", overrides);
    }

    console.log("Transacción de pago enviada:", tx.hash);
    const receipt = await tx.wait();
    return receipt;
  } catch (error) {
    console.error("Error al registrar el pago en Blockchain:", error);
    throw error;
  }
};

/**
 * 4. Consultar la existencia y estado de un expediente directamente en la Blockchain (Lectura)
 */
export const fetchExpedienteOnChain = async (actaId) => {
  try {
    await asegurarRedArbitrumSepolia();
    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
    
    const res = await contract.obtenerExpediente(actaId);
    return { actaId: res[0], placa: res[1], infraccion: res[2], estado: res[3] };
  } catch (error) {
    console.error("Error al consultar expediente on-chain:", error);
    return null;
  }
};