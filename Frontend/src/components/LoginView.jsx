import React, { useState } from 'react';
import { Heart, User, Lock, Sparkles, AlertCircle, Wifi, WifiOff } from 'lucide-react';
import { loginUser } from '../api';

const LoginView = ({ onLogin, theme, apiConnected }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const userData = await loginUser(email, password);
      onLogin(userData);
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err?.message || err?.toString() || 'Login failed. Please check your credentials.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen ${theme.bg} ${theme.textMain} p-4 transition-colors duration-500`}>
      {/* Liquid Glass Login Card */}
      <div className={`w-full max-w-md p-10 space-y-8 ${theme.cardBg} border ${theme.cardBorder} rounded-3xl relative overflow-hidden backdrop-blur-3xl`}>
        {/* Ambient Glow */}
        <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-indigo-500/20 blur-[100px] pointer-events-none" />
        
        <div className="text-center relative z-10">
          <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-500/80 to-purple-600/80 flex items-center justify-center shadow-lg border border-white/20 mb-6">
            <Heart className="text-white fill-white" size={40} />
          </div>
          <h2 className="text-3xl font-bold tracking-tight mb-2 drop-shadow-sm">Med Perplexity</h2>
          <p className={theme.textMuted}>Clinical Intelligence Platform</p>
        </div>

        <form className="space-y-6 relative z-10" onSubmit={handleSubmit}>
          {error && (
            <div className="p-3 bg-rose-500/20 border border-rose-500/30 rounded-xl flex items-center gap-2 text-rose-200 text-sm">
              <AlertCircle size={16} />
              {error}
            </div>
          )}
          
          <div>
            <div className="relative">
              <User className={`absolute left-3 top-1/2 -translate-y-1/2 ${theme.textMuted}`} size={20} />
              <input 
                type="text" 
                required
                className={`w-full pl-10 pr-4 py-3 rounded-xl outline-none transition-all ${theme.inputBg}`}
                placeholder="dr.sharma"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <div className="relative">
              <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 ${theme.textMuted}`} size={20} />
              <input 
                type="password" 
                required
                className={`w-full pl-10 pr-4 py-3 rounded-xl outline-none transition-all ${theme.inputBg}`}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>
          
          {!apiConnected && (
            <p className="text-xs text-orange-300 text-center">
              Testing mode: Any email/password will work
            </p>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 bg-white/20 hover:bg-white/30 border border-white/40 text-white font-bold rounded-xl transition-all shadow-[0_4px_14px_0_rgba(0,0,0,0.1)] flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {loading ? <><Sparkles className="animate-spin" size={20} /> Authenticating...</> : 'Enter Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginView;