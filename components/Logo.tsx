import React from 'react';

export const Logo: React.FC<{ className?: string, theme?: 'light' | 'dark' }> = ({ className = "h-12", theme = 'light' }) => {
  const textColor = theme === 'dark' ? 'text-white' : 'text-slate-900';
  
  return (
    <div className={`flex items-center gap-3 ${className}`}>
        {/* Modern Minimalist Icon */}
        <div className="relative w-10 h-10 flex-shrink-0">
            {/* Outer Ring */}
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#e2e8f0" strokeWidth="2" opacity={theme === 'dark' ? 0.2 : 1} />
                
                {/* Dynamic Arrows */}
                <path d="M 50 15 A 35 35 0 0 0 15 50" fill="none" stroke="#10b981" strokeWidth="10" strokeLinecap="round" />
                <path d="M 85 50 A 35 35 0 0 0 50 85" fill="none" stroke="#1e40af" strokeWidth="10" strokeLinecap="round" />
                
                {/* Center Arrow */}
                <path d="M 35 65 L 65 35" stroke="#f59e0b" strokeWidth="8" strokeLinecap="round" />
                <path d="M 65 35 L 50 35 M 65 35 L 65 50" stroke="#f59e0b" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        </div>
        
        {/* Text */}
        <div className="flex flex-col leading-none select-none">
            <span className={`text-xl font-extrabold tracking-tight ${textColor}`}>
                Skill<span className="text-emerald-500">Quest</span>
            </span>
            <div className="flex items-center gap-1">
                 <div className="h-0.5 w-3 bg-yellow-400 rounded-full"></div>
                 <span className="text-[0.6rem] font-bold tracking-[0.2em] text-slate-400 uppercase">Brazil</span>
            </div>
        </div>
    </div>
  );
};