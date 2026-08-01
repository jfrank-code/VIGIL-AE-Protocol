import React from 'react';
import { ShieldCheck, ExternalLink, Hash, Database } from 'lucide-react';

export default function OracleTable() {
  const logs = [
    { id: 'ACTA-001', hora: '14:23:05', placa: 'P3A-891', tipo: 'Zona Rígida', tx: '0x3f...82a1' },
    { id: 'ACTA-002', hora: '14:28:40', placa: 'M1B-450', tipo: 'Exceso Berma', tx: '0x9b...11c4' },
    { id: 'ACTA-003', hora: '14:35:12', placa: 'F5R-902', tipo: 'Obstrucción', tx: '0x1a...e590' },
  ];

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-sm hover:border-slate-700 transition flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Oráculo Web3 (Arbitrum Sepolia)
          </h3>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            INMUTABLE
          </span>
        </div>

        <div className="space-y-2.5">
          {logs.map((item, idx) => (
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

              <a 
                href="https://sepolia.arbiscan.io/" 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center gap-1 text-[10px] bg-blue-600/10 text-blue-400 hover:bg-blue-600 hover:text-white px-2.5 py-1.5 rounded-lg border border-blue-500/30 transition shadow-sm font-medium"
              >
                <span>{item.tx}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800/80 flex justify-between text-[10px] text-slate-500 font-mono">
        <span className="flex items-center gap-1"><Database className="w-3 h-3 text-slate-600"/> Smart Contract Activo</span>
        <span className="text-emerald-400 font-bold">100% Sincronizado</span>
      </div>
    </div>
  );
}