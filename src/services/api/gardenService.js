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
}

export default new GardenService()