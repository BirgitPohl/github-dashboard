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
 * Composable for shared GitHub API functionality
 * Provides reusable methods for making authenticated GitHub API requests
 */
export const useGitHubAPI = () => {
  const config = useRuntimeConfig()
  
  const owner = config.public.githubOwner || 'Oracommit'
  const token = config.githubToken

  /**
   * Get standard headers for GitHub API requests
   */
  const getHeaders = (): GitHubAPIHeaders => {
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
   * Fetch all repositories for the configured owner
   * Tries organization endpoint first, then falls back to user endpoint
   */
  const fetchRepositories = async (): Promise<GitHubRepository[]> => {
    const headers = getHeaders()
    
    // Try organization endpoint first
    let reposResponse = await fetch(
      `https://api.github.com/orgs/${owner}/repos?type=all&per_page=100&sort=updated`,
      { headers }
    )

    // Fallback to user endpoint if organization fails
    if (!reposResponse.ok) {
      reposResponse = await fetch(
        `https://api.github.com/users/${owner}/repos?type=all&per_page=100&sort=updated`,
        { headers }
      )
    }

    if (!reposResponse.ok) {
      const errorText = await reposResponse.text()
      throw new Error(`GitHub API error: ${reposResponse.statusText} - ${errorText}`)
    }

    const repositories = await reposResponse.json()
    return repositories.filter((repo: GitHubRepository) => !repo.archived)
  }

  /**
   * Fetch data from a GitHub API endpoint with proper error handling
   */
  const fetchFromGitHub = async (endpoint: string): Promise<unknown> => {
    const headers = getHeaders()
    
    const response = await fetch(`https://api.github.com${endpoint}`, { headers })
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`GitHub API error: ${response.statusText} - ${errorText}`)
    }
    
    return response.json()
  }

  /**
   * Fetch data from multiple GitHub API endpoints in batches to respect rate limits
   */
  const fetchInBatches = async (
    endpoints: string[],
    batchSize: number = 5,
    delayMs: number = 100
  ): Promise<unknown[]> => {
    const results: unknown[] = []
    
    for (let i = 0; i < endpoints.length; i += batchSize) {
      const batch = endpoints.slice(i, i + batchSize)
      
      const batchPromises = batch.map(async (endpoint) => {
        try {
          return await fetchFromGitHub(endpoint)
        } catch (error) {
          console.warn(`Failed to fetch ${endpoint}:`, error)
          return []
        }
      })
      
      const batchResults = await Promise.all(batchPromises)
      results.push(...batchResults.flat())
      
      // Add delay between batches to be respectful to GitHub API
      if (i + batchSize < endpoints.length) {
        await new Promise(resolve => setTimeout(resolve, delayMs))
      }
    }
    
    return results
  }

  return {
    owner,
    token: !!token,
    getHeaders,
    fetchRepositories,
    fetchFromGitHub,
    fetchInBatches
  }
}