import { executeGraphQLQuery, type ProjectV2 } from '../utils/github-graphql'
import { getGitHubOwner } from '../utils/github'

interface ProjectsResponse {
  organization?: {
    projectsV2: {
      nodes: ProjectV2[]
      totalCount: number
    }
  }
  user?: {
    projectsV2: {
      nodes: ProjectV2[]
      totalCount: number
    }
  }
}

const PROJECTS_QUERY = `
  query GetProjects($owner: String!, $first: Int!) {
    organization(login: $owner) {
      projectsV2(first: $first, orderBy: {field: UPDATED_AT, direction: DESC}) {
        nodes {
          id
          number
          title
          shortDescription
          url
          public
          closed
          createdAt
          updatedAt
          views(first: 20) {
            totalCount
            nodes {
              id
              name
              number
              layout
              filter
              createdAt
              updatedAt
            }
          }
        }
        totalCount
      }
    }
  }
`

const USER_PROJECTS_QUERY = `
  query GetUserProjects($owner: String!, $first: Int!) {
    user(login: $owner) {
      projectsV2(first: $first, orderBy: {field: UPDATED_AT, direction: DESC}) {
        nodes {
          id
          number
          title
          shortDescription
          url
          public
          closed
          createdAt
          updatedAt
          views(first: 20) {
            totalCount
            nodes {
              id
              name
              number
              layout
              filter
              createdAt
              updatedAt
            }
          }
        }
        totalCount
      }
    }
  }
`

export default defineEventHandler(async (_event) => {
  try {
    const owner = getGitHubOwner()
    console.log(`Fetching GitHub ProjectsV2 for: ${owner} (GraphQL)`)

    let projects: ProjectV2[] = []

    // Try organization endpoint first
    try {
      const response = await executeGraphQLQuery<ProjectsResponse>(
        PROJECTS_QUERY,
        { owner, first: 50 }
      )

      if (response.organization?.projectsV2) {
        projects = response.organization.projectsV2.nodes
        console.log(`Found ${projects.length} projects (organization)`)
      }
    } catch (orgError) {
      console.log('Organization query failed, trying user endpoint...')

      // Fallback to user endpoint
      const response = await executeGraphQLQuery<ProjectsResponse>(
        USER_PROJECTS_QUERY,
        { owner, first: 50 }
      )

      if (response.user?.projectsV2) {
        projects = response.user.projectsV2.nodes
        console.log(`Found ${projects.length} projects (user)`)
      }
    }

    // Filter out closed projects and return
    const openProjects = projects.filter(p => !p.closed)

    return openProjects.map(project => ({
      id: project.id,
      number: project.number,
      title: project.title,
      shortDescription: project.shortDescription,
      url: project.url,
      public: project.public,
      closed: project.closed,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      viewsCount: project.views.totalCount,
      // Just include view count, not full views (fetch separately for detail)
      views: project.views.nodes.map(v => ({
        id: v.id,
        name: v.name,
        number: v.number,
        layout: v.layout
      }))
    }))

  } catch (error: unknown) {
    console.error('Error fetching ProjectsV2 (GraphQL):', error)

    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: `Failed to fetch ProjectsV2: ${error instanceof Error ? error.message : String(error)}`
    })
  }
})
