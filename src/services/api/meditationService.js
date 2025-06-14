// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

class MeditationService {
  constructor() {
    this.apperClient = null;
    this.userProgress = new Map(); // Track user progress per session
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
    await delay(300);
    
    if (!this.apperClient) this.initializeClient();
    
    try {
      const params = {
        Fields: ['Name', 'Tags', 'Owner', 'title', 'description', 'duration', 'category', 'instructor', 'audio_url', 'difficulty', 'thumbnail', 'CreatedOn', 'ModifiedOn']
      };
      
      const response = await this.apperClient.fetchRecords('meditation_session', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      return response.data || [];
    } catch (error) {
      console.error('Error fetching meditation sessions:', error);
      throw error;
    }
  }

  async getById(id) {
    await delay(200);
    
    if (!this.apperClient) this.initializeClient();
    
    try {
      const params = {
        fields: ['Name', 'Tags', 'Owner', 'title', 'description', 'duration', 'category', 'instructor', 'audio_url', 'difficulty', 'thumbnail', 'CreatedOn', 'ModifiedOn']
      };
      
      const response = await this.apperClient.getRecordById('meditation_session', parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching meditation session with ID ${id}:`, error);
      throw error;
    }
  }

  async getByCategory(category) {
    await delay(250);
    
    if (!this.apperClient) this.initializeClient();
    
    try {
      const params = {
        Fields: ['Name', 'Tags', 'Owner', 'title', 'description', 'duration', 'category', 'instructor', 'audio_url', 'difficulty', 'thumbnail', 'CreatedOn', 'ModifiedOn'],
        where: [
          {
            FieldName: 'category',
            Operator: 'ExactMatch',
            Values: [category]
          }
        ]
      };
      
      const response = await this.apperClient.fetchRecords('meditation_session', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      return response.data || [];
    } catch (error) {
      console.error('Error fetching meditation sessions by category:', error);
      throw error;
    }
  }

  async getProgress(sessionId) {
    await delay(150);
    return this.userProgress.get(sessionId) || {
      completedSessions: 0,
      totalTime: 0,
      lastCompleted: null
    };
  }

  async updateProgress(sessionId, sessionData) {
    await delay(200);
    const current = this.userProgress.get(sessionId) || {
      completedSessions: 0,
      totalTime: 0,
      lastCompleted: null
    };

    const updated = {
      completedSessions: current.completedSessions + 1,
      totalTime: current.totalTime + sessionData.duration,
      lastCompleted: new Date().toISOString()
    };

    this.userProgress.set(sessionId, updated);
    return { ...updated };
  }

  async getTotalStats() {
    await delay(200);
    let totalSessions = 0;
    let totalMinutes = 0;

    for (const progress of this.userProgress.values()) {
      totalSessions += progress.completedSessions;
      totalMinutes += Math.round(progress.totalTime / 60);
    }

    return {
      totalSessions,
      totalMinutes,
      streak: this.calculateStreak()
    };
  }

  calculateStreak() {
    // Simple streak calculation based on last completed dates
    const recentSessions = Array.from(this.userProgress.values())
      .filter(p => p.lastCompleted)
      .sort((a, b) => new Date(b.lastCompleted).getTime() - new Date(a.lastCompleted).getTime());

    if (recentSessions.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const session of recentSessions) {
      const sessionDate = new Date(session.lastCompleted);
      sessionDate.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.floor((today.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === streak) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  async getFavorites() {
    await delay(200);
    // Return sessions with highest completion counts
    const favorites = Array.from(this.userProgress.entries())
      .filter(([_, progress]) => progress.completedSessions > 0)
      .sort((a, b) => b[1].completedSessions - a[1].completedSessions)
      .slice(0, 3);

    if (favorites.length === 0) return [];

    try {
      const sessions = await this.getAll();
      const favoriteIds = favorites.map(([sessionId]) => sessionId);
      
      return sessions.filter(session => favoriteIds.includes(session.id?.toString()));
    } catch (error) {
      console.error('Error fetching favorite sessions:', error);
      return [];
    }
  }
}

export default new MeditationService()