import React, { useState, useEffect } from 'react';
import {
  Camera,
  AlertTriangle,
  Activity,
  Car,
  Search,
  WifiOff,
  Info,
  CheckCircle2
} from 'lucide-react';
import { API_URL, API_URL as API_BASE } from '../config/apiConfig';

const ANPR_VIDEO_URL = `${API_BASE}/video_feed_anpr`;
const ANPR_STATS_URL = `${API_BASE}/api/anpr/stats`;

export default function OcrView() {
  const [stats, setStats] = useState({
    conteo_total: 0,
    vehiculos_activos: 0,
    capturas_detenidos: [],
    capturas_marcha: []
  });

  const [placaFocalizar, setPlacaFocalizar] = useState('');
  const [objetivoFocalizado, setObjetivoFocalizado] = useState('NINGUNA');
  const [connected, setConnected] = useState(true);
  const [videoError, setVideoError] = useState(false);

  useEffect(() => {
    let activo = true;

    const obtenerStats = async () => {
      try {
        const res = await fetch(ANPR_STATS_URL, { cache: 'no-store' });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();

        if (!activo) return;

        setStats({
          conteo_total: Number(data.conteo_total) || 0,
          vehiculos_activos: Number(data.vehiculos_activos) || 0,
          capturas_detenidos: Array.isArray(data.capturas_detenidos)
            ? data.capturas_detenidos
            : [],
          capturas_marcha: Array.isArray(data.capturas_marcha)
            ? data.capturas_marcha
            : []
        });

        setConnected(true);
        setVideoError(false);
      } catch (err) {
        if (activo) {
          setConnected(false);
        }
      }
    };

    obtenerStats();
    const interval = setInterval(obtenerStats, 1000);

    return () => {
      activo = false;
      clearInterval(interval);
    };
  }, []);

  const handleFocalizar = async (e) => {
    e.preventDefault();

    const placa = placaFocalizar.trim().toUpperCase();
    if (!placa) return;

    try {
      const res = await fetch(`${API_BASE}/api/focalizar_placa`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ placa })
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      setObjetivoFocalizado(placa);
      setPlacaFocalizar('');
    } catch (err) {
      console.error('Error focusing on plate:', err);
    }
  };

  const renderCaptura = (item, idx, tipo) => {
    const esDetenido = tipo === 'detenido';
    const placa = item?.placa || 'NOT DETECTED';
    const tienePlaca = placa !== 'NOT DETECTED' && placa !== 'NODETECTADA';
    const confianza = Number(item?.confianza ?? item?.conf_lpr ?? 0);

    return (
      <div
        key={`${item?.id_vehiculo || 'vehiculo'}-${idx}`}
        className={`bg-slate-950 border ${
          esDetenido ? 'border-red-900/40' : 'border-blue-900/40'
        } rounded-lg p-3 space-y-2 hover:border-slate-600 transition-colors`}
      >
        {item?.foto_base64 ? (
          <img
            src={item.foto_base64}
            alt={esDetenido ? 'Enlarged plate - stopped vehicle' : 'Enlarged plate - moving vehicle'}
            className="w-full h-24 object-cover rounded border border-slate-700 shadow-inner"
          />
        ) : (
          <div className="w-full h-24 bg-slate-900 rounded flex items-center justify-center text-xs text-slate-500 font-mono">
            PLATE PHOTO N/A
          </div>
        )}

        <div className="bg-slate-900 border border-slate-800 rounded p-2 flex justify-between items-center gap-3">
          <div className="min-w-0">
            <span className="text-[10px] text-slate-400 block uppercase font-mono">
              Recognized by HyperLPR3:
            </span>
            <span
              className={`text-sm font-mono font-black tracking-widest ${
                tienePlaca
                  ? esDetenido
                    ? 'text-red-400'
                    : 'text-emerald-400'
                  : 'text-amber-400'
              }`}
            >
              {placa}
            </span>
          </div>

          <div className="text-right shrink-0">
            <span className="text-[10px] text-slate-500 font-mono block">
              {item?.hora || '--:--:--'}
            </span>
            {confianza > 0 && (
              <span className="text-[10px] text-emerald-400/80 font-mono font-bold">
                {(confianza <= 1 ? confianza * 100 : confianza).toFixed(1)}%
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6 text-slate-100 max-w-[1600px] mx-auto font-sans">
      {/* INFO CARD */}
      <div className="bg-slate-900/90 border border-amber-500/30 rounded-xl p-4 flex items-start gap-4 shadow-lg backdrop-blur">
        <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/20 mt-0.5">
          <Info className="w-5 h-5" />
        </div>

        <div className="space-y-1 text-xs">
          <h2 className="font-bold text-amber-300 uppercase tracking-wide text-sm">
            ANPR Algorithm Testbed (Real Video Processing)
          </h2>
          <p className="text-slate-300 leading-relaxed">
            The municipal live cameras are used to monitor dwell time in{' '}
            <strong>restricted zones</strong>. This section exclusively analyzes{' '}
            <strong>trafico.mp4</strong> frame by frame using{' '}
            <strong>YOLOv8 + HyperLPR3</strong>. The video shown corresponds to the same
            frame currently being processed by the ANPR backend.
          </p>
        </div>
      </div>

      {/* ANPR MODULE HEADER */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row justify-between items-center gap-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-600/20 text-blue-400 rounded-lg border border-blue-500/30">
            <Camera className="w-6 h-6" />
          </div>

          <div>
            <h1 className="text-lg font-bold tracking-wide text-white flex items-center gap-2 flex-wrap">
              ANPR MODULE - LICENSE PLATE RECOGNITION & ROAD ENFORCEMENT

              {!connected && (
                <span className="flex items-center gap-1 text-xs text-red-400 bg-red-950/80 border border-red-800 px-2 py-0.5 rounded">
                  <WifiOff className="w-3 h-3" />
                  ANPR BACKEND DISCONNECTED
                </span>
              )}

              {connected && (
                <span className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-950/50 border border-emerald-800 px-2 py-0.5 rounded">
                  <CheckCircle2 className="w-3 h-3" />
                  ANPR ONLINE
                </span>
              )}
            </h1>

            <p className="text-xs text-slate-400">
              Synchronized processing of trafico.mp4 with YOLOv8 + HyperLPR3
            </p>
          </div>
        </div>
      </div>

      {/* MAIN GRID SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* PROCESSED ANPR VIDEO STREAM */}
        <div className="lg:col-span-7 space-y-3">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
            <div className="px-4 py-2.5 bg-slate-950/80 border-b border-slate-800 flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-300 flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
                ANPR VIDEO DETECTION (TRAFICO.MP4)
              </span>

              <span className="bg-blue-950 text-blue-400 border border-blue-800 px-2.5 py-0.5 rounded text-[10px] font-mono font-bold">
                HYPERLPR3 & YOLOv8
              </span>
            </div>

            <div className="relative bg-black aspect-video flex items-center justify-center overflow-hidden">
              {!videoError ? (
                <img
                  src={ANPR_VIDEO_URL}
                  alt="Processed ANPR stream of trafico.mp4"
                  className="w-full h-full object-contain"
                  onError={() => setVideoError(true)}
                />
              ) : (
                <div className="text-center px-6">
                  <WifiOff className="w-10 h-10 text-red-500 mx-auto mb-3" />
                  <p className="text-red-400 font-bold text-sm">
                    ANPR STREAM UNAVAILABLE
                  </p>
                  <p className="text-slate-500 text-xs mt-1 font-mono">
                    Check the API connection at {API_BASE}
                  </p>
                </div>
              )}

              <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/70 border border-emerald-500/30 rounded px-2 py-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-mono font-bold text-emerald-400">
                  PROCESSED FRAME
                </span>
              </div>
            </div>

            <div className="px-4 py-3 bg-slate-950/90 border-t border-slate-800 flex justify-between items-center text-xs font-mono gap-4">
              <div>
                <span className="text-slate-400">Focused Target: </span>
                <span className="text-amber-400 font-bold ml-1">
                  {objetivoFocalizado}
                </span>
              </div>

              <div className="text-right">
                <span className="text-slate-400">ANPR Status: </span>
                <span className="text-emerald-400 font-bold ml-1">
                  {connected ? 'TRACKING ROADWAY' : 'DISCONNECTED'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* SIDE PANELS: PLATE CAPTURES */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 rounded-lg">
                <Car className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                  Total Vehicles Detected
                </h3>
                <p className="text-2xl font-black font-mono text-white tracking-tight">
                  {stats.conteo_total}
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[11px] text-slate-400 block">
                In current frame
              </span>
              <span className="text-sm font-bold font-mono text-amber-400">
                {stats.vehiculos_activos} active
              </span>
            </div>
          </div>

          {/* STOPPED VEHICLES */}
          <div className="bg-slate-900/90 border border-red-900/40 rounded-xl p-4 shadow-lg space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-red-900/30">
              <span className="text-xs font-bold text-red-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                CAPTURES: STOPPED (&gt;= 3s)
              </span>

              <span className="bg-red-950 text-red-400 border border-red-800 px-2 py-0.5 rounded text-[10px] font-mono font-bold">
                {stats.capturas_detenidos.length}
              </span>
            </div>

            <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
              {stats.capturas_detenidos.length > 0 ? (
                stats.capturas_detenidos.map((item, idx) =>
                  renderCaptura(item, idx, 'detenido')
                )
              ) : (
                <div className="py-8 text-center text-slate-500 text-xs font-mono">
                  Clean loop. No stopped-vehicle infraction captures yet.
                </div>
              )}
            </div>
          </div>

          {/* MOVING VEHICLES */}
          <div className="bg-slate-900/90 border border-blue-900/40 rounded-xl p-4 shadow-lg space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-blue-900/30">
              <span className="text-xs font-bold text-blue-400 flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-500" />
                CAPTURES: MOVING
              </span>

              <span className="bg-blue-950 text-blue-400 border border-blue-800 px-2 py-0.5 rounded text-[10px] font-mono font-bold">
                {stats.capturas_marcha.length}
              </span>
            </div>

            <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
              {stats.capturas_marcha.length > 0 ? (
                stats.capturas_marcha.map((item, idx) =>
                  renderCaptura(item, idx, 'marcha')
                )
              ) : (
                <div className="py-8 text-center text-slate-500 text-xs font-mono">
                  Tracking roadway. Waiting for in-transit reads...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}