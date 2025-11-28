import React from 'react';
import { Heart, BookOpen, Users, Settings, Sun, Moon } from 'lucide-react';

const NavItem = ({ icon: Icon, active, onClick, theme, label }) => (
  <button 
    onClick={onClick}
    className={`relative p-3 rounded-xl transition-all duration-300 group flex items-center justify-center w-full ${active ? theme.navActive : theme.navInactive}`}
    title={label}
  >
    <Icon size={22} strokeWidth={active ? 2.5 : 2} />
    {active && (
      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white/80 rounded-r-full shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
    )}
  </button>
);

const Sidebar = ({ view, setView, isDarkMode, toggleTheme, theme }) => {
  return (
    <nav className={`w-24 py-8 flex flex-col items-center gap-6 z-50 ${theme.sidebarBg} transition-colors duration-300`}>
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500/80 to-purple-600/80 backdrop-blur-md flex items-center justify-center shadow-lg border border-white/20 cursor-pointer" onClick={() => setView('rounds')}>
        <Heart className="text-white fill-white" size={24} />
      </div>
      
      <NavItem theme={theme} icon={BookOpen} label="Daily Rounds" active={view === 'rounds'} onClick={() => setView('rounds')} />
      <NavItem theme={theme} icon={Users} label="My Patients" active={view === 'patients' || view === 'detail'} onClick={() => { setView('patients'); }} />
      <NavItem theme={theme} icon={Settings} label="Settings" active={view === 'settings'} onClick={() => setView('settings')} />

      <div className="flex-1" />
      
      <button 
        onClick={toggleTheme}
        className={`p-3 rounded-full mb-4 transition-all duration-300 ${isDarkMode ? 'bg-white/10 text-yellow-400 hover:bg-white/20' : 'bg-black/20 text-white hover:bg-black/30'} border border-white/30`}
      >
        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
      </button>
    </nav>
  );
};

export default Sidebar;