import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Card from '@/components/atoms/Card'
import Button from '@/components/atoms/Button'
import ApperIcon from '@/components/ApperIcon'

const ElementPalette = ({ elements, onElementSelect, selectedCategory }) => {
  const [activeCategory, setActiveCategory] = useState(selectedCategory || 'Rocks')
  
  const categories = [...new Set(elements.map(el => el.category))]
  const filteredElements = elements.filter(el => el.category === activeCategory)

  const categoryIcons = {
    'Rocks': 'Mountain',
    'Plants': 'Leaf',
    'Water': 'Waves'
  }

  return (
    <Card className="h-full flex flex-col">
      <div className="p-4 border-b border-sage-200">
        <h3 className="font-display text-lg text-moss-800 mb-3">Garden Elements</h3>
        
        {/* Category Tabs */}
        <div className="flex space-x-1 bg-sage-50 p-1 rounded-lg">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`flex-1 flex items-center justify-center px-3 py-2 rounded-md text-xs font-medium transition-all duration-200 ${
                activeCategory === category
                  ? 'bg-surface text-moss-800 shadow-sm'
                  : 'text-sage-600 hover:text-moss-700'
              }`}
            >
              <ApperIcon 
                name={categoryIcons[category]} 
                className="w-3 h-3 mr-1" 
              />
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Elements Grid */}
      <div className="flex-1 p-4 overflow-y-auto zen-scroll">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-2 gap-3"
          >
            {filteredElements.map((element, index) => (
              <motion.div
                key={element.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  variant="flat"
                  padding="small"
                  hover
                  onClick={() => onElementSelect(element)}
                  className="text-center group cursor-pointer"
                >
                  <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-200">
                    {element.icon}
                  </div>
                  <h4 className="text-xs font-medium text-moss-800 mb-1 line-clamp-2">
                    {element.name}
                  </h4>
                  <p className="text-xs text-sage-600 line-clamp-2">
                    {element.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {filteredElements.length === 0 && (
          <div className="text-center py-8">
            <div className="text-4xl mb-2 opacity-50">🌱</div>
            <p className="text-sage-500 text-sm">No elements in this category</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-t border-sage-200">
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="small"
            icon="RotateCcw"
            className="flex-1"
          >
            Reset
          </Button>
          <Button
            variant="ghost"
            size="small"
            icon="Save"
            className="flex-1"
          >
            Templates
          </Button>
        </div>
      </div>
    </Card>
  )
}

export default ElementPalette