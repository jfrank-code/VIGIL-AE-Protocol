import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Building2, User, Cpu, FileText, ArrowRight, Activity, Lock } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-6 relative overflow-hidden font-sans">
      {/* Luces de fondo estilo Cyberpunk */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Landing */}
      <header className="max-w-7xl mx-auto w-full flex justify-between items-center py-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/10 border border-blue-500/30 rounded-xl text-blue-400 shadow-lg shadow-blue-500/10">
            <Cpu className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-wider bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
              VIGIL-AE Protocol
            </h1>
            <p className="text-[10px] text-slate-400 font-mono">Fiscalización Vial Autónomo & Oráculo Web3</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-full text-xs font-mono text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          Arbitrum Sepolia Live
        </div>
      </header>

      {/* Hero Content */}
      <main className="max-w-5xl mx-auto w-full my-auto py-12 text-center space-y-8">
        <div className="inline-flex items-center gap-2 bg-slate-900/80 border border-cyan-500/30 px-4 py-1.5 rounded-full text-xs font-mono text-cyan-300 shadow-xl">
          <ShieldCheck className="w-4 h-4 text-cyan-400" /> Transparencia Inmutable contra la Corrupción Municipal
        </div>

        <h2 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight leading-tight">
          Fiscalización Vial Inteligente con <br />
          <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
            Detección IA y Evidencia en Blockchain
          </span>
        </h2>

        <p className="text-slate-400 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
          Plataforma descentralizada que automatiza la captura de infracciones de tránsito, procesa lectura de placas en tiempo real y respalda cada acta mediante hashes inmutables en Arbitrum.
        </p>

        {/* Tarjetas de Selección de Rol */}
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto pt-6">
          {/* Opción Municipalidad */}
          <div 
            onClick={() => navigate('/municipal')}
            className="group relative bg-slate-900/90 border border-slate-800 hover:border-blue-500/50 rounded-2xl p-6 text-left cursor-pointer transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl text-blue-400 group-hover:scale-110 transition-transform">
                <Building2 className="w-7 h-7" />
              </div>
              <span className="text-[10px] font-mono bg-blue-950/80 text-blue-300 px-2.5 py-1 rounded-md border border-blue-800/40">
                Acceso Admin
              </span>
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors flex items-center gap-2">
              Portal Municipal <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-blue-400" />
            </h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Monitoreo de cámaras EZVIZ en tiempo real, clasificación logística con YOLOv8, detección ANPR y gestión e anulación de expedientes.
            </p>
          </div>

          {/* Opción Ciudadano */}
          <div 
            onClick={() => navigate('/ciudadano')}
            className="group relative bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-6 text-left cursor-pointer transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-1"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 group-hover:scale-110 transition-transform">
                <User className="w-7 h-7" />
              </div>
              <span className="text-[10px] font-mono bg-emerald-950/80 text-emerald-300 px-2.5 py-1 rounded-md border border-emerald-800/40">
                Consulta Pública
              </span>
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors flex items-center gap-2">
              Portal Ciudadano <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-emerald-400" />
            </h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Consulta infracciones por placa, visualiza pruebas fotográficas capturadas por IA y verifica la validez del acta en Arbiscan.
            </p>
          </div>
        </div>

        {/* Badges Informativos */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-8 border-t border-slate-800/60 text-xs">
          <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-800/80">
            <Activity className="w-4 h-4 text-cyan-400 mb-1 mx-auto" />
            <span className="text-slate-300 font-semibold block">Detección Continua</span>
            <span className="text-[10px] text-slate-500">YOLOv8 + Polígonos Viales</span>
          </div>
          <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-800/80">
            <Lock className="w-4 h-4 text-blue-400 mb-1 mx-auto" />
            <span className="text-slate-300 font-semibold block">Prueba Inmutable</span>
            <span className="text-[10px] text-slate-500">Hash SHA-256 en Arbitrum</span>
          </div>
          <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-800/80">
            <FileText className="w-4 h-4 text-amber-400 mb-1 mx-auto" />
            <span className="text-slate-300 font-semibold block">Auditoría de Actas</span>
            <span className="text-[10px] text-slate-500">Anulaciones con Resolución</span>
          </div>
          <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-800/80">
            <Cpu className="w-4 h-4 text-emerald-400 mb-1 mx-auto" />
            <span className="text-slate-300 font-semibold block">Copiloto IA</span>
            <span className="text-[10px] text-slate-500">Asistencia automatizada 24/7</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 border-t border-slate-800/60 text-xs text-slate-500 font-mono">
        VIGIL-AE Protocol © 2026 - Hackathon Prototype Edition
      </footer>
    </div>
  );
}