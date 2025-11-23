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
      case 'ISSUE': return '📘'
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
   * Get color for item state using design system tokens
   */
  const getStateColor = (state: string): string => {
    switch (state.toLowerCase()) {
      case 'open': return 'var(--color-success-500)'
      case 'closed': return 'var(--color-gray-500)'
      case 'merged': return 'var(--color-purple-500)'
      default: return 'var(--color-gray-500)'
    }
  }

  return {
    getTypeIcon,
    getTypeText,
    getStateColor
  }
}
