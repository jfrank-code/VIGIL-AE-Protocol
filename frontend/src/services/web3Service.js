import { ethers } from 'ethers';

// Smart contract address deployed on Arbitrum Sepolia
const CONTRACT_ADDRESS = "0xa95eCCEd4020B098155E13d404BF2d53133bd8Bf";

// Smart contract ABI (Register, Void, Pay and Query functions)
const CONTRACT_ABI = [
  "function registrarInfraccion(string _actaId, string _placa, string _infraccion) public",
  "function anularActa(string _actaId, string _motivo) public",
  "function pagarActa(string _actaId) public",
  "function cambiarEstadoActa(string _actaId, uint8 _nuevoEstado, string _motivo) public",
  "function obtenerExpediente(string _actaId) public view returns (string, string, string, string)"
];

/**
 * Checks and automatically switches the MetaMask network to Arbitrum Sepolia (ChainID: 421614 / 0x66eee)
 */
export const asegurarRedArbitrumSepolia = async () => {
  if (!window.ethereum) throw new Error("MetaMask is not installed in this browser.");
  
  const chainId = await window.ethereum.request({ method: 'eth_chainId' });
  const ARBITRUM_SEPOLIA_CHAIN_ID = '0x66eee'; // 421614 in hex

  if (chainId !== ARBITRUM_SEPOLIA_CHAIN_ID) {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: ARBITRUM_SEPOLIA_CHAIN_ID }],
      });
    } catch (switchError) {
      // If the network isn't added to MetaMask yet (error 4902), add it automatically
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
 * Gets the Signer and computes dynamic gas fees with a +25% margin
 * to avoid the 'max fee per gas less than block base fee' error
 */
const getSignerAndOverrides = async () => {
  await asegurarRedArbitrumSepolia();
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  const feeData = await provider.getFeeData();
  const overrides = {};

  // 25% buffer for gas fluctuations across Arbitrum's fast blocks
  if (feeData.maxFeePerGas) {
    overrides.maxFeePerGas = (feeData.maxFeePerGas * 125n) / 100n;
  }
  if (feeData.maxPriorityFeePerGas) {
    overrides.maxPriorityFeePerGas = (feeData.maxPriorityFeePerGas * 125n) / 100n;
  }

  return { signer, overrides };
};

/**
 * 1. Register a real infraction on-chain via MetaMask
 */
export const registrarInfraccionOnChain = async (actaId, placa, infraccion) => {
  try {
    const { signer, overrides } = await getSignerAndOverrides();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    
    const tx = await contract.registrarInfraccion(actaId, placa, infraccion, overrides);
    console.log("Transaction sent:", tx.hash);
    
    const receipt = await tx.wait();
    return receipt;
  } catch (error) {
    console.error("Error registering the infraction on-chain:", error);
    throw error;
  }
};

/**
 * 2. Void a case on-chain with the user's own digital signature
 */
export const anularActaOnChain = async (actaId, motivo) => {
  try {
    const { signer, overrides } = await getSignerAndOverrides();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    
    let tx;
    try {
      tx = await contract.anularActa(actaId, motivo, overrides);
    } catch (err) {
      // Fallback to the uint8 enum (2 = VOIDED)
      tx = await contract.cambiarEstadoActa(actaId, 2, motivo, overrides);
    }

    console.log("Void transaction sent:", tx.hash);
    const receipt = await tx.wait();
    return receipt;
  } catch (error) {
    console.error("Error voiding the case on-chain:", error);
    throw error;
  }
};

/**
 * 3. Pay a case on-chain with the user's own digital signature
 */
export const pagarActaOnChain = async (actaId) => {
  try {
    const { signer, overrides } = await getSignerAndOverrides();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    
    let tx;
    try {
      tx = await contract.pagarActa(actaId, overrides);
    } catch (err) {
      // Fallback to the uint8 enum (1 = PAID)
      tx = await contract.cambiarEstadoActa(actaId, 1, "Voluntary payment recorded", overrides);
    }

    console.log("Payment transaction sent:", tx.hash);
    const receipt = await tx.wait();
    return receipt;
  } catch (error) {
    console.error("Error recording the payment on-chain:", error);
    throw error;
  }
};

/**
 * 4. Read a case's existence and status directly from the blockchain (read-only)
 */
export const fetchExpedienteOnChain = async (actaId) => {
  try {
    await asegurarRedArbitrumSepolia();
    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
    
    const res = await contract.obtenerExpediente(actaId);
    return { actaId: res[0], placa: res[1], infraccion: res[2], estado: res[3] };
  } catch (error) {
    console.error("Error querying the case on-chain:", error);
    return null;
  }
};