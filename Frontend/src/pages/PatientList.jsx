import React from 'react';
import Card from '../components/Card';
import { ChevronRight } from 'lucide-react';

const PatientList = ({ patients, setPatient, theme, isDarkMode, filter, setFilter }) => {
  const getFilteredPatients = () => {
    let filtered = patients;
    if (filter === 'Critical Care') filtered = filtered.filter(p => p.status === 'Critical');
    if (filter === 'Today') filtered = filtered.filter(p => p.appointment === 'Today');
    return filtered;
  };

  return (
    <div className="flex-1 overflow-y-auto px-8 pb-8 z-10 custom-scrollbar">
      {/* Glass Filter Bar */}
      <div className={`flex gap-4 mb-8 border-b border-white/20 pb-4 overflow-x-auto`}>
        {['All Patients', 'Appointments Today', 'Critical Care'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f === 'Appointments Today' ? 'Today' : f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap border ${
              (filter === 'Today' && f === 'Appointments Today') || filter === f
              ? 'bg-white/20 text-white border-white/40 shadow-lg backdrop-blur-md' 
              : 'text-white/60 hover:text-white hover:bg-white/10 border-transparent'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {getFilteredPatients().map((p) => (
          <Card key={p.id} theme={theme} className="cursor-pointer group" onClick={() => setPatient(p)}>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white shadow-lg border-2 border-white/20 ${
                  p.gender === 'Female' ? 'bg-pink-500/50' : 'bg-blue-600/50'
                }`}>
                  {p.name.charAt(0)}
                </div>
                <div>
                  <h4 className={`font-bold ${theme.textMain} drop-shadow-sm`}>{p.name}</h4>
                  <span className={`text-xs ${theme.textMuted}`}>ID: #{p.id} • {p.age}y</span>
                </div>
              </div>
              <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide border backdrop-blur-md ${
                p.status === 'Critical' 
                    ? 'bg-rose-500/20 text-white border-rose-500/30' 
                    : p.status === 'Waiting'
                        ? 'bg-emerald-500/20 text-white border-emerald-500/30'
                        : 'bg-white/10 text-white border-white/20'
              }`}>
                {p.status}
              </span>
            </div>
            <div className={`flex justify-between items-center text-sm border-t border-dashed border-white/20 pt-4 mt-2`}>
                <span className={theme.textMuted}>{p.condition}</span>
                <ChevronRight size={16} className={`text-white/50 group-hover:text-white transition-colors`} />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PatientList;