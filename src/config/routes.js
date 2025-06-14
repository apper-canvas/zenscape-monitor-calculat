import Garden from '@/components/pages/Garden'
import Meditate from '@/components/pages/Meditate'
import Journal from '@/components/pages/Journal'

export const routes = {
  garden: {
    id: 'garden',
    label: 'Garden',
    path: '/garden',
    icon: 'Flower2',
    component: Garden
  },
  meditate: {
    id: 'meditate',
    label: 'Meditate',
    path: '/meditate',
    icon: 'Brain',
    component: Meditate
  },
  journal: {
    id: 'journal',
    label: 'Journal',
    path: '/journal',
    icon: 'BookOpen',
    component: Journal
  }
}

export const routeArray = Object.values(routes)
export default routes