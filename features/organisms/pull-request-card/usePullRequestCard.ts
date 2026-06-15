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
    if (pr.merged_at) return 'lucide:git-merge'
    if (pr.state === 'open' && pr.draft) return 'lucide:file-edit'
    if (pr.state === 'open') return 'lucide:git-pull-request'
    return 'lucide:git-pull-request-closed'
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
   * Resolve the semantic background + on-color text for a PR row.
   * Each branch returns the saturated background and the matching
   * --color-on-* text token so contrast stays correct when the palette
   * changes (e.g. light Pearl Aqua needs dark text, dark Oxidized Iron
   * needs white text).
   *
   * draft           → neutral-dark   (muted, parked)
   * merged          → tertiary       (done)
   * checks failed   → error          (broken — highest concern)
   * change requested→ warning        (author owes work)
   * checks ✓ + ✓ed  → success        (ready to land)
   * everything else → primary        (in progress / default open)
   */
  const getStateRowColors = (pr: PullRequest): { bg: string; fg: string } => {
    if (pr.draft) return { bg: 'var(--color-neutral-dark)', fg: 'var(--color-on-neutral)' }
    if (pr.merged_at) return { bg: 'var(--color-tertiary)', fg: 'var(--color-on-tertiary)' }
    if (pr.check_status === 'failure') return { bg: 'var(--color-error)', fg: 'var(--color-on-error)' }
    if (pr.review_status === 'changes_requested') return { bg: 'var(--color-warning)', fg: 'var(--color-on-warning)' }
    if (pr.check_status === 'success' && pr.review_status === 'approved') return { bg: 'var(--color-success)', fg: 'var(--color-on-success)' }
    return { bg: 'var(--color-primary)', fg: 'var(--color-on-primary)' }
  }

  /**
   * Get icon for CI/check status
   */
  const getCheckIcon = (status: 'success' | 'failure' | 'pending' | 'neutral'): string => {
    switch (status) {
      case 'success': return 'lucide:check-circle-2'
      case 'failure': return 'lucide:x-circle'
      case 'pending': return 'lucide:loader-circle'
      case 'neutral': return 'lucide:circle-minus'
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
      case 'approved': return 'lucide:thumbs-up'
      case 'changes_requested': return 'lucide:alert-triangle'
      case 'commented': return 'lucide:message-circle'
      case 'pending': return 'lucide:eye'
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
    getStateRowColors,
    getCheckIcon,
    getCheckLabel,
    getReviewIcon,
    getReviewLabel
  }
}
