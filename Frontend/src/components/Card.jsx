import React from 'react';

const Card = ({ children, className = "", theme, onClick }) => {
  // Safety check
  const safeTheme = theme || { cardBg: 'bg-white', cardBorder: 'border-white' };

  return (
    <div 
      onClick={onClick}
      className={`
        rounded-xl p-6 relative overflow-hidden transition-all duration-300
        ${safeTheme.cardBg} border ${safeTheme.cardBorder}
        hover:scale-[1.01] hover:shadow-2xl
        before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-br before:from-white/10 before:to-transparent before:opacity-50 before:pointer-events-none
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default Card;