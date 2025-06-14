import React from 'react'
import { motion } from 'framer-motion'
import Card from '@/components/atoms/Card'
import Button from '@/components/atoms/Button'
import ApperIcon from '@/components/ApperIcon'

const MeditationCard = ({ session, onPlay, onFavorite, isFavorite = false }) => {
  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    return `${minutes} min`
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return 'text-success bg-green-50'
      case 'Intermediate': return 'text-warning bg-yellow-50'
      case 'Advanced': return 'text-error bg-red-50'
      default: return 'text-sage-600 bg-sage-50'
    }
  }

  return (
    <Card
      variant="default"
      padding="medium"
      hover
      className="group cursor-pointer h-full"
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-200">
            {session.thumbnail}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onFavorite?.(session)
            }}
            className="p-1 hover:bg-sage-100 rounded-full transition-colors duration-200"
          >
            <ApperIcon
              name={isFavorite ? "Heart" : "Heart"}
              className={`w-4 h-4 ${
                isFavorite ? 'text-error fill-current' : 'text-sage-400'
              }`}
            />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3 className="font-display text-lg text-moss-800 mb-2 line-clamp-2">
            {session.title}
          </h3>
          <p className="text-sm text-sage-600 mb-4 line-clamp-2">
            {session.description}
          </p>

          {/* Tags */}
          {session.tags && session.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {session.tags.slice(0, 3).map(tag => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-sage-100 text-sage-600 text-xs rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-sage-200">
          <div className="flex items-center space-x-4 text-xs text-sage-600">
            <div className="flex items-center">
              <ApperIcon name="Clock" className="w-3 h-3 mr-1" />
              {formatDuration(session.duration)}
            </div>
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(session.difficulty)}`}>
              {session.difficulty}
            </div>
          </div>

          <Button
            variant="accent"
            size="small"
            icon="Play"
            onClick={(e) => {
              e.stopPropagation()
              onPlay(session)
            }}
            className="group-hover:scale-105 transition-transform duration-200"
          >
            Play
          </Button>
        </div>

        {/* Instructor */}
        {session.instructor && (
          <div className="mt-2 flex items-center text-xs text-sage-500">
            <ApperIcon name="User" className="w-3 h-3 mr-1" />
            {session.instructor}
          </div>
        )}
      </div>
    </Card>
  )
}

export default MeditationCard