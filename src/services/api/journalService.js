// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

class JournalService {
  constructor() {
    this.apperClient = null;
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
        Fields: ['Name', 'Tags', 'Owner', 'date', 'title', 'content', 'mood', 'garden_used', 'CreatedOn', 'ModifiedOn'],
        orderBy: [
          {
            FieldName: 'date',
            SortType: 'DESC'
          }
        ]
      };
      
      const response = await this.apperClient.fetchRecords('journal_entry', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      return response.data || [];
    } catch (error) {
      console.error('Error fetching journal entries:', error);
      throw error;
    }
  }

  async getById(id) {
    await delay(200);
    
    if (!this.apperClient) this.initializeClient();
    
    try {
      const params = {
        fields: ['Name', 'Tags', 'Owner', 'date', 'title', 'content', 'mood', 'garden_used', 'CreatedOn', 'ModifiedOn']
      };
      
      const response = await this.apperClient.getRecordById('journal_entry', parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching journal entry with ID ${id}:`, error);
      throw error;
    }
  }

  async getByDateRange(startDate, endDate) {
    await delay(250);
    
    if (!this.apperClient) this.initializeClient();
    
    try {
      const params = {
        Fields: ['Name', 'Tags', 'Owner', 'date', 'title', 'content', 'mood', 'garden_used', 'CreatedOn', 'ModifiedOn'],
        where: [
          {
            FieldName: 'date',
            Operator: 'GreaterThanOrEqualTo',
            Values: [startDate]
          },
          {
            FieldName: 'date',
            Operator: 'LessThanOrEqualTo',
            Values: [endDate]
          }
        ],
        orderBy: [
          {
            FieldName: 'date',
            SortType: 'DESC'
          }
        ]
      };
      
      const response = await this.apperClient.fetchRecords('journal_entry', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      return response.data || [];
    } catch (error) {
      console.error('Error fetching journal entries by date range:', error);
      throw error;
    }
  }

  async create(entryData) {
    await delay(400);
    
    if (!this.apperClient) this.initializeClient();
    
    try {
      // Only include Updateable fields
      const createData = {
        Name: entryData.title || 'Untitled Entry',
        Tags: entryData.tags ? entryData.tags.join(',') : '',
        date: entryData.date || new Date().toISOString(),
        title: entryData.title || 'Untitled Entry',
        content: entryData.content || '',
        mood: entryData.mood || '',
        garden_used: entryData.gardenUsed ? parseInt(entryData.gardenUsed) : null
      };
      
      const params = {
        records: [createData]
      };
      
      const response = await this.apperClient.createRecord('journal_entry', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              console.error(`${error.fieldLabel}: ${error.message}`);
            });
          });
        }
        
        if (successfulRecords.length > 0) {
          return successfulRecords[0].data;
        }
      }
      
      throw new Error('Failed to create journal entry');
    } catch (error) {
      console.error('Error creating journal entry:', error);
      throw error;
    }
  }

  async update(id, updates) {
    await delay(300);
    
    if (!this.apperClient) this.initializeClient();
    
    try {
      // Only include Updateable fields
      const updateData = {
        Id: parseInt(id),
        Name: updates.title || 'Untitled Entry',
        Tags: updates.tags ? updates.tags.join(',') : '',
        date: updates.date,
        title: updates.title || 'Untitled Entry',
        content: updates.content || '',
        mood: updates.mood || '',
        garden_used: updates.gardenUsed ? parseInt(updates.gardenUsed) : null
      };
      
      const params = {
        records: [updateData]
      };
      
      const response = await this.apperClient.updateRecord('journal_entry', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const successfulUpdates = response.results.filter(result => result.success);
        const failedUpdates = response.results.filter(result => !result.success);
        
        if (failedUpdates.length > 0) {
          console.error(`Failed to update ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
          
          failedUpdates.forEach(record => {
            record.errors?.forEach(error => {
              console.error(`${error.fieldLabel}: ${error.message}`);
            });
          });
        }
        
        if (successfulUpdates.length > 0) {
          return successfulUpdates[0].data;
        }
      }
      
      throw new Error('Failed to update journal entry');
    } catch (error) {
      console.error('Error updating journal entry:', error);
      throw error;
    }
  }

  async delete(id) {
    await delay(300);
    
    if (!this.apperClient) this.initializeClient();
    
    try {
      const params = {
        RecordIds: [parseInt(id)]
      };
      
      const response = await this.apperClient.deleteRecord('journal_entry', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const successfulDeletions = response.results.filter(result => result.success);
        const failedDeletions = response.results.filter(result => !result.success);
        
        if (failedDeletions.length > 0) {
          console.error(`Failed to delete ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`);
        }
        
        return successfulDeletions.length > 0;
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting journal entry:', error);
      throw error;
    }
  }

  async getMoodStats(days = 30) {
    await delay(200);
    
    if (!this.apperClient) this.initializeClient();
    
    try {
      const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
      
      const params = {
        Fields: ['mood'],
        where: [
          {
            FieldName: 'date',
            Operator: 'GreaterThanOrEqualTo',
            Values: [cutoffDate]
          },
          {
            FieldName: 'mood',
            Operator: 'HasValue',
            Values: []
          }
        ]
      };
      
      const response = await this.apperClient.fetchRecords('journal_entry', params);
      
      if (!response.success) {
        console.error(response.message);
        return {};
      }
      
      const entries = response.data || [];
      const moodCounts = entries.reduce((acc, entry) => {
        if (entry.mood) {
          acc[entry.mood] = (acc[entry.mood] || 0) + 1;
        }
        return acc;
      }, {});
      
      return moodCounts;
    } catch (error) {
      console.error('Error fetching mood statistics:', error);
      return {};
    }
  }
}

export default new JournalService()