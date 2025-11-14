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

interface GitHubRepository {
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

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const query = getQuery(event)
  
  // Configuration from runtime config
  const owner = config.githubOwner || 'Oracommit'
  const token = config.githubToken
  const state = (query.state as string) || 'open' // open, closed, all
  
  try {
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'GitHub-Dashboard/1.0'
    }
    
    if (token) {
      headers.Authorization = `Bearer ${token}`
      console.log('Using GitHub token for authentication')
    } else {
      console.log('No GitHub token provided, using unauthenticated requests')
    }

    // First, get all repositories for the owner
    console.log(`Fetching repositories for owner: ${owner}`)
    
    let reposResponse = await fetch(
      `https://api.github.com/orgs/${owner}/repos?type=all&per_page=100&sort=updated`,
      { headers }
    )

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

    const repositories: GitHubRepository[] = await reposResponse.json()
    console.log(`Found ${repositories.length} repositories`)

    // Fetch pull requests for each repository
    const allPullRequests: PullRequest[] = []
    
    // Process repositories in batches to avoid rate limiting
    const batchSize = 5
    for (let i = 0; i < repositories.length; i += batchSize) {
      const batch = repositories.slice(i, i + batchSize)
      
      const pullRequestPromises = batch.map(async (repo) => {
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