interface StatusConfig {
  color: string
  bgColor: string
  borderColor: string
  icon: string
  label: string
}

type ProjectState = 'OPEN' | 'CLOSED'

/**
 * Composable for project card logic
 * Determines visual configuration based on project state
 */
export const useProjectCard = () => {
  const getStatusConfig = (state: ProjectState): StatusConfig => {
    switch (state) {
      case 'OPEN':
        return {
          color: '#10b981', // Green
          bgColor: '#f0fdf4',
          borderColor: '#10b981',
          icon: '🚀',
          label: 'Active'
        }
      case 'CLOSED':
        return {
          color: '#6b7280', // Gray
          bgColor: '#f9fafb',
          borderColor: '#6b7280',
          icon: '✅',
          label: 'Closed'
        }
      default:
        return {
          color: '#6b7280', // Gray
          bgColor: '#f9fafb',
          borderColor: '#6b7280',
          icon: '📋',
          label: 'Unknown'
        }
    }
  }

  return {
    getStatusConfig
  }
}
