export interface GitHubWorkflow {
  id: number
  name: string
  status: 'active' | 'disabled' | 'unknown'
  updated_at: string
  html_url: string
  badge_url: string
}

export interface WorkflowsResponse {
  workflows: GitHubWorkflow[]
}