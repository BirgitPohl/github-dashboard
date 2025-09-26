/**
 * Composable for handling project item filtering
 */

interface ProjectItem {
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

interface FilterOptions {
  search: string
  state: string
  type: string
  status: string
  assignee: string
  repository: string
}

interface SelectOption {
  value: string
  label: string
}

export const useProjectFilters = () => {
  /**
   * Create filter options from items
   */
  const createFilterOptions = (items: ProjectItem[]) => {
    const stateOptions = computed((): SelectOption[] => {
      if (!items.length) return []
      const states = [...new Set(items.map(item => item.state))]
      return [
        { value: 'all', label: 'All States' },
        ...states.map(state => ({ value: state, label: state }))
      ]
    })

    const typeOptions: SelectOption[] = [
      { value: 'all', label: 'All Types' },
      { value: 'ISSUE', label: 'Issues' },
      { value: 'PULL_REQUEST', label: 'Pull Requests' },
      { value: 'DRAFT_ISSUE', label: 'Draft Issues' }
    ]

    const statusOptions = computed((): SelectOption[] => {
      if (!items.length) return []
      const statuses = [...new Set(items.map(item => item.status).filter(Boolean))]
      return [
        { value: 'all', label: 'All Statuses' },
        ...statuses.map(status => ({ value: status!, label: status! }))
      ]
    })

    const repositoryOptions = computed((): SelectOption[] => {
      if (!items.length) return []
      const repositories = [...new Set(items.map(item => `${item.repository_owner}/${item.repository}`))]
      return [
        { value: 'all', label: 'All Repositories' },
        ...repositories.map(repo => ({ value: repo, label: repo }))
      ]
    })

    const assigneeOptions = computed((): SelectOption[] => {
      if (!items.length) return []
      const assignees = new Set<string>()
      for (const item of items) {
        for (const assignee of item.assignees) {
          assignees.add(assignee.login)
        }
      }
      return [
        { value: 'all', label: 'All Assignees' },
        ...Array.from(assignees).map(assignee => ({ value: assignee, label: assignee }))
      ]
    })

    return {
      stateOptions,
      typeOptions,
      statusOptions,
      repositoryOptions,
      assigneeOptions
    }
  }

  /**
   * Check if item matches search criteria
   */
  const matchesSearch = (item: ProjectItem, search: string): boolean => {
    if (!search) return true

    const searchLower = search.toLowerCase()
    return (
      item.title.toLowerCase().includes(searchLower) ||
      item.repository.toLowerCase().includes(searchLower) ||
      item.repository_owner.toLowerCase().includes(searchLower) ||
      (item.number && item.number.toString().includes(search)) ||
      item.assignees.some(assignee => assignee.login.toLowerCase().includes(searchLower)) ||
      item.labels.some(label => label.name.toLowerCase().includes(searchLower)) ||
      Object.values(item.custom_fields || {}).some(value =>
        value.toLowerCase().includes(searchLower)
      )
    )
  }

  /**
   * Check if item matches filter criteria
   */
  const matchesFilters = (item: ProjectItem, filters: FilterOptions): boolean => {
    // State filter
    if (filters.state !== 'all' && item.state !== filters.state) {
      return false
    }

    // Type filter
    if (filters.type !== 'all' && item.type !== filters.type) {
      return false
    }

    // Status filter
    if (filters.status !== 'all' && item.status !== filters.status) {
      return false
    }

    // Repository filter
    if (filters.repository !== 'all') {
      const itemRepo = `${item.repository_owner}/${item.repository}`
      if (itemRepo !== filters.repository) {
        return false
      }
    }

    // Assignee filter
    if (filters.assignee !== 'all') {
      const hasAssignee = item.assignees.some(assignee => assignee.login === filters.assignee)
      if (!hasAssignee) {
        return false
      }
    }

    return true
  }

  /**
   * Filter items based on search and filter criteria
   */
  const filterItems = (items: ProjectItem[], filters: FilterOptions): ProjectItem[] => {
    return items.filter(item => {
      // Search filter
      if (filters.search && !matchesSearch(item, filters.search)) {
        return false
      }

      return matchesFilters(item, filters)
    })
  }

  /**
   * Create default filter state
   */
  const createDefaultFilters = (): FilterOptions => ({
    search: '',
    state: 'all',
    type: 'all',
    status: 'all',
    assignee: 'all',
    repository: 'all'
  })

  return {
    createFilterOptions,
    filterItems,
    matchesSearch,
    matchesFilters,
    createDefaultFilters
  }
}