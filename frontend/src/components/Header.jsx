import React from 'react';
import { Search, ShieldAlert, Cpu } from 'lucide-react';

export default function Header({ searchPlate, setSearchPlate }) {
  return (
    <header className="flex flex-col md:flex-row justify-between items-start md:items-center pb-6 mb-6 border-b border-slate-800 gap-4">
      <div>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 border border-blue-500/30 rounded-xl text-blue-400">
            <Cpu className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-wider bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
              VIGIL-AE Protocol
            </h1>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Sistema Autónomo de Fiscalización Vial Portuaria & Oráculo Blockchain
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* Status Badge */}
        <div className="flex items-center gap-2 bg-slate-900/90 border border-emerald-500/30 px-3 py-1.5 rounded-full shadow-inner">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span className="text-xs font-mono font-medium text-emerald-400">
            Arbitrum Sepolia: Connected
          </span>
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 focus-within:border-blue-500/50 p-1.5 rounded-lg transition-all shadow-sm">
          <Search className="w-4 h-4 text-slate-400 ml-2" />
          <input 
            type="text" 
            value={searchPlate}
            onChange={(e) => setSearchPlate(e.target.value.toUpperCase())}
            placeholder="Buscar Placa Objetivo..."
            className="bg-transparent text-xs focus:outline-none text-blue-300 font-mono uppercase w-32 md:w-40 placeholder:text-slate-600"
          />
          <button className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-3 py-1 rounded font-medium transition shadow-md shadow-blue-900/20 active:scale-95">
            Filtrar
          </button>
        </div>
      </div>
    </header>
  );
}