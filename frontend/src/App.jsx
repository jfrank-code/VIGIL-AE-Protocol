import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import Header from './components/Header';
import CameraGrid from './components/CameraGrid';
import MetricsPanel from './components/MetricsPanel';
import VehicleClassification from './components/VehicleClassification';
import OracleTable from './components/OracleTable';
import OcrView from './components/OcrView';
import ExpedientesTable from './components/ExpedientesTable';
import CitizenPortal from './components/CitizenPortal';
import Chatbot from './components/Chatbot';
import { ArrowLeft } from 'lucide-react';

// NUEVA IMPORTACIÓN: Componentes del Piloto VMT y Escalabilidad
import PilotDisclaimerModal from './components/PilotDisclaimerModal';
import ScalingRoadmap from './components/ScalingRoadmap';

// Contenedor Portal Municipal
function MunicipalDashboard() {
  const [searchPlate, setSearchPlate] = useState('');
  const [activeTab, setActiveTab] = useState('cameras');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 lg:p-6 font-sans relative">
      {/* Modal de Aviso Ético y Piloto VMT */}
      <PilotDisclaimerModal />

      <div className="max-w-7xl mx-auto space-y-6">
        <Header 
          searchPlate={searchPlate} 
          setSearchPlate={setSearchPlate} 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
        />

        {/* Tarjeta Visual de Piloto vs. Escalabilidad Municipal */}
        <ScalingRoadmap />

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

        {activeTab === 'ocr' && <OcrView />}
        {activeTab === 'expedientes' && <ExpedientesTable />}
      </div>
      <Chatbot />
    </div>
  );
}

// Contenedor Portal Ciudadano
function CitizenView() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans">
      <div className="max-w-5xl mx-auto mb-4">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-slate-300 px-4 py-2 rounded-xl border border-slate-800 text-xs font-mono transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Volver al Inicio
        </button>
      </div>
      <CitizenPortal />
      <Chatbot />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/municipal" element={<MunicipalDashboard />} />
        <Route path="/ciudadano" element={<CitizenView />} />
      </Routes>
    </BrowserRouter>
  );
}