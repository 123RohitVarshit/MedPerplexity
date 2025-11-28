import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Mic, Send, AlertTriangle } from 'lucide-react';

const ChatInterface = ({ theme, isDarkMode, messages, setMessages }) => {
  const [input, setInput] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const newMsg = { id: Date.now(), type: 'user', text: input };
    setMessages(prev => [...prev, newMsg]);
    setInput('');
    
    // Simulate Thinking
    setTimeout(() => {
        setMessages(prev => [...prev, { id: Date.now() + 1, type: 'thinking', text: "Reasoning..." }]);
    }, 600);

    setTimeout(() => {
        setMessages(prev => prev.filter(m => m.type !== 'thinking'));
        
        let response = { text: "I found no specific guidelines for that query." };
        
        if (input.toLowerCase().includes('diclofenac')) {
            response = {
                type: 'alert',
                title: 'Contraindication Alert',
                text: "Diclofenac is contraindicated for this patient due to **CKD Stage 3**. NSAIDs can worsen renal function.",
                suggestion: "Consider Paracetamol 650mg or Tramadol if pain is severe."
            };
        } else {
            response = { text: "Based on the recent labs, I recommend continuing the current fluid therapy. Monitor electrolytes closely." };
        }

      setMessages(prev => [...prev, { id: Date.now() + 2, type: 'bot', ...response }]);
    }, 2000);
  };

  return (
    <div className={`w-[60%] flex flex-col ${theme.cardBg} border-l ${theme.cardBorder} relative backdrop-blur-2xl`}>
      {/* Chat Header */}
      <div className={`p-4 border-b ${theme.cardBorder} flex justify-between items-center bg-black/5`}>
        <div className="flex items-center gap-3">
           <div className="p-2 bg-indigo-500/20 rounded-lg border border-indigo-500/30">
              <Sparkles size={18} className="text-indigo-200" />
           </div>
           <div>
              <h3 className={`font-bold ${theme.textMain}`}>Clinical Co-Pilot</h3>
              <span className="text-[10px] text-emerald-200 flex items-center gap-1">
                 <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Active Listening
              </span>
           </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        {messages.map((m) => (
           <div key={m.id} className={`flex ${m.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl text-sm leading-relaxed shadow-lg backdrop-blur-md border ${
                 m.type === 'user' 
                 ? 'bg-white/20 border-white/30 text-white rounded-tr-none p-4' 
                 : `${isDarkMode ? 'bg-black/30 border-white/10' : 'bg-white/40 border-white/40'} ${theme.textMain} rounded-tl-none p-0 overflow-hidden`
              }`}>
                 {m.type === 'bot' && (
                     <div className="p-4">
                        <div className="text-[10px] font-bold text-indigo-300 mb-1 uppercase tracking-wider">AI Insight</div>
                        <div dangerouslySetInnerHTML={{ __html: m.text?.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>') }} />
                     </div>
                 )}
                 {m.type === 'alert' && (
                     <div className={`border-l-4 border-rose-400`}>
                         <div className={`p-4 ${theme.dangerBg}`}>
                             <div className={`flex items-center gap-2 font-bold ${theme.dangerText} mb-2`}>
                                 <AlertTriangle size={18} />
                                 {m.title}
                             </div>
                             <p className={`mb-3 text-white/90`} dangerouslySetInnerHTML={{ __html: m.text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>') }} />
                             <div className={`text-xs p-3 rounded-lg bg-black/20 text-white/80`}>
                                 <strong>Recommendation:</strong> {m.suggestion}
                             </div>
                         </div>
                     </div>
                 )}
                 
                 {m.type === 'thinking' && <div className="p-4 text-[10px] font-bold text-white/60 flex items-center gap-2"><Sparkles size={10} className="animate-spin" /> Reasoning...</div>}
                 {m.type === 'user' && m.text}
              </div>
           </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <div className={`p-6 border-t ${theme.cardBorder} bg-black/10`}>
         <div className="relative flex items-center gap-3">
            <button className={`p-3 rounded-xl transition-colors bg-white/10 border border-white/20 text-white hover:bg-white/20`}>
               <Mic size={20} />
            </button>
            
            <input 
               className={`flex-1 rounded-xl px-4 py-3 text-sm focus:outline-none transition-all ${theme.inputBg}`}
               placeholder="Ask about interactions, dosage, or guidelines..."
               value={input}
               onChange={(e) => setInput(e.target.value)}
               onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            />
            <button 
              onClick={sendMessage}
              className="p-3 bg-white/20 border border-white/30 rounded-xl text-white hover:bg-white/30 transition-all"
            >
               <Send size={20} />
            </button>
         </div>
      </div>
    </div>
  );
};

export default ChatInterface;