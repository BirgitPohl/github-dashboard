interface GitHubProjectItem {
  id: string
  type: string
  content?: {
    __typename: string
    id: string
    number?: number
    title: string
    url: string
    state: string
    milestone?: {
      title: string
    }
    trackedInIssues?: {
      nodes: Array<{
        title: string
        number: number
        url: string
      }>
    }
    trackedIssues?: {
      nodes: Array<{
        title: string
        number: number
        url: string
      }>
    }
    repository: {
      name: string
      owner: {
        login: string
      }
    }
    assignees?: {
      nodes: Array<{
        login: string
        avatarUrl: string
      }>
    }
    labels?: {
      nodes: Array<{
        name: string
        color: string
      }>
    }
    createdAt: string
    updatedAt: string
  }
  fieldValues?: {
    nodes: Array<{
      __typename: string
      field: {
        name: string
      }
      text?: string
      name?: string
      date?: string
      number?: number
      title?: string
      startDate?: string
      duration?: number
    }>
  }
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

interface ProjectViewItems {
  view: {
    id: string
    name: string
    layout: string
    groupByFields?: string[]
    sortByFields?: Array<{
      fieldName: string
      direction: 'ASC' | 'DESC'
    }>
    filter?: string
  }
  items: ProjectItem[]
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const projectId = getRouterParam(event, 'id')
  const viewId = getRouterParam(event, 'viewId')
  
  if (!projectId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Project ID is required'
    })
  }

  if (!viewId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'View ID is required'
    })
  }

  const token = config.githubToken
  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: 'GitHub token is required to fetch view items'
    })
  }

  try {
    console.log(`Fetching view items for project ID: ${projectId}, view ID: ${viewId}`)

    // Since GitHub's ProjectV2 API doesn't support filtering items by view directly,
    // we'll fetch all project items and apply view-specific filtering on the server side
    const query = `
      query($projectId: ID!) {
        node(id: $projectId) {
          ... on ProjectV2 {
            id
            title
            items(first: 100) {
              nodes {
                id
                type
                content {
                  __typename
                  ... on Issue {
                    id
                    number
                    title
                    url
                    state
                    milestone {
                      title
                    }
                    trackedInIssues(first: 5) {
                      nodes {
                        title
                        number
                        url
                      }
                    }
                    trackedIssues(first: 5) {
                      nodes {
                        title
                        number
                        url
                      }
                    }
                    repository {
                      name
                      owner {
                        login
                      }
                    }
                    assignees(first: 10) {
                      nodes {
                        login
                        avatarUrl
                      }
                    }
                    labels(first: 10) {
                      nodes {
                        name
                        color
                      }
                    }
                    createdAt
                    updatedAt
                  }
                  ... on PullRequest {
                    id
                    number
                    title
                    url
                    state
                    milestone {
                      title
                    }
                    repository {
                      name
                      owner {
                        login
                      }
                    }
                    assignees(first: 10) {
                      nodes {
                        login
                        avatarUrl
                      }
                    }
                    labels(first: 10) {
                      nodes {
                        name
                        color
                      }
                    }
                    createdAt
                    updatedAt
                  }
                  ... on DraftIssue {
                    id
                    title
                    createdAt
                    updatedAt
                  }
                }
                fieldValues(first: 20) {
                  nodes {
                    __typename
                    ... on ProjectV2ItemFieldTextValue {
                      field {
                        ... on ProjectV2Field {
                          name
                        }
                      }
                      text
                    }
                    ... on ProjectV2ItemFieldSingleSelectValue {
                      field {
                        ... on ProjectV2SingleSelectField {
                          name
                        }
                      }
                      name
                    }
                    ... on ProjectV2ItemFieldDateValue {
                      field {
                        ... on ProjectV2Field {
                          name
                        }
                      }
                      date
                    }
                    ... on ProjectV2ItemFieldNumberValue {
                      field {
                        ... on ProjectV2Field {
                          name
                        }
                      }
                      number
                    }
                    ... on ProjectV2ItemFieldIterationValue {
                      field {
                        ... on ProjectV2IterationField {
                          name
                        }
                      }
                      title
                      startDate
                      duration
                    }
                    ... on ProjectV2ItemFieldRepositoryValue {
                      field {
                        ... on ProjectV2Field {
                          name
                        }
                      }
                      repository {
                        name
                        owner {
                          login
                        }
                      }
                    }
                    ... on ProjectV2ItemFieldPullRequestValue {
                      field {
                        ... on ProjectV2Field {
                          name
                        }
                      }
                      pullRequests(first: 5) {
                        nodes {
                          number
                          title
                          url
                        }
                      }
                    }

                  }
                }
              }
            }
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
                      id
                      name
                    }
                    ... on ProjectV2SingleSelectField {
                      id
                      name
                    }
                  }
                }
                sortByFields(first: 10) {
                  nodes {
                    field {
                      ... on ProjectV2Field {
                        id
                        name
                      }
                      ... on ProjectV2SingleSelectField {
                        id
                        name
                      }
                    }
                    direction
                  }
                }
              }
            }
          }
        }
      }
    `

    const response = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-GitHub-Api-Version': '2022-11-28'
      },
      body: JSON.stringify({
        query,
        variables: { projectId }
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.log(`GitHub GraphQL API error response:`, errorText)
      throw createError({
        statusCode: response.status,
        statusMessage: `GitHub GraphQL API error: ${response.statusText} - ${errorText}`
      })
    }

    const data = await response.json()
    
    // Check for GraphQL errors
    if (data.errors) {
      console.log('GraphQL errors:', data.errors)
      throw createError({
        statusCode: 400,
        statusMessage: `GraphQL error: ${data.errors.map((e: { message?: string }) => e.message || 'Unknown error').join(', ')}`
      })
    }

    const project = data.data?.node
    if (!project) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Project not found'
      })
    }

    // Find the specific view
    const view = project.views?.nodes?.find((v: { id: string }) => v.id === viewId)
    if (!view) {
      throw createError({
        statusCode: 404,
        statusMessage: 'View not found'
      })
    }

    // Transform project items (since GitHub API doesn't support view-specific filtering)
    // We return all items and let the client handle view-specific filtering if needed
    const items: ProjectItem[] = project.items.nodes
      .filter((item: GitHubProjectItem) => item.content) // Filter out items without content
      .map((item: GitHubProjectItem): ProjectItem => {
        const content = item.content!
        
        // Extract custom field values
        const customFields: Record<string, string> = {}
        
        // Add built-in GitHub fields that might be used for grouping
        if (content.milestone?.title) {
          customFields['Milestone'] = content.milestone.title
        }
        
        // Add parent issue information
        // trackedInIssues = issues that track this issue (parents)
        if (content.trackedInIssues?.nodes && content.trackedInIssues.nodes.length > 0) {
          const parentIssue = content.trackedInIssues.nodes[0]
          customFields['Parent issue'] = `#${parentIssue.number} ${parentIssue.title}`
        }
        
        // Also add child issues information if needed
        if (content.trackedIssues?.nodes && content.trackedIssues.nodes.length > 0) {
          const childCount = content.trackedIssues.nodes.length
          customFields['Child issues'] = `${childCount} child issue${childCount > 1 ? 's' : ''}`
        }
        
        // Debug: Log issue relationships for debugging
        if (content.number && (content.trackedInIssues?.nodes?.length || content.trackedIssues?.nodes?.length)) {
          console.log(`Issue #${content.number}: trackedInIssues=${content.trackedInIssues?.nodes?.length || 0}, trackedIssues=${content.trackedIssues?.nodes?.length || 0}`)
        }
        
        // Extract project-specific custom field values
        if (item.fieldValues?.nodes) {
          for (const fieldValue of item.fieldValues.nodes) {
            if (fieldValue?.field?.name) {
              const fieldName = fieldValue.field.name
              let value = ''
              
              // Handle different field value types based on __typename
              switch (fieldValue.__typename) {
                case 'ProjectV2ItemFieldTextValue':
                  value = fieldValue.text || ''
                  break
                case 'ProjectV2ItemFieldSingleSelectValue':
                  value = fieldValue.name || ''
                  break
                case 'ProjectV2ItemFieldDateValue':
                  value = fieldValue.date || ''
                  break
                case 'ProjectV2ItemFieldNumberValue':
                  value = fieldValue.number?.toString() || ''
                  break
                case 'ProjectV2ItemFieldIterationValue':
                  value = fieldValue.title || ''
                  break
                case 'ProjectV2ItemFieldRepositoryValue': {
                  const repoField = fieldValue as { repository?: { owner: { login: string }, name: string } }
                  value = repoField.repository ? `${repoField.repository.owner.login}/${repoField.repository.name}` : ''
                  break
                }
                case 'ProjectV2ItemFieldPullRequestValue': {
                  const prField = fieldValue as { pullRequests?: { nodes: Array<{ number: number, title: string }> } }
                  if (prField.pullRequests?.nodes && prField.pullRequests.nodes.length > 0) {
                    const pr = prField.pullRequests.nodes[0]
                    value = `#${pr.number} ${pr.title}`
                  }
                  break
                }
                default:
                  // Fallback to the old logic for any other field types
                  value = fieldValue.text || fieldValue.name || fieldValue.date || fieldValue.number?.toString() || fieldValue.title || ''
                  break
              }
              
              if (value) {
                customFields[fieldName] = value
              }
            }
          }
        }

        return {
          id: item.id,
          type: item.type as 'ISSUE' | 'PULL_REQUEST' | 'DRAFT_ISSUE',
          number: content.number,
          title: content.title,
          url: content.url || '#',
          state: content.state || 'open',
          repository: content.repository?.name || 'Unknown',
          repository_owner: content.repository?.owner?.login || 'Unknown',
          assignees: content.assignees?.nodes || [],
          labels: content.labels?.nodes || [],
          created_at: content.createdAt,
          updated_at: content.updatedAt,
          status: customFields['Status'] || customFields['status'],
          priority: customFields['Priority'] || customFields['priority'],
          custom_fields: customFields
        }
      })

    // Sort items by updated date (newest first)
    items.sort((a: ProjectItem, b: ProjectItem) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())

    const viewItems: ProjectViewItems = {
      view: {
        id: view.id,
        name: view.name,
        layout: view.layout,
        groupByFields: view.groupByFields?.nodes?.map((field: { name: string }) => field.name) || [],
        sortByFields: view.sortByFields?.nodes?.map((sortField: { field: { name: string }; direction: string }) => ({
          fieldName: sortField.field.name,
          direction: sortField.direction as 'ASC' | 'DESC'
        })) || [],
        filter: view.filter
      },
      items
    }

    console.log(`Processed ${items.length} items for view: ${view.name}`)
    return viewItems
    
  } catch (error: unknown) {
    console.error('Error fetching view items:', error)
    
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error // Re-throw createError errors
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to fetch view items: ${error instanceof Error ? error.message : String(error)}`
    })
  }
})