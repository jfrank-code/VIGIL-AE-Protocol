import React, { useState, useEffect } from 'react';
import { Truck, Car, Bike, Bus } from 'lucide-react';
import { API_URL } from '../config/apiConfig';

// Configuración de la URL base API

export default function VehicleClassification() {
  const [counts, setCounts] = useState({
    autos: 0,
    camiones: 0,
    motos: 0,
    buses: 0,
    conteo_total: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_URL}/api/stats`);
        if (res.ok) {
          const data = await res.json();
          setCounts(data);
        }
      } catch (err) {
        console.error("Error fetching vehicle counts:", err);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 2000);
    return () => clearInterval(interval);
  }, []);

  const total = counts.conteo_total || (counts.autos + counts.camiones + counts.motos + counts.buses);
  const maxVal = Math.max(total, 10);

  const items = [
    { tipo: 'Cars', count: counts.autos || 0, max: maxVal, color: 'bg-blue-500', icon: Car },
    { tipo: 'Trucks', count: counts.camiones || 0, max: maxVal, color: 'bg-red-500', icon: Truck },
    { tipo: 'Motorcycles', count: counts.motos || 0, max: maxVal, color: 'bg-amber-500', icon: Bike },
    { tipo: 'Buses', count: counts.buses || 0, max: maxVal, color: 'bg-emerald-500', icon: Bus },
  ];

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-sm hover:border-slate-700 transition flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Truck className="w-4 h-4 text-amber-400" /> Logistics Classification
          </h3>
          <span className="text-[10px] font-mono text-slate-500">YOLOV8 AI DETECTOR</span>
        </div>

        <div className="space-y-4">
          {items.map((item, idx) => {
            const Icon = item.icon;
            const percentage = item.max > 0 ? (item.count / item.max) * 100 : 0;

            return (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-slate-300 flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5 text-slate-400" /> {item.tipo}
                  </span>
                  <span className="text-slate-400 font-bold">{item.count} <span className="text-[10px] text-slate-600">units</span></span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800/80">
                  <div 
                    className={`${item.color} h-full rounded-full transition-all duration-500`} 
                    style={{ width: `${Math.min(100, percentage)}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800/80 text-[10px] font-mono text-slate-500 flex justify-between">
        <span>Total Count: {total} vehicles</span>
        <span>Model Accuracy: 98.6%</span>
      </div>
    </div>
  );
}