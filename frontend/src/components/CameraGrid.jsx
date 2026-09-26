import React from 'react';
import { Camera } from 'lucide-react';
import { API_URL } from '../config/apiConfig';

export default function CameraGrid() {
  return (
    <section className="grid grid-cols-1 gap-6 mb-6">

      {/* NODE 01: SOUTH SHOULDER */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden flex flex-col shadow-2xl backdrop-blur-sm hover:border-slate-700/80 transition-all duration-300 max-w-xl mx-auto w-full">
        <div className="p-3 bg-slate-900/90 border-b border-slate-800 flex justify-between items-center">
          <span className="text-xs font-bold text-emerald-400 flex items-center gap-2 font-mono uppercase tracking-wider">
            <Camera className="w-4 h-4 text-emerald-400" /> NODE_01: South Shoulder
          </span>
          <span className="bg-emerald-500/10 text-emerald-400 text-[10px] px-2.5 py-0.5 rounded-full border border-emerald-500/20 font-mono font-bold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> LIVE EZVIZ
          </span>
        </div>

        {/* EZVIZ HD stream */}
        <div className="relative aspect-video w-full bg-slate-950 flex items-center justify-center overflow-hidden">
          <img
            src={`${API_URL}/video_feed_1`}
            alt="NODE_01 South Shoulder"
            className="w-full h-full object-cover shadow-inner"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://via.placeholder.com/960x540/0f172a/94a3b8?text=Connecting+to+EZVIZ+Stream+Node+01...";
            }}
          />
        </div>

        <div className="p-2 bg-slate-950/80 text-[10px] text-slate-400 flex justify-between font-mono border-t border-slate-800/60">
          <span>AI Active: <strong className="text-slate-200">YOLOv8 + Polygon Zones</strong></span>
          <span>Status: <strong className="text-emerald-400 font-bold">Monitoring</strong></span>
        </div>
      </div>

    </section>
  );
}