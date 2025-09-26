interface GitHubProject {
  id: string
  title: string
  shortDescription: string | null
  url: string
  createdAt: string
  updatedAt: string
  closed: boolean
  items?: {
    totalCount: number
  }
}

interface Project {
  id: string
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
  const config = useRuntimeConfig()
  
  // Configuration from runtime config
  const owner = config.githubOwner || 'Oracommit'
  const token = config.githubToken
  
  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: 'GitHub token is required to fetch projects'
    })
  }

  try {
    console.log(`Fetching GitHub Projects for organization: ${owner}`)

    // GraphQL query for GitHub Projects v2
    const query = `
      query($owner: String!) {
        organization(login: $owner) {
          projectsV2(first: 20) {
            nodes {
              id
              title
              shortDescription
              url
              createdAt
              updatedAt
              closed
              items {
                totalCount
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
        variables: { owner }
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
      
      // Check if it's a scope issue
      const scopeError = data.errors.find((error: { type?: string }) => error.type === 'INSUFFICIENT_SCOPES')
      if (scopeError) {
        throw createError({
          statusCode: 403,
          statusMessage: 'GitHub token missing required scopes. Please add "read:project" scope to your token at https://github.com/settings/tokens'
        })
      }
      
      throw createError({
        statusCode: 400,
        statusMessage: `GraphQL error: ${data.errors.map((e: { message?: string }) => e.message || 'Unknown error').join(', ')}`
      })
    }

    const githubProjects = data.data?.organization?.projectsV2?.nodes || []
    console.log(`Found ${githubProjects.length} GitHub Projects`)

    // Transform GitHub Projects to our format
    const projects: Project[] = githubProjects
      .filter((project: GitHubProject) => !project.closed) // Filter out closed projects
      .map((project: GitHubProject) => ({
        id: project.id,
        title: project.title,
        shortDescription: project.shortDescription || undefined,
        url: project.url,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
        state: project.closed ? 'CLOSED' : 'OPEN',
        items: {
          totalCount: project.items?.totalCount || 0
        }
      }))

    // Sort by most recently updated
    projects.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

    console.log(`Processed ${projects.length} projects`)
    return projects
    
  } catch (error: unknown) {
    console.error('Error fetching GitHub Projects:', error)
    
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error // Re-throw createError errors
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to fetch GitHub Projects: ${error instanceof Error ? error.message : String(error)}`
    })
  }
})