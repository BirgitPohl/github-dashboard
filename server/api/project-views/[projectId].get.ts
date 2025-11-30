import { executeGraphQLQuery, type ProjectV2 } from '../../utils/github-graphql'

interface ProjectDetailResponse {
  node: ProjectV2
}

const PROJECT_DETAIL_QUERY = `
  query GetProjectDetail($projectId: ID!) {
    node(id: $projectId) {
      ... on ProjectV2 {
        id
        number
        title
        shortDescription
        url
        public
        closed
        createdAt
        updatedAt
        views(first: 50) {
          totalCount
          nodes {
            id
            name
            number
            layout
            filter
            createdAt
            updatedAt
            sortByFields(first: 10) {
              nodes {
                direction
                field {
                  ... on ProjectV2FieldConfiguration {
                    field {
                      __typename
                      ... on ProjectV2Field {
                        id
                        name
                        dataType
                      }
                      ... on ProjectV2SingleSelectField {
                        id
                        name
                        dataType
                      }
                      ... on ProjectV2IterationField {
                        id
                        name
                        dataType
                      }
                    }
                  }
                }
              }
            }
            groupByFields(first: 10) {
              nodes {
                ... on ProjectV2FieldConfiguration {
                  field {
                    __typename
                    ... on ProjectV2Field {
                      id
                      name
                      dataType
                    }
                    ... on ProjectV2SingleSelectField {
                      id
                      name
                      dataType
                    }
                    ... on ProjectV2IterationField {
                      id
                      name
                      dataType
                    }
                  }
                }
              }
            }
            fields(first: 50) {
              nodes {
                ... on ProjectV2FieldConfiguration {
                  field {
                    __typename
                    ... on ProjectV2Field {
                      id
                      name
                      dataType
                    }
                    ... on ProjectV2SingleSelectField {
                      id
                      name
                      dataType
                      options {
                        id
                        name
                        color
                      }
                    }
                    ... on ProjectV2IterationField {
                      id
                      name
                      dataType
                      configuration {
                        duration
                        startDay
                        iterations {
                          id
                          title
                          startDate
                          duration
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
    }
  }
`

export default defineEventHandler(async (event) => {
  try {
    const projectId = getRouterParam(event, 'projectId')

    if (!projectId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Project ID is required'
      })
    }

    console.log(`Fetching ProjectV2 detail for: ${projectId}`)

    const response = await executeGraphQLQuery<ProjectDetailResponse>(
      PROJECT_DETAIL_QUERY,
      { projectId }
    )

    if (!response.node) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Project not found'
      })
    }

    const project = response.node

    return {
      id: project.id,
      number: project.number,
      title: project.title,
      shortDescription: project.shortDescription,
      url: project.url,
      public: project.public,
      closed: project.closed,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      views: project.views.nodes
    }

  } catch (error: unknown) {
    console.error('Error fetching ProjectV2 detail:', error)

    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: `Failed to fetch project detail: ${error instanceof Error ? error.message : String(error)}`
    })
  }
})
