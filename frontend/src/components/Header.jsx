import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Cpu, Camera, Eye, FileText, Download, ArrowLeft } from 'lucide-react';
import { generatePdfReport } from '../utils/reportGenerator';

export default function Header({ searchPlate, setSearchPlate, activeTab, setActiveTab, stats }) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 flex flex-col md:flex-row justify-between items-start md:items-center pb-6 pt-4 mb-6 border-b border-slate-800 gap-4">
      {/* TÍTULO Y BOTÓN VOLVER */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/')}
          className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white rounded-xl transition-all"
          title="Volver a la Landing Page"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 border border-blue-500/30 rounded-xl text-blue-400">
            <Cpu className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-wider bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
              VIGIL-AE Protocol
            </h1>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Panel de Fiscalización Municipal
            </p>
          </div>
        </div>
      </div>

      {/* NAVEGACIÓN Y HERRAMIENTAS */}
      <div className="flex flex-wrap items-center gap-3">
        
        {/* BOTONES DE SECCIÓN */}
        <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-xl gap-1">
          <button
            onClick={() => setActiveTab('cameras')}
            className={`flex items-center gap-1.5 text-xs font-mono font-bold px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'cameras'
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Camera className="w-3.5 h-3.5" /> CÁMARAS EN VIVO
          </button>

          <button
            onClick={() => setActiveTab('ocr')}
            className={`flex items-center gap-1.5 text-xs font-mono font-bold px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'ocr'
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" /> ANPR
          </button>

          <button
            onClick={() => setActiveTab('expedientes')}
            className={`flex items-center gap-1.5 text-xs font-mono font-bold px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'expedientes'
                ? 'bg-cyan-600/20 text-cyan-400 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> EXPEDIENTES
          </button>
        </div>

        {/* BOTÓN DESCARGAR REPORTE PDF CON DATOS REALES */}
        <button
          onClick={() => generatePdfReport(stats, searchPlate)}
          className="flex items-center gap-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold px-3.5 py-2 rounded-xl transition-all shadow-lg active:scale-95"
        >
          <Download className="w-4 h-4 text-emerald-400" />
          DESCARGAR REPORTE PDF
        </button>

        {/* Buscador de Placas */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1.5 rounded-lg">
          <Search className="w-4 h-4 text-slate-400 ml-1" />
        </div>
      </div>
    </header>
  );
}