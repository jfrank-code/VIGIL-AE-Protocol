import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  Building2, 
  User, 
  Cpu, 
  FileText, 
  ArrowRight, 
  Activity, 
  Lock, 
  AlertTriangle, 
  Database, 
  Globe, 
  Scan,
  TrendingUp,
  FileCheck2,
  ChevronRight,
  History
} from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-6 relative overflow-hidden font-sans">
      {/* Luces de fondo estilo Cyberpunk */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Landing */}
      <header className="max-w-7xl mx-auto w-full flex justify-between items-center py-4 border-b border-slate-800/80 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/10 border border-blue-500/30 rounded-xl text-blue-400 shadow-lg shadow-blue-500/10">
            <Cpu className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-wider bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
              VIGIL-AE Protocol
            </h1>
            <p className="text-[10px] text-slate-400 font-mono">Fiscalización Vial Autónoma & Oráculo Web3</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-full text-xs font-mono text-emerald-400 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          Arbitrum Sepolia Live
        </div>
      </header>

      {/* Hero Content */}
      <main className="max-w-6xl mx-auto w-full my-auto py-8 text-center space-y-12 relative z-10">
        
        <div className="space-y-6 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-slate-900/80 border border-cyan-500/30 px-4 py-1.5 rounded-full text-xs font-mono text-cyan-300 shadow-xl backdrop-blur-md">
            <ShieldCheck className="w-4 h-4 text-cyan-400" /> Transparencia Inmutable contra la Corrupción Municipal
          </div>

          <h2 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight leading-tight">
            Fiscalización Vial Inteligente con <br />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
              Detección IA y Evidencia en Blockchain
            </span>
          </h2>

          <p className="text-slate-400 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
            Plataforma descentralizada que automatiza la captura de infracciones en zonas rígidas, procesa matrículas en tiempo real y registra actas inalterables en Arbitrum.
          </p>

          {/* Tarjetas de Selección de Rol */}
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto pt-2">
            {/* Opción Municipalidad */}
            <div 
              onClick={() => navigate('/municipal')}
              className="group relative bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800 hover:border-blue-500/60 rounded-2xl p-6 text-left cursor-pointer transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-1"
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
                Portal Municipal <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1 text-blue-400" />
              </h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Monitoreo de cámaras en tiempo real, clasificación logística con YOLOv8, detección ANPR y emisión autónoma de actas.
              </p>
            </div>

            {/* Opción Ciudadano */}
            <div 
              onClick={() => navigate('/ciudadano')}
              className="group relative bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800 hover:border-emerald-500/60 rounded-2xl p-6 text-left cursor-pointer transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/20 hover:-translate-y-1"
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
                Portal Ciudadano <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1 text-emerald-400" />
              </h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Consulta infracciones por placa, visualiza pruebas fotográficas capturadas por IA y verifica el historial de trazabilidad.
              </p>
            </div>
          </div>
        </div>

        {/* --- SECCIÓN DE IMPACTO Y ESTADÍSTICAS VISUALES --- */}
        <div className="pt-4 border-t border-slate-800/60">
          <div className="flex items-center justify-center gap-2 text-amber-400 font-mono text-xs font-bold uppercase tracking-widest mb-8">
            <AlertTriangle className="w-4 h-4 animate-bounce text-amber-400" /> Diagnóstico y Contexto Urbano
          </div>

          <div className="grid md:grid-cols-3 gap-8 items-stretch max-w-5xl mx-auto">
            
            {/* Stat 1 - Gigante */}
            <div className="relative group p-6 bg-slate-900/40 border border-amber-500/20 rounded-2xl text-center hover:border-amber-500/50 transition-all duration-300 hover:bg-slate-900/80 hover:-translate-y-1">
              <div className="text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-amber-300 to-amber-500 font-mono tracking-tight drop-shadow-[0_0_25px_rgba(245,158,11,0.2)]">
                87%
              </div>
              <div className="text-sm font-bold text-slate-200 mt-3 flex items-center justify-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                Zonas Rígidas
              </div>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                De 1,867 papeletas mensuales en distritos de alto tráfico como Miraflores, casi 9 de cada 10 corresponden a estacionamientos indebidos.
              </p>
            </div>

            {/* Stat 2 - Gigante */}
            <div className="relative group p-6 bg-slate-900/40 border border-cyan-500/20 rounded-2xl text-center hover:border-cyan-500/50 transition-all duration-300 hover:bg-slate-900/80 hover:-translate-y-1">
              <div className="text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-cyan-300 to-blue-500 font-mono tracking-tight drop-shadow-[0_0_25px_rgba(6,182,212,0.2)]">
                G40
              </div>
              <div className="text-sm font-bold text-slate-200 mt-3">
                Código de Falta Grave
              </div>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Tipificada en el Reglamento Nacional de Tránsito para autos parqueados en vías señalizadas con sardinel amarillo las 24 horas.
              </p>
            </div>

            {/* Stat 3 - Gigante */}
            <div className="relative group p-6 bg-slate-900/40 border border-emerald-500/20 rounded-2xl text-center hover:border-emerald-500/50 transition-all duration-300 hover:bg-slate-900/80 hover:-translate-y-1">
              <div className="text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-emerald-300 to-teal-500 font-mono tracking-tight drop-shadow-[0_0_25px_rgba(16,185,129,0.2)]">
                100%
              </div>
              <div className="text-sm font-bold text-slate-200 mt-3 flex items-center justify-center gap-1.5">
                <History className="w-4 h-4 text-emerald-400" />
                Trazabilidad Histórica
              </div>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Garantía inmutable: si una multa es anulada por apelación justa, el registro del expediente se actualiza pero mantiene su auditoría pública en Arbitrum.
              </p>
            </div>

          </div>
        </div>

        {/* --- FLUJO CONECTADO PASO A PASO (TIMELINE) --- */}
        <div className="pt-8 max-w-5xl mx-auto">
          <h4 className="text-xs font-mono uppercase tracking-widest text-slate-500 mb-8">
            Flujo de Fiscalización Autónoma y Auditoría
          </h4>

          <div className="grid md:grid-cols-4 gap-4 relative">
            
            {/* Paso 1 */}
            <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-xl text-left relative group hover:border-cyan-500/40 transition-all">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center font-mono font-bold text-xs mb-3">
                01
              </div>
              <h5 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
                <Scan className="w-4 h-4 text-cyan-400" /> Detección por IA
              </h5>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Cámaras monitorean zonas rígidas. YOLOv8 identifica vehículos mal estacionados en áreas amarillas.
              </p>
              <ChevronRight className="hidden md:block absolute -right-3.5 top-1/2 -translate-y-1/2 text-slate-700 z-10 w-5 h-5" />
            </div>

            {/* Paso 2 */}
            <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-xl text-left relative group hover:border-blue-500/40 transition-all">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center font-mono font-bold text-xs mb-3">
                02
              </div>
              <h5 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-blue-400" /> Lectura ANPR
              </h5>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                PaddleOCR procesa la placa vehicular en milisegundos y vincula la prueba fotográfica de forma automática.
              </p>
              <ChevronRight className="hidden md:block absolute -right-3.5 top-1/2 -translate-y-1/2 text-slate-700 z-10 w-5 h-5" />
            </div>

            {/* Paso 3 */}
            <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-xl text-left relative group hover:border-indigo-500/40 transition-all">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center font-mono font-bold text-xs mb-3">
                03
              </div>
              <h5 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
                <Database className="w-4 h-4 text-indigo-400" /> Firma SHA-256
              </h5>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Se almacena el expediente en la base de datos local y se genera el hash criptográfico inalterable de la imagen.
              </p>
              <ChevronRight className="hidden md:block absolute -right-3.5 top-1/2 -translate-y-1/2 text-slate-700 z-10 w-5 h-5" />
            </div>

            {/* Paso 4 */}
            <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-xl text-left relative group hover:border-emerald-500/40 transition-all">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-mono font-bold text-xs mb-3">
                04
              </div>
              <h5 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-emerald-400" /> Registro Arbitrum
              </h5>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                El hash se inscribe en la red. Si el acta se anula administrativamente, el estado cambia sin borrar el historial.
              </p>
            </div>

          </div>
        </div>

        {/* Badges Informativos */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto pt-6 border-t border-slate-800/60 text-xs">
          <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-800/80 flex flex-col items-center justify-center">
            <Activity className="w-4 h-4 text-cyan-400 mb-1" />
            <span className="text-slate-300 font-semibold block">Detección Continua</span>
            <span className="text-[10px] text-slate-500">YOLOv8 + Polígonos Viales</span>
          </div>
          <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-800/80 flex flex-col items-center justify-center">
            <Lock className="w-4 h-4 text-blue-400 mb-1" />
            <span className="text-slate-300 font-semibold block">Prueba Inmutable</span>
            <span className="text-[10px] text-slate-500">Hash SHA-256 en Arbitrum</span>
          </div>
          <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-800/80 flex flex-col items-center justify-center">
            <FileText className="w-4 h-4 text-amber-400 mb-1" />
            <span className="text-slate-300 font-semibold block">Auditoría Transparente</span>
            <span className="text-[10px] text-slate-500">Resolución con N° de Expediente</span>
          </div>
          <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-800/80 flex flex-col items-center justify-center">
            <FileCheck2 className="w-4 h-4 text-emerald-400 mb-1" />
            <span className="text-slate-300 font-semibold block">Notificaciones Automáticas</span>
            <span className="text-[10px] text-slate-500">Alertas SMS vía Twilio</span>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="text-center py-4 border-t border-slate-800/60 text-xs text-slate-500 font-mono relative z-10">
        VIGIL-AE Protocol © 2026 - Hackathon Prototype Edition
      </footer>
    </div>
  );
}