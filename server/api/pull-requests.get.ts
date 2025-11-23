import { fetchRepositories, getGitHubHeaders, type GitHubRepository } from '../utils/github'

// Helper to fetch review status for a PR
async function fetchReviewStatus(
  repoFullName: string,
  prNumber: number,
  headers: HeadersInit
): Promise<'approved' | 'changes_requested' | 'pending' | 'commented'> {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${repoFullName}/pulls/${prNumber}/reviews`,
      { headers }
    )
    if (!response.ok) return 'pending'

    const reviews = await response.json()
    // Get the latest review state per reviewer
    const latestByReviewer = new Map<string, string>()
    for (const review of reviews) {
      if (review.state !== 'PENDING' && review.state !== 'COMMENTED') {
        latestByReviewer.set(review.user.login, review.state)
      }
    }

    const states = Array.from(latestByReviewer.values())
    if (states.includes('CHANGES_REQUESTED')) return 'changes_requested'
    if (states.includes('APPROVED')) return 'approved'
    if (reviews.some((r: { state: string }) => r.state === 'COMMENTED')) return 'commented'
    return 'pending'
  } catch {
    return 'pending'
  }
}

// Helper to fetch check/CI status for a PR
async function fetchCheckStatus(
  repoFullName: string,
  commitSha: string,
  headers: HeadersInit
): Promise<'success' | 'failure' | 'pending' | 'neutral'> {
  try {
    // Fetch combined status (legacy status API)
    const statusResponse = await fetch(
      `https://api.github.com/repos/${repoFullName}/commits/${commitSha}/status`,
      { headers }
    )

    // Fetch check runs (newer checks API)
    const checksResponse = await fetch(
      `https://api.github.com/repos/${repoFullName}/commits/${commitSha}/check-runs`,
      { headers }
    )

    let hasFailure = false
    let hasPending = false
    let hasSuccess = false

    if (statusResponse.ok) {
      const status = await statusResponse.json()
      if (status.state === 'failure' || status.state === 'error') hasFailure = true
      else if (status.state === 'pending') hasPending = true
      else if (status.state === 'success') hasSuccess = true
    }

    if (checksResponse.ok) {
      const checks = await checksResponse.json()
      for (const check of checks.check_runs || []) {
        if (check.conclusion === 'failure' || check.conclusion === 'timed_out' || check.conclusion === 'cancelled') {
          hasFailure = true
        } else if (check.status === 'in_progress' || check.status === 'queued') {
          hasPending = true
        } else if (check.conclusion === 'success') {
          hasSuccess = true
        }
      }
    }

    if (hasFailure) return 'failure'
    if (hasPending) return 'pending'
    if (hasSuccess) return 'success'
    return 'neutral'
  } catch {
    return 'neutral'
  }
}

// Helper to fetch comment counts for a PR
async function fetchCommentCounts(
  repoFullName: string,
  prNumber: number,
  headers: HeadersInit
): Promise<{ total: number; unresolved: number }> {
  try {
    // Fetch review comments (inline comments on diff)
    const reviewCommentsResponse = await fetch(
      `https://api.github.com/repos/${repoFullName}/pulls/${prNumber}/comments?per_page=100`,
      { headers }
    )

    let total = 0
    let unresolved = 0

    if (reviewCommentsResponse.ok) {
      const comments = await reviewCommentsResponse.json()

      // Group by thread (in_reply_to_id)
      const threads = new Map<number, Array<{ id: number }>>()

      for (const comment of comments) {
        total++
        const threadId = comment.in_reply_to_id || comment.id
        if (!threads.has(threadId)) {
          threads.set(threadId, [])
        }
        threads.get(threadId)!.push(comment)
      }

      // Check which threads are unresolved (no resolution marker)
      // GitHub doesn't provide resolution status via REST API directly for review comments
      // We'll count root comments as potentially unresolved threads
      for (const [threadId, threadComments] of threads) {
        // If this is a root comment (not a reply), count as unresolved
        const rootComment = comments.find((c: { id: number }) => c.id === threadId)
        if (rootComment) {
          unresolved++
        }
      }
    }

    return { total, unresolved }
  } catch {
    return { total: 0, unresolved: 0 }
  }
}

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
    sha: string
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
  additions: number
  deletions: number
  changed_files: number
  // Additional data fetched separately
  review_status?: 'approved' | 'changes_requested' | 'pending' | 'commented'
  check_status?: 'success' | 'failure' | 'pending' | 'neutral'
  comments: {
    total: number
    unresolved: number
  }
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const state = (query.state as string) || 'open' // open, closed, all

  try {
    const headers = getGitHubHeaders()
    const repositories = await fetchRepositories()
    console.log(`Fetching pull requests from ${repositories.length} repositories`)

    // Fetch pull requests for each repository
    const allPullRequests: PullRequest[] = []

    // Process repositories in batches to avoid rate limiting
    const batchSize = 5
    for (let i = 0; i < repositories.length; i += batchSize) {
      const batch = repositories.slice(i, i + batchSize)

      const pullRequestPromises = batch.map(async (repo: GitHubRepository) => {
        try {
          console.log(`Fetching pull requests for ${repo.full_name}`)

          const prResponse = await fetch(
            `https://api.github.com/repos/${repo.full_name}/pulls?state=${state}&per_page=100&sort=updated&direction=desc`,
            { headers }
          )

          if (!prResponse.ok) {
            console.warn(`Failed to fetch PRs for ${repo.full_name}: ${prResponse.status}`)
            return []
          }

          const prs = await prResponse.json()

          // Fetch additional data for each PR in parallel
          const enrichedPrs = await Promise.all(
            prs.map(async (pr: PullRequest) => {
              const [review_status, check_status, comments] = await Promise.all([
                fetchReviewStatus(repo.full_name, pr.number, headers),
                fetchCheckStatus(repo.full_name, pr.head.sha, headers),
                fetchCommentCounts(repo.full_name, pr.number, headers)
              ])

              return {
                ...pr,
                repository: {
                  name: repo.name,
                  full_name: repo.full_name
                },
                review_status,
                check_status,
                comments
              }
            })
          )

          return enrichedPrs
        } catch (error) {
          console.warn(`Error fetching PRs for ${repo.full_name}:`, error)
          return []
        }
      })

      const batchResults = await Promise.all(pullRequestPromises)
      allPullRequests.push(...batchResults.flat())

      // Small delay between batches to be respectful to GitHub API
      if (i + batchSize < repositories.length) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }

    // Sort by updated date (most recent first)
    allPullRequests.sort((a, b) =>
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    )

    console.log(`Found ${allPullRequests.length} pull requests across all repositories`)

    // Calculate statistics
    const repositoryNames = new Set(allPullRequests.map(pr => pr.repository.name))
    const stats = {
      total: allPullRequests.length,
      open: allPullRequests.filter(pr => pr.state === 'open').length,
      closed: allPullRequests.filter(pr => pr.state === 'closed').length,
      merged: allPullRequests.filter(pr => pr.merged_at !== null).length,
      draft: allPullRequests.filter(pr => pr.draft).length,
      repositories: repositoryNames.size
    }

    return {
      pull_requests: allPullRequests,
      stats
    }

  } catch (error: unknown) {
    console.error('Error in pull-requests API:', error)
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to fetch pull requests: ${(error instanceof Error ? error.message : String(error))}`
    })
  }
})
