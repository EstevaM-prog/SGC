import React from 'react';

export default function DonutChart({ value, total, label, colorStart, colorEnd, id }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  const size = 140;
  const stroke = 16;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = (pct / 100) * c;
  const remaining = c - dash;

  return (
    <div className="donut-inner">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <linearGradient id={`g-${id}`} x1="0%" x2="100%" y1="0%" y2="100%">
            <stop offset="0%" stopColor={colorStart} />
            <stop offset="100%" stopColor={colorEnd} />
          </linearGradient>
        </defs>
        <g transform={`translate(${size / 2},${size / 2})`}>
          <circle 
            r={r} cx="0" cy="0" fill="none" 
            stroke="rgba(255,255,255,0.06)" 
            strokeWidth={stroke} 
          />
          <circle 
            r={r} cx="0" cy="0" fill="none" 
            stroke={`url(#g-${id})`} 
            strokeWidth={stroke} 
            strokeDasharray={`${dash} ${remaining}`} 
            strokeLinecap="round" 
            transform="rotate(-90)" 
          />
        </g>
      </svg>
      <div className="donut-label">
        <div className="donut-value">{value}</div>
        <div className="donut-text">{label}</div>
        <div className="donut-pct">{pct}%</div>
      </div>
    </div>
  );
}
