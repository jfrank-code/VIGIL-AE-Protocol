import React, { useState } from 'react';

// Datos de consulta simulados
const MOCK_CITIZEN_DATA = {
  'P3A-891': {
    placa: 'P3A-891',
    actaId: 'ACTA-2026-001',
    fecha: '2026-08-04 10:15 AM',
    ubicación: 'Av. Larco / Calle Tarata - Zona Rígida',
    monto: 'S/ 247.50',
    estado: 'EMITIDA',
    evidenciaUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
    hash: '0x8f2a9d8172bc3e1b88a901f4c2e5a7b8c9d01234',
    resolucion: null,
    motivo: null
  },
  'B7X-102': {
    placa: 'B7X-102',
    actaId: 'ACTA-2026-002',
    fecha: '2026-08-04 11:30 AM',
    ubicación: 'Av. Benavides cdra 12 - Berma Sur',
    monto: 'S/ 515.00',
    estado: 'ANULADA',
    evidenciaUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
    hash: '0x4c9e112233449a2f887766554433221100aabbcc',
    resolucion: 'RES-MUNI-2026-88',
    motivo: 'Falso positivo por oclusión de señalización vial'
  }
};

export default function CitizenPortal() {
  const [searchPlaca, setSearchPlaca] = useState('');
  const [result, setResult] = useState(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    const cleanPlaca = searchPlaca.trim().toUpperCase();
    setResult(MOCK_CITIZEN_DATA[cleanPlaca] || null);
    setSearched(true);
  };

  return (
    <div className="max-w-4xl mx-auto mt-6 p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl text-slate-100">
      {/* Encabezado Portal Ciudadano */}
      <div className="text-center mb-8">
        <span className="bg-cyan-500/10 text-cyan-400 text-xs px-3 py-1 rounded-full border border-cyan-500/20 font-mono">
          Portal Público de Transparencia Vial
        </span>
        <h2 className="text-3xl font-extrabold text-white mt-2">Consulta de Infracciones Ciudadanas</h2>
        <p className="text-slate-400 text-sm mt-1">
          Verifica las evidencias fotográficas e inmutabilidad en la blockchain de Arbitrum
        </p>
      </div>

      {/* Buscador de Placas */}
      <form onSubmit={handleSearch} className="flex gap-3 max-w-xl mx-auto mb-8">
        <input
          type="text"
          placeholder="Ingrese su placa (ej: P3A-891 o B7X-102)"
          value={searchPlaca}
          onChange={(e) => setSearchPlaca(e.target.value)}
          className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 uppercase font-mono tracking-wider text-lg"
          required
        />
        <button
          type="submit"
          className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-6 py-3 rounded-xl transition-all shadow-lg shadow-cyan-500/20"
        >
          Buscar Placa
        </button>
      </form>

      {/* Resultados de Búsqueda */}
      {searched && (
        result ? (
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 grid md:grid-cols-2 gap-6 items-start">
            {/* Evidencia Fotográfica */}
            <div>
              <div className="relative rounded-lg overflow-hidden border border-slate-700">
                <img src={result.evidenciaUrl} alt="Evidencia IA" className="w-full h-56 object-cover" />
                <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-md text-cyan-300 text-xs font-mono px-2.5 py-1 rounded border border-cyan-500/30">
                  Detección IA VIGIL-AE
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-2 text-center">
                Captura original respaldada con Hash criptográfico.
              </p>
            </div>

            {/* Detalles del Acta */}
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs text-slate-400 font-mono">N° de Acta</span>
                  <h3 className="text-lg font-bold text-cyan-400 font-mono">{result.actaId}</h3>
                </div>
                <span className={`px-3 py-1 text-xs rounded-full font-bold ${
                  result.estado === 'EMITIDA' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                  'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}>
                  {result.estado}
                </span>
              </div>

              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-slate-400 block text-xs">Ubicación y Fecha</span>
                  <span className="text-slate-200 font-medium">{result.ubicación} ({result.fecha})</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-xs">Monto Estimado</span>
                  <span className="text-emerald-400 font-bold font-mono text-base">{result.monto}</span>
                </div>

                {/* Si la multa fue anulada */}
                {result.estado === 'ANULADA' && (
                  <div className="bg-red-950/40 border border-red-800/50 rounded-lg p-3 text-xs space-y-1">
                    <span className="text-red-400 font-bold block">Infracción Anulada por la Municipalidad</span>
                    <p className="text-slate-300"><strong className="text-slate-200">Resolución:</strong> {result.resolucion}</p>
                    <p className="text-slate-400"><strong>Sustento:</strong> {result.motivo}</p>
                  </div>
                )}

                {/* Hash Criptográfico Blockchain */}
                <div className="pt-2 border-t border-slate-700/60">
                  <span className="text-slate-400 text-xs block">Prueba Inmutable (Arbitrum Sepolia):</span>
                  <code className="text-xs text-cyan-300/80 font-mono break-all block bg-slate-900 p-2 rounded mt-1 border border-slate-800">
                    {result.hash}
                  </code>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <a
                  href={`https://sepolia.arbiscan.io/tx/${result.hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full text-center bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-medium py-2.5 rounded-lg border border-slate-600 transition-colors"
                >
                  Ver en Explorer (Arbiscan) ↗
                </a>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-10 bg-slate-800/30 border border-slate-800 rounded-xl">
            <span className="text-3xl">🔍</span>
            <p className="text-slate-300 font-medium mt-2">No se encontraron infracciones registradas para esta placa.</p>
            <p className="text-xs text-slate-500 mt-1">Prueba buscando con las placas de prueba: <span className="text-cyan-400 font-mono">P3A-891</span> o <span className="text-cyan-400 font-mono">B7X-102</span></p>
          </div>
        )
      )}
    </div>
  );
}