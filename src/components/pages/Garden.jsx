import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import GardenCanvas from '@/components/organisms/GardenCanvas'
import ElementPalette from '@/components/molecules/ElementPalette'
import SoundPlayer from '@/components/molecules/SoundPlayer'
import Button from '@/components/atoms/Button'
import Card from '@/components/atoms/Card'
import Loading from '@/components/atoms/Loading'
import ApperIcon from '@/components/ApperIcon'
import { gardenService } from '@/services'

const Garden = () => {
  const [gardens, setGardens] = useState([])
  const [currentGarden, setCurrentGarden] = useState(null)
  const [elements, setElements] = useState([])
  const [availableElements, setAvailableElements] = useState([])
  const [selectedElement, setSelectedElement] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const [gardenName, setGardenName] = useState('')

  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    setLoading(true)
    try {
      const [gardenData, elementData] = await Promise.all([
        gardenService.getAll(),
        gardenService.getElements()
      ])
      
      setGardens(gardenData)
      setAvailableElements(elementData)
      
      // Load the first garden or create empty one
      if (gardenData.length > 0) {
        const firstGarden = gardenData[0]
        setCurrentGarden(firstGarden)
        setElements(firstGarden.elements || [])
        setGardenName(firstGarden.name)
      } else {
        // Start with empty garden
        setElements([])
        setGardenName('My Zen Garden')
      }
    } catch (error) {
      console.error('Failed to load garden data:', error)
      toast.error('Failed to load garden data')
    } finally {
      setLoading(false)
    }
  }

  const handleElementSelect = (element) => {
    if (!element) return

    // Add element to canvas at a random position
    const newElement = {
      ...element,
      position: {
        x: Math.random() * 300 + 100,
        y: Math.random() * 200 + 100
      },
      rotation: 0,
      scale: 1.0
    }

    setElements(prev => [...prev, newElement])
    toast.success(`Added ${element.name} to your garden`)
  }

  const handleElementsChange = (newElements) => {
    setElements(newElements)
  }

  const handleSaveGarden = async () => {
    if (!gardenName.trim()) {
      toast.error('Please enter a garden name')
      return
    }

    setSaving(true)
    try {
      const gardenData = {
        name: gardenName.trim(),
        description: `A peaceful garden with ${elements.length} elements`,
        elements: elements,
        thumbnail: elements.length > 0 ? getGardenThumbnail() : '🌱',
        isTemplate: false
      }

      let savedGarden
      if (currentGarden?.id && !currentGarden.isTemplate) {
        // Update existing garden
        savedGarden = await gardenService.update(currentGarden.id, gardenData)
        setGardens(prev => prev.map(g => g.id === currentGarden.id ? savedGarden : g))
        toast.success('Garden updated successfully!')
      } else {
        // Create new garden
        savedGarden = await gardenService.create(gardenData)
        setGardens(prev => [savedGarden, ...prev])
        toast.success('Garden saved successfully!')
      }

      setCurrentGarden(savedGarden)
      setShowSaveModal(false)
    } catch (error) {
      console.error('Failed to save garden:', error)
      toast.error('Failed to save garden')
    } finally {
      setSaving(false)
    }
  }

  const handleLoadGarden = async (garden) => {
    try {
      const fullGarden = await gardenService.getById(garden.id)
      setCurrentGarden(fullGarden)
      setElements(fullGarden.elements || [])
      setGardenName(fullGarden.name)
      setShowTemplates(false)
      toast.success(`Loaded ${fullGarden.name}`)
    } catch (error) {
      console.error('Failed to load garden:', error)
      toast.error('Failed to load garden')
    }
  }

  const handleNewGarden = () => {
    setCurrentGarden(null)
    setElements([])
    setGardenName('My New Garden')
    setSelectedElement(null)
    toast.info('Started a new garden')
  }

  const getGardenThumbnail = () => {
    const elementTypes = elements.map(el => el.type)
    if (elementTypes.includes('water')) return '🌊'
    if (elementTypes.includes('plant')) return '🌸'
    if (elementTypes.includes('rock')) return '🪨'
    return '🌱'
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loading variant="zen" text="Loading your zen garden..." />
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col lg:flex-row overflow-hidden bg-background">
      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col p-4 lg:p-6 min-h-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-display text-moss-800">
              {gardenName}
            </h1>
            {currentGarden?.isTemplate && (
              <span className="px-2 py-1 bg-accent text-moss-800 text-xs rounded-full font-medium">
                Template
              </span>
            )}
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              icon="Plus"
              onClick={handleNewGarden}
            >
              New
            </Button>
            <Button
              variant="ghost"
              icon="FolderOpen"
              onClick={() => setShowTemplates(true)}
            >
              Load
            </Button>
            <Button
              variant="accent"
              icon="Save"
              onClick={() => setShowSaveModal(true)}
              disabled={elements.length === 0}
            >
              Save
            </Button>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 min-h-0">
          <GardenCanvas
            elements={elements}
            onElementsChange={handleElementsChange}
            selectedElement={selectedElement}
            onElementSelect={setSelectedElement}
            className="h-full"
          />
        </div>

        {/* Garden Stats */}
        <div className="flex items-center justify-between mt-4 text-sm text-sage-600">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <ApperIcon name="Flower2" className="w-4 h-4 mr-1" />
              <span>{elements.length} elements</span>
            </div>
            <div className="flex items-center">
              <ApperIcon name="Palette" className="w-4 h-4 mr-1" />
              <span>{new Set(elements.map(e => e.type)).size} types</span>
            </div>
          </div>
          
          <div className="text-xs text-sage-500">
            {currentGarden?.updatedAt ? 
              `Last saved: ${new Date(currentGarden.updatedAt).toLocaleDateString()}` :
              'Unsaved changes'
            }
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="w-full lg:w-80 flex flex-col p-4 lg:p-6 space-y-4 bg-surface lg:bg-transparent border-t lg:border-t-0 lg:border-l border-sage-200">
        {/* Element Palette */}
        <div className="flex-1 min-h-0">
          <ElementPalette
            elements={availableElements}
            onElementSelect={handleElementSelect}
            selectedCategory="Rocks"
          />
        </div>

        {/* Sound Player */}
        <div className="flex-shrink-0">
          <SoundPlayer />
        </div>
      </div>

      {/* Save Modal */}
      <AnimatePresence>
        {showSaveModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Card className="w-full max-w-md">
                <div className="p-6">
                  <h3 className="text-lg font-display text-moss-800 mb-4">
                    Save Your Garden
                  </h3>
                  
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={gardenName}
                      onChange={(e) => setGardenName(e.target.value)}
                      placeholder="Enter garden name..."
                      className="w-full px-3 py-2 border border-sage-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-400"
                    />
                    
                    <div className="text-sm text-sage-600">
                      <p>This garden contains {elements.length} elements including:</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {[...new Set(elements.map(e => e.name))].slice(0, 5).map(name => (
                          <span key={name} className="px-2 py-1 bg-sage-100 rounded-full text-xs">
                            {name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-3 mt-6">
                    <Button
                      variant="ghost"
                      onClick={() => setShowSaveModal(false)}
                      disabled={saving}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      onClick={handleSaveGarden}
                      loading={saving}
                      className="flex-1"
                    >
                      Save Garden
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Templates Modal */}
      <AnimatePresence>
        {showTemplates && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl max-h-[80vh] overflow-hidden"
            >
              <Card>
                <div className="p-6 border-b border-sage-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-display text-moss-800">
                      Garden Templates & Saved Gardens
                    </h3>
                    <Button
                      variant="ghost"
                      icon="X"
                      onClick={() => setShowTemplates(false)}
                    />
                  </div>
                </div>
                
                <div className="p-6 overflow-y-auto zen-scroll max-h-96">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {gardens.map((garden) => (
                      <Card
                        key={garden.id}
                        variant="flat"
                        hover
                        onClick={() => handleLoadGarden(garden)}
                        className="cursor-pointer group"
                      >
                        <div className="flex items-center space-x-3 p-4">
                          <div className="text-2xl group-hover:scale-110 transition-transform">
                            {garden.thumbnail}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-moss-800 truncate">
                              {garden.name}
                            </h4>
                            <p className="text-xs text-sage-600 truncate">
                              {garden.elements?.length || 0} elements
                            </p>
                            <p className="text-xs text-sage-500 mt-1">
                              {garden.isTemplate ? 'Template' : 'Your garden'}
                            </p>
                          </div>
                          <ApperIcon name="ChevronRight" className="w-4 h-4 text-sage-400 group-hover:text-moss-600" />
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Garden