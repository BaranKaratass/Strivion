import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '../../lib/utils';

interface ButtonProps extends HTMLMotionProps<'button'> {
  variant?: 'primary' | 'secondary' | 'outline';
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ className, variant = 'primary', loading, children, ...props }) => {
  const variants = {
    primary: "bg-white text-black hover:bg-slate-200 shadow-white/5",
    secondary: "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/10",
    outline: "bg-transparent border border-white/10 text-white hover:bg-white/5",
  };

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      className={cn(
        "w-full py-3 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        className
      )}
      disabled={loading}
      {...props}
    >
      {loading ? (
        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : children}
    </motion.button>
  );
};
