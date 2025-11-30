import { executeGraphQLQuery, type ProjectV2Item } from '../../../utils/github-graphql'

interface ProjectItemsResponse {
  node: {
    id: string
    items: {
      nodes: ProjectV2Item[]
      pageInfo: {
        hasNextPage: boolean
        endCursor: string | null
      }
      totalCount: number
    }
  }
}

const PROJECT_ITEMS_QUERY = `
  query GetProjectItems($projectId: ID!, $first: Int!, $after: String) {
    node(id: $projectId) {
      ... on ProjectV2 {
        id
        items(first: $first, after: $after) {
          totalCount
          pageInfo {
            hasNextPage
            endCursor
          }
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
                closed
                repository {
                  name
                  url
                }
                assignees(first: 10) {
                  nodes {
                    login
                    avatarUrl
                  }
                }
                labels(first: 20) {
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
                closed
                merged
                repository {
                  name
                  url
                }
                assignees(first: 10) {
                  nodes {
                    login
                    avatarUrl
                  }
                }
                labels(first: 20) {
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
            fieldValues(first: 50) {
              nodes {
                ... on ProjectV2ItemFieldTextValue {
                  text
                  field {
                    ... on ProjectV2Field {
                      id
                      name
                    }
                  }
                }
                ... on ProjectV2ItemFieldNumberValue {
                  number
                  field {
                    ... on ProjectV2Field {
                      id
                      name
                    }
                  }
                }
                ... on ProjectV2ItemFieldDateValue {
                  date
                  field {
                    ... on ProjectV2Field {
                      id
                      name
                    }
                  }
                }
                ... on ProjectV2ItemFieldSingleSelectValue {
                  name
                  optionId
                  field {
                    ... on ProjectV2SingleSelectField {
                      id
                      name
                    }
                  }
                }
                ... on ProjectV2ItemFieldIterationValue {
                  title
                  duration
                  startDate
                  field {
                    ... on ProjectV2IterationField {
                      id
                      name
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`

/**
 * Fetch all items for a project (with pagination)
 */
async function fetchAllProjectItems(projectId: string): Promise<ProjectV2Item[]> {
  const allItems: ProjectV2Item[] = []
  let hasNextPage = true
  let after: string | null = null

  while (hasNextPage) {
    const response = await executeGraphQLQuery<ProjectItemsResponse>(
      PROJECT_ITEMS_QUERY,
      { projectId, first: 100, after }
    )

    const { nodes, pageInfo } = response.node.items
    allItems.push(...nodes)

    hasNextPage = pageInfo.hasNextPage
    after = pageInfo.endCursor

    console.log(`Fetched ${nodes.length} items (total: ${allItems.length})`)
  }

  return allItems
}

export default defineEventHandler(async (event) => {
  try {
    const projectId = getRouterParam(event, 'projectId')

    if (!projectId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Project ID is required'
      })
    }

    console.log(`Fetching items for ProjectV2: ${projectId}`)

    const items = await fetchAllProjectItems(projectId)

    console.log(`Successfully fetched ${items.length} items`)

    // Transform items to simpler format
    return items.map(item => {
      // Build custom fields object from fieldValues
      const customFields: Record<string, unknown> = {}

      for (const fieldValue of item.fieldValues.nodes) {
        if (!fieldValue.field) continue

        const fieldName = fieldValue.field.name

        // Extract value based on type
        if ('text' in fieldValue && fieldValue.text !== undefined) {
          customFields[fieldName] = fieldValue.text
        } else if ('number' in fieldValue && fieldValue.number !== undefined) {
          customFields[fieldName] = fieldValue.number
        } else if ('date' in fieldValue && fieldValue.date !== undefined) {
          customFields[fieldName] = fieldValue.date
        } else if ('name' in fieldValue && fieldValue.name !== undefined) {
          customFields[fieldName] = fieldValue.name
        } else if ('title' in fieldValue && fieldValue.title !== undefined) {
          customFields[fieldName] = {
            title: fieldValue.title,
            startDate: fieldValue.startDate,
            duration: fieldValue.duration
          }
        }
      }

      return {
        id: item.id,
        type: item.type,
        content: item.content,
        customFields
      }
    })

  } catch (error: unknown) {
    console.error('Error fetching ProjectV2 items:', error)

    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: `Failed to fetch project items: ${error instanceof Error ? error.message : String(error)}`
    })
  }
})
