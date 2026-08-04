import React, { useState } from 'react';
import { MessageSquare, X, Send, Bot, User, ShieldCheck, Sparkles } from 'lucide-react';

const MOCK_BOT_RESPONSES = {
  anular: "Para anular un acta en la sección 'EXPEDIENTES', la autoridad municipal ingresa la Resolución Municipal y motivo. Esto genera un hash inmutable en Arbitrum.",
  placa: "Puedes consultar cualquier multa en el 'PORTAL CIUDADANO' ingresando la placa del vehículo (ej: P3A-891 o B7X-102).",
  blockchain: "VIGIL-AE registra el hash criptográfico de cada infracción en Arbitrum Sepolia para impedir la alteración arbitraria de las pruebas.",
  monto: "Los montos de las multas se calculan según el tipo de infracción (Zona Rígida, Berma Sur o Obstrucción).",
  default: "Hola, soy el Copiloto IA de VIGIL-AE. Puedo orientarte sobre las cámaras de vigilancia, el registro en Arbitrum o la emisión de reportes."
};

export default function Chatbot() {
  // Abierto por defecto para máxima visibilidad
  const [isOpen, setIsOpen] = useState(true);
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: '¡Hola! 🤖 Soy VIGIL-AI Copilot. Estoy aquí para guiarte en el monitoreo de cámaras, expedientes y la verificación Web3.'
    }
  ]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userText = inputMessage;
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setInputMessage('');

    setTimeout(() => {
      const lower = userText.toLowerCase();
      let botAnswer = MOCK_BOT_RESPONSES.default;

      if (lower.includes('anul') || lower.includes('resolución')) botAnswer = MOCK_BOT_RESPONSES.anular;
      else if (lower.includes('placa') || lower.includes('buscar')) botAnswer = MOCK_BOT_RESPONSES.placa;
      else if (lower.includes('blockchain') || lower.includes('arbitrum')) botAnswer = MOCK_BOT_RESPONSES.blockchain;
      else if (lower.includes('monto') || lower.includes('precio')) botAnswer = MOCK_BOT_RESPONSES.monto;

      setMessages(prev => [...prev, { sender: 'bot', text: botAnswer }]);
    }, 600);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white px-5 py-3 rounded-full shadow-2xl flex items-center gap-2 border border-cyan-400/50 animate-bounce"
        >
          <Bot className="w-5 h-5" />
          <span className="text-xs font-bold font-mono">Abrir Copiloto IA</span>
        </button>
      )}

      {isOpen && (
        <div className="bg-slate-900 border-2 border-cyan-500/50 rounded-2xl shadow-2xl w-80 md:w-96 h-[460px] flex flex-col overflow-hidden animate-fadeIn backdrop-blur-xl">
          {/* Header con luz de atención */}
          <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 p-3.5 border-b border-cyan-500/30 flex justify-between items-center relative">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-cyan-500/20 border border-cyan-400/40 rounded-xl text-cyan-300 relative">
                <Bot className="w-5 h-5" />
                <Sparkles className="w-3 h-3 text-amber-300 absolute -top-1 -right-1 animate-spin" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white flex items-center gap-1.5 font-mono tracking-wider">
                  VIGIL-AI COPILOT <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                </h3>
                <p className="text-[10px] text-cyan-300/80 font-mono">Asistente en Tiempo Real</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mensajes */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-slate-950/70 text-xs">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex items-start gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'bot' && (
                  <div className="p-1 bg-slate-800 rounded text-cyan-400 border border-slate-700 mt-0.5">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] p-2.5 rounded-xl ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none shadow-md'
                      : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>
                {msg.sender === 'user' && (
                  <div className="p-1 bg-blue-600/30 rounded text-blue-300 border border-blue-500/30 mt-0.5">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Input */}
          <form onSubmit={handleSendMessage} className="p-2.5 bg-slate-900 border-t border-slate-800 flex gap-2">
            <input
              type="text"
              placeholder="Escribe tu consulta..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
            />
            <button
              type="submit"
              className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 p-2 rounded-xl transition-all shadow-md font-bold"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}