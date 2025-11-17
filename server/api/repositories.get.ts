import { fetchRepositories, type GitHubRepository } from '../utils/github'

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
  try {
    const repositories = await fetchRepositories()
    console.log(`Processing ${repositories.length} repositories`)

    // Transform repositories into project views
    const projects: Project[] = repositories
      .map((repo: GitHubRepository): Project => ({
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
function categorizeProject(repo: GitHubRepository): string {
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
