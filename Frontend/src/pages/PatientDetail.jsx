import React from 'react';
import SmoothLineChart from '../components/VitalsGraph';
import ChatInterface from '../components/ChatInterface';
import { AlertTriangle, ArrowLeft, FileText } from 'lucide-react';
import { isVitalAbnormal } from '../utils';

const PatientDetail = ({ patient, detailData, theme, isDarkMode, messages, setMessages }) => {
  return (
    <div className="flex-1 flex overflow-hidden">
      
      {/* LEFT PANEL: CONTEXT (40%) - Read Only */}
      <div className={`w-[40%] ${theme.bg} border-r border-white/10 p-6 overflow-y-auto space-y-6 custom-scrollbar backdrop-blur-md`}>
        
        {/* 1. Header Profile & Allergy Warning */}
        <div>
          <h2 className={`text-3xl font-bold ${theme.textMain} mb-2 drop-shadow-md`}>{patient.name}</h2>
          <p className={theme.textMuted}>{patient.age} Yrs • {patient.gender} • {patient.condition}</p>
          
          {/* Allergy Banner */}
          {detailData.allergies.length > 0 && (
              <div className={`mt-4 ${theme.dangerBg} ${theme.dangerBorder} border px-4 py-3 rounded-xl flex items-center gap-3 animate-pulse`}>
                  <AlertTriangle size={20} className="text-white" />
                  <span className="text-sm font-bold text-white">Allergic to: {detailData.allergies.join(', ')}</span>
              </div>
          )}
        </div>

        {/* 2. Vitals Grid */}
        <div className="grid grid-cols-2 gap-4">
            {Object.entries(patient.vitals).map(([key, val]) => (
                <div key={key} className={`p-4 rounded-2xl ${theme.cardBg} border ${theme.cardBorder}`}>
                  <span className={`text-xs font-bold uppercase ${theme.textMuted}`}>{key}</span>
                  <div className={`text-2xl font-mono font-bold mt-1 ${isVitalAbnormal(key, val) ? 'text-rose-300' : 'text-white'}`}>
                      {val}
                  </div>
                </div>
            ))}
        </div>

        {/* 3. Health Trend Graph */}
        <div className={`p-4 rounded-2xl ${theme.cardBg} border ${theme.cardBorder}`}>
          <div className="flex justify-between mb-4">
            <h3 className={`text-sm font-bold uppercase ${theme.textMuted}`}>{detailData.graphLabel}</h3>
            <span className="text-xs text-emerald-300 font-bold flex items-center gap-1">
              <ArrowLeft className="rotate-[-45deg]" size={12}/> Improving
            </span>
          </div>
          <div className="h-40">
            <SmoothLineChart data={detailData.vitalsData} theme={theme} isDark={isDarkMode} />
          </div>
        </div>

        {/* 4. Last Session Summary */}
        <div className={`p-5 rounded-2xl border border-white/20 bg-white/5 backdrop-blur-sm`}>
          <h3 className={`text-sm font-bold mb-3 flex items-center gap-2 text-white`}>
              <FileText size={16} /> Last Visit Summary
          </h3>
          <ul className={`space-y-2 text-sm text-white/80`}>
            {detailData.lastSummary.map((point, i) => (
                <li key={i} className="flex gap-2 items-start">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-white/60 flex-shrink-0" />
                    <span className="leading-relaxed">{point}</span>
                </li>
            ))}
          </ul>
        </div>

      </div>

      {/* RIGHT PANEL: CO-PILOT (60%) - Interactive */}
      <ChatInterface 
        theme={theme} 
        isDarkMode={isDarkMode} 
        messages={messages} 
        setMessages={setMessages} 
      />

    </div>
  );
};

export default PatientDetail;