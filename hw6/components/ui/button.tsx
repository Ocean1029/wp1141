import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export function Button({ 
  children, 
  variant = "primary", 
  size = "md", 
  isLoading, 
  className = "", 
  disabled, 
  ...props 
}: ButtonProps) {
  
  const baseStyles = "rounded-lg font-bold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center justify-center gap-2";
  
  const variants = {
    primary: "bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-900/20",
    secondary: "bg-slate-700 hover:bg-slate-600 text-slate-200",
    outline: "border-2 border-amber-600/50 text-amber-500 hover:bg-amber-600/10",
    ghost: "bg-transparent text-slate-400 hover:text-white",
    danger: "bg-red-600 hover:bg-red-500 text-white",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3.5 text-base w-full",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} 
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      )}
      {children}
    </button>
  );
}

