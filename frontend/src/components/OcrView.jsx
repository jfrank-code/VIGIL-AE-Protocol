import React, { useState, useEffect } from 'react';
import { Camera, AlertTriangle, Activity, Car, RefreshCw, CheckCircle, ShieldAlert, Search, WifiOff } from 'lucide-react';

export default function OcrView() {
  const [stats, setStats] = useState({
    conteo_total: 0,
    vehiculos_activos: 0,
    saturacion_berma: 0,
    capturas_detenidos: [],
    capturas_marcha: []
  });
  const [placaFocalizar, setPlacaFocalizar] = useState('');
  const [objetivoFocalizado, setObjetivoFocalizado] = useState('NINGUNA');
  const [connected, setConnected] = useState(true);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch('http://localhost:8000/api/stats');
        if (res.ok) {
          const data = await res.json();
          setStats({
            conteo_total: data.conteo_total || 0,
            vehiculos_activos: data.vehiculos_activos || 0,
            saturacion_berma: data.saturacion_berma || 0,
            capturas_detenidos: Array.isArray(data.capturas_detenidos) ? data.capturas_detenidos : [],
            capturas_marcha: Array.isArray(data.capturas_marcha) ? data.capturas_marcha : []
          });
          setConnected(true);
        } else {
          setConnected(false);
        }
      } catch (err) {
        setConnected(false);
        console.error("Error conectando con el backend ANPR:", err);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleFocalizar = async (e) => {
    e.preventDefault();
    if (!placaFocalizar.trim()) return;
    try {
      await fetch('http://localhost:8000/api/focalizar_placa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ placa: placaFocalizar.trim().toUpperCase() })
      });
      setObjetivoFocalizado(placaFocalizar.trim().toUpperCase());
      setPlacaFocalizar('');
    } catch (err) {
      console.error("Error al focalizar placa:", err);
    }
  };

  return (
    <div className="p-6 space-y-6 text-slate-100 max-w-[1600px] mx-auto">
      
      {/* HEADER MÓDULO ANPR */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row justify-between items-center gap-4 shadow-lg backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-600/20 text-blue-400 rounded-lg border border-blue-500/30">
            <Camera className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-wide text-white flex items-center gap-2">
              MÓDULO ANPR - RECONOCIMIENTO DE PLACAS & FISCALIZACIÓN VIAL (En desarollo...)
              {!connected && (
                <span className="flex items-center gap-1 text-xs text-red-400 bg-red-950/80 border border-red-800 px-2 py-0.5 rounded">
                  <WifiOff className="w-3 h-3" /> DESCONECTADO
                </span>
              )}
            </h1>
            <p className="text-xs text-slate-400">
              Monitoreo continuo de tráfico local (<span className="text-blue-400 font-mono">trafico.mp4</span>) con YOLOv8 + HyperLPR3
            </p>
          </div>
        </div>

        {/* BUSCADOR FOCALIZAR */}
        <form onSubmit={handleFocalizar} className="flex items-center gap-2 w-full md:w-auto">
          <input
            type="text"
            placeholder="INGRESAR PLACA (EJ: P3A-891)..."
            value={placaFocalizar}
            onChange={(e) => setPlacaFocalizar(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-xs font-mono uppercase tracking-wider text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 w-full md:w-64"
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-blue-600/20 flex items-center gap-1.5"
          >
            <Search className="w-3.5 h-3.5" /> Focalizar
          </button>
        </form>
      </div>

      {/* SECCIÓN PRINCIPAL GRID: VIDEO (IZQ) Y CLASIFICACIÓN / CONTADOR (DER) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* COLUMNA IZQUIERDA: TRANSMISIÓN DE VIDEO EN BUCLE (7 COLS) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
            <div className="px-4 py-2.5 bg-slate-950/80 border-b border-slate-800 flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-300 flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
                DETECCIÓN DE INFRACCIONES EN VIDEO (TRAFICO.MP4)
              </span>
              <span className="bg-blue-950 text-blue-400 border border-blue-800 px-2.5 py-0.5 rounded text-[10px] font-mono font-bold">
                HYPERLPR3 & YOLOv8
              </span>
            </div>

            {/* FEED DE VIDEO BACKEND */}
            <div className="relative bg-black aspect-video flex items-center justify-center overflow-hidden">
              <video
                src="/trafico.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-contain"
              />
            </div>

            {/* BARRA INFERIOR DE ESTADO FOCALIZADO */}
            <div className="px-4 py-3 bg-slate-950/90 border-t border-slate-800 flex justify-between items-center text-xs font-mono">
              <div>
                <span className="text-slate-400">Objetivo Focalizado: </span>
                <span className="text-amber-400 font-bold ml-1">{objetivoFocalizado}</span>
              </div>
              <div>
                <span className="text-slate-400">Estatus Alerta: </span>
                <span className="text-emerald-400 font-bold ml-1">RASTREANDO</span>
              </div>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: CONTADOR ÚNICO + CARROS DETENIDOS Y EN MARCHA (5 COLS) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* CONTADOR DE VEHÍCULOS ÚNICO Y LIMPIO */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 rounded-lg">
                <Car className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xs uppercase font-bold text-slate-400 tracking-wider">Total Vehículos Detectados</h3>
                <p className="text-2xl font-black font-mono text-white tracking-tight">{stats.conteo_total}</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-400 block">En berma/polígono</span>
              <span className="text-sm font-bold font-mono text-amber-400">{stats.vehiculos_activos} activos</span>
            </div>
          </div>

          {/* CARROS DETENIDOS */}
          <div className="bg-slate-900/90 border border-red-900/40 rounded-xl p-4 shadow-lg space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-red-900/30">
              <span className="text-xs font-bold text-red-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                CARROS DETENIDOS (&gt;= 3s)
              </span>
              <span className="bg-red-950 text-red-400 border border-red-800 px-2 py-0.5 rounded text-[10px] font-mono font-bold">
                {stats.capturas_detenidos.length}
              </span>
            </div>

            <div className="space-y-2 max-h-[190px] overflow-y-auto pr-1">
              {stats.capturas_detenidos.length > 0 ? (
                stats.capturas_detenidos.map((item, idx) => (
                  <div key={idx} className="bg-slate-950 border border-red-900/30 rounded-lg p-2 flex items-center gap-3">
                    {item.foto_base64 ? (
                      <img src={item.foto_base64} alt="Placa Detenido" className="w-20 h-12 object-cover rounded border border-slate-700" />
                    ) : (
                      <div className="w-20 h-12 bg-slate-900 rounded flex items-center justify-center text-[10px] text-slate-500 font-mono">FOTO N/A</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-mono font-bold text-amber-400">{item.placa || "DETECCION_HYPERLPR3"}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{item.hora}</span>
                      </div>
                      <span className="text-[10px] text-slate-300 block truncate">{item.tipo || "Vehículo"} • Obstruyendo</span>
                      <span className="inline-block bg-red-950 text-red-400 text-[9px] px-1.5 py-0.5 rounded mt-1 font-bold">DETENIDO</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-slate-500 text-xs font-mono">
                  Bucle limpio. No hay vehículos detenidos (&gt;= 3s).
                </div>
              )}
            </div>
          </div>

          {/* CARROS EN MARCHA */}
          <div className="bg-slate-900/90 border border-blue-900/40 rounded-xl p-4 shadow-lg space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-blue-900/30">
              <span className="text-xs font-bold text-blue-400 flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-500" />
                CARROS EN MARCHA
              </span>
              <span className="bg-blue-950 text-blue-400 border border-blue-800 px-2 py-0.5 rounded text-[10px] font-mono font-bold">
                {stats.capturas_marcha.length}
              </span>
            </div>

            <div className="space-y-2 max-h-[190px] overflow-y-auto pr-1">
              {stats.capturas_marcha.length > 0 ? (
                stats.capturas_marcha.map((item, idx) => (
                  <div key={idx} className="bg-slate-950 border border-blue-900/30 rounded-lg p-2 flex items-center gap-3">
                    {item.foto_base64 ? (
                      <img src={item.foto_base64} alt="Placa En Marcha" className="w-20 h-12 object-cover rounded border border-slate-700" />
                    ) : (
                      <div className="w-20 h-12 bg-slate-900 rounded flex items-center justify-center text-[10px] text-slate-500 font-mono">FOTO N/A</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-mono font-bold text-blue-400">{item.placa || "LECTURA_OK"}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{item.hora}</span>
                      </div>
                      <span className="text-[10px] text-slate-300 block truncate">{item.tipo || "Vehículo"} • Tránsito normal</span>
                      <span className="inline-block bg-blue-950 text-blue-400 text-[9px] px-1.5 py-0.5 rounded mt-1 font-bold">EN MARCHA</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-slate-500 text-xs font-mono">
                  Rastreando calzada. Esperando lecturas en tránsito...
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}