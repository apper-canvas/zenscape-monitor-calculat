import React from 'react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import Card from '@/components/atoms/Card'
import Button from '@/components/atoms/Button'
import ApperIcon from '@/components/ApperIcon'

const JournalEntry = ({ entry, onEdit, onDelete, onView }) => {
  const getMoodIcon = (mood) => {
    const moodMap = {
      peaceful: { icon: 'Smile', color: 'text-success' },
      reflective: { icon: 'Brain', color: 'text-info' },
      inspired: { icon: 'Sparkles', color: 'text-warning' },
      centered: { icon: 'Target', color: 'text-moss-700' },
      grateful: { icon: 'Heart', color: 'text-error' },
      anxious: { icon: 'AlertCircle', color: 'text-orange-500' },
      calm: { icon: 'Waves', color: 'text-blue-500' },
      energetic: { icon: 'Zap', color: 'text-yellow-500' }
    }
    return moodMap[mood] || { icon: 'Circle', color: 'text-sage-400' }
  }

  const moodInfo = getMoodIcon(entry.mood)
  const previewText = entry.content?.length > 150 
    ? entry.content.substring(0, 150) + '...' 
    : entry.content

  return (
    <Card
      variant="default"
      padding="medium"
      hover
      onClick={() => onView?.(entry)}
      className="group cursor-pointer"
    >
      <div className="flex flex-col space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-display text-lg text-moss-800 mb-1 line-clamp-1">
              {entry.title || 'Untitled Entry'}
            </h3>
            <div className="flex items-center text-sm text-sage-600">
              <ApperIcon name="Calendar" className="w-4 h-4 mr-1" />
              {format(new Date(entry.date), 'MMM dd, yyyy')}
            </div>
          </div>
          
          {entry.mood && (
            <div className="flex items-center space-x-1">
              <ApperIcon 
                name={moodInfo.icon} 
                className={`w-4 h-4 ${moodInfo.color}`} 
              />
              <span className={`text-xs font-medium capitalize ${moodInfo.color}`}>
                {entry.mood}
              </span>
            </div>
          )}
        </div>

        {/* Content Preview */}
        <div className="flex-1">
          <p className="text-sm text-sage-700 leading-relaxed line-clamp-3">
            {previewText}
          </p>
        </div>

        {/* Tags */}
        {entry.tags && entry.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {entry.tags.slice(0, 3).map(tag => (
              <span
                key={tag}
                className="px-2 py-1 bg-moss-50 text-moss-700 text-xs rounded-full"
              >
                #{tag}
              </span>
            ))}
            {entry.tags.length > 3 && (
              <span className="px-2 py-1 bg-sage-100 text-sage-600 text-xs rounded-full">
                +{entry.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-sage-200 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="flex items-center text-xs text-sage-500">
            <ApperIcon name="Clock" className="w-3 h-3 mr-1" />
            {format(new Date(entry.updatedAt || entry.createdAt), 'h:mm a')}
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="small"
              icon="Edit3"
              onClick={(e) => {
                e.stopPropagation()
                onEdit?.(entry)
              }}
            />
            <Button
              variant="ghost"
              size="small"
              icon="Trash2"
              onClick={(e) => {
                e.stopPropagation()
                onDelete?.(entry)
              }}
              className="text-error hover:text-error hover:bg-red-50"
            />
          </div>
        </div>

        {/* Garden Connection */}
        {entry.gardenUsed && (
          <div className="flex items-center text-xs text-sage-500 bg-sage-50 px-2 py-1 rounded-full">
            <ApperIcon name="Flower2" className="w-3 h-3 mr-1" />
            <span>Inspired by garden creation</span>
          </div>
        )}
      </div>
    </Card>
  )
}

export default JournalEntry