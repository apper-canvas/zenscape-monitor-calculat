import React from 'react'
import { motion } from 'framer-motion'

const Loading = ({ 
  size = 'medium', 
  variant = 'spinner',
  text,
  className = '' 
}) => {
  const sizes = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8', 
    large: 'w-12 h-12'
  }

  if (variant === 'skeleton') {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="bg-sage-200 rounded h-4 mb-2"></div>
        <div className="bg-sage-200 rounded h-4 w-3/4"></div>
      </div>
    )
  }

  if (variant === 'zen') {
    return (
      <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
        <motion.div
          className="relative"
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        >
          <div className="w-16 h-16 border-2 border-sage-200 rounded-full"></div>
          <motion.div
            className="absolute top-1 left-1 w-2 h-2 bg-accent rounded-full"
            animate={{ 
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>
        {text && (
          <p className="mt-4 text-sage-600 text-sm font-medium">{text}</p>
        )}
      </div>
    )
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <motion.div
        className={`border-2 border-sage-200 border-t-sage-600 rounded-full ${sizes[size]}`}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
      {text && (
        <span className="ml-3 text-sage-600 text-sm">{text}</span>
      )}
    </div>
  )
}

export default Loading