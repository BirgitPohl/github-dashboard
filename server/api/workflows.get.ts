import { fetchRepositories, getGitHubHeaders, type GitHubRepository } from '../utils/github'

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

interface WorkflowRunResult {
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
}

export default defineEventHandler(async (_event) => {
  try {
    const headers = getGitHubHeaders()
    const repositories = await fetchRepositories()

    console.log(`Processing ${repositories.length} repositories for workflows`)

    if (repositories.length === 0) {
      console.log('No repositories found')
      return { workflows: [] }
    }

    const allWorkflowRuns: WorkflowRunResult[] = []

    // Process repositories in parallel, but limit concurrency
    const batchSize = 5
    for (let i = 0; i < repositories.length; i += batchSize) {
      const batch = repositories.slice(i, i + batchSize)

      await Promise.all(
        batch.map(async (repository: GitHubRepository) => {
          try {
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

    return { workflows: allWorkflowRuns }

  } catch (error: unknown) {
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to fetch workflows: ${(error instanceof Error ? error.message : String(error))}`
    })
  }
})
