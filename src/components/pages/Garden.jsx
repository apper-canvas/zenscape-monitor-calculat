import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "react-toastify";
import GardenCanvas from "@/components/organisms/GardenCanvas";
import ElementPalette from "@/components/molecules/ElementPalette";
import SoundPlayer from "@/components/molecules/SoundPlayer";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import Loading from "@/components/atoms/Loading";
import ApperIcon from "@/components/ApperIcon";
import { gardenService } from "@/services";

const Garden = () => {
  const [gardens, setGardens] = useState([])
  const [currentGarden, setCurrentGarden] = useState(null)
  const [elements, setElements] = useState([])
  const [availableElements, setAvailableElements] = useState([])
  const [selectedElement, setSelectedElement] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [showGallery, setShowGallery] = useState(false)
  const [gardenName, setGardenName] = useState('')
  
  // Gallery state
  const [galleryLoading, setGalleryLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('updatedAt')
  const [sortDirection, setSortDirection] = useState('desc')
  const [filteredGardens, setFilteredGardens] = useState([])
  const [viewMode, setViewMode] = useState('grid')
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
      setShowGallery(false)
      toast.success(`Loaded ${fullGarden.name}`)
    } catch (error) {
      console.error('Failed to load garden:', error)
      toast.error('Failed to load garden')
    }
  }

  const handleDuplicateGarden = async (garden) => {
    try {
      const duplicated = await gardenService.duplicate(garden.id)
      setGardens(prev => [duplicated, ...prev])
      await loadGalleryGardens()
      toast.success(`Duplicated ${garden.name}`)
    } catch (error) {
      console.error('Failed to duplicate garden:', error)
      toast.error('Failed to duplicate garden')
    }
  }

  const handleDeleteGarden = async (garden) => {
    if (!confirm(`Are you sure you want to delete "${garden.name}"?`)) return
    
    try {
      await gardenService.delete(garden.id)
      setGardens(prev => prev.filter(g => g.id !== garden.id))
      await loadGalleryGardens()
      toast.success(`Deleted ${garden.name}`)
    } catch (error) {
      console.error('Failed to delete garden:', error)
      toast.error('Failed to delete garden')
    }
  }

  const handleExportGarden = async (garden) => {
    try {
      const exportData = await gardenService.exportGarden(garden.id)
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${garden.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_garden.json`
      a.click()
      URL.revokeObjectURL(url)
      toast.success(`Exported ${garden.name}`)
    } catch (error) {
      console.error('Failed to export garden:', error)
      toast.error('Failed to export garden')
    }
  }

  const loadGalleryGardens = async () => {
    setGalleryLoading(true)
    try {
      let results = []
      
      if (searchQuery) {
        results = await gardenService.search(searchQuery)
      } else if (selectedCategory !== 'all') {
        results = await gardenService.getByCategory(selectedCategory)
      } else {
        results = await gardenService.getAll()
      }
      
      if (sortBy) {
        results = await gardenService.sortBy(sortBy, sortDirection)
        if (selectedCategory !== 'all') {
          results = results.filter(g => 
            selectedCategory === 'templates' ? g.isTemplate : !g.isTemplate
          )
        }
        if (searchQuery) {
          const query = searchQuery.toLowerCase()
          results = results.filter(g => 
            g.name.toLowerCase().includes(query) ||
            g.description.toLowerCase().includes(query)
          )
        }
      }
      
      setFilteredGardens(results)
    } catch (error) {
      console.error('Failed to load gallery gardens:', error)
      toast.error('Failed to load gallery')
    } finally {
      setGalleryLoading(false)
    }
  }

  // Load gallery data when gallery opens or filters change
  useEffect(() => {
    if (showGallery) {
      loadGalleryGardens()
    }
  }, [showGallery, searchQuery, selectedCategory, sortBy, sortDirection])

const handleNewGarden = () => {
    setCurrentGarden(null)
    setElements([])
    setGardenName('My New Garden')
    setSelectedElement(null)
    toast.info('Started a new garden')
  }

  const getGardenThumbnail = () => {
    const elementTypes = [...new Set(elements.map(e => e.type))]
    if (elementTypes.includes('rocks')) return '🪨'
    if (elementTypes.includes('plants')) return '🌿'
    if (elementTypes.includes('water')) return '💧'
    return '🌱'
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loading variant="zen" text="Loading your garden..." />
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
              icon="Images"
              onClick={() => setShowGallery(true)}
            >
              Gallery
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
{/* Garden Gallery Modal */}
      <AnimatePresence>
        {showGallery && (
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
              className="w-full max-w-6xl max-h-[90vh] overflow-hidden"
            >
              <Card>
                {/* Gallery Header */}
                <div className="p-6 border-b border-sage-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-display text-moss-800">
                      Garden Gallery
                    </h3>
                    <Button
                      variant="ghost"
                      icon="X"
                      onClick={() => setShowGallery(false)}
                    />
                  </div>
                  
                  {/* Gallery Controls */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Search & Filters */}
                    <div className="flex-1 flex gap-3">
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="Search gardens..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full px-3 py-2 border border-sage-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-400 text-sm"
                        />
                      </div>
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="px-3 py-2 border border-sage-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-400 text-sm"
                      >
                        <option value="all">All Gardens</option>
                        <option value="personal">My Gardens</option>
                        <option value="templates">Templates</option>
                      </select>
                      <select
                        value={`${sortBy}-${sortDirection}`}
                        onChange={(e) => {
                          const [field, dir] = e.target.value.split('-')
                          setSortBy(field)
                          setSortDirection(dir)
                        }}
                        className="px-3 py-2 border border-sage-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-400 text-sm"
                      >
                        <option value="updatedAt-desc">Recent First</option>
                        <option value="updatedAt-asc">Oldest First</option>
                        <option value="name-asc">Name A-Z</option>
                        <option value="name-desc">Name Z-A</option>
                        <option value="elementCount-desc">Most Elements</option>
                        <option value="elementCount-asc">Fewest Elements</option>
                      </select>
                    </div>
                    
                    {/* View Toggle */}
                    <div className="flex border border-sage-200 rounded-lg overflow-hidden">
                      <Button
                        variant={viewMode === 'grid' ? 'primary' : 'ghost'}
                        size="small"
                        icon="Grid3X3"
                        onClick={() => setViewMode('grid')}
                        className="rounded-none border-none"
                      />
                      <Button
                        variant={viewMode === 'list' ? 'primary' : 'ghost'}
                        size="small"
                        icon="List"
                        onClick={() => setViewMode('list')}
                        className="rounded-none border-none"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Gallery Content */}
                <div className="p-6 overflow-y-auto zen-scroll max-h-[60vh]">
                  {galleryLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loading variant="zen" text="Loading gallery..." />
                    </div>
                  ) : filteredGardens.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-4xl mb-4 opacity-50">🌱</div>
                      <h4 className="text-lg font-display text-moss-800 mb-2">
                        {searchQuery ? 'No gardens found' : 'No gardens yet'}
                      </h4>
                      <p className="text-sage-600">
                        {searchQuery 
                          ? 'Try adjusting your search or filters'
                          : 'Create your first garden to see it here'
                        }
                      </p>
                    </div>
                  ) : (
                    <div className={viewMode === 'grid' 
                      ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
                      : 'space-y-3'
                    }>
                      {filteredGardens.map((garden) => (
                        <Card
                          key={garden.id}
                          variant="flat"
                          hover
                          className="cursor-pointer group"
                        >
                          {viewMode === 'grid' ? (
                            <div className="p-4">
                              <div className="flex items-center justify-between mb-3">
                                <div className="text-3xl group-hover:scale-110 transition-transform">
                                  {garden.thumbnail}
                                </div>
                                <div className="flex space-x-1">
                                  {!garden.isTemplate && (
                                    <>
                                      <Button
                                        variant="ghost"
                                        size="small"
                                        icon="Copy"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          handleDuplicateGarden(garden)
                                        }}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                                      />
                                      <Button
                                        variant="ghost"
                                        size="small"
                                        icon="Download"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          handleExportGarden(garden)
                                        }}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                                      />
                                      <Button
                                        variant="ghost"
                                        size="small"
                                        icon="Trash2"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          handleDeleteGarden(garden)
                                        }}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity text-red-600"
                                      />
                                    </>
                                  )}
                                </div>
                              </div>
                              <div onClick={() => handleLoadGarden(garden)}>
                                <h4 className="font-medium text-moss-800 truncate mb-1">
                                  {garden.name}
                                </h4>
                                <p className="text-xs text-sage-600 line-clamp-2 mb-2">
                                  {garden.description}
                                </p>
                                <div className="flex items-center justify-between text-xs text-sage-500">
                                  <span>{garden.elements?.length || 0} elements</span>
                                  <span>{garden.isTemplate ? 'Template' : 'Personal'}</span>
                                </div>
                                <div className="text-xs text-sage-400 mt-1">
                                  {new Date(garden.updatedAt).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div 
                              className="flex items-center space-x-4 p-4"
                              onClick={() => handleLoadGarden(garden)}
                            >
                              <div className="text-2xl group-hover:scale-110 transition-transform">
                                {garden.thumbnail}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-moss-800 truncate">
                                  {garden.name}
                                </h4>
                                <p className="text-sm text-sage-600 truncate">
                                  {garden.description}
                                </p>
                                <div className="flex items-center space-x-4 text-xs text-sage-500 mt-1">
                                  <span>{garden.elements?.length || 0} elements</span>
                                  <span>{garden.isTemplate ? 'Template' : 'Personal'}</span>
                                  <span>{new Date(garden.updatedAt).toLocaleDateString()}</span>
                                </div>
                              </div>
                              <div className="flex space-x-1">
                                {!garden.isTemplate && (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="small"
                                      icon="Copy"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleDuplicateGarden(garden)
                                      }}
                                    />
                                    <Button
                                      variant="ghost"
                                      size="small"
                                      icon="Download"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleExportGarden(garden)
                                      }}
                                    />
                                    <Button
                                      variant="ghost"
                                      size="small"
                                      icon="Trash2"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleDeleteGarden(garden)
                                      }}
                                      className="text-red-600"
                                    />
                                  </>
                                )}
                                <ApperIcon name="ChevronRight" className="w-4 h-4 text-sage-400 group-hover:text-moss-600" />
                              </div>
                            </div>
                          )}
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Gallery Footer */}
                <div className="px-6 py-4 border-t border-sage-200 bg-sage-50">
                  <div className="flex items-center justify-between text-sm text-sage-600">
                    <div>
                      {filteredGardens.length} garden{filteredGardens.length !== 1 ? 's' : ''} 
                      {searchQuery && ` matching "${searchQuery}"`}
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-xs">
                        {selectedCategory === 'templates' ? 'Templates' :
                         selectedCategory === 'personal' ? 'Personal Gardens' : 'All Gardens'}
                      </span>
                    </div>
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