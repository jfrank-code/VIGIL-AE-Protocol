import React, { useState } from 'react';
import Header from './components/Header';
import CameraGrid from './components/CameraGrid';
import MetricsPanel from './components/MetricsPanel';
import VehicleClassification from './components/VehicleClassification';
import OracleTable from './components/OracleTable';

export default function App() {
  const [searchPlate, setSearchPlate] = useState('');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans selection:bg-blue-500 selection:text-white">
      {/* Container Máximo para Pantallas Anchas */}
      <div className="max-w-7xl mx-auto space-y-6">
        <Header searchPlate={searchPlate} setSearchPlate={setSearchPlate} />
        
        <main className="space-y-6">
          <CameraGrid />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <MetricsPanel />
            <VehicleClassification />
            <OracleTable />
          </div>
        </main>

        <footer className="pt-6 border-t border-slate-800/60 text-center text-xs text-slate-600 font-mono flex flex-col md:flex-row justify-between items-center gap-2">
          <p>© 2026 VIGIL-AE Protocol — Sistema de Inspección Inmutable AI & Web3</p>
          <p className="text-[10px] text-slate-500">Ethereum Hackathon Build • Arbitrum L2</p>
        </footer>
      </div>
    </div>
  );
}
