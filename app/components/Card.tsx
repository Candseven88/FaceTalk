'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  className?: string;
  badge?: string;
  isPopular?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  hasHover?: boolean;
  hasGlow?: boolean;
  animated?: boolean;
  delay?: number;
}

export default function Card({
  title,
  subtitle,
  icon,
  className = '',
  badge,
  isPopular = false,
  children,
  onClick,
  hasHover = true,
  hasGlow = false,
  animated = true,
  delay = 0,
}: CardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        delay: delay * 0.1,
      }
    }
  };

  return (
    <motion.div
      initial={animated ? "hidden" : "visible"}
      animate="visible"
      variants={variants}
      className={`
        relative overflow-hidden bg-white rounded-2xl
        border border-gray-200 transition-all duration-300
        ${hasHover ? 'hover:shadow-card-hover hover:-translate-y-1' : ''}
        ${hasGlow && isHovered ? 'shadow-glow' : 'shadow-card'}
        ${isPopular ? 'ring-2 ring-facebook-blue/30' : ''}
        ${className}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Popular badge */}
      {isPopular && (
        <div className="absolute -top-1 -right-1 bg-facebook-blue text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-xl shadow-md transform rotate-0 z-10">
          Most Popular
        </div>
      )}
      
      {/* Badge */}
      {badge && !isPopular && (
        <div className="absolute top-2 right-2 bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
          {badge}
        </div>
      )}
      
      {/* Card content */}
      <div className="p-6">
        {/* Card header with icon and title */}
        {(title || icon) && (
          <div className="flex items-start mb-4">
            {icon && (
              <div className="mr-3 flex-shrink-0 text-facebook-blue">
                {icon}
              </div>
            )}
            <div>
              {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
              {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
            </div>
          </div>
        )}
        
        {/* Card body */}
        <div>{children}</div>
      </div>
      
      {/* Glow effect on hover */}
      {hasGlow && (
        <div 
          className={`absolute inset-0 bg-gradient-to-r from-blue-400/10 to-indigo-400/10 opacity-0 transition-opacity duration-500 rounded-2xl pointer-events-none ${
            isHovered ? 'opacity-100' : ''
          }`}
        />
      )}
    </motion.div>
  );
} 