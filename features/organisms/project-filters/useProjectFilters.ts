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
  repository: string
  // Dynamic custom field filters (can be string or array for multi-select)
  [key: string]: string | string[]
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

    const repositoryOptions = computed((): SelectOption[] => {
      if (!items.length) return []
      const repositories = [...new Set(items.map(item => `${item.repository_owner}/${item.repository}`))]
      return [
        { value: 'all', label: 'All Repositories' },
        ...repositories.map(repo => ({ value: repo, label: repo }))
      ]
    })

    // Dynamically create filter options for all custom fields
    const customFieldOptions = computed((): Record<string, SelectOption[]> => {
      if (!items.length) return {}

      // Fields to exclude from filters
      const excludedFields = ['Devs', 'Sub-issues progress_data']

      const fieldOptionsMap: Record<string, Set<string>> = {}

      // Collect all unique values for each custom field
      for (const item of items) {
        for (const [fieldName, fieldValue] of Object.entries(item.custom_fields || {})) {
          // Skip excluded fields
          if (excludedFields.includes(fieldName)) {
            continue
          }

          if (!fieldOptionsMap[fieldName]) {
            fieldOptionsMap[fieldName] = new Set()
          }
          if (fieldValue) {
            fieldOptionsMap[fieldName].add(fieldValue)
          }
        }
      }

      // Convert to SelectOption arrays (no "All" option for multi-select)
      const result: Record<string, SelectOption[]> = {}
      for (const [fieldName, values] of Object.entries(fieldOptionsMap)) {
        result[fieldName] = Array.from(values).sort().map(value => ({ value, label: value }))
      }

      return result
    })

    return {
      stateOptions,
      typeOptions,
      repositoryOptions,
      customFieldOptions
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

    // Repository filter
    if (filters.repository !== 'all') {
      const itemRepo = `${item.repository_owner}/${item.repository}`
      if (itemRepo !== filters.repository) {
        return false
      }
    }

    // Dynamic custom field filters (support both single and multi-select)
    for (const [filterKey, filterValue] of Object.entries(filters)) {
      // Skip built-in filters
      if (['search', 'state', 'type', 'repository'].includes(filterKey)) {
        continue
      }

      // Check custom field filter
      if (filterValue) {
        const itemValue = item.custom_fields?.[filterKey]

        // Handle array (multi-select)
        if (Array.isArray(filterValue)) {
          if (filterValue.length > 0 && !filterValue.includes(itemValue)) {
            return false
          }
        }
        // Handle string (single select)
        else if (filterValue !== 'all' && itemValue !== filterValue) {
          return false
        }
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