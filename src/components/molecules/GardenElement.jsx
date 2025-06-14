import React from 'react'
import { motion } from 'framer-motion'

const GardenElement = ({
  element,
  onDragEnd,
  onSelect,
  selected = false,
  isDragging = false,
  ...props
}) => {
  const { type, subtype, position, rotation = 0, scale = 1 } = element

  const getElementIcon = () => {
    const elementMap = {
      'meditation-stone': '⬜',
      'large-boulder': '🪨',
      'river-stone': '🥌',
      'zen-stone': '⚪',
      'bamboo': '🎋',
      'cherry-blossom': '🌸',
      'lotus': '🪷',
      'moss': '🟢',
      'fern': '🌿',
      'night-jasmine': '🌼',
      'single-bamboo': '🪴',
      'small-pond': '🫧',
      'stream': '〰️',
      'fountain': '⛲',
      'reflection-pool': '💧'
    }
    return elementMap[subtype] || '⚫'
  }

  const getElementSize = () => {
    const sizeMap = {
      small: 'text-2xl',
      medium: 'text-3xl',
      large: 'text-4xl',
      tall: 'text-4xl',
      ground: 'text-3xl',
      long: 'text-2xl'
    }
    
    // Default sizing based on type
    if (type === 'water') return sizeMap.medium
    if (type === 'rock') return sizeMap.medium
    if (type === 'plant') return sizeMap.large
    
    return sizeMap.medium
  }

  return (
    <motion.div
      drag
      dragMomentum={false}
      onDragEnd={(event, info) => {
        const rect = event.target.closest('.zen-canvas').getBoundingClientRect()
        const newPosition = {
          x: Math.max(0, Math.min(rect.width - 50, position.x + info.offset.x)),
          y: Math.max(0, Math.min(rect.height - 50, position.y + info.offset.y))
        }
        onDragEnd?.(element, newPosition)
      }}
      onClick={() => onSelect?.(element)}
      className={`
        absolute garden-element cursor-grab active:cursor-grabbing select-none
        ${selected ? 'ring-2 ring-accent ring-offset-2' : ''}
        ${isDragging ? 'z-10' : 'z-0'}
      `}
      style={{
        left: position.x,
        top: position.y,
        transform: `rotate(${rotation}deg) scale(${scale})`,
        transformOrigin: 'center'
      }}
      whileHover={{ scale: scale * 1.1 }}
      whileDrag={{ scale: scale * 1.2, zIndex: 50 }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: scale }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      {...props}
    >
      <div className={`${getElementSize()} filter drop-shadow-sm hover:drop-shadow-md transition-all duration-200`}>
        {getElementIcon()}
      </div>
      
      {/* Selection indicator */}
      {selected && (
        <motion.div
          className="absolute -inset-2 border-2 border-accent rounded-full opacity-50"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      )}
    </motion.div>
  )
}

export default GardenElement