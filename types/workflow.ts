export interface Workflow {
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

export interface WorkflowsResponse {
  workflows: Workflow[]
}
