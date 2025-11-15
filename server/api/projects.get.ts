import { executeGraphQL, getGitHubOwner } from '../utils/github'

interface GitHubProject {
  id: string
  title: string
  shortDescription: string | null
  url: string
  createdAt: string
  updatedAt: string
  closed: boolean
  items?: {
    totalCount: number
  }
}

interface Project {
  id: string
  title: string
  shortDescription?: string
  url: string
  createdAt: string
  updatedAt: string
  state: 'OPEN' | 'CLOSED'
  items: {
    totalCount: number
  }
}

export default defineEventHandler(async (_event) => {
  try {
    const owner = getGitHubOwner()
    console.log(`Fetching GitHub Projects for organization: ${owner}`)

    // GraphQL query for GitHub Projects v2
    const query = `
      query($owner: String!) {
        organization(login: $owner) {
          projectsV2(first: 20) {
            nodes {
              id
              title
              shortDescription
              url
              createdAt
              updatedAt
              closed
              items {
                totalCount
              }
            }
          }
        }
      }
    `

    const data = await executeGraphQL<{
      organization: {
        projectsV2: {
          nodes: GitHubProject[]
        }
      }
    }>(query, { owner })

    const githubProjects = data.organization?.projectsV2?.nodes || []
    console.log(`Found ${githubProjects.length} GitHub Projects`)

    // Transform GitHub Projects to our format
    const projects: Project[] = githubProjects
      .filter((project: GitHubProject) => !project.closed) // Filter out closed projects
      .map((project: GitHubProject) => ({
        id: project.id,
        title: project.title,
        shortDescription: project.shortDescription || undefined,
        url: project.url,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
        state: project.closed ? 'CLOSED' : 'OPEN',
        items: {
          totalCount: project.items?.totalCount || 0
        }
      }))

    // Sort by most recently updated
    projects.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

    console.log(`Processed ${projects.length} projects`)
    return projects

  } catch (error: unknown) {
    console.error('Error fetching GitHub Projects:', error)

    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error // Re-throw createError errors
    }

    throw createError({
      statusCode: 500,
      statusMessage: `Failed to fetch GitHub Projects: ${error instanceof Error ? error.message : String(error)}`
    })
  }
})
