import { fetchProjectItemsREST, transformRESTItemToProjectItem } from '../../utils/github-rest'
import { executeGraphQL } from '../../utils/github'

interface ProjectView {
  id: string
  name: string
  number: number
  layout: 'TABLE_LAYOUT' | 'BOARD_LAYOUT' | 'ROADMAP_LAYOUT'
  filter?: string
  groupByFields?: string[]
  sortByFields?: Array<{
    fieldName: string
    direction: 'ASC' | 'DESC'
  }>
  createdAt: string
  updatedAt: string
}

interface ProjectItem {
  id: string
  type: 'ISSUE' | 'PULL_REQUEST' | 'DRAFT_ISSUE'
  number?: number
  title: string
  url: string
  state: string
  repository: string
  repository_owner: string
  assignees: Array<{
    login: string
    avatarUrl: string
  }>
  labels: Array<{
    name: string
    color: string
  }>
  created_at: string
  updated_at: string
  status?: string
  priority?: string
  custom_fields: Record<string, string>
}

interface ProjectDetails {
  id: string
  number: number
  title: string
  shortDescription: string | null
  url: string
  views: ProjectView[]
  items: ProjectItem[]
  fields: Array<{
    name: string
    dataType: string
  }>
}

export default defineEventHandler(async (event) => {
  const projectNumber = getRouterParam(event, 'id')

  if (!projectNumber) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Project number is required'
    })
  }

  try {
    console.log(`Fetching project details for project number: ${projectNumber} (REST API)`)

    // Fetch project items using REST API
    const restItems = await fetchProjectItemsREST(parseInt(projectNumber))

    // Transform REST items to our format
    // This automatically extracts ALL custom fields including Size, Parent issue, etc.
    const items: ProjectItem[] = restItems.map(transformRESTItemToProjectItem)

    // Sort items by updated date (newest first)
    items.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())

    // Extract unique field names from all items
    const fieldNames = new Set<string>()
    items.forEach(item => {
      Object.keys(item.custom_fields).forEach(key => fieldNames.add(key))
    })

    // Fetch views using minimal GraphQL query (only view metadata, not items)
    // We only use GraphQL for views because REST API doesn't provide this
    let views: ProjectView[] = []
    try {
      const viewsQuery = `
        query($projectNumber: Int!) {
          organization(login: "Oracommit") {
            projectV2(number: $projectNumber) {
              id
              title
              shortDescription
              url
              views(first: 10) {
                nodes {
                  id
                  name
                  number
                  layout
                  filter
                  groupByFields(first: 10) {
                    nodes {
                      ... on ProjectV2Field {
                        name
                      }
                      ... on ProjectV2SingleSelectField {
                        name
                      }
                    }
                  }
                  sortByFields(first: 10) {
                    nodes {
                      field {
                        ... on ProjectV2Field {
                          name
                        }
                        ... on ProjectV2SingleSelectField {
                          name
                        }
                      }
                      direction
                    }
                  }
                  createdAt
                  updatedAt
                }
              }
            }
          }
        }
      `

      const viewsData = await executeGraphQL<{
        organization: {
          projectV2: {
            id: string
            title: string
            shortDescription: string | null
            url: string
            views: {
              nodes: Array<{
                id: string
                name: string
                number: number
                layout: string
                filter?: string
                groupByFields?: { nodes: Array<{ name: string }> }
                sortByFields?: { nodes: Array<{ field: { name: string }, direction: string }> }
                createdAt: string
                updatedAt: string
              }>
            }
          }
        }
      }>(viewsQuery, { projectNumber: parseInt(projectNumber) })

      const project = viewsData.organization?.projectV2
      if (project) {
        views = project.views?.nodes?.map(view => ({
          id: view.id,
          name: view.name,
          number: view.number,
          layout: view.layout as 'TABLE_LAYOUT' | 'BOARD_LAYOUT' | 'ROADMAP_LAYOUT',
          filter: view.filter,
          groupByFields: view.groupByFields?.nodes?.map(field => field.name) || [],
          sortByFields: view.sortByFields?.nodes?.map(sortField => ({
            fieldName: sortField.field.name,
            direction: sortField.direction as 'ASC' | 'DESC'
          })) || [],
          createdAt: view.createdAt,
          updatedAt: view.updatedAt
        })) || []

        const projectDetails: ProjectDetails = {
          id: project.id,
          number: parseInt(projectNumber),
          title: project.title,
          shortDescription: project.shortDescription,
          url: project.url,
          views,
          items,
          fields: Array.from(fieldNames).map(name => ({
            name,
            dataType: 'TEXT'
          }))
        }

        console.log(`Processed ${items.length} items for project: ${project.title} (REST + GraphQL views)`)
        return projectDetails
      }
    } catch (viewsError) {
      console.warn('Failed to fetch views via GraphQL, continuing without views:', viewsError)
    }

    // Fallback if GraphQL fails: return data without views
    const projectDetails: ProjectDetails = {
      id: projectNumber,
      number: parseInt(projectNumber),
      title: `Project ${projectNumber}`,
      shortDescription: null,
      url: '',
      views: [],
      items,
      fields: Array.from(fieldNames).map(name => ({
        name,
        dataType: 'TEXT'
      }))
    }

    console.log(`Processed ${items.length} items for project ${projectNumber} (REST API only)`)
    return projectDetails

  } catch (error: unknown) {
    console.error('Error fetching project details:', error)

    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: `Failed to fetch project details: ${error instanceof Error ? error.message : String(error)}`
    })
  }
})
