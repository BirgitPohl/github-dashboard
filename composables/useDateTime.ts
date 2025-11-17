/**
 * General date and time utility composable
 * Provides consistent date/time formatting across the application
 */
export const useDateTime = () => {
  /**
   * Format a date string into a relative time string (e.g., "2h ago", "3d ago")
   * This is the most comprehensive version with full granularity
   *
   * @param dateString - ISO date string or any valid date format
   * @returns Human-readable relative time string
   */
  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return 'just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`

    return date.toLocaleDateString()
  }

  /**
   * Format a date string into a simplified relative time (hours/days only)
   * Useful for cards and compact displays
   *
   * @param dateString - ISO date string or any valid date format
   * @returns Simplified relative time string or "Recent"
   */
  const formatTimeAgoSimple = (dateString: string): string => {
    const now = new Date()
    const updated = new Date(dateString)
    const diffMs = now.getTime() - updated.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays > 0) {
      return `${diffDays}d ago`
    } else if (diffHours > 0) {
      return `${diffHours}h ago`
    } else {
      return 'Recent'
    }
  }

  /**
   * Format a date string into detailed relative time with years/months
   * Useful for creation dates and long time periods
   *
   * @param dateString - ISO date string or any valid date format
   * @returns Detailed relative time string with years/months/days
   */
  const formatTimeAgoDetailed = (dateString: string): string => {
    const now = new Date()
    const created = new Date(dateString)
    const diffMs = now.getTime() - created.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays > 365) {
      const years = Math.floor(diffDays / 365)
      return `${years} year${years > 1 ? 's' : ''} ago`
    } else if (diffDays > 30) {
      const months = Math.floor(diffDays / 30)
      return `${months} month${months > 1 ? 's' : ''} ago`
    } else if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    } else {
      return 'Today'
    }
  }

  /**
   * Format a date string into an absolute date format
   * Shows "Mon DD" for current year, "Mon DD, YYYY" for other years
   *
   * @param dateString - ISO date string or any valid date format
   * @returns Formatted date string
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
    formatTimeAgo,
    formatTimeAgoSimple,
    formatTimeAgoDetailed,
    formatDate
  }
}
