import React from 'react';
import { Check } from 'lucide-react';

export const Checkbox = ({ id, checked, onChange, label, color = 'bg-app-accent3' }) => {
    return (
        <label htmlFor={id} className="flex items-center gap-3 cursor-pointer group">
            <div className="relative flex items-center justify-center">
                <input
                    type="checkbox"
                    id={id}
                    checked={checked}
                    onChange={(e) => onChange(e.target.checked)}
                    className="sr-only"
                />
                <div className={`w-5 h-5 rounded flex items-center justify-center transition-all duration-300 border ${
                    checked 
                        ? `${color} border-transparent` 
                        : 'border-app-border bg-transparent group-hover:border-white/30'
                }`}>
                    <Check className={`w-3 h-3 text-white transition-opacity duration-300 ${checked ? 'opacity-100' : 'opacity-0'}`} />
                </div>
            </div>
            {label && (
                <div className="flex items-center gap-2">
                    {/* Optional dash line mimicking the weather chart legend */}
                    <span className="text-white/40 text-xs font-black tracking-widest">—</span>
                    <span className="text-sm font-medium text-app-textMuted group-hover:text-white transition-colors">{label}</span>
                </div>
            )}
        </label>
    );
};
