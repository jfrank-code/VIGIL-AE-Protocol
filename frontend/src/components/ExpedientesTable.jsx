import React, { useState } from 'react';

// Datos iniciales simulados
const INITIAL_EXPEDIENTES = [
  { id: 'ACTA-2026-001', placa: 'P3A-891', fecha: '2026-08-04 10:15', infraccion: 'Estacionamiento en Zona Rígida', estado: 'EMITIDA', hash: '0x8f2a...3e1b', resolucion: '-', motivo: '-' },
  { id: 'ACTA-2026-002', placa: 'B7X-102', fecha: '2026-08-04 11:30', infraccion: 'Bloqueo de Berma Sur', estado: 'EMITIDA', hash: '0x4c9e...9a2f', resolucion: '-', motivo: '-' },
  { id: 'ACTA-2026-003', placa: 'F9K-441', fecha: '2026-08-04 12:05', infraccion: 'Obstrucción de Ciclovía', estado: 'PAGADA', hash: '0x1b7d...8a4c', resolucion: '-', motivo: '-' },
];

export default function ExpedientesTable() {
  const [expedientes, setExpedientes] = useState(INITIAL_EXPEDIENTES);
  const [selectedActa, setSelectedActa] = useState(null);
  const [numResolucion, setNumResolucion] = useState('');
  const [motivo, setMotivo] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Genera un Hash criptográfico SHA-256 real en el navegador
  const generateAnulationHash = async (actaId, res, mot) => {
    const dataText = `${actaId}-${res}-${mot}-${Date.now()}`;
    const encoder = new TextEncoder();
    const data = encoder.encode(dataText);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 10) + '...';
  };

  const handleAnularSubmit = async (e) => {
    e.preventDefault();
    if (!numResolucion || !motivo) return alert('Por favor completa todos los campos');

    setIsProcessing(true);
    const newHash = await generateAnulationHash(selectedActa.id, numResolucion, motivo);

    setTimeout(() => {
      setExpedientes(prev => prev.map(exp => {
        if (exp.id === selectedActa.id) {
          return {
            ...exp,
            estado: 'ANULADA',
            resolucion: numResolucion,
            motivo: motivo,
            hash: newHash
          };
        }
        return exp;
      }));

      setIsProcessing(false);
      setSelectedActa(null);
      setNumResolucion('');
      setMotivo('');
    }, 800);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-slate-100 shadow-2xl mt-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-cyan-400 flex items-center gap-2">
            📋 Gestión de Expedientes e Infracciones
          </h2>
          <p className="text-sm text-slate-400">Control administrativo y auditoría inmutable de actas</p>
        </div>
        <div className="bg-slate-800/80 text-xs px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300">
          Red: <span className="text-cyan-400 font-mono">Arbitrum Sepolia</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-800/50 text-slate-400 uppercase text-xs border-b border-slate-800">
            <tr>
              <th className="p-3">ID Acta</th>
              <th className="p-3">Placa</th>
              <th className="p-3">Fecha/Hora</th>
              <th className="p-3">Infracción</th>
              <th className="p-3">Estado</th>
              <th className="p-3">Resolución</th>
              <th className="p-3">Hash Criptográfico</th>
              <th className="p-3 text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {expedientes.map((exp) => (
              <tr key={exp.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="p-3 font-mono text-cyan-300 font-semibold">{exp.id}</td>
                <td className="p-3 font-bold text-white">{exp.placa}</td>
                <td className="p-3 text-xs text-slate-400">{exp.fecha}</td>
                <td className="p-3 text-slate-200">{exp.infraccion}</td>
                <td className="p-3">
                  <span className={`px-2.5 py-1 text-xs rounded-full font-semibold ${
                    exp.estado === 'EMITIDA' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                    exp.estado === 'PAGADA' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                    'bg-red-500/10 text-red-400 border border-red-500/20'
                  }`}>
                    {exp.estado}
                  </span>
                </td>
                <td className="p-3 text-xs font-mono text-slate-400">{exp.resolucion}</td>
                <td className="p-3 font-mono text-xs text-slate-500">{exp.hash}</td>
                <td className="p-3 text-right">
                  {exp.estado === 'EMITIDA' && (
                    <button
                      onClick={() => setSelectedActa(exp)}
                      className="bg-red-600/80 hover:bg-red-500 text-white text-xs font-medium px-3 py-1.5 rounded-lg border border-red-500/30 transition-all shadow-lg"
                    >
                      Anular Acta
                    </button>
                  )}
                  {exp.estado === 'ANULADA' && (
                    <span className="text-xs text-slate-500 italic">Anulado en Blockchain</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de Anulación */}
      {selectedActa && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <h3 className="text-lg font-bold text-slate-100 mb-1">
              🚫 Anular Infracción: <span className="text-cyan-400 font-mono">{selectedActa.id}</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Esta acción firmará un registro administrativo en la blockchain justificando la anulación.
            </p>

            <form onSubmit={handleAnularSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">N° Resolución Municipal</label>
                <input
                  type="text"
                  placeholder="Ej: RES-MUNI-2026-99"
                  value={numResolucion}
                  onChange={(e) => setNumResolucion(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Motivo / Sustento Técnico</label>
                <textarea
                  placeholder="Ej. Falso positivo por oclusión temporal o señalización obstruida."
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  rows="3"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                  required
                ></textarea>
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedActa(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-medium font-semibold shadow-lg shadow-red-600/20 flex items-center gap-2"
                >
                  {isProcessing ? 'Firmando en Arbitrum...' : 'Confirmar y Anular'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}