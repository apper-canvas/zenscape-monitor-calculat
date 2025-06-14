import React, { useState } from 'react'
import { motion } from 'framer-motion'
import ApperIcon from '@/components/ApperIcon'

const Input = ({
  type = 'text',
  label,
  placeholder,
  value,
  onChange,
  error,
  icon,
  disabled = false,
  required = false,
  className = '',
  ...props
}) => {
  const [focused, setFocused] = useState(false)

  const inputClasses = `
    w-full px-3 py-2 border rounded-lg transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-sage-400 focus:border-transparent
    disabled:bg-sage-50 disabled:cursor-not-allowed
    ${error 
      ? 'border-error focus:ring-error' 
      : 'border-sage-200 hover:border-sage-300'
    }
    ${icon ? 'pl-10' : ''}
    ${className}
  `

  const hasValue = value && value.length > 0

  return (
    <div className="relative">
      {label && (
        <motion.label
          className={`absolute left-3 transition-all duration-200 pointer-events-none ${
            focused || hasValue
              ? 'top-1 text-xs text-sage-600 bg-background px-1 -translate-y-1/2'
              : 'top-1/2 text-sm text-sage-400 -translate-y-1/2'
          }`}
          animate={{
            fontSize: focused || hasValue ? '0.75rem' : '0.875rem',
            top: focused || hasValue ? '0px' : '50%',
            color: focused ? '#8B956D' : error ? '#B67162' : '#9CA3AF'
          }}
        >
          {label} {required && <span className="text-error">*</span>}
        </motion.label>
      )}
      
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <ApperIcon name={icon} className="w-4 h-4 text-sage-400" />
          </div>
        )}
        
        <input
          type={type}
          placeholder={focused ? placeholder : ''}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          disabled={disabled}
          required={required}
          className={inputClasses}
          {...props}
        />
      </div>
      
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1 text-xs text-error flex items-center"
        >
          <ApperIcon name="AlertCircle" className="w-3 h-3 mr-1" />
          {error}
        </motion.p>
      )}
    </div>
  )
}

export default Input