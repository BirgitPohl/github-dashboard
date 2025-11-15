/**
 * Composable for project items table logic
 * Provides helper functions for formatting and displaying project items
 */
export const useProjectItemsTable = () => {
  /**
   * Get icon emoji for item type
   */
  const getTypeIcon = (type: string): string => {
    switch (type) {
      case 'ISSUE': return '🐛'
      case 'PULL_REQUEST': return '🔀'
      case 'DRAFT_ISSUE': return '📝'
      default: return '📋'
    }
  }

  /**
   * Get short text label for item type
   */
  const getTypeText = (type: string): string => {
    switch (type) {
      case 'PULL_REQUEST': return 'PR'
      case 'DRAFT_ISSUE': return 'Draft'
      case 'ISSUE': return 'Issue'
      default: return type
    }
  }

  /**
   * Get color for item state
   */
  const getStateColor = (state: string): string => {
    switch (state.toLowerCase()) {
      case 'open': return '#10b981'
      case 'closed': return '#6b7280'
      case 'merged': return '#8b5cf6'
      default: return '#6b7280'
    }
  }

  /**
   * Format date to short readable format
   */
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    const currentYear = new Date().getFullYear()
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() === currentYear ? undefined : 'numeric'
    })
  }

  return {
    getTypeIcon,
    getTypeText,
    getStateColor,
    formatDate
  }
}
