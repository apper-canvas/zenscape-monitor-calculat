import soundData from '../mockData/ambientSounds.json'

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

class SoundService {
  constructor() {
    this.sounds = [...soundData]
    this.currentlyPlaying = null
    this.volume = 0.7
  }

  async getAll() {
    await delay(200)
    return [...this.sounds]
  }

  async getById(id) {
    await delay(150)
    const sound = this.sounds.find(s => s.id === id)
    if (!sound) throw new Error('Sound not found')
    return { ...sound }
  }

  async getByCategory(category) {
    await delay(200)
    return this.sounds
      .filter(s => s.category === category)
      .map(s => ({ ...s }))
  }

  // Simulated audio playback methods
  async play(soundId) {
    await delay(100)
    const sound = this.sounds.find(s => s.id === soundId)
    if (!sound) throw new Error('Sound not found')
    
    this.currentlyPlaying = soundId
    return {
      success: true,
      sound: { ...sound },
      isPlaying: true
    }
  }

  async pause() {
    await delay(50)
    const wasPlaying = this.currentlyPlaying
    this.currentlyPlaying = null
    return {
      success: true,
      wasPlaying,
      isPlaying: false
    }
  }

  async setVolume(level) {
    await delay(50)
    this.volume = Math.max(0, Math.min(1, level))
    return {
      success: true,
      volume: this.volume
    }
  }

  getCurrentlyPlaying() {
    if (!this.currentlyPlaying) return null
    const sound = this.sounds.find(s => s.id === this.currentlyPlaying)
    return sound ? { ...sound } : null
  }

  getVolume() {
    return this.volume
  }

  async createMix(soundIds, name) {
    await delay(300)
    const validSounds = soundIds
      .map(id => this.sounds.find(s => s.id === id))
      .filter(Boolean)

    if (validSounds.length === 0) {
      throw new Error('No valid sounds for mix')
    }

    const mix = {
      id: Date.now().toString(),
      name: name || `Custom Mix ${Date.now()}`,
      sounds: validSounds.map(s => ({ ...s })),
      createdAt: new Date().toISOString(),
      type: 'mix'
    }

    return mix
  }

  async getFavorites() {
    await delay(200)
    // Mock favorites based on play count or popularity
    return this.sounds
      .filter(s => s.popular)
      .slice(0, 4)
      .map(s => ({ ...s }))
  }
}

export default new SoundService()