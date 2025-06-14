import React from 'react'
import { motion } from 'framer-motion'

const Card = ({
  children,
  variant = 'default',
  padding = 'medium',
  hover = false,
  className = '',
  onClick,
  ...props
}) => {
  const baseClasses = 'bg-surface rounded-lg border border-sage-200 paper-texture transition-all duration-200'
  
  const variants = {
    default: 'shadow-sm',
    elevated: 'shadow-md',
    flat: 'shadow-none border-sage-100'
  }
  
  const paddings = {
    none: '',
    small: 'p-3',
    medium: 'p-4',
    large: 'p-6'
  }

  const hoverClasses = hover ? 'hover:shadow-md hover:scale-105 cursor-pointer' : ''
  const cardClasses = `${baseClasses} ${variants[variant]} ${paddings[padding]} ${hoverClasses} ${className}`

  const CardComponent = onClick || hover ? motion.div : 'div'
  const motionProps = onClick || hover ? {
    whileHover: { y: -2 },
    whileTap: onClick ? { scale: 0.98 } : {}
  } : {}

  return (
    <CardComponent
      className={cardClasses}
      onClick={onClick}
      {...motionProps}
      {...props}
    >
      {children}
    </CardComponent>
  )
}

export default Card