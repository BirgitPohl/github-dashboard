/**
 * REST API utilities for GitHub Projects V2
 * Provides simpler, more maintainable access to GitHub Projects data
 */

import { getGitHubOwner, getGitHubHeaders } from './github'

export interface RESTProject {
  id: number
  node_id: string
  number: number // Used for REST API calls
  title: string
  description: string | null
  url: string
  created_at: string
  updated_at: string
  state: 'open' | 'closed'
  public: boolean
}

export interface RESTProjectItem {
  id: number
  node_id: string
  project_url: string
  content_type: 'Issue' | 'PullRequest' | 'DraftIssue'
  content: {
    // This is a full GitHub issue/PR object
    id?: number
    node_id?: string
    number?: number
    title?: string
    url?: string
    html_url?: string
    state?: string
    body?: string
    repository_url?: string
    assignees?: Array<{ login: string, avatar_url: string }>
    labels?: Array<{ name: string, color: string }>
    milestone?: { title: string }
    created_at?: string
    updated_at?: string
    pull_request?: any
    draft?: boolean
  }
  fields: Array<{
    id: number
    name: string
    data_type: string
    value: any
  }>
  created_at: string
  updated_at: string
  archived_at: string | null
}

export interface RESTProjectField {
  id: number
  node_id: string
  name: string
  data_type: 'text' | 'number' | 'single_select' | 'date' | 'iteration' | 'parent_issue' | 'title' | 'assignees' | string
  options?: Array<{ name: string }>
  created_at: string
  updated_at: string
}

export interface ProjectItem {
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

/**
 * Fetch all projects for the organization
 */
export async function fetchProjectsREST(): Promise<RESTProject[]> {
  const owner = getGitHubOwner()
  const headers = getGitHubHeaders()

  console.log(`Fetching GitHub Projects v2 for organization: ${owner} (REST API)`)

  const response = await fetch(
    `https://api.github.com/orgs/${owner}/projectsV2?per_page=100`,
    { headers }
  )

  if (!response.ok) {
    const errorText = await response.text()
    console.error('REST API error response:', errorText)
    throw createError({
      statusCode: response.status,
      statusMessage: `GitHub REST API error: ${response.statusText} - ${errorText}`
    })
  }

  const data = await response.json()
  const projects = data.projectsV2 || data.projects || data || []
  console.log(`Found ${projects.length} projects via REST API`)

  return projects
}

/**
 * Fetch single project details by number
 */
export async function fetchProjectREST(projectNumber: number): Promise<RESTProject> {
  const owner = getGitHubOwner()
  const headers = getGitHubHeaders()

  console.log(`Fetching project ${projectNumber} details (REST API)`)

  const response = await fetch(
    `https://api.github.com/orgs/${owner}/projectsV2/${projectNumber}`,
    { headers }
  )

  if (!response.ok) {
    const errorText = await response.text()
    console.error('REST API error response:', errorText)
    throw createError({
      statusCode: response.status,
      statusMessage: `GitHub REST API error: ${response.statusText} - ${errorText}`
    })
  }

  const project = await response.json()
  console.log(`Fetched project: ${project.title}`)

  return project
}

/**
 * Fetch all fields for a project
 */
export async function fetchProjectFieldsREST(projectNumber: number): Promise<RESTProjectField[]> {
  const owner = getGitHubOwner()
  const headers = getGitHubHeaders()

  console.log(`Fetching fields for project ${projectNumber} (REST API)`)

  const response = await fetch(
    `https://api.github.com/orgs/${owner}/projectsV2/${projectNumber}/fields`,
    { headers }
  )

  if (!response.ok) {
    const errorText = await response.text()
    console.error('REST API error response:', errorText)
    throw createError({
      statusCode: response.status,
      statusMessage: `GitHub REST API error: ${response.statusText} - ${errorText}`
    })
  }

  const data = await response.json()
  // REST API returns array directly, not { fields: [...] }
  const fields = Array.isArray(data) ? data : (data.fields || [])
  console.log(`Found ${fields.length} fields`)

  return fields
}

/**
 * Fetch all items for a specific project with pagination support
 * @param projectNumber - The project number
 * @param fieldIds - Optional array of field IDs to include in response (if not provided, only Title is returned)
 */
export async function fetchProjectItemsREST(projectNumber: number, fieldIds?: number[]): Promise<RESTProjectItem[]> {
  const owner = getGitHubOwner()
  const headers = getGitHubHeaders()

  console.log(`Fetching items for project ${projectNumber} (REST API)`)

  let allItems: RESTProjectItem[] = []
  let cursor: string | null = null
  let page = 1

  // Build fields parameter if provided
  const fieldsParam = fieldIds && fieldIds.length > 0 ? `&fields=${fieldIds.join(',')}` : ''

  do {
    const url = cursor
      ? `https://api.github.com/orgs/${owner}/projectsV2/${projectNumber}/items?per_page=100&after=${cursor}${fieldsParam}`
      : `https://api.github.com/orgs/${owner}/projectsV2/${projectNumber}/items?per_page=100${fieldsParam}`

    console.log(`Fetching page ${page} of project items...`)

    const response = await fetch(url, { headers })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('REST API error response:', errorText)
      throw createError({
        statusCode: response.status,
        statusMessage: `GitHub REST API error: ${response.statusText} - ${errorText}`
      })
    }

    const data = await response.json()
    // REST API returns array directly, not { items: [...] }
    const items = Array.isArray(data) ? data : (data.items || [])
    allItems = allItems.concat(items)

    // Parse Link header for pagination cursor
    const linkHeader = response.headers.get('Link')
    cursor = null
    if (linkHeader) {
      // Link header format: <url>; rel="next", <url>; rel="last"
      const nextMatch = linkHeader.match(/<[^>]*[?&]after=([^>&]+)[^>]*>;\s*rel="next"/)
      if (nextMatch) {
        cursor = nextMatch[1]
      }
    }

    page++

    console.log(`Page ${page - 1}: fetched ${items.length} items (total: ${allItems.length})${cursor ? ' - has more pages' : ' - final page'}`)
  } while (cursor)

  console.log(`Total items fetched: ${allItems.length}`)
  return allItems
}

/**
 * Transform REST API project item to our internal format
 * Dynamically handles all field types based on data_type
 */
let _debugLogged = false
export function transformRESTItemToProjectItem(item: RESTProjectItem): ProjectItem {
  const customFields: Record<string, string> = {}

  // Debug: log item structure for first few items
  if (!_debugLogged) {
    console.log('=== SAMPLE ITEM STRUCTURE ===')
    console.log('Content type:', item.content_type)
    console.log('Content keys:', Object.keys(item.content || {}))
    console.log('Number of fields:', item.fields.length)
    console.log('Fields:', JSON.stringify(item.fields, null, 2))
    console.log('Content sample:', JSON.stringify(item.content, null, 2).substring(0, 500))
    _debugLogged = true
  }

  // Extract ALL custom fields dynamically based on data_type
  for (const field of item.fields) {
    if (field.value === null || field.value === undefined) continue

    // Handle based on data_type (not field name!)
    switch (field.data_type) {
      case 'title':
        // Title field - extract raw text
        if (typeof field.value === 'object' && field.value.raw) {
          customFields[field.name] = field.value.raw
        }
        break

      case 'assignees':
        // Assignees field - skip, handled separately in content
        break

      case 'labels':
        // Labels field - skip, handled separately in content
        break

      case 'number':
        // Numeric fields (Size, Story Points, etc.)
        customFields[field.name] = String(field.value)
        break

      case 'single_select':
        // Single select fields (Status, Priority, etc.)
        if (typeof field.value === 'object' && field.value.name) {
          customFields[field.name] = field.value.name
        } else {
          customFields[field.name] = String(field.value)
        }
        break

      case 'text':
        // Text fields
        if (typeof field.value === 'object' && field.value.raw) {
          customFields[field.name] = field.value.raw
        } else {
          customFields[field.name] = String(field.value)
        }
        break

      case 'date':
        // Date fields
        customFields[field.name] = String(field.value)
        break

      case 'iteration':
        // Iteration/Sprint fields
        if (typeof field.value === 'object' && field.value.title) {
          customFields[field.name] = field.value.title
        } else {
          customFields[field.name] = String(field.value)
        }
        break

      case 'parent_issue':
        // Parent issue field - cross-project references
        if (typeof field.value === 'object' && field.value.number) {
          const parent = field.value
          if (parent.repository) {
            customFields[field.name] = `${parent.repository}#${parent.number} ${parent.title || ''}`
          } else {
            customFields[field.name] = `#${parent.number} ${parent.title || ''}`
          }
        }
        break

      case 'milestone':
        // Milestone fields
        if (typeof field.value === 'object' && field.value.title) {
          customFields[field.name] = field.value.title
        } else {
          customFields[field.name] = String(field.value)
        }
        break

      case 'sub_issues_progress':
        // Sub-issues progress field
        if (typeof field.value === 'object') {
          const progress = field.value
          if (progress.completed !== undefined && progress.total !== undefined) {
            customFields[field.name] = `${progress.completed}/${progress.total}`
          } else {
            customFields[field.name] = JSON.stringify(field.value)
          }
        }
        break

      case 'issue_type':
        // Issue type field
        if (typeof field.value === 'object' && field.value.name) {
          customFields[field.name] = field.value.name
        } else {
          customFields[field.name] = String(field.value)
        }
        break

      case 'repository':
        // Repository field
        if (typeof field.value === 'object' && field.value.name) {
          customFields[field.name] = field.value.name
        } else {
          customFields[field.name] = String(field.value)
        }
        break

      case 'linked_pull_requests':
      case 'reviewers':
        // Array fields - convert to count or list
        if (Array.isArray(field.value)) {
          customFields[field.name] = `${field.value.length} items`
        }
        break

      default:
        // Generic fallback for any other field types
        if (typeof field.value === 'object') {
          // Try to extract common properties
          if (field.value.name) {
            customFields[field.name] = field.value.name
          } else if (field.value.title) {
            customFields[field.name] = field.value.title
          } else if (field.value.raw) {
            customFields[field.name] = field.value.raw
          } else {
            customFields[field.name] = JSON.stringify(field.value)
          }
        } else {
          customFields[field.name] = String(field.value)
        }
    }
  }

  // Extract repository info from repository_url
  // Format: https://api.github.com/repos/{owner}/{repo}
  let repoName = 'Unknown'
  let repoOwner = 'Unknown'
  if (item.content.repository_url) {
    const match = item.content.repository_url.match(/repos\/([^\/]+)\/([^\/]+)/)
    if (match) {
      repoOwner = match[1]
      repoName = match[2]
    }
  }

  // Determine item type from content_type field
  let itemType: 'ISSUE' | 'PULL_REQUEST' | 'DRAFT_ISSUE' = 'ISSUE'
  if (item.content_type === 'PullRequest') {
    itemType = 'PULL_REQUEST'
  } else if (item.content_type === 'DraftIssue') {
    itemType = 'DRAFT_ISSUE'
  } else {
    itemType = 'ISSUE'
  }

  return {
    id: item.node_id,
    type: itemType,
    number: item.content.number,
    title: item.content.title || 'Untitled',
    url: item.content.url || '',
    state: item.content.state || 'open',
    repository: repoName,
    repository_owner: repoOwner,
    assignees: (item.content.assignees || []).map(a => ({
      login: a.login,
      avatarUrl: a.avatar_url
    })),
    labels: item.content.labels || [],
    created_at: item.content.created_at || item.created_at,
    updated_at: item.content.updated_at || item.updated_at,
    status: customFields['Status'],
    priority: customFields['Priority'],
    custom_fields: customFields // Includes Size, Parent issue, and all others!
  }
}
