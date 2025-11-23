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
  // Use the general date/time utility
  const { formatTimeAgo } = useDateTime()

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

  /**
   * Get border color based on PR state
   */
  const getStateBorderColor = (pr: PullRequest): string => {
    if (pr.merged_at) return '#8b5cf6'
    if (pr.state === 'open' && pr.draft) return '#f59e0b'
    if (pr.state === 'open') return '#10b981'
    return '#ef4444'
  }

  /**
   * Get icon for CI/check status
   */
  const getCheckIcon = (status: 'success' | 'failure' | 'pending' | 'neutral'): string => {
    switch (status) {
      case 'success': return 'heroicons:check-circle'
      case 'failure': return 'heroicons:x-circle'
      case 'pending': return 'heroicons:clock'
      case 'neutral': return 'heroicons:minus-circle'
    }
  }

  /**
   * Get label for CI/check status
   */
  const getCheckLabel = (status: 'success' | 'failure' | 'pending' | 'neutral'): string => {
    switch (status) {
      case 'success': return 'Checks passed'
      case 'failure': return 'Checks failed'
      case 'pending': return 'Checks running'
      case 'neutral': return 'No checks'
    }
  }

  /**
   * Get icon for review status
   */
  const getReviewIcon = (status: 'approved' | 'changes_requested' | 'pending' | 'commented'): string => {
    switch (status) {
      case 'approved': return 'heroicons:hand-thumb-up'
      case 'changes_requested': return 'heroicons:exclamation-triangle'
      case 'commented': return 'heroicons:chat-bubble-bottom-center-text'
      case 'pending': return 'heroicons:eye'
    }
  }

  /**
   * Get label for review status
   */
  const getReviewLabel = (status: 'approved' | 'changes_requested' | 'pending' | 'commented'): string => {
    switch (status) {
      case 'approved': return 'Approved'
      case 'changes_requested': return 'Changes requested'
      case 'commented': return 'Reviewed'
      case 'pending': return 'Review pending'
    }
  }

  return {
    formatTimeAgo,
    getStateClass,
    getStateIcon,
    getStateLabel,
    getStateBorderColor,
    getCheckIcon,
    getCheckLabel,
    getReviewIcon,
    getReviewLabel
  }
}
