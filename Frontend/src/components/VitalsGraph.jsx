import React from 'react';

const SmoothLineChart = ({ data, theme, isDark }) => {
  if (!data) return null;
  const height = 150;
  const width = 400;
  const max = Math.max(...data.map(d => d.value)) * 1.1;
  const min = Math.min(...data.map(d => d.value)) * 0.9; 
  
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((d.value - min) / (max - min)) * height;
    return `${x},${y}`;
  });
  
  // High contrast white stroke for better visibility on glass background
  const strokeColor = "#ffffff";
  const pointFill = "rgba(255,255,255,0.2)";
  const pointStroke = "#ffffff";
  
  return (
    <div className="w-full h-full flex items-end justify-center pb-2">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
        {/* White Grid Lines */}
        <line x1="0" y1={height} x2={width} y2={height} stroke="white" strokeOpacity="0.3" />
        <line x1="0" y1={height/2} x2={width} y2={height/2} stroke="white" strokeDasharray="4" strokeOpacity="0.3" />
        
        <polyline 
          points={points.join(' ')} 
          fill="none" 
          stroke={strokeColor}
          strokeWidth="3" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className="drop-shadow-[0_4px_8px_rgba(0,0,0,0.3)]"
        />
        {points.map((p, i) => (
          <g key={i} className="group cursor-pointer">
            <circle cx={p.split(',')[0]} cy={p.split(',')[1]} r="5" fill={pointFill} stroke={pointStroke} strokeWidth="2" className="transition-all group-hover:r-7" />
            <text x={p.split(',')[0]} y={parseFloat(p.split(',')[1]) - 12} textAnchor="middle" fill="white" fontSize="12" fontWeight="bold" className="opacity-0 group-hover:opacity-100 transition-opacity font-mono bg-black/50 px-1 rounded shadow-sm">
              {data[i].value}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
};

export default SmoothLineChart;