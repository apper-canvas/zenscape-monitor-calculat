import journalData from '../mockData/journalEntries.json'

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

class JournalService {
  constructor() {
    this.entries = [...journalData]
  }

  async getAll() {
    await delay(300)
    return [...this.entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }

  async getById(id) {
    await delay(200)
    const entry = this.entries.find(e => e.id === id)
    if (!entry) throw new Error('Journal entry not found')
    return { ...entry }
  }

  async getByDateRange(startDate, endDate) {
    await delay(250)
    const start = new Date(startDate).getTime()
    const end = new Date(endDate).getTime()
    
    return this.entries
      .filter(entry => {
        const entryDate = new Date(entry.date).getTime()
        return entryDate >= start && entryDate <= end
      })
      .map(entry => ({ ...entry }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }

  async create(entryData) {
    await delay(400)
    const newEntry = {
      id: Date.now().toString(),
      ...entryData,
      date: entryData.date || new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    this.entries.unshift(newEntry)
    return { ...newEntry }
  }

  async update(id, updates) {
    await delay(300)
    const index = this.entries.findIndex(e => e.id === id)
    if (index === -1) throw new Error('Journal entry not found')
    
    this.entries[index] = {
      ...this.entries[index],
      ...updates,
      updatedAt: new Date().toISOString()
    }
    return { ...this.entries[index] }
  }

  async delete(id) {
    await delay(300)
    const index = this.entries.findIndex(e => e.id === id)
    if (index === -1) throw new Error('Journal entry not found')
    
    const deleted = this.entries.splice(index, 1)[0]
    return { ...deleted }
  }

  async getMoodStats(days = 30) {
    await delay(200)
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    const recentEntries = this.entries.filter(e => new Date(e.date) >= cutoffDate)
    
    const moodCounts = recentEntries.reduce((acc, entry) => {
      if (entry.mood) {
        acc[entry.mood] = (acc[entry.mood] || 0) + 1
      }
      return acc
    }, {})

    return moodCounts
  }
}

export default new JournalService()