import React, { useState } from 'react';
import { Search, ExternalLink, ShieldCheck, AlertTriangle, CheckCircle, FileText, RefreshCw } from 'lucide-react';

export default function CitizenPortal() {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    const cleanQuery = searchQuery.trim().toUpperCase();
    if (!cleanQuery) return;

    setLoading(true);
    setSearched(true);

    try {
      const res = await fetch('http://localhost:8000/api/expedientes');
      if (res.ok) {
        const data = await res.json();
        
        // Coincidencia por Placa, N° de Acta o Hash Web3
        const matches = data.filter(exp => 
          (exp.placa && exp.placa.toUpperCase() === cleanQuery) ||
          (exp.actaId && exp.actaId.toUpperCase() === cleanQuery) ||
          (exp.id && exp.id.toUpperCase() === cleanQuery) ||
          (exp.hash && exp.hash.toLowerCase() === cleanQuery.toLowerCase())
        );

        setResults(matches.reverse()); // Muestra las más recientes primero
      } else {
        setResults([]);
      }
    } catch (err) {
      console.error("Error al consultar el portal de expedientes:", err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-6 p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl text-slate-100">
      {/* Encabezado */}
      <div className="text-center mb-8">
        <span className="bg-cyan-500/10 text-cyan-400 text-xs px-3 py-1 rounded-full border border-cyan-500/20 font-mono">
          Portal Público de Transparencia Vial
        </span>
        <h2 className="text-3xl font-extrabold text-white mt-2">Consulta de Infracciones Ciudadanas</h2>
        <p className="text-slate-400 text-sm mt-1">
          Verifica las evidencias fotográficas e inmutabilidad en la blockchain de Arbitrum
        </p>
      </div>

      {/* Buscador Multicriterio */}
      <form onSubmit={handleSearch} className="flex gap-3 max-w-xl mx-auto mb-8">
        <input
          type="text"
          placeholder="Ingrese Placa (ej: P3A-891), N° Acta o Hash Web3"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 uppercase font-mono tracking-wider text-sm"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-6 py-3 rounded-xl transition-all shadow-lg shadow-cyan-500/20 flex items-center gap-2"
        >
          {loading ? (
            <RefreshCw className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Search className="w-5 h-5" />
              <span>Buscar</span>
            </>
          )}
        </button>
      </form>

      {/* Resultados de Búsqueda */}
      {searched && (
        loading ? (
          <div className="text-center py-10 text-slate-400 font-mono text-sm">
            Consultando registros en el Smart Contract...
          </div>
        ) : results.length > 0 ? (
          <div className="space-y-6">
            <p className="text-xs text-slate-400 font-mono">
              Se encontraron <strong className="text-cyan-400">{results.length}</strong> registro(s) asociado(s):
            </p>
            {results.map((result, idx) => (
              <div key={idx} className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 grid md:grid-cols-2 gap-6 items-start">
                {/* Evidencia o Información Fotográfica */}
                <div>
                  <div className="relative rounded-lg overflow-hidden border border-slate-700 bg-slate-950 flex items-center justify-center h-56">
                    {result.foto_base64 || result.evidenciaUrl ? (
                      <img 
                        src={result.foto_base64 || result.evidenciaUrl} 
                        alt="Evidencia IA" 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <div className="text-center p-4">
                        <FileText className="w-12 h-12 text-slate-600 mx-auto mb-2" />
                        <span className="text-xs text-slate-500 font-mono">Registro en Blockchain sin captura previa</span>
                      </div>
                    )}
                    <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-md text-cyan-300 text-xs font-mono px-2.5 py-1 rounded border border-cyan-500/30">
                      Detección VIGIL-AE
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mt-2 text-center">
                    Evidencia indexada con firma criptográfica.
                  </p>
                </div>

                {/* Detalles del Expediente */}
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs text-slate-400 font-mono">N° de Acta</span>
                      <h3 className="text-lg font-bold text-cyan-400 font-mono">{result.actaId || result.id}</h3>
                    </div>
                    <span className={`px-3 py-1 text-xs rounded-full font-bold flex items-center gap-1 ${
                      result.estado === 'ANULADA' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                      result.estado === 'PAGADA' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                      'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}>
                      {result.estado === 'ANULADA' && <AlertTriangle className="w-3 h-3" />}
                      {result.estado === 'PAGADA' && <CheckCircle className="w-3 h-3" />}
                      {result.estado || 'REGISTRADA'}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-slate-400 block text-xs">Vehículo y Placa</span>
                      <span className="text-slate-200 font-bold font-mono">{result.placa} ({result.vehiculo || 'Auto'})</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-xs">Tipo de Infracción</span>
                      <span className="text-slate-200 font-medium">{result.infraccion || result.tipoInfraccion}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-xs">Origen / Nodo</span>
                      <span className="text-slate-300 font-mono text-xs">{result.origen || result.nodoEmisor || 'Cámara Municipal'}</span>
                    </div>

                    {/* Sustento en caso de Anulación */}
                    {result.estado === 'ANULADA' && (
                      <div className="bg-amber-950/30 border border-amber-800/50 rounded-lg p-3 text-xs space-y-1">
                        <span className="text-amber-400 font-bold block">Infracción Anulada</span>
                        <p className="text-slate-300"><strong>Motivo:</strong> {result.motivo || 'Revisión administrativa'}</p>
                      </div>
                    )}

                    {/* Hash Web3 Arbitrum */}
                    <div className="pt-2 border-t border-slate-700/60">
                      <span className="text-slate-400 text-xs flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-400" /> Prueba Inmutable (Arbitrum Sepolia):
                      </span>
                      <code className="text-xs text-cyan-300/80 font-mono break-all block bg-slate-950 p-2 rounded mt-1 border border-slate-800">
                        {result.hash || '0x0000000000000000000000000000000000000000'}
                      </code>
                    </div>
                  </div>

                  {result.hash && result.hash.startsWith('0x') && (
                    <div className="pt-2">
                      <a
                        href={`https://sepolia.arbiscan.io/tx/${result.hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full text-center bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-medium py-2.5 rounded-lg border border-slate-600 transition-colors flex items-center justify-center gap-2"
                      >
                        <span>Ver en Explorer (Arbiscan)</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-slate-800/30 border border-slate-800 rounded-xl">
            <span className="text-3xl">🔍</span>
            <p className="text-slate-300 font-medium mt-2">No se encontraron infracciones registradas para la búsqueda realizada.</p>
            <p className="text-xs text-slate-500 mt-1">Verifica la placa o el número de acta consultado.</p>
          </div>
        )
      )}
    </div>
  );
}