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
      {/* Cyberpunk-style background glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Landing Header */}
      <header className="max-w-7xl mx-auto w-full flex justify-between items-center py-4 border-b border-slate-800/80 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/10 border border-blue-500/30 rounded-xl text-blue-400 shadow-lg shadow-blue-500/10">
            <Cpu className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-wider bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
              VIGIL-AE Protocol
            </h1>
            <p className="text-[10px] text-slate-400 font-mono">Autonomous Road Enforcement & Web3 Oracle</p>
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
            <ShieldCheck className="w-4 h-4 text-cyan-400" /> Immutable Transparency Against Municipal Corruption
          </div>

          <h2 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight leading-tight">
            Smart Road Enforcement with <br />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
              AI Detection and Blockchain Evidence
            </span>
          </h2>

          <p className="text-slate-400 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
            A decentralized platform that automates infraction capture in restricted zones, processes license plates in real time, and records tamper-proof case files on Arbitrum.
          </p>

          {/* Role selection cards */}
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto pt-2">
            {/* Municipality option */}
            <div 
              onClick={() => navigate('/municipal')}
              className="group relative bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800 hover:border-blue-500/60 rounded-2xl p-6 text-left cursor-pointer transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-1"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl text-blue-400 group-hover:scale-110 transition-transform">
                  <Building2 className="w-7 h-7" />
                </div>
                <span className="text-[10px] font-mono bg-blue-950/80 text-blue-300 px-2.5 py-1 rounded-md border border-blue-800/40">
                  Admin Access
                </span>
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors flex items-center gap-2">
                Municipal Portal <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1 text-blue-400" />
              </h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Real-time camera monitoring, YOLOv8 logistics classification, ANPR detection, and autonomous case-file issuance.
              </p>
            </div>

            {/* Citizen option */}
            <div 
              onClick={() => navigate('/ciudadano')}
              className="group relative bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800 hover:border-emerald-500/60 rounded-2xl p-6 text-left cursor-pointer transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/20 hover:-translate-y-1"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 group-hover:scale-110 transition-transform">
                  <User className="w-7 h-7" />
                </div>
                <span className="text-[10px] font-mono bg-emerald-950/80 text-emerald-300 px-2.5 py-1 rounded-md border border-emerald-800/40">
                  Public Lookup
                </span>
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors flex items-center gap-2">
                Citizen Portal <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1 text-emerald-400" />
              </h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Look up infractions by plate, view AI-captured photographic evidence, and verify the traceability history.
              </p>
            </div>
          </div>
        </div>

        {/* --- IMPACT & VISUAL STATS SECTION --- */}
        <div className="pt-4 border-t border-slate-800/60">
          <div className="flex items-center justify-center gap-2 text-amber-400 font-mono text-xs font-bold uppercase tracking-widest mb-8">
            <AlertTriangle className="w-4 h-4 animate-bounce text-amber-400" /> Urban Diagnostics and Context
          </div>

          <div className="grid md:grid-cols-3 gap-8 items-stretch max-w-5xl mx-auto">
            
            {/* Stat 1 - Large */}
            <div className="relative group p-6 bg-slate-900/40 border border-amber-500/20 rounded-2xl text-center hover:border-amber-500/50 transition-all duration-300 hover:bg-slate-900/80 hover:-translate-y-1">
              <div className="text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-amber-300 to-amber-500 font-mono tracking-tight drop-shadow-[0_0_25px_rgba(245,158,11,0.2)]">
                87%
              </div>
              <div className="text-sm font-bold text-slate-200 mt-3 flex items-center justify-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                Restricted Zones
              </div>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Of 1,867 monthly tickets in high-traffic districts like Miraflores, nearly 9 out of 10 are for improper parking.
              </p>
            </div>

            {/* Stat 2 - Large */}
            <div className="relative group p-6 bg-slate-900/40 border border-cyan-500/20 rounded-2xl text-center hover:border-cyan-500/50 transition-all duration-300 hover:bg-slate-900/80 hover:-translate-y-1">
              <div className="text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-cyan-300 to-blue-500 font-mono tracking-tight drop-shadow-[0_0_25px_rgba(6,182,212,0.2)]">
                G40
              </div>
              <div className="text-sm font-bold text-slate-200 mt-3">
                Serious Offense Code
              </div>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Defined in the National Traffic Code for cars parked on roads marked with a yellow curb 24 hours a day.
              </p>
            </div>

            {/* Stat 3 - Large */}
            <div className="relative group p-6 bg-slate-900/40 border border-emerald-500/20 rounded-2xl text-center hover:border-emerald-500/50 transition-all duration-300 hover:bg-slate-900/80 hover:-translate-y-1">
              <div className="text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-emerald-300 to-teal-500 font-mono tracking-tight drop-shadow-[0_0_25px_rgba(16,185,129,0.2)]">
                100%
              </div>
              <div className="text-sm font-bold text-slate-200 mt-3 flex items-center justify-center gap-1.5">
                <History className="w-4 h-4 text-emerald-400" />
                Historical Traceability
              </div>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Immutable guarantee: if a fine is voided on a valid appeal, the case-file record is updated but keeps its public audit trail on Arbitrum.
              </p>
            </div>

          </div>
        </div>

        {/* --- STEP-BY-STEP FLOW (TIMELINE) --- */}
        <div className="pt-8 max-w-5xl mx-auto">
          <h4 className="text-xs font-mono uppercase tracking-widest text-slate-500 mb-8">
            Autonomous Enforcement and Audit Flow
          </h4>

          <div className="grid md:grid-cols-4 gap-4 relative">
            
            {/* Step 1 */}
            <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-xl text-left relative group hover:border-cyan-500/40 transition-all">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center font-mono font-bold text-xs mb-3">
                01
              </div>
              <h5 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
                <Scan className="w-4 h-4 text-cyan-400" /> AI Detection
              </h5>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Cameras monitor restricted zones. YOLOv8 identifies improperly parked vehicles in yellow-marked areas.
              </p>
              <ChevronRight className="hidden md:block absolute -right-3.5 top-1/2 -translate-y-1/2 text-slate-700 z-10 w-5 h-5" />
            </div>

            {/* Step 2 */}
            <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-xl text-left relative group hover:border-blue-500/40 transition-all">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center font-mono font-bold text-xs mb-3">
                02
              </div>
              <h5 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-blue-400" /> ANPR Reading
              </h5>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                PaddleOCR processes the license plate in milliseconds and automatically links the photographic evidence.
              </p>
              <ChevronRight className="hidden md:block absolute -right-3.5 top-1/2 -translate-y-1/2 text-slate-700 z-10 w-5 h-5" />
            </div>

            {/* Step 3 */}
            <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-xl text-left relative group hover:border-indigo-500/40 transition-all">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center font-mono font-bold text-xs mb-3">
                03
              </div>
              <h5 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
                <Database className="w-4 h-4 text-indigo-400" /> SHA-256 Signature
              </h5>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                The case file is stored in the local database and a tamper-proof cryptographic hash of the image is generated.
              </p>
              <ChevronRight className="hidden md:block absolute -right-3.5 top-1/2 -translate-y-1/2 text-slate-700 z-10 w-5 h-5" />
            </div>

            {/* Step 4 */}
            <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-xl text-left relative group hover:border-emerald-500/40 transition-all">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-mono font-bold text-xs mb-3">
                04
              </div>
              <h5 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-emerald-400" /> Arbitrum Registration
              </h5>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                The hash is recorded on the network. If the case is voided administratively, the status changes without erasing the history.
              </p>
            </div>

          </div>
        </div>

        {/* Info badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto pt-6 border-t border-slate-800/60 text-xs">
          <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-800/80 flex flex-col items-center justify-center">
            <Activity className="w-4 h-4 text-cyan-400 mb-1" />
            <span className="text-slate-300 font-semibold block">Continuous Detection</span>
            <span className="text-[10px] text-slate-500">YOLOv8 + Road Polygon Zones</span>
          </div>
          <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-800/80 flex flex-col items-center justify-center">
            <Lock className="w-4 h-4 text-blue-400 mb-1" />
            <span className="text-slate-300 font-semibold block">Immutable Proof</span>
            <span className="text-[10px] text-slate-500">SHA-256 Hash on Arbitrum</span>
          </div>
          <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-800/80 flex flex-col items-center justify-center">
            <FileText className="w-4 h-4 text-amber-400 mb-1" />
            <span className="text-slate-300 font-semibold block">Transparent Audit</span>
            <span className="text-[10px] text-slate-500">Resolution with Case No.</span>
          </div>
          <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-800/80 flex flex-col items-center justify-center">
            <FileCheck2 className="w-4 h-4 text-emerald-400 mb-1" />
            <span className="text-slate-300 font-semibold block">Automatic Notifications</span>
            <span className="text-[10px] text-slate-500">SMS Alerts via Twilio</span>
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