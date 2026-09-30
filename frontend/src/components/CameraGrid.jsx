import React from 'react';
import { Camera } from 'lucide-react';
import { API_URL } from '../config/apiConfig';

export default function CameraGrid() {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 w-full">
      {/* CAMERA 01: LIVE MONITORING - RAW STREAM */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden flex flex-col shadow-2xl backdrop-blur-sm hover:border-slate-700/80 transition-all duration-300 w-full">
        <div className="p-3 bg-slate-900/90 border-b border-slate-800 flex justify-between items-center">
          <div>
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-2 font-mono uppercase tracking-wider">
              <Camera className="w-4 h-4 text-emerald-400" /> CAMERA_01: MONITORING
            </span>
            <div className="text-[10px] text-slate-400 font-mono mt-1">
              TRANSMISIÓN EN VIVO · SIN PROCESAMIENTO IA
            </div>
          </div>
          <span className="bg-emerald-500/10 text-emerald-400 text-[10px] px-2.5 py-0.5 rounded-full border border-emerald-500/20 font-mono font-bold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> LIVE
          </span>
        </div>

        <div className="relative aspect-video w-full bg-slate-950 flex items-center justify-center overflow-hidden">
          <img
            src={`${API_URL}/video_feed_raw`}
            alt="Camera 01 live monitoring"
            className="w-full h-full object-cover shadow-inner"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://via.placeholder.com/960x540/0f172a/94a3b8?text=Connecting+to+Live+Monitoring...";
            }}
          />
        </div>

        <div className="p-2 bg-slate-950/80 text-[10px] text-slate-400 flex justify-between font-mono border-t border-slate-800/60">
          <span>Mode: <strong className="text-slate-200">Live Monitoring</strong></span>
          <span>Status: <strong className="text-emerald-400 font-bold">Monitoring</strong></span>
        </div>
      </div>

      {/* CAMERA 02: AI ANALYSIS - PROCESSED STREAM */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden flex flex-col shadow-2xl backdrop-blur-sm hover:border-slate-700/80 transition-all duration-300 w-full">
        <div className="p-3 bg-slate-900/90 border-b border-slate-800 flex justify-between items-center">
          <div>
            <span className="text-xs font-bold text-cyan-400 flex items-center gap-2 font-mono uppercase tracking-wider">
              <Camera className="w-4 h-4 text-cyan-400" /> CAMERA_01: AI ANALYSIS
            </span>
            <div className="text-[10px] text-slate-400 font-mono mt-1">
              DETECCIÓN VEHICULAR · ANPR · EVENTOS
            </div>
          </div>
          <span className="bg-cyan-500/10 text-cyan-400 text-[10px] px-2.5 py-0.5 rounded-full border border-cyan-500/20 font-mono font-bold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span> AI LIVE
          </span>
        </div>

        <div className="relative aspect-video w-full bg-slate-950 flex items-center justify-center overflow-hidden">
          <img
            src={`${API_URL}/video_feed_1`}
            alt="Camera 01 AI analysis"
            className="w-full h-full object-cover shadow-inner"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://via.placeholder.com/960x540/0f172a/94a3b8?text=Connecting+to+AI+Analysis...";
            }}
          />
        </div>

        <div className="p-2 bg-slate-950/80 text-[10px] text-slate-400 flex justify-between font-mono border-t border-slate-800/60">
          <span>AI Active: <strong className="text-slate-200">YOLOv8 + Polygon Zones</strong></span>
          <span>Status: <strong className="text-cyan-400 font-bold">Analyzing</strong></span>
        </div>
      </div>
    </section>
  );
}