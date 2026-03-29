import React from 'react';
import { cn } from '../../lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className, ...props }) => {
  return (
    <div className="space-y-1.5 w-full">
      {label && <label className="text-sm font-medium text-slate-400 ml-1">{label}</label>}
      <input
        className={cn(
          "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500",
          "focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all",
          error && "border-red-500/50 focus:border-red-500 focus:ring-red-500/10",
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-400 ml-1">{error}</p>}
    </div>
  );
};
