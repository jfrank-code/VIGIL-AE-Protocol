import React, { useState } from 'react';
import Header from './components/Header';
import CameraGrid from './components/CameraGrid';
import MetricsPanel from './components/MetricsPanel';
import VehicleClassification from './components/VehicleClassification';
import OracleTable from './components/OracleTable';
import OcrView from './components/OcrView';

export default function App() {
  const [searchPlate, setSearchPlate] = useState('');
  const [activeTab, setActiveTab] = useState('cameras');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 lg:p-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header con Estado de Búsqueda y Navegación */}
        <Header 
          searchPlate={searchPlate} 
          setSearchPlate={setSearchPlate} 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
        />

        {/* VISTA 1: CÁMARAS EN VIVO (EZVIZ) */}
        {activeTab === 'cameras' && (
          <div className="space-y-6 animate-fadeIn">
            <CameraGrid />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <MetricsPanel />
              <VehicleClassification />
              <OracleTable searchPlate={searchPlate} />
            </div>
          </div>
        )}

        {/* VISTA 2: FISCALIZACIÓN ANPR / OCR */}
        {activeTab === 'ocr' && <OcrView />}

      </div>
    </div>
  );
}
