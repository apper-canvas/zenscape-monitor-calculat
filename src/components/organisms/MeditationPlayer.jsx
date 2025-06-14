import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Card from '@/components/atoms/Card'
import Button from '@/components/atoms/Button'
import ApperIcon from '@/components/ApperIcon'

const MeditationPlayer = ({ session, onClose, onComplete }) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)

  useEffect(() => {
    let interval
    if (isPlaying && !isCompleted) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + 1
          if (newTime >= session.duration) {
            setIsCompleted(true)
            setIsPlaying(false)
            onComplete?.(session)
            return session.duration
          }
          return newTime
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isPlaying, isCompleted, session.duration, onComplete])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const progress = (currentTime / session.duration) * 100

  const handlePlayPause = () => {
    if (isCompleted) {
      // Restart
      setCurrentTime(0)
      setIsCompleted(false)
      setIsPlaying(true)
    } else {
      setIsPlaying(!isPlaying)
    }
  }

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const percentage = clickX / rect.width
    const newTime = Math.floor(percentage * session.duration)
    setCurrentTime(newTime)
    setIsCompleted(false)
  }

  const handleRestart = () => {
    setCurrentTime(0)
    setIsCompleted(false)
    setIsPlaying(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
    >
      <Card className="w-full max-w-md bg-surface">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-sage-200">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">{session.thumbnail}</div>
            <div>
              <h3 className="font-display text-lg text-moss-800">{session.title}</h3>
              <p className="text-sm text-sage-600">{session.instructor}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="small"
            icon="X"
            onClick={onClose}
            className="text-sage-500 hover:text-moss-700"
          />
        </div>

        {/* Visualization */}
        <div className="p-6 text-center">
          <motion.div
            className="relative w-32 h-32 mx-auto mb-6"
            animate={isPlaying ? { scale: [1, 1.05, 1] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {/* Outer ring */}
            <div className="absolute inset-0 border-4 border-sage-200 rounded-full"></div>
            
            {/* Progress ring */}
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle
                cx="50%"
                cy="50%"
                r="60"
                stroke="transparent"
                strokeWidth="4"
                fill="transparent"
              />
              <motion.circle
                cx="50%"
                cy="50%"
                r="60"
                stroke="#8B956D"
                strokeWidth="4"
                fill="transparent"
                strokeDasharray={`${2 * Math.PI * 60}`}
                strokeDashoffset={`${2 * Math.PI * 60 * (1 - progress / 100)}`}
                strokeLinecap="round"
                transition={{ duration: 0.5 }}
              />
            </svg>

            {/* Center content */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-sm text-sage-600 mb-1">
                  {formatTime(currentTime)}
                </div>
                <div className="text-xs text-sage-500">
                  {formatTime(session.duration)}
                </div>
              </div>
            </div>

            {/* Breathing indicator */}
            {isPlaying && (
              <motion.div
                className="absolute inset-2 border-2 border-accent rounded-full opacity-50"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />
            )}
          </motion.div>

          {/* Status */}
          <div className="text-center mb-4">
            {isCompleted ? (
              <div className="text-success font-medium">Session Complete! 🎉</div>
            ) : isPlaying ? (
              <div className="text-moss-700 font-medium">Breathe deeply and relax...</div>
            ) : (
              <div className="text-sage-600">Ready to begin</div>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-6 pb-4">
          <div
            className="w-full h-2 bg-sage-200 rounded-full cursor-pointer overflow-hidden"
            onClick={handleSeek}
          >
            <motion.div
              className="h-full bg-accent rounded-full"
              style={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <div className="flex justify-between text-xs text-sage-500 mt-2">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(session.duration - currentTime)} remaining</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center space-x-4 p-6 border-t border-sage-200">
          <Button
            variant="ghost"
            size="medium"
            icon="RotateCcw"
            onClick={handleRestart}
            disabled={currentTime === 0}
          />
          
          <Button
            variant="primary"
            size="large"
            icon={isCompleted ? "RotateCcw" : isPlaying ? "Pause" : "Play"}
            onClick={handlePlayPause}
            className="w-16 h-16 rounded-full"
          />
          
          <Button
            variant="ghost"
            size="medium"
            icon="SkipForward"
            onClick={() => setCurrentTime(session.duration)}
            disabled={isCompleted}
          />
        </div>

        {/* Session Info */}
        <div className="px-6 pb-6">
          <div className="flex items-center justify-center space-x-4 text-xs text-sage-600">
            <div className="flex items-center">
              <ApperIcon name="Target" className="w-3 h-3 mr-1" />
              {session.category}
            </div>
            <div className="flex items-center">
              <ApperIcon name="TrendingUp" className="w-3 h-3 mr-1" />
              {session.difficulty}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

export default MeditationPlayer