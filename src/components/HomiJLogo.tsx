import React from 'react';
import { motion } from 'motion/react';

interface HomiJLogoProps {
  className?: string;
  theme?: 'dark' | 'light';
  showText?: boolean;
  title?: string;
  subText?: string;
  variant?: 'bottle' | 'text' | 'hg';
}

export const HomiJLogo = ({ 
  className = "", 
  theme = 'dark', 
  showText = false,
  title = "Homi.J",
  subText = "Group",
  variant = 'bottle'
}: HomiJLogoProps) => {
  return (
    <div className={`flex items-center gap-3 group cursor-pointer ${className}`}>
      <div className="relative w-10 h-10 md:w-12 md:h-12 flex items-center justify-center">
        {/* Background Glow */}
        <motion.div 
          className={`absolute inset-0 rounded-xl blur-md transition-colors duration-500 ${
            theme === 'dark' ? 'bg-orange-500/20 group-hover:bg-green-500/30' : 'bg-orange-500/10 group-hover:bg-green-500/20'
          }`}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        
        {/* Gradient Box */}
        <div className={`relative z-10 w-full h-full bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:from-orange-400 group-hover:to-orange-500 transition-all duration-500 overflow-hidden ${variant === 'hg' ? 'from-electric-blue to-blue-600 shadow-electric-blue/20 group-hover:from-blue-400 group-hover:to-electric-blue' : ''}`}>
          {variant === 'bottle' ? (
            /* Milk Bottle Icon */
            <motion.div
              animate={{ 
                y: [0, -3, 0],
                scale: [1, 1.05, 1]
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="flex flex-col items-center justify-center"
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Bottle Body */}
                <path d="M9 5C9 4.44772 9.44772 4 10 4H14C14.5523 4 15 4.44772 15 5V7H9V5Z" fill="white"/>
                <path d="M7 8C7 7.44772 7.44772 7 8 7H16C16.5523 7 17 7.44772 17 8V18C17 19.6569 15.6569 21 14 21H10C8.34315 21 7 19.6569 7 18V8Z" fill="white" fillOpacity="0.95"/>
                {/* Cap */}
                <rect x="10" y="2" width="4" height="2" rx="1" fill="#f97316" />
                {/* Liquid Level Animation */}
                <motion.rect 
                  x="8" 
                  y="12" 
                  width="8" 
                  height="8" 
                  fill="#f97316" 
                  fillOpacity="0.1"
                  animate={{ height: [6, 8, 6], y: [14, 12, 14] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
                {/* Milk Drop Detail */}
                <circle cx="12" cy="13" r="1.5" fill="#f97316" />
              </svg>
            </motion.div>
          ) : (
            /* HJ / HG Text Variant */
            <motion.span 
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-white font-black text-xl md:text-2xl tracking-tighter"
            >
              {variant === 'hg' ? 'HG' : 'HJ'}
            </motion.span>
          )}
          
          {/* Shine Effect */}
          <motion.div 
            className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 skew-x-12"
          />
        </div>
      </div>
      
      {showText && (
        <div className="flex flex-col -space-y-1 text-left">
          <span className={`text-2xl md:text-3xl font-display font-bold tracking-tighter transition-colors duration-300 ${
            theme === 'dark' ? 'text-orange-500 group-hover:text-green-500' : 'text-orange-600 group-hover:text-green-600'
          }`}>
            {title}<span className={`ml-0.5 transition-colors duration-300 ${theme === 'dark' ? 'text-white group-hover:text-orange-500' : 'text-gray-900 group-hover:text-orange-600'}`}>{subText}</span>
          </span>
          <span className={`text-[11px] font-bold uppercase tracking-[0.3em] transition-colors duration-300 ${theme === 'dark' ? 'text-gray-500 group-hover:text-gray-300' : 'text-gray-400 group-hover:text-gray-600'}`}>
            Engineering Excellence
          </span>
        </div>
      )}
    </div>
  );
};
