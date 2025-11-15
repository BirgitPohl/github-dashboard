/**
 * Server-side GitHub API utilities
 * Provides shared functionality for making authenticated GitHub API requests
 */

export interface GitHubRepository {
  id: number
  name: string
  full_name: string
  description: string | null
  private: boolean
  archived: boolean
  language: string | null
  stargazers_count: number
  forks_count: number
  open_issues_count: number
  updated_at: string
  created_at: string
  html_url: string
  topics: string[]
  size: number
  default_branch: string
}

export type GitHubAPIHeaders = Record<string, string>

/**
 * Get standard headers for GitHub API requests
 */
export function getGitHubHeaders(): GitHubAPIHeaders {
  const config = useRuntimeConfig()
  const token = config.githubToken

  const headers: GitHubAPIHeaders = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'GitHub-Dashboard/1.0'
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  return headers
}

/**
 * Get the configured GitHub owner
 */
export function getGitHubOwner(): string {
  const config = useRuntimeConfig()
  return config.githubOwner || 'Oracommit'
}

/**
 * Fetch all repositories for the configured owner
 * Tries organization endpoint first, then falls back to user endpoint
 */
export async function fetchRepositories(): Promise<GitHubRepository[]> {
  const owner = getGitHubOwner()
  const headers = getGitHubHeaders()

  console.log(`Fetching repositories for owner: ${owner}`)

  // Try organization endpoint first
  let reposResponse = await fetch(
    `https://api.github.com/orgs/${owner}/repos?type=all&per_page=100&sort=updated`,
    { headers }
  )

  // Fallback to user endpoint if organization fails
  if (!reposResponse.ok) {
    console.log(`Organization endpoint failed (${reposResponse.status}), trying user endpoint...`)
    reposResponse = await fetch(
      `https://api.github.com/users/${owner}/repos?type=all&per_page=100&sort=updated`,
      { headers }
    )
  }

  if (!reposResponse.ok) {
    const errorText = await reposResponse.text()
    throw createError({
      statusCode: reposResponse.status,
      statusMessage: `GitHub API error: ${reposResponse.statusText} - ${errorText}`
    })
  }

  const repositories = await reposResponse.json()
  console.log(`Found ${repositories.length} repositories`)

  return repositories.filter((repo: GitHubRepository) => !repo.archived)
}

/**
 * Fetch data from a GitHub API endpoint with proper error handling
 */
export async function fetchFromGitHub<T = unknown>(endpoint: string): Promise<T> {
  const headers = getGitHubHeaders()

  const response = await fetch(`https://api.github.com${endpoint}`, { headers })

  if (!response.ok) {
    const errorText = await response.text()
    throw createError({
      statusCode: response.status,
      statusMessage: `GitHub API error: ${response.statusText} - ${errorText}`
    })
  }

  return response.json()
}

/**
 * Fetch data from multiple GitHub API endpoints in batches to respect rate limits
 */
export async function fetchInBatches<T = unknown>(
  endpoints: string[],
  batchSize: number = 5,
  delayMs: number = 100
): Promise<T[]> {
  const results: T[] = []

  for (let i = 0; i < endpoints.length; i += batchSize) {
    const batch = endpoints.slice(i, i + batchSize)

    const batchPromises = batch.map(async (endpoint) => {
      try {
        return await fetchFromGitHub<T>(endpoint)
      } catch (error) {
        console.warn(`Failed to fetch ${endpoint}:`, error)
        return null
      }
    })

    const batchResults = await Promise.all(batchPromises)
    results.push(...batchResults.filter((r): r is T => r !== null))

    // Add delay between batches to be respectful to GitHub API
    if (i + batchSize < endpoints.length) {
      await new Promise(resolve => setTimeout(resolve, delayMs))
    }
  }

  return results
}

/**
 * Process repositories in batches with a callback function
 * Useful for operations that need to be rate-limited
 */
export async function processRepositoriesInBatches<T>(
  repositories: GitHubRepository[],
  callback: (repo: GitHubRepository) => Promise<T | null>,
  batchSize: number = 5
): Promise<T[]> {
  const results: T[] = []

  for (let i = 0; i < repositories.length; i += batchSize) {
    const batch = repositories.slice(i, i + batchSize)

    const batchPromises = batch.map(async (repo) => {
      try {
        return await callback(repo)
      } catch (error) {
        console.warn(`Error processing repository ${repo.name}:`, error)
        return null
      }
    })

    const batchResults = await Promise.all(batchPromises)
    results.push(...batchResults.filter((r): r is T => r !== null))
  }

  return results
}
