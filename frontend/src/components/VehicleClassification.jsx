import React from 'react';
import { Truck, Car, Bike, Bus } from 'lucide-react';

export default function VehicleClassification() {
  const items = [
    { tipo: 'Autos', count: 12, max: 20, color: 'bg-blue-500', icon: Car },
    { tipo: 'Camiones', count: 5, max: 20, color: 'bg-red-500', icon: Truck },
    { tipo: 'Motos', count: 7, max: 20, color: 'bg-amber-500', icon: Bike },
    { tipo: 'Buses', count: 2, max: 20, color: 'bg-emerald-500', icon: Bus },
  ];

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-sm hover:border-slate-700 transition flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Truck className="w-4 h-4 text-amber-400" /> Clasificación Logística
          </h3>
          <span className="text-[10px] font-mono text-slate-500">IA DETECTOR YOLOV8</span>
        </div>

        <div className="space-y-4">
          {items.map((item, idx) => {
            const Icon = item.icon;
            const percentage = (item.count / item.max) * 100;

            return (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-slate-300 flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5 text-slate-400" /> {item.tipo}
                  </span>
                  <span className="text-slate-400 font-bold">{item.count} <span className="text-[10px] text-slate-600">und</span></span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800/80">
                  <div 
                    className={`${item.color} h-full rounded-full transition-all duration-500`} 
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800/80 text-[10px] font-mono text-slate-500 flex justify-between">
        <span>Conteo Total: 26 vehículos</span>
        <span>Precisión Modelo: 98.6%</span>
      </div>
    </div>
  );
}