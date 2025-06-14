import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import GardenElement from '@/components/molecules/GardenElement'
import Button from '@/components/atoms/Button'
import ApperIcon from '@/components/ApperIcon'

const GardenCanvas = ({
  elements = [],
  onElementsChange,
  onAddElement,
  selectedElement,
  onElementSelect,
  canvasSize = { width: 800, height: 600 },
  className = ''
}) => {
  const canvasRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [ripples, setRipples] = useState([])
  const [showGrid, setShowGrid] = useState(false)

  const handleElementDragEnd = (element, newPosition) => {
    const updatedElements = elements.map(el =>
      el === element ? { ...el, position: newPosition } : el
    )
    onElementsChange(updatedElements)
    setIsDragging(false)

    // Create ripple effect for water elements
    if (element.type === 'water') {
      createRipple(newPosition.x + 25, newPosition.y + 25)
    }
  }

  const createRipple = (x, y) => {
    const ripple = {
      id: Date.now(),
      x,
      y
    }
    setRipples(prev => [...prev, ripple])
    
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== ripple.id))
    }, 600)
  }

  const handleCanvasClick = (event) => {
    if (event.target === canvasRef.current) {
      onElementSelect?.(null)
    }
  }

  const handleElementDoubleClick = (element) => {
    // Rotate element on double click
    const updatedElements = elements.map(el =>
      el === element 
        ? { ...el, rotation: (el.rotation || 0) + 45 }
        : el
    )
    onElementsChange(updatedElements)
  }

  const clearCanvas = () => {
    if (window.confirm('Are you sure you want to clear all elements?')) {
      onElementsChange([])
      onElementSelect?.(null)
    }
  }

  return (
    <div className={`relative bg-background rounded-lg border-2 border-sage-200 overflow-hidden ${className}`}>
      {/* Canvas Controls */}
      <div className="absolute top-4 right-4 z-20 flex space-x-2">
        <Button
          variant="ghost"
          size="small"
          icon={showGrid ? "GridOff" : "Grid3X3"}
          onClick={() => setShowGrid(!showGrid)}
          className="bg-surface/80 backdrop-blur-sm"
        />
        <Button
          variant="ghost"
          size="small"
          icon="RotateCcw"
          onClick={clearCanvas}
          className="bg-surface/80 backdrop-blur-sm"
        />
      </div>

      {/* Canvas Info */}
      <div className="absolute top-4 left-4 z-20 bg-surface/80 backdrop-blur-sm rounded-lg px-3 py-2">
        <div className="flex items-center space-x-2 text-sm text-sage-600">
          <ApperIcon name="Flower2" className="w-4 h-4" />
          <span>{elements.length} elements</span>
        </div>
      </div>

      {/* Main Canvas */}
      <div
        ref={canvasRef}
        onClick={handleCanvasClick}
        className={`
          relative w-full h-full min-h-[400px] md:min-h-[500px] zen-canvas cursor-crosshair
          ${showGrid ? 'opacity-100' : 'opacity-90'}
        `}
        style={{
          backgroundSize: showGrid ? '20px 20px' : '40px 40px',
          backgroundImage: showGrid 
            ? 'radial-gradient(circle at 1px 1px, rgba(139, 149, 109, 0.3) 1px, transparent 0)'
            : 'radial-gradient(circle at 1px 1px, rgba(139, 149, 109, 0.1) 1px, transparent 0)'
        }}
      >
        {/* Garden Elements */}
        <AnimatePresence>
          {elements.map((element, index) => (
            <GardenElement
              key={`${element.type}-${element.subtype}-${index}`}
              element={element}
              onDragEnd={handleElementDragEnd}
              onSelect={onElementSelect}
              selected={selectedElement === element}
              isDragging={isDragging}
              onDoubleClick={() => handleElementDoubleClick(element)}
              onDragStart={() => setIsDragging(true)}
            />
          ))}
        </AnimatePresence>

        {/* Ripple Effects */}
        <AnimatePresence>
          {ripples.map(ripple => (
            <motion.div
              key={ripple.id}
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 4, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="absolute pointer-events-none border-2 border-sage-400 rounded-full ripple"
              style={{
                left: ripple.x - 10,
                top: ripple.y - 10,
                width: 20,
                height: 20
              }}
            />
          ))}
        </AnimatePresence>

        {/* Empty State */}
        {elements.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="text-center p-8">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="text-6xl mb-4 opacity-50"
              >
                🌱
              </motion.div>
              <h3 className="text-xl font-display text-moss-800 mb-2">
                Create Your Zen Garden
              </h3>
              <p className="text-sage-600 max-w-md">
                Drag elements from the palette to create your peaceful sanctuary. 
                Double-click to rotate, drag to reposition.
              </p>
            </div>
          </motion.div>
        )}

        {/* Selection Hint */}
        {selectedElement && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-surface/90 backdrop-blur-sm rounded-lg px-4 py-2 text-sm text-sage-600 z-20">
            <div className="flex items-center space-x-2">
              <ApperIcon name="Info" className="w-4 h-4" />
              <span>Double-click to rotate • Drag to move</span>
            </div>
          </div>
        )}
      </div>

      {/* Floating particles for ambiance */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-sage-300 rounded-full opacity-30"
            style={{
              left: `${20 + i * 30}%`,
              top: `${10 + i * 20}%`
            }}
            animate={{
              y: [0, -20, 0],
              x: [0, 10, 0],
              opacity: [0.3, 0.1, 0.3]
            }}
            transition={{
              duration: 8 + i * 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 2
            }}
          />
        ))}
      </div>
    </div>
  )
}

export default GardenCanvas