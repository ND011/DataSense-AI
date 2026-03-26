import React from 'react';

/**
 * Functional Tab Component
 * Modes: "weather" (icon + text, rounded pill) or "stock" (small text, circular/rounded square)
 */
export const Tabs = ({ options, activeTab, onChange, mode = 'weather' }) => {
    return (
        <div className="flex flex-wrap items-center gap-2">
            {options.map((option) => {
                const isActive = activeTab === option.id;
                
                if (mode === 'weather') {
                    const Icon = option.icon;
                    return (
                        <button
                            key={option.id}
                            onClick={() => onChange(option.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                                isActive 
                                    ? 'bg-app-accent text-slate-900 shadow-[0_0_15px_rgba(251,191,36,0.5)]' 
                                    : 'text-app-textMuted hover:text-white hover:bg-white/5'
                            }`}
                        >
                            {Icon && <Icon className="w-4 h-4" />}
                            {option.label}
                        </button>
                    );
                }

                // Default "stock" mode
                return (
                    <button
                        key={option.id}
                        onClick={() => onChange(option.id)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${
                            isActive
                                ? 'bg-app-accent3 text-white'
                                : 'text-app-textMuted hover:text-white hover:bg-white/5'
                        }`}
                    >
                        {option.label}
                    </button>
                );
            })}
        </div>
    );
};
