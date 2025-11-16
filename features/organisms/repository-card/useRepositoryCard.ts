interface CategoryConfig {
  color: string
  bgColor: string
  borderColor: string
  icon: string
  label: string
}

/**
 * Composable for repository card logic
 * Determines visual configuration based on repository category
 */
export const useRepositoryCard = () => {
  const getCategoryConfig = (category: string): CategoryConfig => {
    const cat = category.toLowerCase()

    switch (cat) {
      case 'web application':
        return {
          color: '#10b981', // Green
          bgColor: '#f0fdf4',
          borderColor: '#10b981',
          icon: '🌐',
          label: 'Web App'
        }
      case 'api/service':
        return {
          color: '#3b82f6', // Blue
          bgColor: '#eff6ff',
          borderColor: '#3b82f6',
          icon: '⚡',
          label: 'API/Service'
        }
      case 'library/component':
        return {
          color: '#8b5cf6', // Purple
          bgColor: '#f5f3ff',
          borderColor: '#8b5cf6',
          icon: '📦',
          label: 'Library'
        }
      case 'documentation':
        return {
          color: '#f59e0b', // Amber
          bgColor: '#fffbeb',
          borderColor: '#f59e0b',
          icon: '📚',
          label: 'Docs'
        }
      case 'tool/utility':
        return {
          color: '#ef4444', // Red
          bgColor: '#fef2f2',
          borderColor: '#ef4444',
          icon: '🔧',
          label: 'Tool'
        }
      default:
        return {
          color: '#6b7280', // Gray
          bgColor: '#f9fafb',
          borderColor: '#6b7280',
          icon: '📁',
          label: 'General'
        }
    }
  }

  const formatSize = (sizeInKB: number): string => {
    if (sizeInKB < 1024) return `${sizeInKB} KB`
    const mb = sizeInKB / 1024
    if (mb < 1024) return `${mb.toFixed(1)} MB`
    const gb = mb / 1024
    return `${gb.toFixed(1)} GB`
  }

  return {
    getCategoryConfig,
    formatSize
  }
}
