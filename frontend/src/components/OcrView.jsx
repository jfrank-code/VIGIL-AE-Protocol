import React, { useState } from 'react';
import { ShieldAlert, Search, Car, FileText, CheckCircle, AlertTriangle } from 'lucide-react';

export default function OcrView() {
  const [placaBuscada, setPlacaBuscada] = useState('');
  const [placaActiva, setPlacaActiva] = useState('NINGUNA');

  const handleBuscar = (e) => {
    e.preventDefault();
    if (placaBuscada.trim()) {
      setPlacaActiva(placaBuscada.toUpperCase());
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* BARRA SUPERIOR DE BÚSQUEDA ANPR */}
      <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-xl backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100 font-mono uppercase tracking-wider">
              Módulo ANPR - Reconocimiento & Fiscalización Vial
            </h2>
            <p className="text-xs text-slate-400">Detección de Vehículos Detenidos & Lectura de Placas</p>
          </div>
        </div>

        {/* Formulario de Placa Objetivo */}
        <form onSubmit={handleBuscar} className="flex items-center gap-2">
          <div className="relative">
            <input
              type="text"
              placeholder="INGRESAR PLACA (Ej: P3A-891)..."
              value={placaBuscada}
              onChange={(e) => setPlacaBuscada(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-slate-100 text-xs px-3.5 py-2 rounded-xl focus:outline-none focus:border-blue-500 font-mono tracking-widest w-64 uppercase"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 transition font-mono shadow-lg shadow-blue-600/20"
          >
            <Search className="w-3.5 h-3.5" /> FOCALIZAR
          </button>
        </form>
      </div>

      {/* GRID PRINCIPAL DE VIDEO Y ANÁLISIS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* REPRODUCTOR PRINCIPAL DEL VIDEO TRAFICO.MP4 (2 COLUMNAS) */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden flex flex-col shadow-2xl">
          <div className="p-3.5 bg-slate-900 border-b border-slate-800 flex justify-between items-center">
            <span className="text-xs font-bold text-blue-400 flex items-center gap-2 font-mono uppercase">
              <Car className="w-4 h-4" /> Stream Analítico: Detección de Infracciones
            </span>
            <span className="bg-blue-500/10 text-blue-400 text-[10px] px-2.5 py-0.5 rounded-full border border-blue-500/20 font-mono font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span> HYPERLPR3 ACTIVO
            </span>
          </div>

          {/* Video Stream de Trafico.mp4 desde Python */}
            <div className="relative w-full h-[450px] bg-black rounded-lg overflow-hidden flex items-center justify-center">
            <video 
                src="/trafico.mp4" 
                autoPlay 
                loop 
                muted 
                playsInline 
                className="w-full h-full object-cover"
            />
            </div>

          <div className="p-3 bg-slate-950/80 text-xs text-slate-400 flex justify-between font-mono border-t border-slate-800/60">
            <span>Objetivo en Mira: <strong className="text-amber-400 font-bold">{placaActiva}</strong></span>
            <span>Alerta WhatsApp: <strong className="text-emerald-400 font-bold">CONFIGURADA</strong></span>
          </div>
        </div>

        {/* PANEL LATERAL: HISTORIAL DE DETENIDOS E INFRACCIONES */}
        <div className="space-y-6 flex flex-col">
          
          {/* Tarjeta de Vehículo Detenido */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl">
            <h3 className="text-xs font-bold text-rose-400 font-mono uppercase mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> Captura: Vehículo Detenido
            </h3>
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex flex-col items-center justify-center gap-2">
              <div className="w-full h-24 bg-slate-900 rounded-lg flex items-center justify-center text-xs text-slate-600 font-mono border border-slate-800/80">
                [ RECORTE ROI EN TIEMPO REAL ]
              </div>
              <span className="text-[11px] font-mono text-rose-400 font-bold mt-1">
                MULTA EN PROCESO (&gt; 3 SEG QUIETO)
              </span>
            </div>
          </div>

          {/* Tabla de Actas Fiscalizadoras */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl flex-1 flex flex-col">
            <h3 className="text-xs font-bold text-slate-200 font-mono uppercase mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-400" /> Registro de Infracciones
            </h3>
            <div className="space-y-2 font-mono text-xs flex-1">
              <div className="bg-slate-950/60 border border-slate-800/80 p-2.5 rounded-xl flex justify-between items-center">
                <span className="text-slate-400">14:22:01</span>
                <span className="text-amber-400 font-bold">P3A-891</span>
                <span className="text-rose-400 text-[10px] bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">DETENIDO</span>
              </div>
              <div className="bg-slate-950/60 border border-slate-800/80 p-2.5 rounded-xl flex justify-between items-center">
                <span className="text-slate-400">14:25:30</span>
                <span className="text-amber-400 font-bold">M1B-450</span>
                <span className="text-emerald-400 text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">MARCHA</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}