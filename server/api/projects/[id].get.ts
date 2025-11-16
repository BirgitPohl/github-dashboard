import {
  fetchProjectREST,
  fetchProjectItemsREST,
  fetchProjectFieldsREST,
  transformRESTItemToProjectItem,
  type RESTProjectField
} from '../../utils/github-rest'

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
    const projectNum = parseInt(projectNumber)

    console.log(`Fetching project ${projectNum} via PURE REST API (NO GraphQL)`)

    // Fetch all data using REST API only - NO GraphQL!
    const [project, restItems, fields] = await Promise.all([
      fetchProjectREST(projectNum),           // Project metadata
      fetchProjectItemsREST(projectNum),       // All items with fields
      fetchProjectFieldsREST(projectNum)       // Project field definitions
    ])

    // Transform REST items to our internal format
    // This automatically extracts ALL custom fields: Size, Parent issue, Priority, etc.
    const items: ProjectItem[] = restItems.map(transformRESTItemToProjectItem)

    // Sort items by updated date (newest first)
    items.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())

    const projectDetails: ProjectDetails = {
      id: project.node_id,
      number: project.number,
      title: project.title,
      shortDescription: project.description,
      url: project.url,
      items,
      fields: fields.map((f: RESTProjectField) => ({
        name: f.name,
        dataType: f.data_type.toUpperCase()
      }))
    }

    console.log(`✅ SUCCESS: Fetched project "${project.title}" with ${items.length} items via PURE REST API (NO GraphQL)`)
    return projectDetails

  } catch (error: unknown) {
    console.error('Error fetching project details (REST):', error)

    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: `Failed to fetch project details: ${error instanceof Error ? error.message : String(error)}`
    })
  }
})
