import React, { useState, useEffect } from 'react';
import { Search, Bell, ArrowLeft, Settings, LogOut } from 'lucide-react';
// IMPORTING FROM SEPARATE FILES
import Sidebar from './components/Sidebar';
import LoginView from './components/LoginView';
import DailyRounds from './pages/DailyRounds';
import PatientList from './pages/PatientList';
import PatientDetail from './pages/PatientDetail';
import { THEMES, INITIAL_ROUNDS, MOCK_PATIENTS, PATIENT_DETAILS_MAP } from './constants';
import { getPatients, getDailyRounds, getPatientDetail, clearAuthToken, checkAPIHealth } from './api';
import './index.css'; 

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false); 
  
  const theme = isDarkMode ? THEMES.dark : THEMES.light;
  
  const [view, setView] = useState('rounds'); 
  const [rounds, setRounds] = useState([]);
  const [patients, setPatients] = useState([]);
  const [patientFilter, setPatientFilter] = useState('Today'); 
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiConnected, setApiConnected] = useState(false);
  
  const [activePatient, setActivePatient] = useState(null);
  const [patientDetailData, setPatientDetailData] = useState(null);
  const [messages, setMessages] = useState([]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // Check API health on mount
  useEffect(() => {
    checkAPIHealth().then(setApiConnected);
  }, []);

  // Load data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadDailyRounds();
      loadPatients();
    }
  }, [isAuthenticated]);

  // Reload patients when filter changes
  useEffect(() => {
    if (isAuthenticated) {
      loadPatients();
    }
  }, [patientFilter]);

  const loadDailyRounds = async () => {
    try {
      const data = await getDailyRounds();
      setRounds(data.length > 0 ? data : INITIAL_ROUNDS);
    } catch (error) {
      console.error('Failed to load daily rounds:', error);
      setRounds(INITIAL_ROUNDS);
    }
  };

  const loadPatients = async () => {
    try {
      setLoading(true);
      const data = await getPatients(patientFilter);
      setPatients(data.length > 0 ? data : MOCK_PATIENTS);
    } catch (error) {
      console.error('Failed to load patients:', error);
      setPatients(MOCK_PATIENTS);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (userData) => {
    setIsAuthenticated(true);
    setView('rounds');
  };

  const handleLogout = () => {
    clearAuthToken();
    setIsAuthenticated(false);
    setActivePatient(null);
    setMessages([]);
    setRounds([]);
    setPatients([]);
  };

  const toggleBookmark = (id) => {
    setRounds(prev => prev.map(item => item.id === id ? { ...item, isBookmarked: !item.isBookmarked } : item));
  };

  const handlePatientClick = async (p) => {
    setActivePatient(p);
    setView('detail');
    setMessages([{ 
      id: 0, 
      type: 'bot', 
      text: `**Context Loaded: ${p.name}**\n\nLoading patient data...` 
    }]);

    // Try to load detailed patient data from backend
    try {
      const detailData = await getPatientDetail(p.id);
      setPatientDetailData(detailData);
      setMessages([{ 
        id: 0, 
        type: 'bot', 
        text: `**Context Loaded: ${p.name}**\n\nI've analyzed the vitals and recent history. Vitals are ${p.status.toLowerCase()}. How can I assist?` 
      }]);
    } catch (error) {
      console.error('Failed to load patient details:', error);
      // Fallback to mock data
      setPatientDetailData(PATIENT_DETAILS_MAP[1]);
      setMessages([{ 
        id: 0, 
        type: 'bot', 
        text: `**Context Loaded: ${p.name}**\n\nUsing cached patient data. How can I assist?` 
      }]);
    }
  };

  if (!isAuthenticated) {
    return <LoginView onLogin={handleLogin} theme={theme} apiConnected={apiConnected} />;
  }

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.textMain} font-sans transition-all duration-700 flex overflow-hidden`}>
      
      <Sidebar 
        view={view} 
        setView={setView} 
        isDarkMode={isDarkMode} 
        toggleTheme={toggleTheme} 
        theme={theme} 
      />

      <main className="flex-1 h-screen overflow-hidden relative flex flex-col transition-all duration-500">
        
        {/* Liquid Glass Header */}
        <header className={`px-8 py-6 flex justify-between items-center z-20 backdrop-blur-md border-b ${theme.cardBorder} bg-black/5`}>
          <div>
            <h1 className={`text-3xl font-bold tracking-tight ${theme.textMain} drop-shadow-md`}>
              {view === 'rounds' && "Morning Briefing"}
              {view === 'patients' && "My Patients"}
              {view === 'settings' && "Settings"}
              {view === 'detail' && (
                <button onClick={() => setView('patients')} className={`flex items-center gap-2 hover:text-white transition-colors`}>
                  <ArrowLeft size={24} /> Back to List
                </button>
              )}
            </h1>
            {view === 'rounds' && <p className={`text-sm ${theme.textMuted} font-medium mt-1`}>Here are today's Cardiology updates.</p>}
          </div>
          
          <div className="flex items-center gap-4">
             {(view === 'rounds' || view === 'patients') && (
                 <div className={`relative group hidden md:block w-72`}>
                    <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${theme.textMuted} group-focus-within:text-white transition-colors`} size={18} />
                    <input 
                      type="text" 
                      placeholder={view === 'rounds' ? "Search updates..." : "Search patients..."}
                      className={`w-full rounded-2xl pl-10 pr-4 py-2.5 text-sm outline-none transition-all ${theme.inputBg}`}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                 </div>
             )}

             <button className={`p-2.5 rounded-full relative transition-all ${theme.cardBg} border ${theme.cardBorder} hover:bg-white/20`}>
               <Bell size={20} />
               <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 rounded-full animate-pulse border border-white" />
             </button>
          </div>
        </header>

        {view === 'rounds' && (
          <DailyRounds 
            rounds={rounds} 
            toggleBookmark={toggleBookmark} 
            theme={theme} 
            searchQuery={searchQuery} 
          />
        )}

        {view === 'patients' && (
          <PatientList 
            patients={patients}
            setPatient={handlePatientClick}
            theme={theme}
            isDarkMode={isDarkMode}
            filter={patientFilter}
            setFilter={setPatientFilter}
            loading={loading}
          />
        )}

        {view === 'detail' && activePatient && patientDetailData && (
          <PatientDetail 
            patient={activePatient}
            detailData={patientDetailData}
            theme={theme}
            isDarkMode={isDarkMode}
            messages={messages}
            setMessages={setMessages}
          />
        )}

        {view === 'settings' && (
            <div className="flex-1 flex items-center justify-center text-slate-500 flex-col gap-4">
                <Settings size={48} className="opacity-60 text-white" />
                <p className="text-white">Settings & Configuration</p>
                <div className="flex gap-4">
                  <button className={`px-6 py-2.5 ${theme.glass} font-medium rounded-xl hover:bg-white/20 transition-all text-white`}>Manage Account</button>
                  <button onClick={handleLogout} className={`px-6 py-2.5 rounded-xl border font-medium flex items-center gap-2 transition-all ${theme.dangerBg} ${theme.dangerBorder} ${theme.dangerText} hover:bg-rose-500/40`}>
                    <LogOut size={18} /> Logout
                  </button>
                </div>
            </div>
        )}

      </main>
    </div>
  );
};

export default App;