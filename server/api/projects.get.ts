import { fetchProjectsREST, fetchProjectItemsREST } from '../utils/github-rest'

interface Project {
  id: string
  number: number
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
    console.log('Fetching GitHub Projects (REST API)')

    const projects = await fetchProjectsREST()

    // Filter open projects
    const openProjects = projects.filter(p => p.state === 'open')

    // Fetch item counts for each project in parallel
    const itemCounts = await Promise.all(
      openProjects.map(async (p) => {
        try {
          const items = await fetchProjectItemsREST(p.number)
          return items.length
        } catch (error) {
          console.warn(`Failed to fetch item count for project ${p.number}:`, error)
          return 0
        }
      })
    )

    // Transform to frontend format
    const transformedProjects: Project[] = openProjects.map((p, index) => ({
      id: p.node_id,         // GraphQL node_id for consistency
      number: p.number,       // REST API project number - used for detail pages
      title: p.title,
      shortDescription: p.description || undefined,
      url: p.url,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
      state: 'OPEN' as const,
      items: {
        totalCount: itemCounts[index]
      }
    }))

    // Sort by most recently updated
    transformedProjects.sort((a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )

    console.log(`Processed ${transformedProjects.length} projects (REST API)`)
    return transformedProjects

  } catch (error: unknown) {
    console.error('Error fetching GitHub Projects (REST):', error)

    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: `Failed to fetch GitHub Projects: ${error instanceof Error ? error.message : String(error)}`
    })
  }
})
