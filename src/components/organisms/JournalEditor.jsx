import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import Card from '@/components/atoms/Card'
import Button from '@/components/atoms/Button'
import Input from '@/components/atoms/Input'
import ApperIcon from '@/components/ApperIcon'

const JournalEditor = ({ entry, onSave, onCancel, isEditing = false }) => {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [mood, setMood] = useState('')
  const [tags, setTags] = useState([])
  const [tagInput, setTagInput] = useState('')
  const [saving, setSaving] = useState(false)

  const moods = [
    { value: 'peaceful', label: 'Peaceful', icon: 'Smile', color: 'text-success' },
    { value: 'reflective', label: 'Reflective', icon: 'Brain', color: 'text-info' },
    { value: 'inspired', label: 'Inspired', icon: 'Sparkles', color: 'text-warning' },
    { value: 'centered', label: 'Centered', icon: 'Target', color: 'text-moss-700' },
    { value: 'grateful', label: 'Grateful', icon: 'Heart', color: 'text-error' },
    { value: 'anxious', label: 'Anxious', icon: 'AlertCircle', color: 'text-orange-500' },
    { value: 'calm', label: 'Calm', icon: 'Waves', color: 'text-blue-500' },
    { value: 'energetic', label: 'Energetic', icon: 'Zap', color: 'text-yellow-500' }
  ]

  useEffect(() => {
    if (entry) {
      setTitle(entry.title || '')
      setContent(entry.content || '')
      setMood(entry.mood || '')
      setTags(entry.tags || [])
    }
  }, [entry])

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim().toLowerCase())) {
      setTags([...tags, tagInput.trim().toLowerCase()])
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleSave = async () => {
    if (!title.trim() && !content.trim()) return

    setSaving(true)
    try {
      const entryData = {
        title: title.trim() || 'Untitled Entry',
        content: content.trim(),
        mood,
        tags,
        date: entry?.date || new Date().toISOString()
      }

      await onSave(entryData)
    } catch (error) {
      console.error('Failed to save entry:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault()
      handleAddTag()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-sage-200">
          <div>
            <h2 className="text-xl font-display text-moss-800">
              {isEditing ? 'Edit Entry' : 'New Journal Entry'}
            </h2>
            <p className="text-sm text-sage-600 mt-1">
              {format(new Date(entry?.date || new Date()), 'EEEE, MMMM dd, yyyy')}
            </p>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              onClick={onCancel}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              loading={saving}
              disabled={!title.trim() && !content.trim()}
            >
              {isEditing ? 'Update' : 'Save'}
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Title */}
          <Input
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What's on your mind today?"
            className="text-lg font-display"
          />

          {/* Mood Selection */}
          <div>
            <label className="block text-sm font-medium text-moss-800 mb-3">
              How are you feeling?
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {moods.map((moodOption) => (
                <button
                  key={moodOption.value}
                  onClick={() => setMood(mood === moodOption.value ? '' : moodOption.value)}
                  className={`
                    flex items-center space-x-2 p-3 rounded-lg border-2 transition-all duration-200
                    ${mood === moodOption.value
                      ? 'border-moss-400 bg-moss-50 shadow-sm'
                      : 'border-sage-200 hover:border-sage-300 hover:bg-sage-50'
                    }
                  `}
                >
                  <ApperIcon 
                    name={moodOption.icon} 
                    className={`w-4 h-4 ${
                      mood === moodOption.value ? moodOption.color : 'text-sage-400'
                    }`} 
                  />
                  <span className={`text-sm font-medium ${
                    mood === moodOption.value ? 'text-moss-800' : 'text-sage-600'
                  }`}>
                    {moodOption.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-moss-800 mb-2">
              Your thoughts
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Let your thoughts flow freely..."
              rows={12}
              className="
                w-full px-4 py-3 border border-sage-200 rounded-lg resize-none
                focus:outline-none focus:ring-2 focus:ring-sage-400 focus:border-transparent
                text-sage-800 leading-relaxed
              "
            />
            <div className="flex justify-between text-xs text-sage-500 mt-2">
              <span>{content.length} characters</span>
              <span>Express yourself freely</span>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-moss-800 mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {tags.map((tag) => (
                <motion.div
                  key={tag}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center space-x-1 px-3 py-1 bg-moss-100 text-moss-700 rounded-full text-sm"
                >
                  <span>#{tag}</span>
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="text-moss-500 hover:text-moss-700"
                  >
                    <ApperIcon name="X" className="w-3 h-3" />
                  </button>
                </motion.div>
              ))}
            </div>
            <div className="flex space-x-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Add a tag..."
                className="
                  flex-1 px-3 py-2 border border-sage-200 rounded-lg text-sm
                  focus:outline-none focus:ring-2 focus:ring-sage-400 focus:border-transparent
                "
              />
              <Button
                variant="ghost"
                size="small"
                icon="Plus"
                onClick={handleAddTag}
                disabled={!tagInput.trim()}
              />
            </div>
          </div>

          {/* Writing Tips */}
          <Card variant="flat" padding="small" className="bg-sage-50">
            <div className="flex items-start space-x-3">
              <ApperIcon name="Lightbulb" className="w-5 h-5 text-accent mt-0.5" />
              <div>
                <h4 className="font-medium text-moss-800 text-sm mb-1">
                  Mindful Writing Tips
                </h4>
                <ul className="text-xs text-sage-600 space-y-1">
                  <li>• Write without judgment - let thoughts flow naturally</li>
                  <li>• Focus on the present moment and your current feelings</li>
                  <li>• Notice patterns in your thoughts and emotions</li>
                  <li>• End with gratitude or a positive intention</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </Card>
    </motion.div>
  )
}

export default JournalEditor