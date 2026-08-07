import React, { useState, useEffect } from 'react';
import { Activity, Clock, ShieldAlert, BarChart3 } from 'lucide-react';

export default function MetricsPanel() {
  const [stats, setStats] = useState({
    tiempo_monitoreo: 0,
    tiempo_total_obstruido: 0,
    perdida_capacidad: 0,
    saturacion_berma: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/stats');
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error("Error obteniendo métricas:", err);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between backdrop-blur-sm hover:border-slate-700 transition">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-400" /> Capacidad & Eficiencia Vial
          </h3>
          <span className="text-[10px] font-mono text-slate-500">MÉTRICAS EN TIEMPO REAL</span>
        </div>

        <div className="space-y-3 font-mono text-xs">
          <div className="flex justify-between py-2 border-b border-slate-800/60 items-center">
            <span className="text-slate-400 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-slate-500"/> Monitoreo Total:</span>
            <span className="text-slate-200 font-bold">{stats.tiempo_monitoreo} min</span>
          </div>

          <div className="flex justify-between py-2 border-b border-slate-800/60 items-center">
            <span className="text-slate-400 flex items-center gap-1.5"><ShieldAlert className="w-3.5 h-3.5 text-amber-500"/> Tiempo Calzada Bloqueada:</span>
            <span className="text-amber-400 font-bold">{stats.tiempo_total_obstruido} min</span>
          </div>

          <div className="flex justify-between py-2 border-b border-slate-800/60 items-center">
            <span className="text-slate-400 flex items-center gap-1.5"><BarChart3 className="w-3.5 h-3.5 text-red-400"/> Pérdida de Capacidad:</span>
            <span className="text-red-400 font-bold">{stats.perdida_capacidad} %</span>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-800/80">
        <div className="flex justify-between text-xs font-mono mb-2">
          <span className="text-slate-400">Nivel de Saturación Berma Portuaria:</span>
          <span className="text-blue-400 font-bold">{stats.saturacion_berma}%</span>
        </div>
        <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden p-0.5 border border-slate-800">
          <div 
            className="bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400 h-full rounded-full transition-all duration-700 shadow-sm"
            style={{ width: `${Math.min(100, stats.saturacion_berma)}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}