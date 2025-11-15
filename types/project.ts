export interface Project {
  id: string
  title: string
  description: string
  url: string
  created_at: string
  updated_at: string
  status: 'open' | 'closed'
  items_count: number
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

export interface ProjectView {
  id: string
  name: string
  number: number
  layout: 'TABLE_LAYOUT' | 'BOARD_LAYOUT' | 'ROADMAP_LAYOUT'
  filter?: string
  groupByFields?: string[]
  sortByFields?: Array<{
    fieldName: string
    direction: 'ASC' | 'DESC'
  }>
  createdAt: string
  updatedAt: string
}

export interface ProjectDetails {
  id: string
  title: string
  shortDescription: string | null
  url: string
  views: ProjectView[]
  items: ProjectItem[]
  fields: Array<{
    name: string
    dataType: string
  }>
}

export interface ViewData {
  view: {
    id: string
    name: string
    layout: string
    groupByFields?: string[]
    sortByFields?: Array<{
      fieldName: string
      direction: 'ASC' | 'DESC'
    }>
    filter?: string
  }
  items: ProjectItem[]
}
