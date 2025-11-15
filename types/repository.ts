export interface Repository {
  id: number
  name: string
  full_name: string
  description: string
  language: string
  is_private: boolean
  stars: number
  forks: number
  issues: number
  updated_at: string
  created_at: string
  html_url: string
  topics: string[]
  size: number
  default_branch: string
  category: string
  tech_stack: string[]
}
