import React, { useState, useEffect } from 'react';
import { ShieldCheck, ExternalLink, Database } from 'lucide-react';
import { API_URL } from '../config/apiConfig';

// Configuración de la URL base API

export default function OracleTable() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_URL}/api/stats`);
        if (!res.ok) return;
        const data = await res.json();
        
        // Map the payload returned by the Python backend.
        // IMPORTANT: never fabricate a fake tx hash here. A real on-chain hash
        // is either present (item.hash, set by the backend after a confirmed
        // Arbitrum transaction) or it isn't — in which case we show a
        // "Pending" state instead of inventing something that looks real.
        if (data.registros_multas && Array.isArray(data.registros_multas)) {
          const mappedLogs = data.registros_multas.map((item, idx) => ({
            id: item.actaId || item.id || `ACTA-${idx + 1}`,
            hora: item.hora || '12:00:00',
            placa: item.placa || 'NOT DETECTED',
            tipo: item.infraccion || item.tipoInfraccion || 'Restricted Zone',
            tx: item.hash || null,
          }));
          setLogs(mappedLogs.reverse()); // Show most recent first
        }
      } catch (err) {
        console.error("Error syncing with the Web3 Oracle:", err);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-sm hover:border-slate-700 transition flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Web3 Oracle (Arbitrum Sepolia)
          </h3>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            IMMUTABLE
          </span>
        </div>

        <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
          {logs.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6 font-mono">
              Waiting for real-time AI detections...
            </p>
          ) : (
            logs.map((item, idx) => (
              <div 
                key={idx} 
                className="p-3 bg-slate-950/80 border border-slate-800 hover:border-blue-500/40 rounded-xl text-xs font-mono transition flex justify-between items-center group"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-blue-400 font-bold">{item.placa}</span>
                    <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">{item.id}</span>
                  </div>
                  <p className="text-[10px] text-slate-400">{item.tipo} • <span className="text-slate-500">{item.hora}</span></p>
                </div>

                {item.tx && item.tx.startsWith('0x') && item.tx.length > 20 ? (
                  <a
                    href={`https://sepolia.arbiscan.io/tx/${item.tx}`}
                    target="_blank"
                    rel="noreferrer"
                    title="View the real transaction on Arbiscan"
                    className="flex items-center gap-1 text-[10px] bg-blue-600/10 text-blue-400 hover:bg-blue-600 hover:text-white px-2.5 py-1.5 rounded-lg border border-blue-500/30 transition shadow-sm font-medium"
                  >
                    <span>{`${item.tx.substring(0, 8)}...${item.tx.substring(item.tx.length - 4)}`}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <span
                    title="The transaction has not been confirmed on Arbitrum yet"
                    className="flex items-center gap-1 text-[10px] bg-amber-500/10 text-amber-400 px-2.5 py-1.5 rounded-lg border border-amber-500/30 font-medium"
                  >
                    Pending confirmation
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800/80 flex justify-between text-[10px] text-slate-500 font-mono">
        <span className="flex items-center gap-1"><Database className="w-3 h-3 text-slate-600"/> Smart Contract Active</span>
        <span className="text-emerald-400 font-bold">100% Synced</span>
      </div>
    </div>
  );
}