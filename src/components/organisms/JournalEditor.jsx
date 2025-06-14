import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import Card from '@/components/atoms/Card'
import Button from '@/components/atoms/Button'
import Input from '@/components/atoms/Input'
import ApperIcon from '@/components/ApperIcon'
import journalService from '@/services/api/journalService'
const JournalEditor = ({ entry, onSave, onCancel, isEditing = false }) => {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [mood, setMood] = useState('')
  const [tags, setTags] = useState([])
  const [tagInput, setTagInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [selectedPrompt, setSelectedPrompt] = useState('')
  const [showPrompts, setShowPrompts] = useState(true)
  const [moodStats, setMoodStats] = useState({})
  const [showMoodInsights, setShowMoodInsights] = useState(false)
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

  const journalPrompts = {
    reflection: [
      "What emotions am I experiencing right now, and what might they be telling me?",
      "What patterns do I notice in my thoughts today?",
      "How has my perspective shifted recently?",
      "What would I tell a friend who was in my situation?"
    ],
    gratitude: [
      "What are three small things I'm grateful for today?",
      "Who in my life am I thankful for and why?",
      "What challenges have become blessings in disguise?",
      "How has my body served me well today?"
    ],
    mindfulness: [
      "What do I notice about my breathing right now?",
      "What sensations am I aware of in this moment?",
      "How can I bring more presence to my daily activities?",
      "What sounds, sights, or smells am I noticing around me?"
    ],
    growth: [
      "What have I learned about myself this week?",
      "How am I different from who I was a year ago?",
      "What limiting belief am I ready to release?",
      "What new possibility am I open to exploring?"
    ],
    creativity: [
      "If I could create anything without limitations, what would it be?",
      "What inspires me most deeply right now?",
      "How can I express my authentic self more fully?",
      "What would I do if I knew I couldn't fail?"
    ]
  }

  const moodPrompts = {
    peaceful: journalPrompts.gratitude.concat(journalPrompts.mindfulness),
    reflective: journalPrompts.reflection.concat(journalPrompts.growth),
    inspired: journalPrompts.creativity.concat(journalPrompts.growth),
    centered: journalPrompts.mindfulness.concat(journalPrompts.reflection),
    grateful: journalPrompts.gratitude.concat(journalPrompts.reflection),
    anxious: journalPrompts.mindfulness.concat(journalPrompts.reflection),
    calm: journalPrompts.mindfulness.concat(journalPrompts.gratitude),
    energetic: journalPrompts.creativity.concat(journalPrompts.growth)
  }

  useEffect(() => {
    if (entry) {
      setTitle(entry.title || '')
      setContent(entry.content || '')
      setMood(entry.mood || '')
      setTags(entry.tags || [])
    }
  }, [entry])

  useEffect(() => {
    const loadMoodStats = async () => {
      try {
        const stats = await journalService.getMoodStats(7) // Last 7 days
        setMoodStats(stats)
      } catch (error) {
        console.error('Failed to load mood stats:', error)
      }
    }
    loadMoodStats()
  }, [])

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

  const handlePromptSelect = (prompt) => {
    setSelectedPrompt(prompt)
    if (content) {
      setContent(content + '\n\n' + prompt + '\n\n')
    } else {
      setContent(prompt + '\n\n')
    }
    setShowPrompts(false)
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

          {/* Journal Prompts */}
          {showPrompts && (
            <Card variant="flat" padding="medium" className="bg-gradient-to-br from-sage-50 to-moss-50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <ApperIcon name="Lightbulb" className="w-5 h-5 text-accent" />
                  <h3 className="font-medium text-moss-800">
                    {mood ? `${moods.find(m => m.value === mood)?.label} Prompts` : 'Writing Prompts'}
                  </h3>
                </div>
                <button
                  onClick={() => setShowPrompts(false)}
                  className="text-sage-400 hover:text-sage-600"
                >
                  <ApperIcon name="X" className="w-4 h-4" />
                </button>
              </div>

              {mood && moodPrompts[mood] ? (
                <div className="space-y-2">
                  <p className="text-sm text-sage-600 mb-3">
                    Prompts tailored to your current mood:
                  </p>
                  <div className="grid gap-2">
                    {moodPrompts[mood].slice(0, 3).map((prompt, index) => (
                      <motion.button
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => handlePromptSelect(prompt)}
                        className="text-left p-3 rounded-lg border border-sage-200 hover:border-moss-300 hover:bg-white transition-all duration-200 text-sm text-sage-700 hover:text-moss-800"
                      >
                        {prompt}
                      </motion.button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(journalPrompts).map(([category, prompts]) => (
                    <div key={category}>
                      <h4 className="font-medium text-moss-700 mb-2 capitalize text-sm">
                        {category}
                      </h4>
                      <div className="grid gap-2">
                        {prompts.slice(0, 2).map((prompt, index) => (
                          <button
                            key={index}
                            onClick={() => handlePromptSelect(prompt)}
                            className="text-left p-2 rounded border border-sage-200 hover:border-moss-300 hover:bg-white transition-all duration-200 text-sm text-sage-600 hover:text-moss-700"
                          >
                            {prompt}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

          {!showPrompts && (
            <div className="flex justify-center">
              <Button
                variant="ghost"
                size="small"
                icon="Lightbulb"
                onClick={() => setShowPrompts(true)}
              >
                Show Writing Prompts
              </Button>
            </div>
          )}
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

          {/* Mood Insights */}
          {Object.keys(moodStats).length > 0 && (
            <Card variant="flat" padding="medium" className="bg-gradient-to-br from-blue-50 to-indigo-50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <ApperIcon name="BarChart3" className="w-5 h-5 text-info" />
                  <h3 className="font-medium text-moss-800">Your Mood Patterns (Last 7 Days)</h3>
                </div>
                <button
                  onClick={() => setShowMoodInsights(!showMoodInsights)}
                  className="text-sage-400 hover:text-sage-600"
                >
                  <ApperIcon name={showMoodInsights ? "ChevronUp" : "ChevronDown"} className="w-4 h-4" />
                </button>
              </div>
              
              {showMoodInsights && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    {Object.entries(moodStats).map(([moodValue, count]) => {
                      const moodInfo = moods.find(m => m.value === moodValue)
                      if (!moodInfo) return null
                      return (
                        <div key={moodValue} className="flex items-center space-x-2 p-2 bg-white rounded-lg">
                          <ApperIcon name={moodInfo.icon} className={`w-4 h-4 ${moodInfo.color}`} />
                          <div>
                            <div className="text-sm font-medium text-moss-800">{moodInfo.label}</div>
                            <div className="text-xs text-sage-600">{count} time{count !== 1 ? 's' : ''}</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <p className="text-sm text-sage-600">
                    Notice any patterns? Tracking your moods can help you understand what influences your emotional well-being.
                  </p>
                </motion.div>
              )}
            </Card>
          )}

          {/* Mood-Based Writing Suggestions */}
          {mood && (
            <Card variant="flat" padding="small" className="bg-gradient-to-r from-moss-50 to-sage-50">
              <div className="flex items-start space-x-3">
                <ApperIcon name="Heart" className="w-5 h-5 text-accent mt-0.5" />
                <div>
                  <h4 className="font-medium text-moss-800 text-sm mb-2">
                    Writing with {moods.find(m => m.value === mood)?.label} Energy
                  </h4>
                  <div className="text-xs text-sage-600 space-y-1">
                    {mood === 'peaceful' && (
                      <>
                        <p>• Explore what brings you this sense of peace</p>
                        <p>• Notice the small details that contribute to your calm</p>
                        <p>• Consider how you can cultivate more moments like this</p>
                      </>
                    )}
                    {mood === 'reflective' && (
                      <>
                        <p>• Dive deep into your thoughts and observations</p>
                        <p>• Examine patterns and connections in your experiences</p>
                        <p>• Ask yourself questions that lead to insights</p>
                      </>
                    )}
                    {mood === 'inspired' && (
                      <>
                        <p>• Capture the spark of creativity while it's alive</p>
                        <p>• Explore new possibilities and ideas</p>
                        <p>• Let your imagination flow freely without judgment</p>
                      </>
                    )}
                    {mood === 'anxious' && (
                      <>
                        <p>• Name your worries to help reduce their power</p>
                        <p>• Focus on what you can control in this moment</p>
                        <p>• Practice grounding through your senses</p>
                      </>
                    )}
                    {['centered', 'calm', 'grateful', 'energetic'].includes(mood) && (
                      <>
                        <p>• Explore what contributed to this positive state</p>
                        <p>• Notice how this feeling shows up in your body</p>
                        <p>• Consider how to nurture this energy</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Mindful Writing Tips */}
          <Card variant="flat" padding="small" className="bg-sage-50">
            <div className="flex items-start space-x-3">
              <ApperIcon name="Compass" className="w-5 h-5 text-accent mt-0.5" />
              <div>
                <h4 className="font-medium text-moss-800 text-sm mb-1">
                  Mindful Writing Practice
                </h4>
                <ul className="text-xs text-sage-600 space-y-1">
                  <li>• Write without judgment - let thoughts flow naturally</li>
                  <li>• Focus on the present moment and your current feelings</li>
                  <li>• Notice patterns in your thoughts and emotions</li>
                  <li>• End with gratitude or a positive intention</li>
                  <li>• Use prompts when you need inspiration to begin</li>
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