import threading
import time
from web3 import Web3
import config
from config import RPC_URL, CONTRACT_ADDRESS, PRIVATE_KEY, CONTRACT_ABI

# Conexión Web3
w3 = Web3(Web3.HTTPProvider(RPC_URL))
account = w3.eth.account.from_key(PRIVATE_KEY) if (PRIVATE_KEY and len(PRIVATE_KEY) >= 64) else None
checksum_address = Web3.to_checksum_address(CONTRACT_ADDRESS) if CONTRACT_ADDRESS else None
contract = w3.eth.contract(address=checksum_address, abi=CONTRACT_ABI) if (account and checksum_address) else None

web3_lock = threading.Lock()

def registrar_en_blockchain_auto(acta_id, placa, infraccion, nodo_emisor="Nodo 01"):
    if not account or not contract:
        print("⚠️ Advertencia: Cuenta o contrato Web3 no inicializados correctamente.")
        return None

    with web3_lock:
        try:
            evidencia_hash = Web3.solidity_keccak(['string', 'string'], [acta_id, placa])
            nonce = w3.eth.get_transaction_count(account.address, 'pending')

            latest_block = w3.eth.get_block('latest')
            base_fee = latest_block.get('baseFeePerGas', w3.to_wei(20, 'gwei'))
            priority_fee = w3.eth.max_priority_fee
            max_fee_per_gas = int(base_fee * 1.3) + priority_fee

            tx_builder = contract.functions.registrarInfraccion(
                acta_id,          
                placa,            
                infraccion,       
                nodo_emisor,      
                evidencia_hash    
            )

            estimated_gas = tx_builder.estimate_gas({'from': account.address})

            tx = tx_builder.build_transaction({
                'from': account.address,
                'chainId': 421614,
                'gas': int(estimated_gas * 1.2),
                'maxFeePerGas': max_fee_per_gas,
                'maxPriorityFeePerGas': priority_fee,
                'nonce': nonce,
            })

            signed_tx = w3.eth.account.sign_transaction(tx, private_key=PRIVATE_KEY)
            tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)
            hash_hex = w3.to_hex(tx_hash)
            
            time.sleep(0.8)
            print(f"✅ Infracción {acta_id} registrada con éxito en Arbitrum Sepolia! Hash: {hash_hex}")
            return hash_hex

        except Exception as e:
            print(f"⚠️ Error al registrar en Blockchain para {acta_id}: {e}")
            return None

def cambiar_estado_en_blockchain(acta_id, nuevo_estado_int, motivo=""):
    """
    Modifica el estado en el contrato inteligente.
    0 = REGISTRADA, 1 = PAGADA, 2 = ANULADA
    """
    if not account or not contract:
        print("⚠️ Advertencia: Cuenta o contrato Web3 no inicializados correctamente.")
        return None

    with web3_lock:
        try:
            nonce = w3.eth.get_transaction_count(account.address, 'pending')
            latest_block = w3.eth.get_block('latest')
            base_fee = latest_block.get('baseFeePerGas', w3.to_wei(20, 'gwei'))
            priority_fee = w3.eth.max_priority_fee
            max_fee_per_gas = int(base_fee * 1.3) + priority_fee

            tx_builder = contract.functions.cambiarEstadoActa(
                acta_id,
                nuevo_estado_int,
                motivo
            )

            estimated_gas = tx_builder.estimate_gas({'from': account.address})

            tx = tx_builder.build_transaction({
                'from': account.address,
                'chainId': 421614,
                'gas': int(estimated_gas * 1.2),
                'maxFeePerGas': max_fee_per_gas,
                'maxPriorityFeePerGas': priority_fee,
                'nonce': nonce,
            })

            signed_tx = w3.eth.account.sign_transaction(tx, private_key=PRIVATE_KEY)
            tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)
            hash_hex = w3.to_hex(tx_hash)

            print(f"✅ Estado del acta {acta_id} modificado en Blockchain a {nuevo_estado_int}. Hash: {hash_hex}")
            return hash_hex

        except Exception as e:
            print(f"⚠️ Error al cambiar estado en Blockchain para {acta_id}: {e}")
            return None