interface PullRequest {
  id: number
  number: number
  title: string
  state: 'open' | 'closed' | 'merged'
  html_url: string
  created_at: string
  updated_at: string
  closed_at: string | null
  merged_at: string | null
  draft: boolean
  user: {
    login: string
    avatar_url: string
    html_url: string
  }
  assignees: Array<{
    login: string
    avatar_url: string
  }>
  labels: Array<{
    name: string
    color: string
  }>
  head: {
    ref: string
    repo: {
      name: string
      full_name: string
    } | null
  }
  base: {
    ref: string
  }
  repository: {
    name: string
    full_name: string
  }
}

/**
 * Composable for Pull Request card functionality
 */
export const usePullRequestCard = () => {
  /**
   * Format a date string into a relative time string (e.g., "2h ago")
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
   * Get CSS class based on PR state
   */
  const getStateClass = (pr: PullRequest): string => {
    if (pr.merged_at) return 'state-merged'
    if (pr.state === 'open' && pr.draft) return 'state-draft'
    if (pr.state === 'open') return 'state-open'
    return 'state-closed'
  }

  /**
   * Get icon emoji based on PR state
   */
  const getStateIcon = (pr: PullRequest): string => {
    if (pr.merged_at) return '✅'
    if (pr.state === 'open' && pr.draft) return '📝'
    if (pr.state === 'open') return '🔓'
    return '❌'
  }

  /**
   * Get human-readable state label
   */
  const getStateLabel = (pr: PullRequest): string => {
    if (pr.merged_at) return 'Merged'
    if (pr.state === 'open' && pr.draft) return 'Draft'
    if (pr.state === 'open') return 'Open'
    return 'Closed'
  }

  return {
    formatTimeAgo,
    getStateClass,
    getStateIcon,
    getStateLabel
  }
}
