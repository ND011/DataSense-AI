import React from 'react';

export const MetricCard = ({ title, value, change, isPositive, Icon }) => {
    return (
        <div className="glass p-6 rounded-[2.5rem] flex flex-col justify-between min-h-[220px] relative overflow-hidden group">
            {/* Background Decorative Icon */}
            {Icon && (
                <div className="absolute -right-4 -bottom-4 p-4 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-700 pointer-events-none">
                    <Icon className="w-32 h-32 text-white" />
                </div>
            )}
            
            <div className="flex items-center gap-4 mb-6 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-app-accent3/10 flex items-center justify-center text-app-accent3 border border-app-accent3/20 shadow-sm">
                    {Icon ? <Icon className="w-6 h-6" /> : <div className="font-black">{title.charAt(0)}</div>}
                </div>
                <span className="text-sm font-bold text-white tracking-tight">{title}</span>
            </div>
            
            <div className="space-y-4 relative z-10">
                <div className="flex flex-col gap-1">
                    <span className="text-3xl font-black text-white tracking-tighter">{value}</span>
                    <div className={`inline-flex items-center w-fit gap-1 text-[10px] font-black px-2 py-1 rounded-lg ${
                        isPositive 
                            ? 'text-emerald-400 bg-emerald-400/10' 
                            : 'text-red-400 bg-red-400/10'
                    }`}>
                        {isPositive ? '↗' : '↘'} {change || '0%'}
                        <span className="opacity-50 ml-1 font-bold">vs expected</span>
                    </div>
                </div>
                
                {/* Visual Progress/Health Indicator */}
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div 
                        className={`h-full rounded-full ${isPositive ? 'bg-emerald-500 shadow-[0_0_8px_rgba(52,211,153,0.5)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`}
                        style={{ width: `${Math.min(Math.abs(parseFloat(change)) * 5 || 45, 100)}%` }}
                    />
                </div>
            </div>
        </div>
    );
};
