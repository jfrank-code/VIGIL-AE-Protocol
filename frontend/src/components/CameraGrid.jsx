import React from 'react';
import { Camera, Eye } from 'lucide-react';

export default function CameraGrid() {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      
      {/* NODO 01: BERMA SUR */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden flex flex-col shadow-2xl backdrop-blur-sm hover:border-slate-700/80 transition-all duration-300">
        <div className="p-3.5 bg-slate-900/90 border-b border-slate-800 flex justify-between items-center">
          <span className="text-xs font-bold text-emerald-400 flex items-center gap-2 font-mono uppercase tracking-wider">
            <Camera className="w-4 h-4 text-emerald-400" /> NODO_01: Berma Sur
          </span>
          <span className="bg-emerald-500/10 text-emerald-400 text-[10px] px-2.5 py-0.5 rounded-full border border-emerald-500/20 font-mono font-bold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> LIVE EZVIZ
          </span>
        </div>

        {/* Streaming Stream EZVIZ HD */}
        <div className="relative aspect-video w-full bg-slate-950 flex items-center justify-center overflow-hidden">
          <img 
            src="http://localhost:8000/video_feed_1" 
            alt="NODO_01 Berma Sur"
            className="w-full h-full object-cover shadow-inner"
            onError={(e) => {
              e.target.onerror = null; 
              e.target.src="https://via.placeholder.com/960x540/0f172a/94a3b8?text=Conectando+Stream+EZVIZ+Nodo+01...";
            }}
          />
        </div>

        <div className="p-2.5 bg-slate-950/80 text-[11px] text-slate-400 flex justify-between font-mono border-t border-slate-800/60">
          <span>IA Activa: <strong className="text-slate-200">YOLOv8 + Polígonos</strong></span>
          <span>Estado: <strong className="text-emerald-400 font-bold">Monitoreando</strong></span>
        </div>
      </div>

      {/* NODO 02: ACCESO CARGA */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden flex flex-col shadow-2xl backdrop-blur-sm hover:border-slate-700/80 transition-all duration-300">
        <div className="p-3.5 bg-slate-900/90 border-b border-slate-800 flex justify-between items-center">
          <span className="text-xs font-bold text-amber-400 flex items-center gap-2 font-mono uppercase tracking-wider">
            <Eye className="w-4 h-4 text-amber-400" /> NODO_02: Acceso Carga
          </span>
          <span className="bg-emerald-500/10 text-emerald-400 text-[10px] px-2.5 py-0.5 rounded-full border border-emerald-500/20 font-mono font-bold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> LIVE EZVIZ
          </span>
        </div>

        {/* Streaming Stream EZVIZ HD */}
        <div className="relative aspect-video w-full bg-slate-950 flex items-center justify-center overflow-hidden">
          <img 
            src="http://localhost:8000/video_feed_2" 
            alt="NODO_02 Acceso Carga"
            className="w-full h-full object-cover shadow-inner"
            onError={(e) => {
              e.target.onerror = null; 
              e.target.src="https://via.placeholder.com/960x540/0f172a/94a3b8?text=Conectando+Stream+EZVIZ+Nodo+02...";
            }}
          />
        </div>

        <div className="p-2.5 bg-slate-950/80 text-[11px] text-slate-400 flex justify-between font-mono border-t border-slate-800/60">
          <span>IA Activa: <strong className="text-slate-200">YOLOv8 + Polígonos</strong></span>
          <span>Estado: <strong className="text-emerald-400 font-bold">Monitoreando</strong></span>
        </div>
      </div>

    </section>
  );
}