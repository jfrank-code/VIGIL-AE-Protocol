import threading
import time
from web3 import Web3
import config
from config import RPC_URL, CONTRACT_ADDRESS, PRIVATE_KEY, CONTRACT_ABI

# Web3 connection
w3 = Web3(Web3.HTTPProvider(RPC_URL))
account = w3.eth.account.from_key(PRIVATE_KEY) if (PRIVATE_KEY and len(PRIVATE_KEY) >= 64) else None
checksum_address = Web3.to_checksum_address(CONTRACT_ADDRESS) if CONTRACT_ADDRESS else None
contract = w3.eth.contract(address=checksum_address, abi=CONTRACT_ABI) if (account and checksum_address) else None

web3_lock = threading.Lock()

# How many times to retry a broadcast before giving up. Real testnets
# occasionally reject a transaction on a transient RPC/nonce hiccup, so a
# single retry with a short backoff meaningfully improves the odds that a
# genuine on-chain hash comes back instead of None.
MAX_REINTENTOS = 2


def _construir_y_enviar(tx_builder):
    """Builds, signs and broadcasts a transaction. Returns the hex tx hash.
    Raises on failure so the caller can decide whether to retry."""
    nonce = w3.eth.get_transaction_count(account.address, 'pending')
    latest_block = w3.eth.get_block('latest')
    base_fee = latest_block.get('baseFeePerGas', w3.to_wei(20, 'gwei'))
    priority_fee = w3.eth.max_priority_fee
    max_fee_per_gas = int(base_fee * 1.3) + priority_fee

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
    tx_hash = w3.eth.send_raw_transaction(getattr(signed_tx, "raw_transaction", getattr(signed_tx, "rawTransaction", None)))
    return w3.to_hex(tx_hash)


def registrar_en_blockchain_auto(acta_id, placa, infraccion, nodo_emisor="Nodo 01"):
    if not account or not contract:
        print("⚠️ Warning: the Web3 account or contract were not initialized correctly.")
        return None

    with web3_lock:
        evidencia_hash = Web3.solidity_keccak(['string', 'string'], [acta_id, placa])

        ultimo_error = None
        for intento in range(1, MAX_REINTENTOS + 1):
            try:
                tx_builder = contract.functions.registrarInfraccion(
                    acta_id,
                    placa,
                    infraccion,
                    nodo_emisor,
                    evidencia_hash
                )
                hash_hex = _construir_y_enviar(tx_builder)
                print(f"✅ Infraction {acta_id} broadcast to Arbitrum Sepolia! Tx hash: {hash_hex}")
                return hash_hex
            except Exception as e:
                ultimo_error = e
                print(f"⚠️ Attempt {intento}/{MAX_REINTENTOS} to register {acta_id} on-chain failed: {e}")
                if intento < MAX_REINTENTOS:
                    time.sleep(1.5)

        print(f"❌ Giving up on registering {acta_id} on-chain after {MAX_REINTENTOS} attempts: {ultimo_error}")
        return None


def esperar_confirmacion_tx(tx_hash, timeout=90):
    """
    Blocks (in the caller's own background thread — never call this from
    the main request/analytics threads) until the given transaction is
    mined, or the timeout elapses. Returns a dict describing the real
    on-chain outcome so the caller can update the UI honestly instead of
    just assuming the broadcast succeeded:
        {"confirmado": True,  "bloque": <int>}   -> mined and succeeded
        {"confirmado": False, "bloque": <int>}   -> mined but reverted
        {"confirmado": None,  "error": "..."}    -> timed out / RPC error
    """
    try:
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=timeout)
        return {"confirmado": receipt.status == 1, "bloque": receipt.blockNumber}
    except Exception as e:
        print(f"⚠️ Could not confirm tx {tx_hash} within {timeout}s: {e}")
        return {"confirmado": None, "error": str(e)}


def cambiar_estado_en_blockchain(acta_id, nuevo_estado_int, motivo=""):
    """
    Updates a case's status on the smart contract.
    0 = REGISTERED, 1 = PAID, 2 = VOIDED
    """
    if not account or not contract:
        print("⚠️ Warning: the Web3 account or contract were not initialized correctly.")
        return None

    with web3_lock:
        ultimo_error = None
        for intento in range(1, MAX_REINTENTOS + 1):
            try:
                tx_builder = contract.functions.cambiarEstadoActa(
                    acta_id,
                    nuevo_estado_int,
                    motivo
                )
                hash_hex = _construir_y_enviar(tx_builder)
                print(f"✅ Status of case {acta_id} updated on-chain to {nuevo_estado_int}. Tx hash: {hash_hex}")
                return hash_hex
            except Exception as e:
                ultimo_error = e
                print(f"⚠️ Attempt {intento}/{MAX_REINTENTOS} to update status for {acta_id} failed: {e}")
                if intento < MAX_REINTENTOS:
                    time.sleep(1.5)

        print(f"❌ Giving up on updating {acta_id}'s status on-chain after {MAX_REINTENTOS} attempts: {ultimo_error}")
        return None