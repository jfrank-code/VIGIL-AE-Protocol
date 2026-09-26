import React, { useState, useEffect } from 'react';
import { Video, ShieldAlert, CheckCircle2, Building2, Cpu, Lock } from 'lucide-react';

export default function PilotDisclaimerModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // If the legal disclaimer hasn't been accepted yet this session, open the modal
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
        
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">Pilot Environment & Ethical Use Notice</h3>
              <span className="bg-amber-950 text-amber-300 border border-amber-800/60 text-[9px] font-mono px-2 py-0.5 rounded-full font-bold">
                VMT 2026
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">Villa María del Triunfo - Restricted Zone Simulation</p>
          </div>
        </div>

        {/* Notice content */}
        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <p>
            Welcome to the <strong>VIGIL-AE Protocol</strong> admin dashboard. Before interacting with the portal, please review the following disclaimer:
          </p>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 space-y-2.5">
            <div className="flex items-start gap-2.5">
              <Video className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>
                <strong className="text-white">Real-Time EZVIZ Cameras:</strong> The footage streamed by the monitoring nodes comes from real cameras deployed in the <strong>Villa María del Triunfo (VMT)</strong> district to assess improper-parking zones.
              </span>
            </div>

            <div className="flex items-start gap-2.5">
              <Lock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong className="text-white">Strictly Ethical Use:</strong> AI detections (YOLOv8 + PaddleOCR) and the case files on Arbitrum Sepolia run in a simulated, controlled test environment with no real sanctioning effect.
              </span>
            </div>

            <div className="flex items-start gap-2.5">
              <Cpu className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <span>
                <strong className="text-white">Scalability Demonstration:</strong> This prototype demonstrates how the protocol performs against the gradual scale-up local governments will require.
              </span>
            </div>
          </div>
        </div>

        {/* Confirmation button */}
        <button
          onClick={handleAccept}
          className="w-full bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold py-3 rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-[0.99]"
        >
          <CheckCircle2 className="w-4 h-4" /> Understood, Access Municipal Dashboard
        </button>
      </div>
    </div>
  );
}