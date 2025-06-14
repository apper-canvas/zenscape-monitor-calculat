import React from 'react'
import { motion } from 'framer-motion'
import ApperIcon from '@/components/ApperIcon'

const Button = ({
  children,
  variant = 'primary',
  size = 'medium',
  icon,
  iconPosition = 'left',
  disabled = false,
  loading = false,
  onClick,
  className = '',
  ...props
}) => {
  const baseClasses = 'font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variants = {
    primary: 'bg-moss-800 text-surface hover:bg-moss-700 focus:ring-moss-500 shadow-sm hover:shadow-md',
    secondary: 'bg-sage-100 text-sage-700 hover:bg-sage-200 focus:ring-sage-500 border border-sage-200',
    accent: 'bg-accent text-moss-800 hover:bg-sand-600 focus:ring-accent shadow-sm hover:shadow-md',
    ghost: 'text-sage-600 hover:text-moss-700 hover:bg-sage-50 focus:ring-sage-400',
    danger: 'bg-error text-surface hover:bg-red-700 focus:ring-error shadow-sm'
  }
  
  const sizes = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2 text-sm',
    large: 'px-6 py-3 text-base'
  }

  const buttonClasses = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`

  const buttonContent = (
    <>
      {loading && (
        <ApperIcon 
          name="Loader2" 
          className={`animate-spin ${size === 'small' ? 'w-3 h-3' : 'w-4 h-4'} ${children ? 'mr-2' : ''}`} 
        />
      )}
      {!loading && icon && iconPosition === 'left' && (
        <ApperIcon 
          name={icon} 
          className={`${size === 'small' ? 'w-3 h-3' : 'w-4 h-4'} ${children ? 'mr-2' : ''}`} 
        />
      )}
      {children}
      {!loading && icon && iconPosition === 'right' && (
        <ApperIcon 
          name={icon} 
          className={`${size === 'small' ? 'w-3 h-3' : 'w-4 h-4'} ${children ? 'ml-2' : ''}`} 
        />
      )}
    </>
  )

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      className={buttonClasses}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {buttonContent}
    </motion.button>
  )
}

export default Button