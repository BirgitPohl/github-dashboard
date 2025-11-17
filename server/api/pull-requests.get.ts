import { fetchRepositories, getGitHubHeaders, type GitHubRepository } from '../utils/github'

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
  additions: number
  deletions: number
  changed_files: number
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

          // Add repository information to each PR
          return prs.map((pr: PullRequest) => ({
            ...pr,
            repository: {
              name: repo.name,
              full_name: repo.full_name
            }
          }))
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
