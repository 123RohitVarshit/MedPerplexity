import React from 'react';
import Card from '../components/Card';
import { Bookmark } from 'lucide-react';

const DailyRounds = ({ rounds, toggleBookmark, theme, searchQuery }) => {
  const filteredRounds = searchQuery 
    ? rounds.filter(r => r.title.toLowerCase().includes(searchQuery.toLowerCase()) || r.summary.toLowerCase().includes(searchQuery.toLowerCase()))
    : rounds;

  return (
    <div className="flex-1 overflow-y-auto px-8 pb-8 z-10 custom-scrollbar">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRounds.map((item) => (
          <Card key={item.id} theme={theme} className="hover:-translate-y-1 flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <span className={`bg-white/20 border border-white/20 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-md`}>
                {item.type}
              </span>
              <button 
                  onClick={(e) => { e.stopPropagation(); toggleBookmark(item.id); }}
                  className={`text-white/60 hover:text-white transition-colors hover:scale-110`}
              >
                  <Bookmark size={20} fill={item.isBookmarked ? "white" : "none"} />
              </button>
            </div>
            <h3 className={`text-lg font-bold ${theme.textMain} mb-2 leading-tight drop-shadow-sm`}>{item.title}</h3>
            <p className={`text-sm ${theme.textMuted} mb-4 leading-relaxed line-clamp-3`}>{item.summary}</p>
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/10">
              <span className={`text-xs ${theme.textMuted}`}>{item.source}</span>
              <a 
                href={item.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs font-bold text-white hover:underline bg-white/10 px-2 py-1 rounded border border-white/10 hover:bg-white/20 transition-colors"
              >
                Read Full
              </a>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DailyRounds;