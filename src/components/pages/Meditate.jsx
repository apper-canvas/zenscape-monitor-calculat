import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "react-toastify";
import MeditationCard from "@/components/molecules/MeditationCard";
import MeditationPlayer from "@/components/organisms/MeditationPlayer";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import Loading from "@/components/atoms/Loading";
import ApperIcon from "@/components/ApperIcon";
import { meditationService } from "@/services";

const Meditate = () => {
  const [sessions, setSessions] = useState([])
  const [filteredSessions, setFilteredSessions] = useState([])
  const [currentSession, setCurrentSession] = useState(null)
  const [favorites, setFavorites] = useState([])
  const [stats, setStats] = useState({ totalSessions: 0, totalMinutes: 0, streak: 0 })
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('All')
  const [activeFilter, setActiveFilter] = useState('All')

  const categories = ['All', 'Nature', 'Mindfulness', 'Focus', 'Growth', 'Evening']
  const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced']

  useEffect(() => {
    loadMeditationData()
  }, [])

  useEffect(() => {
    filterSessions()
  }, [sessions, activeCategory, activeFilter])

  const loadMeditationData = async () => {
    setLoading(true)
    try {
      const [sessionsData, favoritesData, statsData] = await Promise.all([
        meditationService.getAll(),
        meditationService.getFavorites(),
        meditationService.getTotalStats()
      ])

      setSessions(sessionsData)
      setFavorites(favoritesData)
      setStats(statsData)
    } catch (error) {
      console.error('Failed to load meditation data:', error)
      toast.error('Failed to load meditation sessions')
    } finally {
      setLoading(false)
    }
  }

  const filterSessions = () => {
    let filtered = [...sessions]

    if (activeCategory !== 'All') {
      filtered = filtered.filter(session => session.category === activeCategory)
    }

    if (activeFilter !== 'All') {
      filtered = filtered.filter(session => session.difficulty === activeFilter)
    }

    setFilteredSessions(filtered)
  }

  const handlePlaySession = (session) => {
    setCurrentSession(session)
  }

const handleSessionComplete = async (session) => {
    try {
      await meditationService.updateProgress(session.id, {
        duration: session.duration,
        completedAt: new Date().toISOString()
      })

      // Refresh stats
      const newStats = await meditationService.getTotalStats()
      setStats(newStats)

      toast.success('Meditation session completed! 🧘‍♂️')
    } catch (error) {
      console.error('Failed to update progress:', error)
      toast.error('Failed to save progress')
    }
  }

  const handleRefresh = async () => {
    try {
      await loadMeditationData()
      toast.success('Sessions refreshed successfully')
    } catch (error) {
      console.error('Failed to refresh sessions:', error)
      toast.error('Failed to refresh sessions')
    }
  }

  const handleFavoriteToggle = (session) => {
    const isFavorite = favorites.some(fav => fav.id === session.id)
    
    if (isFavorite) {
      setFavorites(prev => prev.filter(fav => fav.id !== session.id))
      toast.success('Removed from favorites')
    } else {
      setFavorites(prev => [...prev, session])
      toast.success('Added to favorites')
    }
  }

  const isFavorite = (session) => {
    return favorites.some(fav => fav.id === session.id)
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loading variant="zen" text="Preparing your meditation space..." />
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col overflow-hidden bg-background">
    {/* Header */}
    <div className="flex-shrink-0 p-6 bg-surface border-b border-sage-200">
        <div className="max-w-7xl mx-auto">
            <div
                className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div>
                    <h1 className="text-3xl font-display text-moss-800 mb-2">Meditation Sessions
                                      </h1>
                    <p className="text-sage-600">Find peace through guided meditation and mindful breathing
                                      </p>
                </div>
                <div className="flex items-center space-x-6">
                    {/* Stats */}
                    <div className="flex space-x-6">
                        <div className="text-center">
                            <div className="text-2xl font-display text-moss-800">
                                {stats.totalSessions}
                            </div>
                            <div className="text-xs text-sage-600">Sessions</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-display text-moss-800">
                                {stats.totalMinutes}
                            </div>
                            <div className="text-xs text-sage-600">Minutes</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-display text-moss-800">
                                {stats.streak}
                            </div>
                            <div className="text-xs text-sage-600">Day Streak</div>
                        </div>
                    </div>
                    {/* Refresh Button */}
                    <Button
                        variant="ghost"
                        size="sm"
                        icon="RefreshCw"
                        onClick={handleRefresh}
                        disabled={loading}
                        className="text-sage-600 hover:text-moss-800"
                        title="Refresh sessions">Refresh
                                      </Button>
                </div>
            </div>
        </div>
    </div>
    {/* Filters */}
    <div className="flex-shrink-0 p-6 bg-surface border-b border-sage-200">
        <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-8">
                {/* Category Filter */}
                <div>
                    <label className="block text-sm font-medium text-moss-800 mb-2">Category
                                      </label>
                    <div className="flex flex-wrap gap-2">
                        {categories.map(category => <button
                            key={category}
                            onClick={() => setActiveCategory(category)}
                            className={`
                      px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200
                      ${activeCategory === category ? "bg-moss-800 text-surface shadow-sm" : "bg-sage-100 text-sage-700 hover:bg-sage-200"}
                    `}>
                            {category}
                        </button>)}
                    </div>
                </div>
                {/* Difficulty Filter */}
                <div>
                    <label className="block text-sm font-medium text-moss-800 mb-2">Difficulty
                                      </label>
                    <div className="flex flex-wrap gap-2">
                        {difficulties.map(difficulty => <button
                            key={difficulty}
                            onClick={() => setActiveFilter(difficulty)}
                            className={`
                      px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200
                      ${activeFilter === difficulty ? "bg-accent text-moss-800 shadow-sm" : "bg-sage-100 text-sage-700 hover:bg-sage-200"}
                    `}>
                            {difficulty}
                        </button>)}
                    </div>
                </div>
            </div>
        </div>
    </div>
    {/* Content */}
    <div className="flex-1 overflow-y-auto zen-scroll">
        <div className="max-w-7xl mx-auto p-6">
            {/* Favorites Section */}
            {favorites.length > 0 && <div className="mb-8">
                <div className="flex items-center mb-4">
                    <ApperIcon name="Heart" className="w-5 h-5 text-error mr-2" />
                    <h2 className="text-xl font-display text-moss-800">Your Favorites
                                        </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favorites.slice(0, 3).map((session, index) => <motion.div
                        key={session.id}
                        initial={{
                            opacity: 0,
                            y: 20
                        }}
                        animate={{
                            opacity: 1,
                            y: 0
                        }}
                        transition={{
                            delay: index * 0.1
                        }}>
                        <MeditationCard
                            session={session}
                            onPlay={handlePlaySession}
                            onFavorite={handleFavoriteToggle}
                            isFavorite={true} />
                    </motion.div>)}
                </div>
            </div>}
            {/* All Sessions */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-display text-moss-800">
                        {activeCategory === "All" ? "All Sessions" : `${activeCategory} Sessions`}
                    </h2>
                    <div className="text-sm text-sage-600">
                        {filteredSessions.length}session{filteredSessions.length !== 1 ? "s" : ""}
                    </div>
                </div>
                {filteredSessions.length === 0 ? <Card className="text-center py-12">
                    <div className="text-4xl mb-4 opacity-50">🧘‍♂️</div>
                    <h3 className="text-lg font-display text-moss-800 mb-2">No sessions found
                                        </h3>
                    <p className="text-sage-600 mb-4">Try adjusting your filters to see more sessions
                                        </p>
                    <Button
                        variant="accent"
                        onClick={() => {
                            setActiveCategory("All");
                            setActiveFilter("All");
                        }}>Clear Filters
                                        </Button>
                </Card> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredSessions.map((session, index) => <motion.div
                        key={session.id}
                        initial={{
                            opacity: 0,
                            y: 20
                        }}
                        animate={{
                            opacity: 1,
                            y: 0
                        }}
                        transition={{
                            delay: index * 0.1
                        }}>
                        <MeditationCard
                            session={session}
                            onPlay={handlePlaySession}
                            onFavorite={handleFavoriteToggle}
                            isFavorite={isFavorite(session)} />
                    </motion.div>)}
                </div>}
            </div>
            {/* Quick Start */}
            <div className="mt-12">
                <Card variant="elevated" className="bg-gradient-to-br from-moss-50 to-sage-50">
                    <div className="p-8 text-center">
                        <div className="text-4xl mb-4">🌸</div>
                        <h3 className="text-xl font-display text-moss-800 mb-2">New to Meditation?
                                            </h3>
                        <p className="text-sage-600 mb-6 max-w-md mx-auto">Start with our beginner-friendly sessions designed to introduce you to the practice of mindfulness
                                            </p>
                        <Button
                            variant="primary"
                            icon="Play"
                            onClick={() => {
                                const beginnerSession = sessions.find(s => s.difficulty === "Beginner");

                                if (beginnerSession)
                                    handlePlaySession(beginnerSession);
                            }}>Start Your Journey
                                            </Button>
                    </div>
                </Card>
            </div>
        </div>
    </div>
    {/* Meditation Player Modal */}
    <AnimatePresence>
        {currentSession && <MeditationPlayer
            session={currentSession}
            onClose={() => setCurrentSession(null)}
            onComplete={handleSessionComplete} />}
    </AnimatePresence>
</div>
  )
}

export default Meditate