import gardenData from '../mockData/gardens.json'
import elementData from '../mockData/gardenElements.json'

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

class GardenService {
  constructor() {
    this.gardens = [...gardenData]
    this.elements = [...elementData]
  }

  async getAll() {
    await delay(300)
    return [...this.gardens]
  }

  async getById(id) {
    await delay(200)
    const garden = this.gardens.find(g => g.id === id)
    if (!garden) throw new Error('Garden not found')
    return { ...garden }
  }

  async getElements() {
    await delay(200)
    return [...this.elements]
  }

  async create(gardenData) {
    await delay(400)
    const newGarden = {
      id: Date.now().toString(),
      ...gardenData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    this.gardens.unshift(newGarden)
    return { ...newGarden }
  }

  async update(id, updates) {
    await delay(300)
    const index = this.gardens.findIndex(g => g.id === id)
    if (index === -1) throw new Error('Garden not found')
    
    this.gardens[index] = {
      ...this.gardens[index],
      ...updates,
      updatedAt: new Date().toISOString()
    }
    return { ...this.gardens[index] }
  }

  async delete(id) {
    await delay(300)
    const index = this.gardens.findIndex(g => g.id === id)
    if (index === -1) throw new Error('Garden not found')
    
    const deleted = this.gardens.splice(index, 1)[0]
    return { ...deleted }
  }

async getTemplates() {
    await delay(200)
    return this.gardens.filter(g => g.isTemplate).map(g => ({ ...g }))
  }

  async getByCategory(category) {
    await delay(200)
    switch (category) {
      case 'templates':
        return this.gardens.filter(g => g.isTemplate).map(g => ({ ...g }))
      case 'personal':
        return this.gardens.filter(g => !g.isTemplate).map(g => ({ ...g }))
      case 'all':
      default:
        return [...this.gardens]
    }
  }

  async search(query) {
    await delay(200)
    const lowercaseQuery = query.toLowerCase()
    return this.gardens.filter(g => 
      g.name.toLowerCase().includes(lowercaseQuery) ||
      g.description.toLowerCase().includes(lowercaseQuery)
    ).map(g => ({ ...g }))
  }

  async sortBy(field, direction = 'asc') {
    await delay(200)
    const sorted = [...this.gardens].sort((a, b) => {
      let aVal = a[field]
      let bVal = b[field]
      
      if (field === 'updatedAt' || field === 'createdAt') {
        aVal = new Date(aVal)
        bVal = new Date(bVal)
      }
      
      if (field === 'elementCount') {
        aVal = a.elements?.length || 0
        bVal = b.elements?.length || 0
      }
      
      if (aVal < bVal) return direction === 'asc' ? -1 : 1
      if (aVal > bVal) return direction === 'asc' ? 1 : -1
      return 0
    })
    
    return sorted.map(g => ({ ...g }))
  }

  async duplicate(id) {
    await delay(300)
    const garden = this.gardens.find(g => g.id === id)
    if (!garden) throw new Error('Garden not found')
    
    const duplicated = {
      ...garden,
      id: Date.now().toString(),
      name: `${garden.name} (Copy)`,
      isTemplate: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    this.gardens.unshift(duplicated)
    return { ...duplicated }
  }

  async exportGarden(id) {
    await delay(200)
    const garden = this.gardens.find(g => g.id === id)
    if (!garden) throw new Error('Garden not found')
    
    const exportData = {
      ...garden,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    }
    
    return exportData
  }

  async importGarden(gardenData) {
    await delay(300)
    const imported = {
      ...gardenData,
      id: Date.now().toString(),
      isTemplate: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    delete imported.exportedAt
    delete imported.version
    
    this.gardens.unshift(imported)
    return { ...imported }
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