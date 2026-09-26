import React, { useState } from 'react';
import { Search, ExternalLink, ShieldCheck, AlertTriangle, CheckCircle, FileText, RefreshCw } from 'lucide-react';
import { API_URL } from '../config/apiConfig';

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
      const res = await fetch(`${API_URL}/api/expedientes`);
      if (res.ok) {
        const data = await res.json();
        
        // Match by plate, case number, or Web3 hash
        const matches = data.filter(exp => 
          (exp.placa && exp.placa.toUpperCase() === cleanQuery) ||
          (exp.actaId && exp.actaId.toUpperCase() === cleanQuery) ||
          (exp.id && exp.id.toUpperCase() === cleanQuery) ||
          (exp.hash && exp.hash.toLowerCase() === cleanQuery.toLowerCase())
        );

        setResults(matches.reverse()); // Show most recent first
      } else {
        setResults([]);
      }
    } catch (err) {
      console.error("Error querying the case-file portal:", err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-6 p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl text-slate-100">
      {/* Header */}
      <div className="text-center mb-8">
        <span className="bg-cyan-500/10 text-cyan-400 text-xs px-3 py-1 rounded-full border border-cyan-500/20 font-mono">
          Public Road Transparency Portal
        </span>
        <h2 className="text-3xl font-extrabold text-white mt-2">Citizen Infraction Lookup</h2>
        <p className="text-slate-400 text-sm mt-1">
          Verify photographic evidence and immutability on the Arbitrum blockchain
        </p>
      </div>

      {/* Multi-criteria search */}
      <form onSubmit={handleSearch} className="flex gap-3 max-w-xl mx-auto mb-8">
        <input
          type="text"
          placeholder="Enter Plate (e.g. P3A-891), Case No. or Web3 Hash"
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
              <span>Search</span>
            </>
          )}
        </button>
      </form>

      {/* Search Results */}
      {searched && (
        loading ? (
          <div className="text-center py-10 text-slate-400 font-mono text-sm">
            Querying records on the Smart Contract...
          </div>
        ) : results.length > 0 ? (
          <div className="space-y-6">
            <p className="text-xs text-slate-400 font-mono">
              Found <strong className="text-cyan-400">{results.length}</strong> matching record(s):
            </p>
            {results.map((result, idx) => (
              <div key={idx} className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 grid md:grid-cols-2 gap-6 items-start">
                {/* Photographic evidence */}
                <div>
                  <div className="relative rounded-lg overflow-hidden border border-slate-700 bg-slate-950 flex items-center justify-center h-56">
                    {result.foto_base64 || result.evidenciaUrl ? (
                      <img 
                        src={result.foto_base64 || result.evidenciaUrl} 
                        alt="AI Evidence" 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <div className="text-center p-4">
                        <FileText className="w-12 h-12 text-slate-600 mx-auto mb-2" />
                        <span className="text-xs text-slate-500 font-mono">Blockchain record with no prior capture</span>
                      </div>
                    )}
                    <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-md text-cyan-300 text-xs font-mono px-2.5 py-1 rounded border border-cyan-500/30">
                      VIGIL-AE Detection
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mt-2 text-center">
                    Evidence indexed with a cryptographic signature.
                  </p>
                </div>

                {/* Case File Details */}
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs text-slate-400 font-mono">Case No.</span>
                      <h3 className="text-lg font-bold text-cyan-400 font-mono">{result.actaId || result.id}</h3>
                    </div>
                    <span className={`px-3 py-1 text-xs rounded-full font-bold flex items-center gap-1 ${
                      result.estado === 'ANULADA' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                      result.estado === 'PAGADA' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                      'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}>
                      {result.estado === 'ANULADA' && <AlertTriangle className="w-3 h-3" />}
                      {result.estado === 'PAGADA' && <CheckCircle className="w-3 h-3" />}
                      {result.estado === 'REGISTRADA' ? 'REGISTERED' : (result.estado || 'REGISTERED')}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-slate-400 block text-xs">Vehicle and Plate</span>
                      <span className="text-slate-200 font-bold font-mono">{result.placa} ({result.vehiculo || 'Auto'})</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-xs">Infraction Type</span>
                      <span className="text-slate-200 font-medium">{result.infraccion || result.tipoInfraccion}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-xs">Origin / Node</span>
                      <span className="text-slate-300 font-mono text-xs">{result.origen || result.nodoEmisor || 'Municipal Camera'}</span>
                    </div>

                    {/* Rationale if voided */}
                    {result.estado === 'ANULADA' && (
                      <div className="bg-amber-950/30 border border-amber-800/50 rounded-lg p-3 text-xs space-y-1">
                        <span className="text-amber-400 font-bold block">Infraction Voided</span>
                        <p className="text-slate-300"><strong>Reason:</strong> {result.motivo || 'Administrative review'}</p>
                      </div>
                    )}

                    {/* Web3 Arbitrum Hash */}
                    <div className="pt-2 border-t border-slate-700/60">
                      <span className="text-slate-400 text-xs flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-400" /> Immutable Proof (Arbitrum Sepolia):
                      </span>
                      <code className="text-xs text-cyan-300/80 font-mono break-all block bg-slate-950 p-2 rounded mt-1 border border-slate-800">
                        {result.hash || 'Pending on-chain confirmation'}
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
                        <span>View on Explorer (Arbiscan)</span>
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
            <p className="text-slate-300 font-medium mt-2">No infractions were found for this search.</p>
            <p className="text-xs text-slate-500 mt-1">Check the plate or case number you entered.</p>
          </div>
        )
      )}
    </div>
  );
}