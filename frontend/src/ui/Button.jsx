import React from 'react';

export const Button = ({ children, onClick, variant = 'solid', className = '', icon: Icon }) => {
    const baseStyles = "inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-full transition-all duration-300";
    
    const variants = {
        solid: "bg-app-accent3 text-white hover:bg-app-accent3/80 shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:shadow-[0_0_20px_rgba(59,130,246,0.5)]",
        outline: "border border-app-border text-white hover:bg-white/5",
        ghost: "text-app-textMuted hover:text-white hover:bg-app-card"
    };

    return (
        <button 
            onClick={onClick}
            className={`${baseStyles} ${variants[variant]} ${className}`}
        >
            {Icon && <Icon className="w-4 h-4" />}
            {children}
        </button>
    );
};
