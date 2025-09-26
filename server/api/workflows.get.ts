export default defineEventHandler(async (_event) => {
  const config = useRuntimeConfig()
  
  // Configuration from runtime config
  const owner = config.githubOwner || 'Oracommit'
  const token = config.githubToken // Required for private repos
  
  try {
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'GitHub-Dashboard/1.0'
    }
    
    if (token) {
      headers.Authorization = `Bearer ${token}`
      console.log('Using GitHub token for authentication')
      
      // Test token by getting authenticated user info
      try {
        const userResponse = await fetch('https://api.github.com/user', { headers })
        if (userResponse.ok) {
          const user = await userResponse.json()
          console.log(`Authenticated as: ${user.login}`)
        } else {
          console.log(`Token validation failed: ${userResponse.status}`)
        }
      } catch (err) {
        console.log(`Token validation error:`, err)
      }
    } else {
      console.log('No GitHub token provided, using unauthenticated requests')
    }

    // First, get all repositories for the owner
    console.log(`Fetching repositories for owner: ${owner}`)
    
    // Try different endpoints - first try as an organization, then as a user
    let reposResponse = await fetch(
      `https://api.github.com/orgs/${owner}/repos?type=all&per_page=100`,
      { headers }
    )

    // If organization endpoint fails, try user endpoint
    if (!reposResponse.ok) {
      console.log(`Organization endpoint failed (${reposResponse.status}), trying user endpoint...`)
      reposResponse = await fetch(
        `https://api.github.com/users/${owner}/repos?type=all&per_page=100`,
        { headers }
      )
    }

    if (!reposResponse.ok) {
      const errorText = await reposResponse.text()
      console.log(`GitHub API error response:`, errorText)
      console.log(`Response status: ${reposResponse.status}`)
      console.log(`Response headers:`, Object.fromEntries(reposResponse.headers.entries()))
      
      throw createError({
        statusCode: reposResponse.status,
        statusMessage: `GitHub API error: ${reposResponse.statusText} - ${errorText}`
      })
    }

    const repositories = await reposResponse.json()
    console.log(`Found ${repositories.length} repositories`)
    
    // Log first few repository names for debugging
    if (repositories.length > 0) {
      console.log(`First few repositories:`, repositories.slice(0, 3).map((r: Repository) => r.name))
    } else {
      console.log(`No repositories found. This could mean:`)
      console.log(`1. The owner has no repositories`)
      console.log(`2. All repositories are private and token lacks permissions`)
      console.log(`3. The owner name is incorrect`)
      console.log(`4. Rate limit exceeded`)
    }

    interface Repository {
      name: string
      full_name: string
      private: boolean
      archived: boolean
    }

    interface Workflow {
      id: number
      name: string
      state?: string
      updated_at: string
      html_url: string
      path: string
    }

    interface WorkflowRun {
      id: number
      status: string
      conclusion: string | null
      head_branch: string
      updated_at: string
      html_url: string
      run_number: number
      event: string
    }

    // For each repository, get workflows and their runs
    const allWorkflowRuns: Array<{
      id: string
      workflow_id: number
      name: string
      repository: string
      branch: string
      state: string
      status: string
      updated_at: string
      html_url: string
      workflow_url: string
      badge_url: string
      run_number: number
      event: string
      is_private: boolean
    }> = []

    // Process repositories in parallel, but limit concurrency
    const batchSize = 5
    for (let i = 0; i < repositories.length; i += batchSize) {
      const batch = repositories.slice(i, i + batchSize)
      
      await Promise.all(
        batch.map(async (repository: Repository) => {
          try {
            // Skip archived repositories
            if (repository.archived) {
              console.log(`Skipping archived repository: ${repository.name}`)
              return
            }

            console.log(`Fetching workflows for repository: ${repository.name}`)
            
            // Get workflows for this repository
            const workflowsResponse = await fetch(
              `https://api.github.com/repos/${repository.full_name}/actions/workflows`,
              { headers }
            )

            if (!workflowsResponse.ok) {
              console.log(`No workflows found for ${repository.name}: ${workflowsResponse.status}`)
              return
            }

            const workflowsData = await workflowsResponse.json()
            const workflows = workflowsData.workflows || []

            if (workflows.length === 0) {
              return
            }

            console.log(`Found ${workflows.length} workflows in ${repository.name}`)

            // For each workflow, get recent runs
            await Promise.all(
              workflows.map(async (workflow: Workflow) => {
                try {
                  const runsResponse = await fetch(
                    `https://api.github.com/repos/${repository.full_name}/actions/workflows/${workflow.id}/runs?per_page=10`,
                    { headers }
                  )
                  
                  if (runsResponse.ok) {
                    const runsData = await runsResponse.json()
                    const runs = runsData.workflow_runs || []
                    
                    // Group runs by branch and get the latest run for each branch
                    const runsByBranch = new Map<string, WorkflowRun>()
                    
                    for (const run of runs) {
                      const branch = run.head_branch
                      if (branch && (!runsByBranch.has(branch) || 
                          new Date(run.updated_at) > new Date(runsByBranch.get(branch)!.updated_at))) {
                        runsByBranch.set(branch, run)
                      }
                    }
                    
                    // Create a workflow entry for each branch
                    for (const [branch, run] of runsByBranch) {
                      allWorkflowRuns.push({
                        id: `${repository.name}-${workflow.id}-${branch}`,
                        workflow_id: workflow.id,
                        name: workflow.name,
                        repository: repository.name,
                        branch: branch,
                        state: workflow.state || 'unknown',
                        status: run.conclusion || run.status || workflow.state || 'unknown',
                        updated_at: run.updated_at,
                        html_url: run.html_url,
                        workflow_url: workflow.html_url,
                        badge_url: `https://github.com/${repository.full_name}/actions/workflows/${workflow.path.replace('.github/workflows/', '')}/badge.svg?branch=${branch}`,
                        run_number: run.run_number,
                        event: run.event,
                        is_private: repository.private
                      })
                    }
                  }
                } catch (err) {
                  console.log(`Error fetching runs for workflow ${workflow.id} in ${repository.name}:`, err)
                }
              })
            )
          } catch (err) {
            console.log(`Error processing repository ${repository.name}:`, err)
          }
        })
      )
    }

    // Sort by updated_at (newest first)
    allWorkflowRuns.sort((a, b) => {
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    })

    console.log(`Total workflow runs found: ${allWorkflowRuns.length}`)
    
    // If no workflows found, try fallback to a specific known repository
    if (allWorkflowRuns.length === 0) {
      console.log(`No workflows found from repository scan, trying fallback to avatar-emma...`)
      try {
        const fallbackResponse = await fetch(
          `https://api.github.com/repos/${owner}/avatar-emma/actions/workflows`,
          { headers }
        )
        
        if (fallbackResponse.ok) {
          console.log(`Fallback repository accessible, but no workflows returned from scan`)
        } else {
          console.log(`Fallback repository not accessible: ${fallbackResponse.status}`)
        }
      } catch (err) {
        console.log(`Fallback test failed:`, err)
      }
    }
    
    return { workflows: allWorkflowRuns }
    
  } catch (error: unknown) {
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to fetch workflows: ${(error instanceof Error ? error.message : String(error))}`
    })
  }
})