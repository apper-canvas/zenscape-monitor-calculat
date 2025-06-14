// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

class SoundService {
  constructor() {
    this.apperClient = null;
    this.currentlyPlaying = null;
    this.volume = 0.7;
    this.initializeClient();
  }

  initializeClient() {
    if (typeof window !== 'undefined' && window.ApperSDK) {
      const { ApperClient } = window.ApperSDK;
      this.apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
    }
  }

  async getAll() {
    await delay(200);
    
    if (!this.apperClient) this.initializeClient();
    
    try {
      const params = {
        Fields: ['Name', 'Tags', 'Owner', 'description', 'category', 'duration', 'audio_url', 'volume', 'popular', 'icon', 'color', 'CreatedOn', 'ModifiedOn']
      };
      
      const response = await this.apperClient.fetchRecords('ambient_sound', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      return response.data || [];
    } catch (error) {
      console.error('Error fetching ambient sounds:', error);
      throw error;
    }
  }

  async getById(id) {
    await delay(150);
    
    if (!this.apperClient) this.initializeClient();
    
    try {
      const params = {
        fields: ['Name', 'Tags', 'Owner', 'description', 'category', 'duration', 'audio_url', 'volume', 'popular', 'icon', 'color', 'CreatedOn', 'ModifiedOn']
      };
      
      const response = await this.apperClient.getRecordById('ambient_sound', parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching sound with ID ${id}:`, error);
      throw error;
    }
  }

  async getByCategory(category) {
    await delay(200);
    
    if (!this.apperClient) this.initializeClient();
    
    try {
      const params = {
        Fields: ['Name', 'Tags', 'Owner', 'description', 'category', 'duration', 'audio_url', 'volume', 'popular', 'icon', 'color', 'CreatedOn', 'ModifiedOn'],
        where: [
          {
            FieldName: 'category',
            Operator: 'ExactMatch',
            Values: [category]
          }
        ]
      };
      
      const response = await this.apperClient.fetchRecords('ambient_sound', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      return response.data || [];
    } catch (error) {
      console.error('Error fetching sounds by category:', error);
      throw error;
    }
  }

  // Simulated audio playback methods
  async play(soundId) {
    await delay(100);
    
    try {
      const sound = await this.getById(soundId);
      if (!sound) throw new Error('Sound not found');
      
      this.currentlyPlaying = soundId;
      return {
        success: true,
        sound: { ...sound },
        isPlaying: true
      };
    } catch (error) {
      console.error('Error playing sound:', error);
      throw error;
    }
  }

  async pause() {
    await delay(50);
    const wasPlaying = this.currentlyPlaying;
    this.currentlyPlaying = null;
    return {
      success: true,
      wasPlaying,
      isPlaying: false
    };
  }

  async setVolume(level) {
    await delay(50);
    this.volume = Math.max(0, Math.min(1, level));
    return {
      success: true,
      volume: this.volume
    };
  }

  async getCurrentlyPlaying() {
    if (!this.currentlyPlaying) return null;
    
    try {
      const sound = await this.getById(this.currentlyPlaying);
      return sound ? { ...sound } : null;
    } catch (error) {
      console.error('Error getting currently playing sound:', error);
      return null;
    }
  }

  getVolume() {
    return this.volume;
  }

  async createMix(soundIds, name) {
    await delay(300);
    
    try {
      const validSounds = [];
      for (const id of soundIds) {
        try {
          const sound = await this.getById(id);
          if (sound) validSounds.push(sound);
        } catch (error) {
          console.warn(`Sound ${id} not found for mix`);
        }
      }

      if (validSounds.length === 0) {
        throw new Error('No valid sounds for mix');
      }

      const mix = {
        id: Date.now().toString(),
        name: name || `Custom Mix ${Date.now()}`,
        sounds: validSounds.map(s => ({ ...s })),
        createdAt: new Date().toISOString(),
        type: 'mix'
      };

      return mix;
    } catch (error) {
      console.error('Error creating sound mix:', error);
      throw error;
    }
  }

  async getFavorites() {
    await delay(200);
    
    if (!this.apperClient) this.initializeClient();
    
    try {
      const params = {
        Fields: ['Name', 'Tags', 'Owner', 'description', 'category', 'duration', 'audio_url', 'volume', 'popular', 'icon', 'color', 'CreatedOn', 'ModifiedOn'],
        where: [
          {
            FieldName: 'popular',
            Operator: 'ExactMatch',
            Values: [true]
          }
        ]
      };
      
      const response = await this.apperClient.fetchRecords('ambient_sound', params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }
      
      return (response.data || []).slice(0, 4);
    } catch (error) {
      console.error('Error fetching favorite sounds:', error);
      return [];
    }
  }
}

export default new SoundService()