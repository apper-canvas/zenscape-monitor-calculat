import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import JournalEntry from '@/components/molecules/JournalEntry'
import JournalEditor from '@/components/organisms/JournalEditor'
import Button from '@/components/atoms/Button'
import Card from '@/components/atoms/Card'
import Loading from '@/components/atoms/Loading'
import ApperIcon from '@/components/ApperIcon'
import { journalService } from '@/services'

const Journal = () => {
  const [entries, setEntries] = useState([])
  const [filteredEntries, setFilteredEntries] = useState([])
  const [currentEntry, setCurrentEntry] = useState(null)
  const [showEditor, setShowEditor] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [moodStats, setMoodStats] = useState({})
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMood, setSelectedMood] = useState('')
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'))

  const moods = [
    { value: 'peaceful', label: 'Peaceful', icon: 'Smile', color: 'text-success' },
    { value: 'reflective', label: 'Reflective', icon: 'Brain', color: 'text-info' },
    { value: 'inspired', label: 'Inspired', icon: 'Sparkles', color: 'text-warning' },
    { value: 'centered', label: 'Centered', icon: 'Target', color: 'text-moss-700' },
    { value: 'grateful', label: 'Grateful', icon: 'Heart', color: 'text-error' }
  ]

  useEffect(() => {
    loadJournalData()
  }, [])

  useEffect(() => {
    filterEntries()
  }, [entries, searchTerm, selectedMood, selectedMonth])

  const loadJournalData = async () => {
    setLoading(true)
    try {
      const [entriesData, statsData] = await Promise.all([
        journalService.getAll(),
        journalService.getMoodStats(30)
      ])

      setEntries(entriesData)
      setMoodStats(statsData)
    } catch (error) {
      console.error('Failed to load journal data:', error)
      toast.error('Failed to load journal entries')
    } finally {
      setLoading(false)
    }
  }

  const filterEntries = async () => {
    let filtered = [...entries]

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(entry =>
        entry.title?.toLowerCase().includes(term) ||
        entry.content?.toLowerCase().includes(term) ||
        entry.tags?.some(tag => tag.toLowerCase().includes(term))
      )
    }

    // Filter by mood
    if (selectedMood) {
      filtered = filtered.filter(entry => entry.mood === selectedMood)
    }

    // Filter by month
    if (selectedMonth) {
      const startDate = startOfMonth(new Date(selectedMonth + '-01'))
      const endDate = endOfMonth(startDate)
      
      try {
        const monthEntries = await journalService.getByDateRange(
          startDate.toISOString(),
          endDate.toISOString()
        )
        
        // Combine with other filters
        const monthEntryIds = new Set(monthEntries.map(e => e.id))
        filtered = filtered.filter(entry => monthEntryIds.has(entry.id))
      } catch (error) {
        console.error('Failed to filter by date:', error)
      }
    }

    setFilteredEntries(filtered)
  }

  const handleNewEntry = () => {
    setCurrentEntry(null)
    setIsEditing(false)
    setShowEditor(true)
  }

  const handleEditEntry = (entry) => {
    setCurrentEntry(entry)
    setIsEditing(true)
    setShowEditor(true)
  }

  const handleViewEntry = (entry) => {
    // For now, just edit the entry. Could be expanded to a read-only view
    handleEditEntry(entry)
  }

  const handleSaveEntry = async (entryData) => {
    try {
      let savedEntry
      
      if (isEditing && currentEntry) {
        savedEntry = await journalService.update(currentEntry.id, entryData)
        setEntries(prev => prev.map(e => e.id === currentEntry.id ? savedEntry : e))
        toast.success('Entry updated successfully!')
      } else {
        savedEntry = await journalService.create(entryData)
        setEntries(prev => [savedEntry, ...prev])
        toast.success('Entry saved successfully!')
      }

      setShowEditor(false)
      setCurrentEntry(null)
      
      // Refresh mood stats
      const newStats = await journalService.getMoodStats(30)
      setMoodStats(newStats)
    } catch (error) {
      console.error('Failed to save entry:', error)
      toast.error('Failed to save entry')
    }
  }

  const handleDeleteEntry = async (entry) => {
    if (!window.confirm('Are you sure you want to delete this entry?')) {
      return
    }

    try {
      await journalService.delete(entry.id)
      setEntries(prev => prev.filter(e => e.id !== entry.id))
      toast.success('Entry deleted successfully')
      
      // Refresh mood stats
      const newStats = await journalService.getMoodStats(30)
      setMoodStats(newStats)
    } catch (error) {
      console.error('Failed to delete entry:', error)
      toast.error('Failed to delete entry')
    }
  }

  const handleCancelEdit = () => {
    setShowEditor(false)
    setCurrentEntry(null)
    setIsEditing(false)
  }

  const getTotalWordsWritten = () => {
    return entries.reduce((total, entry) => {
      return total + (entry.content?.split(' ').length || 0)
    }, 0)
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loading variant="zen" text="Loading your journal..." />
      </div>
    )
  }

  if (showEditor) {
    return (
      <div className="h-full overflow-y-auto zen-scroll bg-background p-6">
        <JournalEditor
          entry={currentEntry}
          onSave={handleSaveEntry}
          onCancel={handleCancelEdit}
          isEditing={isEditing}
        />
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col overflow-hidden bg-background">
      {/* Header */}
      <div className="flex-shrink-0 p-6 bg-surface border-b border-sage-200">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div>
              <h1 className="text-3xl font-display text-moss-800 mb-2">
                Mindful Journal
              </h1>
              <p className="text-sage-600">
                Reflect on your thoughts and cultivate mindful awareness
              </p>
            </div>

            {/* Stats */}
            <div className="flex space-x-6">
              <div className="text-center">
                <div className="text-2xl font-display text-moss-800">
                  {entries.length}
                </div>
                <div className="text-xs text-sage-600">Entries</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-display text-moss-800">
                  {getTotalWordsWritten().toLocaleString()}
                </div>
                <div className="text-xs text-sage-600">Words</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-display text-moss-800">
                  {Object.keys(moodStats).length}
                </div>
                <div className="text-xs text-sage-600">Moods</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex-shrink-0 p-6 bg-surface border-b border-sage-200">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <ApperIcon name="Search" className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-sage-400" />
                <input
                  type="text"
                  placeholder="Search entries, tags, or content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-sage-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-400"
                />
              </div>
            </div>

            {/* Month Filter */}
            <div>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-3 py-2 border border-sage-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-400"
              />
            </div>

            {/* New Entry Button */}
            <Button
              variant="primary"
              icon="Plus"
              onClick={handleNewEntry}
            >
              New Entry
            </Button>
          </div>

          {/* Mood Filter */}
          <div className="mt-4">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedMood('')}
                className={`
                  px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200
                  ${!selectedMood
                    ? 'bg-moss-800 text-surface shadow-sm'
                    : 'bg-sage-100 text-sage-700 hover:bg-sage-200'
                  }
                `}
              >
                All Moods
              </button>
              {moods.map(mood => (
                <button
                  key={mood.value}
                  onClick={() => setSelectedMood(selectedMood === mood.value ? '' : mood.value)}
                  className={`
                    flex items-center space-x-1 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200
                    ${selectedMood === mood.value
                      ? 'bg-accent text-moss-800 shadow-sm'
                      : 'bg-sage-100 text-sage-700 hover:bg-sage-200'
                    }
                  `}
                >
                  <ApperIcon name={mood.icon} className={`w-3 h-3 ${selectedMood === mood.value ? mood.color : ''}`} />
                  <span>{mood.label}</span>
                  {moodStats[mood.value] && (
                    <span className="ml-1 px-1.5 py-0.5 bg-white/50 rounded-full text-xs">
                      {moodStats[mood.value]}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto zen-scroll">
        <div className="max-w-6xl mx-auto p-6">
          {filteredEntries.length === 0 ? (
            <Card className="text-center py-16">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md mx-auto"
              >
                <div className="text-6xl mb-6 opacity-50">📝</div>
                <h3 className="text-xl font-display text-moss-800 mb-2">
                  {entries.length === 0 ? 'Start Your Mindful Journey' : 'No entries match your filters'}
                </h3>
                <p className="text-sage-600 mb-6">
                  {entries.length === 0 
                    ? 'Begin documenting your thoughts and reflections with your first journal entry'
                    : 'Try adjusting your search or filters to find what you\'re looking for'
                  }
                </p>
                <div className="flex justify-center space-x-3">
                  {entries.length === 0 ? (
                    <Button
                      variant="primary"
                      icon="Plus"
                      onClick={handleNewEntry}
                    >
                      Write First Entry
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setSearchTerm('')
                          setSelectedMood('')
                          setSelectedMonth(format(new Date(), 'yyyy-MM'))
                        }}
                      >
                        Clear Filters
                      </Button>
                      <Button
                        variant="primary"
                        icon="Plus"
                        onClick={handleNewEntry}
                      >
                        New Entry
                      </Button>
                    </>
                  )}
                </div>
              </motion.div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredEntries.map((entry, index) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <JournalEntry
                    entry={entry}
                    onEdit={handleEditEntry}
                    onDelete={handleDeleteEntry}
                    onView={handleViewEntry}
                  />
                </motion.div>
              ))}
            </div>
          )}

          {/* Inspiration */}
          {filteredEntries.length > 0 && (
            <div className="mt-12">
              <Card variant="elevated" className="bg-gradient-to-br from-sage-50 to-moss-50">
                <div className="p-8 text-center">
                  <div className="text-4xl mb-4">🌱</div>
                  <h3 className="text-xl font-display text-moss-800 mb-2">
                    Daily Reflection
                  </h3>
                  <p className="text-sage-600 mb-6 max-w-md mx-auto">
                    "The quieter you become, the more able you are to hear." 
                    <br />
                    <span className="text-sm italic">- Rumi</span>
                  </p>
                  <Button
                    variant="accent"
                    icon="Plus"
                    onClick={handleNewEntry}
                  >
                    Reflect Today
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Journal