// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

class GardenService {
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
        Fields: ['Name', 'Tags', 'Owner', 'description', 'elements', 'is_template', 'thumbnail', 'CreatedOn', 'ModifiedOn']
      };
      
      const response = await this.apperClient.fetchRecords('garden', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      return response.data || [];
    } catch (error) {
      console.error('Error fetching gardens:', error);
      throw error;
    }
  }

  async getById(id) {
    await delay(200);
    
    if (!this.apperClient) this.initializeClient();
    
    try {
      const params = {
        fields: ['Name', 'Tags', 'Owner', 'description', 'elements', 'is_template', 'thumbnail', 'CreatedOn', 'ModifiedOn']
      };
      
      const response = await this.apperClient.getRecordById('garden', parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching garden with ID ${id}:`, error);
      throw error;
    }
  }

  async getElements() {
    await delay(200);
    
    if (!this.apperClient) this.initializeClient();
    
    try {
      const params = {
        Fields: ['Name', 'Tags', 'Owner', 'type', 'subtype', 'category', 'description', 'icon', 'color', 'size', 'width', 'height']
      };
      
      const response = await this.apperClient.fetchRecords('garden_element', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      return response.data || [];
    } catch (error) {
      console.error('Error fetching garden elements:', error);
      throw error;
    }
  }

  async create(gardenData) {
    await delay(400);
    
    if (!this.apperClient) this.initializeClient();
    
    try {
      // Only include Updateable fields
      const createData = {
        Name: gardenData.name || gardenData.Name,
        Tags: gardenData.tags || gardenData.Tags || '',
        description: gardenData.description,
        elements: JSON.stringify(gardenData.elements || []),
        is_template: gardenData.isTemplate || gardenData.is_template || false,
        thumbnail: gardenData.thumbnail || '🌱'
      };
      
      const params = {
        records: [createData]
      };
      
      const response = await this.apperClient.createRecord('garden', params);
      
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
      
      throw new Error('Failed to create garden');
    } catch (error) {
      console.error('Error creating garden:', error);
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
        Name: updates.name || updates.Name,
        Tags: updates.tags || updates.Tags || '',
        description: updates.description,
        elements: JSON.stringify(updates.elements || []),
        is_template: updates.isTemplate || updates.is_template || false,
        thumbnail: updates.thumbnail || '🌱'
      };
      
      const params = {
        records: [updateData]
      };
      
      const response = await this.apperClient.updateRecord('garden', params);
      
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
      
      throw new Error('Failed to update garden');
    } catch (error) {
      console.error('Error updating garden:', error);
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
      
      const response = await this.apperClient.deleteRecord('garden', params);
      
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
      console.error('Error deleting garden:', error);
      throw error;
    }
  }

  async getTemplates() {
    await delay(200);
    
    if (!this.apperClient) this.initializeClient();
    
    try {
      const params = {
        Fields: ['Name', 'Tags', 'Owner', 'description', 'elements', 'is_template', 'thumbnail', 'CreatedOn', 'ModifiedOn'],
        where: [
          {
            FieldName: 'is_template',
            Operator: 'ExactMatch',
            Values: [true]
          }
        ]
      };
      
      const response = await this.apperClient.fetchRecords('garden', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      return response.data || [];
    } catch (error) {
      console.error('Error fetching garden templates:', error);
      throw error;
    }
  }

  async getByCategory(category) {
    await delay(200);
    
    if (!this.apperClient) this.initializeClient();
    
    try {
      let params = {
        Fields: ['Name', 'Tags', 'Owner', 'description', 'elements', 'is_template', 'thumbnail', 'CreatedOn', 'ModifiedOn']
      };
      
      if (category === 'templates') {
        params.where = [
          {
            FieldName: 'is_template',
            Operator: 'ExactMatch',
            Values: [true]
          }
        ];
      } else if (category === 'personal') {
        params.where = [
          {
            FieldName: 'is_template',
            Operator: 'ExactMatch',
            Values: [false]
          }
        ];
      }
      
      const response = await this.apperClient.fetchRecords('garden', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      return response.data || [];
    } catch (error) {
      console.error('Error fetching gardens by category:', error);
      throw error;
    }
  }

  async search(query) {
    await delay(200);
    
    if (!this.apperClient) this.initializeClient();
    
    try {
      const params = {
        Fields: ['Name', 'Tags', 'Owner', 'description', 'elements', 'is_template', 'thumbnail', 'CreatedOn', 'ModifiedOn'],
        whereGroups: [
          {
            operator: 'OR',
            SubGroups: [
              {
                conditions: [
                  {
                    FieldName: 'Name',
                    Operator: 'Contains',
                    Values: [query]
                  }
                ],
                operator: ''
              },
              {
                conditions: [
                  {
                    FieldName: 'description',
                    Operator: 'Contains',
                    Values: [query]
                  }
                ],
                operator: ''
              }
            ]
          }
        ]
      };
      
      const response = await this.apperClient.fetchRecords('garden', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      return response.data || [];
    } catch (error) {
      console.error('Error searching gardens:', error);
      throw error;
    }
  }

  async sortBy(field, direction = 'asc') {
    await delay(200);
    
    if (!this.apperClient) this.initializeClient();
    
    try {
      let sortField = field;
      if (field === 'updatedAt') sortField = 'ModifiedOn';
      if (field === 'createdAt') sortField = 'CreatedOn';
      if (field === 'name') sortField = 'Name';
      
      const params = {
        Fields: ['Name', 'Tags', 'Owner', 'description', 'elements', 'is_template', 'thumbnail', 'CreatedOn', 'ModifiedOn'],
        orderBy: [
          {
            FieldName: sortField,
            SortType: direction.toUpperCase()
          }
        ]
      };
      
      const response = await this.apperClient.fetchRecords('garden', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      return response.data || [];
    } catch (error) {
      console.error('Error sorting gardens:', error);
      throw error;
    }
  }

  async duplicate(id) {
    await delay(300);
    
    try {
      const original = await this.getById(id);
      
      const duplicateData = {
        name: `${original.Name} (Copy)`,
        description: original.description,
        elements: JSON.parse(original.elements || '[]'),
        isTemplate: false,
        thumbnail: original.thumbnail || '🌱'
      };
      
      return await this.create(duplicateData);
    } catch (error) {
      console.error('Error duplicating garden:', error);
      throw error;
    }
  }

  async exportGarden(id) {
    await delay(200);
    
    try {
      const garden = await this.getById(id);
      
      const exportData = {
        ...garden,
        exportedAt: new Date().toISOString(),
        version: '1.0'
      };
      
      return exportData;
    } catch (error) {
      console.error('Error exporting garden:', error);
      throw error;
    }
  }

  async importGarden(gardenData) {
    await delay(300);
    
    try {
      const importData = {
        name: gardenData.name || gardenData.Name,
        description: gardenData.description,
        elements: gardenData.elements,
        isTemplate: false,
        thumbnail: gardenData.thumbnail || '🌱'
      };
      
      // Remove export metadata
      delete importData.exportedAt;
      delete importData.version;
      
      return await this.create(importData);
    } catch (error) {
      console.error('Error importing garden:', error);
      throw error;
    }
  }

  generateThumbnail(elements) {
    if (!elements || elements.length === 0) return '🌱'
    
    const elementTypes = elements.map(el => el.type)
    const plantTypes = elements.filter(el => el.type === 'plant').map(el => el.subtype)
    
    // Prioritize by garden composition
    if (elementTypes.includes('water') && plantTypes.includes('cherry-blossom')) return '🌸'
    if (elementTypes.includes('water') && elementTypes.includes('rock')) return '🏞️'
    if (plantTypes.includes('bamboo')) return '🎋'
    if (plantTypes.includes('lotus')) return '🪷'
    if (elementTypes.includes('water')) return '🌊'
    if (plantTypes.includes('cherry-blossom')) return '🌸'
    if (elementTypes.includes('plant')) return '🌿'
    if (elementTypes.includes('rock')) return '🪨'
    
    return '🌱'
  }
}

export default new GardenService()
export default new GardenService()