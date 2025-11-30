/**
 * GraphQL API utilities for GitHub Projects V2
 * Provides access to Projects V2 views, configurations, and items
 */

import { getGitHubHeaders } from './github'

export interface GraphQLResponse<T> {
  data?: T
  errors?: Array<{
    message: string
    locations?: Array<{ line: number; column: number }>
    path?: string[]
  }>
}

/**
 * Get headers for GraphQL API requests
 * Uses standard GitHub token but with GraphQL-specific Accept header
 */
export function getGraphQLHeaders(): Record<string, string> {
  const headers = getGitHubHeaders()
  // GraphQL doesn't need the v3 accept header
  delete headers.Accept
  headers['Content-Type'] = 'application/json'
  return headers
}

/**
 * Execute a GraphQL query against GitHub's API
 */
export async function executeGraphQLQuery<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const headers = getGraphQLHeaders()

  const response = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      query,
      variables: variables || {}
    })
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw createError({
      statusCode: response.status,
      statusMessage: `GraphQL API error: ${response.statusText} - ${errorText}`
    })
  }

  const result: GraphQLResponse<T> = await response.json()

  if (result.errors && result.errors.length > 0) {
    const errorMessages = result.errors.map(e => e.message).join(', ')
    throw createError({
      statusCode: 500,
      statusMessage: `GraphQL errors: ${errorMessages}`
    })
  }

  if (!result.data) {
    throw createError({
      statusCode: 500,
      statusMessage: 'GraphQL response contained no data'
    })
  }

  return result.data
}

// Type definitions for GraphQL responses

export interface ProjectV2FieldConfiguration {
  field: {
    __typename: string
    id: string
    name: string
    dataType?: string
  }
}

export interface SortByField {
  direction: 'ASC' | 'DESC'
  field: ProjectV2FieldConfiguration
}

export interface ProjectV2View {
  id: string
  name: string
  number: number
  layout: 'TABLE_LAYOUT' | 'BOARD_LAYOUT' | 'ROADMAP_LAYOUT'
  filter: string | null
  sortByFields: {
    nodes: SortByField[]
  }
  groupByFields: {
    nodes: ProjectV2FieldConfiguration[]
  }
  fields: {
    nodes: ProjectV2FieldConfiguration[]
  }
  createdAt: string
  updatedAt: string
}

export interface ProjectV2 {
  id: string
  number: number
  title: string
  shortDescription: string | null
  url: string
  public: boolean
  closed: boolean
  createdAt: string
  updatedAt: string
  views: {
    nodes: ProjectV2View[]
    totalCount: number
  }
}

export interface ProjectV2ItemFieldValue {
  __typename: string
  // Text field
  text?: string
  // Number field
  number?: number
  // Date field
  date?: string
  // Single select field
  name?: string
  optionId?: string
  // Iteration field
  title?: string
  duration?: number
  startDate?: string
}

export interface ProjectV2Item {
  id: string
  type: string
  content?: {
    __typename: 'Issue' | 'PullRequest' | 'DraftIssue'
    id?: string
    number?: number
    title?: string
    url?: string
    state?: string
    closed?: boolean
    repository?: {
      name: string
      url: string
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
    createdAt?: string
    updatedAt?: string
  }
  fieldValues: {
    nodes: Array<{
      field?: {
        __typename: string
        name: string
        id: string
      }
    } & ProjectV2ItemFieldValue>
  }
}
