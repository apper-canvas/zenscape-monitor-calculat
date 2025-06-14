import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Card from '@/components/atoms/Card'
import Button from '@/components/atoms/Button'
import ApperIcon from '@/components/ApperIcon'
import { soundService } from '@/services'

const SoundPlayer = ({ className = '' }) => {
  const [sounds, setSounds] = useState([])
  const [currentSound, setCurrentSound] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(0.7)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSounds()
  }, [])

  const loadSounds = async () => {
    try {
      const soundData = await soundService.getAll()
      setSounds(soundData)
    } catch (error) {
      console.error('Failed to load sounds:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePlaySound = async (sound) => {
    try {
      if (currentSound?.id === sound.id && isPlaying) {
        await soundService.pause()
        setIsPlaying(false)
        setCurrentSound(null)
      } else {
        await soundService.play(sound.id)
        setCurrentSound(sound)
        setIsPlaying(true)
      }
    } catch (error) {
      console.error('Failed to play sound:', error)
    }
  }

  const handleVolumeChange = async (newVolume) => {
    try {
      await soundService.setVolume(newVolume)
      setVolume(newVolume)
    } catch (error) {
      console.error('Failed to set volume:', error)
    }
  }

  if (loading) {
    return (
      <Card className={`p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-sage-200 rounded w-3/4 mb-4"></div>
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 bg-sage-200 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className={`flex flex-col ${className}`}>
      <div className="p-4 border-b border-sage-200">
        <h3 className="font-display text-lg text-moss-800 mb-2">Ambient Sounds</h3>
        
        {/* Volume Control */}
        <div className="flex items-center space-x-3">
          <ApperIcon name="Volume2" className="w-4 h-4 text-sage-600" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
            className="flex-1 h-2 bg-sage-200 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-xs text-sage-600 w-8">{Math.round(volume * 100)}</span>
        </div>
      </div>

      {/* Current Playing */}
      {currentSound && isPlaying && (
        <div className="p-4 bg-moss-50 border-b border-sage-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-lg">{currentSound.icon}</div>
              <div>
                <p className="font-medium text-moss-800 text-sm">{currentSound.name}</p>
                <p className="text-xs text-sage-600">Now Playing</p>
              </div>
            </div>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="w-2 h-2 bg-accent rounded-full"
            />
          </div>
        </div>
      )}

      {/* Sound List */}
      <div className="flex-1 overflow-y-auto zen-scroll">
        <div className="p-4 space-y-2">
          {sounds.map((sound, index) => (
            <motion.div
              key={sound.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                variant="flat"
                padding="small"
                hover
                onClick={() => handlePlaySound(sound)}
                className={`cursor-pointer transition-all duration-200 ${
                  currentSound?.id === sound.id && isPlaying
                    ? 'bg-moss-50 border-moss-200'
                    : 'hover:bg-sage-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="text-lg">{sound.icon}</div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-moss-800 text-sm truncate">
                      {sound.name}
                    </h4>
                    <p className="text-xs text-sage-600 truncate">
                      {sound.description}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    {currentSound?.id === sound.id && isPlaying ? (
                      <ApperIcon name="Pause" className="w-4 h-4 text-moss-700" />
                    ) : (
                      <ApperIcon name="Play" className="w-4 h-4 text-sage-600" />
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Sound Categories */}
      <div className="p-4 border-t border-sage-200">
        <div className="flex flex-wrap gap-2">
          {['Weather', 'Water', 'Nature', 'Wind'].map(category => (
            <div
              key={category}
              className="px-2 py-1 bg-sage-100 text-sage-600 text-xs rounded-full"
            >
              {category}
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}

export default SoundPlayer