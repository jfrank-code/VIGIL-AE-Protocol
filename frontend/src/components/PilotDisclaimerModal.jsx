import React, { useState, useEffect } from 'react';
import { Video, ShieldAlert, CheckCircle2, Building2, Cpu, Lock } from 'lucide-react';

export default function PilotDisclaimerModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Si no ha aceptado el descargo legal previamente en la sesión, abre el modal
    const accepted = sessionStorage.getItem('vmt_pilot_accepted');
    if (!accepted) {
      setOpen(true);
    }
  }, []);

  const handleAccept = () => {
    sessionStorage.setItem('vmt_pilot_accepted', 'true');
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 max-w-lg w-full rounded-2xl p-6 shadow-2xl space-y-5 relative font-sans">
        
        {/* Encabezado */}
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">Aviso de Entorno Piloto & Uso Ético</h3>
              <span className="bg-amber-950 text-amber-300 border border-amber-800/60 text-[9px] font-mono px-2 py-0.5 rounded-full font-bold">
                VMT 2026
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">Villa María del Triunfo - Simulación de Zona Rígida</p>
          </div>
        </div>

        {/* Contenido del aviso */}
        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <p>
            Bienvenido al panel de administración de <strong>VIGIL-AE Protocol</strong>. Antes de interactuar con el portal, considere la siguiente declaración de responsabilidad:
          </p>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 space-y-2.5">
            <div className="flex items-start gap-2.5">
              <Video className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>
                <strong className="text-white">Cámaras EZVIZ en Tiempo Real:</strong> Las imágenes transmitidas en los nodos de monitoreo corresponden a cámaras reales desplegadas en el distrito de <strong>Villa María del Triunfo (VMT)</strong> para evaluar zonas de parqueo indebido.
              </span>
            </div>

            <div className="flex items-start gap-2.5">
              <Lock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong className="text-white">Uso Estrictamente Ético:</strong> Las detecciones por IA (YOLOv8 + PaddleOCR) y los expedientes en Arbitrum Sepolia se ejecutan en un entorno de pruebas simulado y controlado sin efectos sancionatorios reales.
              </span>
            </div>

            <div className="flex items-start gap-2.5">
              <Cpu className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <span>
                <strong className="text-white">Demostración de Escalabilidad:</strong> Este prototipo demuestra el funcionamiento del protocolo frente al escalamiento paulatino que requerirán los gobiernos locales.
              </span>
            </div>
          </div>
        </div>

        {/* Botón de Confirmación */}
        <button
          onClick={handleAccept}
          className="w-full bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold py-3 rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-[0.99]"
        >
          <CheckCircle2 className="w-4 h-4" /> Entendido, Acceder al Panel Municipal
        </button>
      </div>
    </div>
  );
}