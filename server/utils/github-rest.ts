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
  content: {
    type?: 'Issue' | 'PullRequest' | 'DraftIssue'
    number?: number
    title?: string
    url?: string
    state?: string
    body?: string
    repository_url?: string
    assignees?: Array<{ login: string, avatar_url: string }>
    labels?: Array<{ name: string, color: string }>
    milestone?: { title: string }
    created_at?: string
    updated_at?: string
  }
  fields: Array<{
    id: number
    name: string
    type: string  // Note: items use 'type', fields list uses 'data_type'
    value: any
  }>
  created_at: string
  updated_at: string
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
 */
export async function fetchProjectItemsREST(projectNumber: number): Promise<RESTProjectItem[]> {
  const owner = getGitHubOwner()
  const headers = getGitHubHeaders()

  console.log(`Fetching items for project ${projectNumber} (REST API)`)

  let allItems: RESTProjectItem[] = []
  let cursor: string | null = null
  let page = 1

  do {
    const url = cursor
      ? `https://api.github.com/orgs/${owner}/projectsV2/${projectNumber}/items?per_page=100&after=${cursor}`
      : `https://api.github.com/orgs/${owner}/projectsV2/${projectNumber}/items?per_page=100`

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

    cursor = data.pagination?.next_cursor || null
    page++

    console.log(`Page ${page - 1}: fetched ${items.length} items (total: ${allItems.length})`)
  } while (cursor)

  console.log(`Total items fetched: ${allItems.length}`)
  return allItems
}

/**
 * Transform REST API project item to our internal format
 * Handles all field types including parent_issue, number (Size), etc.
 */
export function transformRESTItemToProjectItem(item: RESTProjectItem): ProjectItem {
  const customFields: Record<string, string> = {}

  // Extract ALL custom fields from the fields array
  for (const field of item.fields) {
    if (field.value === null || field.value === undefined) continue

    switch (field.type) {
      case 'number':
        // Size field and other numeric fields
        customFields[field.name] = field.value.toString()
        break

      case 'single_select':
        // Status, Priority, etc.
        if (typeof field.value === 'object' && field.value.name) {
          customFields[field.name] = field.value.name
        } else {
          customFields[field.name] = String(field.value)
        }
        break

      case 'text':
        customFields[field.name] = field.value
        break

      case 'date':
        customFields[field.name] = field.value
        break

      case 'iteration':
        if (typeof field.value === 'object' && field.value.title) {
          customFields[field.name] = field.value.title
        } else {
          customFields[field.name] = String(field.value)
        }
        break

      case 'parent_issue':
        // THE FIELD WE'VE BEEN LOOKING FOR!
        // This is the actual "Parent issue" field from Projects v2
        const parent = field.value
        if (parent && parent.number) {
          if (parent.repository) {
            customFields['Parent issue'] = `${parent.repository}#${parent.number} ${parent.title}`
          } else {
            customFields['Parent issue'] = `#${parent.number} ${parent.title}`
          }
        }
        break

      case 'milestone':
        if (typeof field.value === 'object' && field.value.title) {
          customFields[field.name] = field.value.title
        } else {
          customFields[field.name] = String(field.value)
        }
        break

      default:
        // Handle any other field types
        if (typeof field.value === 'object') {
          customFields[field.name] = JSON.stringify(field.value)
        } else {
          customFields[field.name] = String(field.value)
        }
    }
  }

  // Add milestone from content if available
  if (item.content.milestone?.title) {
    customFields['Milestone'] = item.content.milestone.title
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

  return {
    id: item.node_id,
    type: (item.content.type || 'ISSUE').toUpperCase() as 'ISSUE' | 'PULL_REQUEST' | 'DRAFT_ISSUE',
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
