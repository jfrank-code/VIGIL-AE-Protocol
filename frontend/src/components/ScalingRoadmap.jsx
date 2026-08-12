import React from 'react';
import { Layers, Rocket, ShieldCheck, Video, Sparkles, CheckCircle2, ChevronRight } from 'lucide-react';

export default function ScalingRoadmap() {
  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-sm relative overflow-hidden">
      
      {/* Luz de fondo decorativa */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-xl text-cyan-400">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider font-mono flex items-center gap-2">
              Arquitectura Piloto vs. Proyección Municipal
              <Sparkles className="w-3 h-3 text-amber-400" />
            </h3>
            <p className="text-[10px] text-slate-400 font-mono">Evolución técnica desde la fase Hackathon hacia producción municipal</p>
          </div>
        </div>

        <span className="bg-blue-950/80 text-blue-300 border border-blue-800/40 text-[10px] font-mono px-2.5 py-1 rounded-md self-start md:self-auto">
          Distrito Piloto: Villa María del Triunfo (VMT)
        </span>
      </div>

      {/* Grid Comparativo Interactivo */}
      <div className="grid md:grid-cols-2 gap-4 text-xs font-mono">
        
        {/* Fase Actual */}
        <div className="bg-slate-950/90 border border-cyan-500/30 rounded-xl p-3.5 space-y-2.5 relative">
          <div className="flex justify-between items-center">
            <span className="text-cyan-400 font-bold text-[11px] flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> FASE 1: PROTOTIPO PILOTO
            </span>
            <span className="text-[9px] bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded border border-cyan-800">EN EJECUCIÓN</span>
          </div>

          <ul className="space-y-1.5 text-[11px] text-slate-300">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
              2 Nodos Stream EZVIZ (Zona Rígida VMT)
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
              Modelo YOLOv8 + Detección ANPR
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
              Oráculo Web3 en Testnet Arbitrum Sepolia
            </li>
          </ul>
        </div>

        {/* Fase Futura Escalada */}
        <div className="bg-slate-950/50 border border-slate-800 hover:border-indigo-500/40 transition-colors rounded-xl p-3.5 space-y-2.5">
          <div className="flex justify-between items-center">
            <span className="text-indigo-400 font-bold text-[11px] flex items-center gap-1.5">
              <Rocket className="w-3.5 h-3.5" /> FASE 2: DESPLIEGUE MULTI-DISTRITAL
            </span>
            <span className="text-[9px] bg-indigo-950 text-indigo-300 px-2 py-0.5 rounded border border-indigo-800">ESCALABLE</span>
          </div>

          <ul className="space-y-1.5 text-[11px] text-slate-400">
            <li className="flex items-center gap-2">
              <ChevronRight className="w-3 h-3 text-indigo-400" />
              Cámaras PTZ Municipales de Alta Definición (4K)
            </li>
            <li className="flex items-center gap-2">
              <ChevronRight className="w-3 h-3 text-indigo-400" />
              Integración con Centrales de Videovigilancia Serenazgo
            </li>
            <li className="flex items-center gap-2">
              <ChevronRight className="w-3 h-3 text-indigo-400" />
              Red de Oráculos L2 con emisión oficial de Papeletas
            </li>
          </ul>
        </div>

      </div>
    </div>
  );
}