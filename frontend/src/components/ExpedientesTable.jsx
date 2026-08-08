import React, { useState, useEffect } from 'react';
import { FileText, Search, Ban, CheckCircle, AlertTriangle, ExternalLink, RefreshCw, X, CreditCard } from 'lucide-react';
import { anularActaOnChain, pagarActaOnChain } from '../services/web3Service';

export default function ExpedientesTable() {
  const [expedientes, setExpedientes] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Modales
  const [selectedActaAnular, setSelectedActaAnular] = useState(null);
  const [selectedActaPagar, setSelectedActaPagar] = useState(null);
  
  const [motivoAnulacion, setMotivoAnulacion] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchExpedientes = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/expedientes');
      if (res.ok) {
        const data = await res.json();
        setExpedientes(data.reverse());
      }
    } catch (err) {
      console.error("Error al cargar expedientes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpedientes();
  }, []);

  // Anulación On-Chain
  const handleAnular = async (e) => {
    e.preventDefault();
    if (!selectedActaAnular || !motivoAnulacion.trim()) return;

    setIsProcessing(true);
    try {
      const receipt = await anularActaOnChain(selectedActaAnular.actaId, motivoAnulacion);
      
      await fetch(`http://localhost:8000/api/expedientes/${selectedActaAnular.actaId}/estado`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: 'ANULADA', motivo: motivoAnulacion, txHash: receipt.hash })
      });

      alert(`Acta ${selectedActaAnular.actaId} ANULADA con éxito en Arbitrum Sepolia.`);
      setSelectedActaAnular(null);
      setMotivoAnulacion('');
      fetchExpedientes();
    } catch (error) {
      console.error("Error al anular:", error);
      alert(`No se pudo anular: ${error.reason || error.message || "Verifica tu cuenta en MetaMask"}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Pago On-Chain
  const handlePagar = async () => {
    if (!selectedActaPagar) return;

    setIsProcessing(true);
    try {
      const receipt = await pagarActaOnChain(selectedActaPagar.actaId);
      
      await fetch(`http://localhost:8000/api/expedientes/${selectedActaPagar.actaId}/estado`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: 'PAGADA', motivo: 'Pago Web3 confirmado', txHash: receipt.hash })
      });

      alert(`Acta ${selectedActaPagar.actaId} marcada como PAGADA.`);
      setSelectedActaPagar(null);
      fetchExpedientes();
    } catch (error) {
      console.error("Error al registrar pago:", error);
      alert(`No se pudo procesar el pago: ${error.reason || error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredExpedientes = expedientes.filter(exp => 
    (exp.actaId && exp.actaId.toLowerCase().includes(filter.toLowerCase())) ||
    (exp.placa && exp.placa.toLowerCase().includes(filter.toLowerCase())) ||
    (exp.infraccion && exp.infraccion.toLowerCase().includes(filter.toLowerCase()))
  );

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" /> Registro General de Expedientes Smart Contract
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Consulta y gestión de actas de infracción validadas mediante firma digital en la red Arbitrum
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Buscar por acta, placa o tipo..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 w-64 transition"
            />
          </div>
          <button 
            onClick={fetchExpedientes}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-400' : ''}`} />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase text-[10px]">
            <tr>
              <th className="p-3">ID Acta</th>
              <th className="p-3">Placa</th>
              <th className="p-3">Infracción</th>
              <th className="p-3">Estado</th>
              <th className="p-3">Tx Hash</th>
              <th className="p-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
            {filteredExpedientes.map((exp, idx) => (
              <tr key={idx} className="hover:bg-slate-800/40 transition">
                <td className="p-3 font-bold text-slate-200">{exp.actaId}</td>
                <td className="p-3 text-blue-400 font-bold">{exp.placa}</td>
                <td className="p-3 text-slate-300">{exp.infraccion}</td>
                <td className="p-3">
                  {exp.estado === 'ANULADA' && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 font-bold">
                      <AlertTriangle className="w-3 h-3" /> ANULADA
                    </span>
                  )}
                  {exp.estado === 'PAGADA' && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20 font-bold">
                      <CheckCircle className="w-3 h-3" /> PAGADA
                    </span>
                  )}
                  {exp.estado !== 'ANULADA' && exp.estado !== 'PAGADA' && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-bold">
                      <CheckCircle className="w-3 h-3" /> {exp.estado}
                    </span>
                  )}
                </td>
                <td className="p-3">
                  {exp.hash ? (
                    <a 
                      href={`https://sepolia.arbiscan.io/tx/${exp.hash}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-slate-400 hover:text-blue-400 flex items-center gap-1 transition"
                    >
                      <span>{`${exp.hash.substring(0, 6)}...${exp.hash.substring(exp.hash.length - 4)}`}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : <span className="text-slate-600">N/A</span>}
                </td>
                <td className="p-3 text-right flex justify-end gap-2">
                  {(exp.estado === 'REGISTRADA' || exp.estado === 'PENDIENTE') && (
                    <>
                      <button 
                        onClick={() => setSelectedActaPagar(exp)}
                        className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-600 hover:text-white px-2.5 py-1 rounded-lg border border-emerald-500/30 transition text-[11px]"
                      >
                        <CreditCard className="w-3 h-3" /> Pagar
                      </button>
                      <button 
                        onClick={() => setSelectedActaAnular(exp)}
                        className="inline-flex items-center gap-1 bg-red-500/10 text-red-400 hover:bg-red-600 hover:text-white px-2.5 py-1 rounded-lg border border-red-500/30 transition text-[11px]"
                      >
                        <Ban className="w-3 h-3" /> Anular
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de Anulación */}
      {selectedActaAnular && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Ban className="w-4 h-4 text-red-400" /> Anular Acta {selectedActaAnular.actaId}
              </h4>
              <button onClick={() => setSelectedActaAnular(null)} className="text-slate-500 hover:text-slate-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAnular} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Motivo de Anulación:</label>
                <textarea 
                  rows="3"
                  required
                  placeholder="Ej. Apelación administrativa procedente"
                  value={motivoAnulacion}
                  onChange={(e) => setMotivoAnulacion(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-red-500 transition"
                ></textarea>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setSelectedActaAnular(null)} className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-xl">
                  Cancelar
                </button>
                <button type="submit" disabled={isProcessing} className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl flex items-center gap-2">
                  {isProcessing ? 'Firmando en Blockchain...' : 'Confirmar y Anular'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmación de Pago */}
      {selectedActaPagar && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-400" /> Registrar Pago - Acta {selectedActaPagar.actaId}
              </h4>
              <button onClick={() => setSelectedActaPagar(null)} className="text-slate-500 hover:text-slate-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-300">
              Esta transacción registrará el pago on-chain en Arbitrum Sepolia cambiando el estado a **PAGADA**.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setSelectedActaPagar(null)} className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-xl">
                Cancelar
              </button>
              <button onClick={handlePagar} disabled={isProcessing} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-2">
                {isProcessing ? 'Firmando Pago...' : 'Confirmar Pago On-Chain'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}