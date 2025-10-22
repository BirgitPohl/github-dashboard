interface Repository {
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

interface Project {
  id: number
  name: string
  full_name: string
  description: string
  language: string
  is_private: boolean
  stars: number
  forks: number
  issues: number
  updated_at: string
  created_at: string
  html_url: string
  topics: string[]
  size: number
  default_branch: string
  category: string
  tech_stack: string[]
}

export default defineEventHandler(async (_event) => {
  const config = useRuntimeConfig()
  
  // Configuration from runtime config
  const owner = config.githubOwner || 'Oracommit'
  const token = config.githubToken // Required for private repos
  
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

    // Get all repositories for the owner
    console.log(`Fetching projects for owner: ${owner}`)
    
    // Try organization endpoint first, then user endpoint
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
      console.log(`GitHub API error response:`, errorText)
      throw createError({
        statusCode: reposResponse.status,
        statusMessage: `GitHub API error: ${reposResponse.statusText} - ${errorText}`
      })
    }

    const repositories = await reposResponse.json()
    console.log(`Found ${repositories.length} repositories`)

    interface Repository {
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

    // Transform repositories into project views
    const projects: Project[] = repositories
      .filter((repo: Repository) => !repo.archived) // Filter out archived repos
      .map((repo: Repository): Project => ({
        id: repo.id,
        name: repo.name,
        full_name: repo.full_name,
        description: repo.description || 'No description available',
        language: repo.language || 'Unknown',
        is_private: repo.private,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        issues: repo.open_issues_count,
        updated_at: repo.updated_at,
        created_at: repo.created_at,
        html_url: repo.html_url,
        topics: repo.topics || [],
        size: repo.size,
        default_branch: repo.default_branch,
        // Add view categories based on repository characteristics
        category: categorizeProject(repo),
        tech_stack: getTechStack(repo.language, repo.topics)
      }))
      .sort((a: Project, b: Project) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()) // Sort by most recent

    console.log(`Processed ${projects.length} projects`)
    return projects
    
  } catch (error: unknown) {
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to fetch projects: ${(error instanceof Error ? error.message : String(error))}`
    })
  }
})

// Helper function to categorize projects
function categorizeProject(repo: Repository): string {
  const name = repo.name.toLowerCase()
  const topics = repo.topics || []
  const language = repo.language?.toLowerCase() || ''
  
  // Web Applications
  if (topics.includes('webapp') || topics.includes('website') || 
      name.includes('web') || name.includes('app') || 
      language === 'typescript' || language === 'javascript') {
    return 'Web Application'
  }
  
  // APIs/Services
  if (topics.includes('api') || topics.includes('server') || 
      name.includes('api') || name.includes('server') || name.includes('service')) {
    return 'API/Service'
  }
  
  // Libraries/Components
  if (topics.includes('library') || topics.includes('component') || 
      name.includes('library') || name.includes('component')) {
    return 'Library/Component'
  }
  
  // Documentation
  if (topics.includes('documentation') || name.includes('doc') || 
      name.includes('guide') || language === 'markdown') {
    return 'Documentation'
  }
  
  // Tools/Utilities
  if (topics.includes('tool') || topics.includes('utility') || 
      name.includes('tool') || name.includes('util')) {
    return 'Tool/Utility'
  }
  
  return 'General'
}

// Helper function to determine tech stack
function getTechStack(language: string | null, topics: string[]): string[] {
  const stack: string[] = []
  
  if (language) {
    stack.push(language)
  }
  
  // Add framework/tech indicators from topics
  const techTopics = topics.filter(topic => 
    ['vue', 'nuxt', 'react', 'next', 'node', 'typescript', 'javascript', 
     'python', 'docker', 'kubernetes', 'aws', 'vercel', 'supabase'].includes(topic.toLowerCase())
  )
  
  stack.push(...techTopics)
  
  return [...new Set(stack)] // Remove duplicates
}