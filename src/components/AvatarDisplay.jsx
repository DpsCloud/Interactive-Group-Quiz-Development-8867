import React from 'react';
import { motion } from 'framer-motion';

function AvatarDisplay({ avatar, size = 'md', showName = false, className = '' }) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-lg',
    md: 'w-12 h-12 text-2xl',
    lg: 'w-16 h-16 text-3xl',
    xl: 'w-20 h-20 text-4xl'
  };

  if (!avatar) return null;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        className={`${sizeClasses[size]} bg-gradient-to-r ${avatar.color} rounded-full flex items-center justify-center shadow-lg`}
      >
        <span className="text-white font-bold">
          {avatar.emoji}
        </span>
      </motion.div>
      
      {showName && (
        <div>
          <div className="font-semibold text-gray-800">{avatar.name}</div>
          <div className="text-xs text-gray-500">{avatar.description}</div>
        </div>
      )}
    </div>
  );
}

export default AvatarDisplay;