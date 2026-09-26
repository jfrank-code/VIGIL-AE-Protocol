import React, { useState, useEffect } from 'react';
import { FileText, Search, Ban, CheckCircle, AlertTriangle, ExternalLink, RefreshCw, X, CreditCard } from 'lucide-react';
import { anularActaOnChain, pagarActaOnChain } from '../services/web3Service';
import { API_URL } from '../config/apiConfig';

export default function ExpedientesTable() {
  const [expedientes, setExpedientes] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Modals
  const [selectedActaAnular, setSelectedActaAnular] = useState(null);
  const [selectedActaPagar, setSelectedActaPagar] = useState(null);
  
  const [motivoAnulacion, setMotivoAnulacion] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchExpedientes = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/expedientes`);
      if (res.ok) {
        const data = await res.json();
        setExpedientes(data.reverse());
      }
    } catch (err) {
      console.error("Error loading case files:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpedientes();
  }, []);

  // On-chain void/cancel
  const handleAnular = async (e) => {
    e.preventDefault();
    if (!selectedActaAnular || !motivoAnulacion.trim()) return;

    setIsProcessing(true);
    try {
      const receipt = await anularActaOnChain(selectedActaAnular.actaId, motivoAnulacion);
      
      await fetch(`${API_URL}/api/expedientes/${selectedActaAnular.actaId}/estado`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: 'ANULADA', motivo: motivoAnulacion, txHash: receipt.hash })
      });

      alert(`Case ${selectedActaAnular.actaId} was successfully VOIDED on Arbitrum Sepolia.`);
      setSelectedActaAnular(null);
      setMotivoAnulacion('');
      fetchExpedientes();
    } catch (error) {
      console.error("Error voiding case:", error);
      alert(`Could not void the case: ${error.reason || error.message || "Check your MetaMask account"}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // On-chain payment
  const handlePagar = async () => {
    if (!selectedActaPagar) return;

    setIsProcessing(true);
    try {
      const receipt = await pagarActaOnChain(selectedActaPagar.actaId);
      
      await fetch(`${API_URL}/api/expedientes/${selectedActaPagar.actaId}/estado`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: 'PAGADA', motivo: 'Web3 payment confirmed', txHash: receipt.hash })
      });

      alert(`Case ${selectedActaPagar.actaId} marked as PAID.`);
      setSelectedActaPagar(null);
      fetchExpedientes();
    } catch (error) {
      console.error("Error recording payment:", error);
      alert(`Could not process the payment: ${error.reason || error.message}`);
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
            <FileText className="w-5 h-5 text-blue-400" /> General Smart Contract Case Registry
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Look up and manage infraction records validated via digital signature on the Arbitrum network
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Search by case, plate or type..."
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
              <th className="p-3">Case ID</th>
              <th className="p-3">Plate</th>
              <th className="p-3">Infraction</th>
              <th className="p-3">Status</th>
              <th className="p-3">Tx Hash</th>
              <th className="p-3 text-right">Actions</th>
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
                      <AlertTriangle className="w-3 h-3" /> VOIDED
                    </span>
                  )}
                  {exp.estado === 'PAGADA' && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20 font-bold">
                      <CheckCircle className="w-3 h-3" /> PAID
                    </span>
                  )}
                  {exp.estado !== 'ANULADA' && exp.estado !== 'PAGADA' && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-bold">
                      <CheckCircle className="w-3 h-3" /> {exp.estado === 'REGISTRADA' ? 'REGISTERED' : (exp.estado || 'REGISTERED')}
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
                        <CreditCard className="w-3 h-3" /> Pay
                      </button>
                      <button 
                        onClick={() => setSelectedActaAnular(exp)}
                        className="inline-flex items-center gap-1 bg-red-500/10 text-red-400 hover:bg-red-600 hover:text-white px-2.5 py-1 rounded-lg border border-red-500/30 transition text-[11px]"
                      >
                        <Ban className="w-3 h-3" /> Void
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Void Case Modal */}
      {selectedActaAnular && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Ban className="w-4 h-4 text-red-400" /> Void Case {selectedActaAnular.actaId}
              </h4>
              <button onClick={() => setSelectedActaAnular(null)} className="text-slate-500 hover:text-slate-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAnular} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Reason for Voiding:</label>
                <textarea 
                  rows="3"
                  required
                  placeholder="E.g. Administrative appeal granted"
                  value={motivoAnulacion}
                  onChange={(e) => setMotivoAnulacion(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-red-500 transition"
                ></textarea>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setSelectedActaAnular(null)} className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-xl">
                  Cancel
                </button>
                <button type="submit" disabled={isProcessing} className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl flex items-center gap-2">
                  {isProcessing ? 'Signing on Blockchain...' : 'Confirm and Void'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Confirmation Modal */}
      {selectedActaPagar && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-400" /> Record Payment - Case {selectedActaPagar.actaId}
              </h4>
              <button onClick={() => setSelectedActaPagar(null)} className="text-slate-500 hover:text-slate-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-300">
              This transaction will record the payment on-chain on Arbitrum Sepolia, changing the status to **PAID**.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setSelectedActaPagar(null)} className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-xl">
                Cancel
              </button>
              <button onClick={handlePagar} disabled={isProcessing} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-2">
                {isProcessing ? 'Signing Payment...' : 'Confirm On-Chain Payment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}