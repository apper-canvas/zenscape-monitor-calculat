import meditationData from '../mockData/meditationSessions.json'

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

class MeditationService {
  constructor() {
    this.sessions = [...meditationData]
    this.userProgress = new Map() // Track user progress per session
  }

  async getAll() {
    await delay(300)
    return [...this.sessions]
  }

  async getById(id) {
    await delay(200)
    const session = this.sessions.find(s => s.id === id)
    if (!session) throw new Error('Meditation session not found')
    return { ...session }
  }

  async getByCategory(category) {
    await delay(250)
    return this.sessions
      .filter(s => s.category === category)
      .map(s => ({ ...s }))
  }

  async getProgress(sessionId) {
    await delay(150)
    return this.userProgress.get(sessionId) || {
      completedSessions: 0,
      totalTime: 0,
      lastCompleted: null
    }
  }

  async updateProgress(sessionId, sessionData) {
    await delay(200)
    const current = this.userProgress.get(sessionId) || {
      completedSessions: 0,
      totalTime: 0,
      lastCompleted: null
    }

    const updated = {
      completedSessions: current.completedSessions + 1,
      totalTime: current.totalTime + sessionData.duration,
      lastCompleted: new Date().toISOString()
    }

    this.userProgress.set(sessionId, updated)
    return { ...updated }
  }

  async getTotalStats() {
    await delay(200)
    let totalSessions = 0
    let totalMinutes = 0

    for (const progress of this.userProgress.values()) {
      totalSessions += progress.completedSessions
      totalMinutes += Math.round(progress.totalTime / 60)
    }

    return {
      totalSessions,
      totalMinutes,
      streak: this.calculateStreak()
    }
  }

  calculateStreak() {
    // Simple streak calculation based on last completed dates
    const recentSessions = Array.from(this.userProgress.values())
      .filter(p => p.lastCompleted)
      .sort((a, b) => new Date(b.lastCompleted).getTime() - new Date(a.lastCompleted).getTime())

    if (recentSessions.length === 0) return 0

    let streak = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (const session of recentSessions) {
      const sessionDate = new Date(session.lastCompleted)
      sessionDate.setHours(0, 0, 0, 0)
      
      const daysDiff = Math.floor((today.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysDiff === streak) {
        streak++
      } else {
        break
      }
    }

    return streak
  }

  async getFavorites() {
    await delay(200)
    // Return sessions with highest completion counts
    const favorites = Array.from(this.userProgress.entries())
      .filter(([_, progress]) => progress.completedSessions > 0)
      .sort((a, b) => b[1].completedSessions - a[1].completedSessions)
      .slice(0, 3)
      .map(([sessionId]) => this.sessions.find(s => s.id === sessionId))
      .filter(Boolean)

    return favorites.map(s => ({ ...s }))
  }
}

export default new MeditationService()