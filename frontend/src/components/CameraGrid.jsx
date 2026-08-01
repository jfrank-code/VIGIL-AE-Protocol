import React from 'react';
import { Camera, Eye, Zap } from 'lucide-react';

export default function CameraGrid() {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      
      {/* CÁMARA 01 - EZVIZ CANAL 1 */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden flex flex-col shadow-xl">
        <div className="p-3.5 bg-slate-900 border-b border-slate-800 flex justify-between items-center">
          <span className="text-xs font-semibold text-emerald-400 flex items-center gap-2 font-mono">
            <Camera className="w-4 h-4 text-emerald-400" /> NODO_01: Berma Sur
          </span>
          <span className="bg-emerald-500/10 text-emerald-400 text-[10px] px-2.5 py-0.5 rounded-full border border-emerald-500/20 font-mono font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> LIVE EZVIZ
          </span>
        </div>

        <div className="relative aspect-video bg-slate-950 flex items-center justify-center overflow-hidden">
          <img 
            src="http://localhost:8000/video_feed_1" 
            alt="EZVIZ Canal 1"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null; 
              e.target.src="https://via.placeholder.com/640x360/0f172a/94a3b8?text=Conectando+API+EZVIZ...";
            }}
          />
        </div>
      </div>

      {/* CÁMARA 02 - EZVIZ CANAL 2 */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden flex flex-col shadow-xl">
        <div className="p-3.5 bg-slate-900 border-b border-slate-800 flex justify-between items-center">
          <span className="text-xs font-semibold text-amber-400 flex items-center gap-2 font-mono">
            <Eye className="w-4 h-4 text-amber-400" /> NODO_02: Acceso Carga
          </span>
          <span className="bg-emerald-500/10 text-emerald-400 text-[10px] px-2.5 py-0.5 rounded-full border border-emerald-500/20 font-mono font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> LIVE EZVIZ
          </span>
        </div>

        <div className="relative aspect-video bg-slate-950 flex items-center justify-center overflow-hidden">
          <img 
            src="http://localhost:8000/video_feed_2" 
            alt="EZVIZ Canal 2"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null; 
              e.target.src="https://via.placeholder.com/640x360/0f172a/94a3b8?text=Conectando+API+EZVIZ...";
            }}
          />
        </div>
      </div>

      {/* CÁMARA 03 - RECORTE OCR */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden flex flex-col shadow-xl">
        <div className="p-3.5 bg-slate-900 border-b border-slate-800 flex justify-between items-center">
          <span className="text-xs font-semibold text-blue-400 flex items-center gap-2 font-mono">
            <Zap className="w-4 h-4 text-blue-400" /> NODO_03: Reconocimiento OCR
          </span>
        </div>
        <div className="relative aspect-video bg-slate-950 flex flex-col items-center justify-center p-4">
          <div className="w-full h-28 border border-blue-500/30 bg-blue-950/20 rounded-xl flex flex-col items-center justify-center gap-2 p-3 shadow-inner">
            <span className="text-[10px] text-blue-400 font-mono">RECORTE ROI (MATRÍCULA DETECTADA)</span>
            <div className="bg-amber-400 text-slate-950 px-5 py-1.5 rounded-lg font-mono font-black text-2xl tracking-widest border-2 border-slate-900 shadow-lg">
              P3A-891
            </div>
          </div>
        </div>
      </div>

    </section>
  );
}