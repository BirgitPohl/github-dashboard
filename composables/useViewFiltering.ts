/**
 * Composable for filtering project items based on GitHub view filter strings
 * Note: This is a simplified implementation of GitHub's filter syntax
 */

// ViewItem matches the ProjectItem format expected by the table
export interface ViewItem {
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
  custom_fields: Record<string, unknown>
}

export const useViewFiltering = () => {
  /**
   * Parse a GitHub filter string into filter conditions
   * Supports basic syntax: field:value, -field:value (negation), "quoted values"
   */
  function parseFilterString(filterString: string | null): Map<string, string[]> {
    const filters = new Map<string, string[]>()

    if (!filterString) return filters

    // Match field:values patterns where values can be comma-separated or quoted
    // Handles: field:value, field:"quoted value", field:val1,val2,val3, parent-issue:repo#123
    const filterRegex = /(-)?(\w+(?:-\w+)*):(?:"([^"]+)"|([^\s]+))/g
    let match

    while ((match = filterRegex.exec(filterString)) !== null) {
      const isNegation = match[1] === '-'
      const field = match[2]
      const value = match[3] || match[4]

      const key = isNegation ? `-${field}` : field

      if (!filters.has(key)) {
        filters.set(key, [])
      }

      // Split comma-separated values
      const values = value.split(',').map(v => v.trim().toLowerCase())
      filters.get(key)!.push(...values)
    }

    return filters
  }

  /**
   * Check if an item matches filter conditions
   */
  function matchesFilters(item: ViewItem, filters: Map<string, string[]>): boolean {
    for (const [filterKey, filterValues] of filters.entries()) {
      const isNegation = filterKey.startsWith('-')
      const field = isNegation ? filterKey.substring(1) : filterKey

      let itemValue: string | string[] | undefined

      // Extract item value based on field
      switch (field) {
        case 'is':
          // Special: is:open, is:closed, is:draft, is:issue, is:pr
          if (filterValues.includes('open')) {
            itemValue = item.state?.toLowerCase() === 'open' ? 'open' : undefined
          } else if (filterValues.includes('closed')) {
            itemValue = item.state?.toLowerCase() === 'closed' ? 'closed' : undefined
          } else if (filterValues.includes('issue')) {
            itemValue = item.type === 'ISSUE' ? 'issue' : undefined
          } else if (filterValues.includes('pr')) {
            itemValue = item.type === 'PULL_REQUEST' ? 'pr' : undefined
          }
          break

        case 'assignee':
          itemValue = item.assignees.map(a => a.login.toLowerCase())
          break

        case 'label':
          itemValue = item.labels.map(l => l.name.toLowerCase())
          break

        case 'repo':
        case 'repository':
          itemValue = item.repository.toLowerCase()
          break

        case 'state':
          itemValue = item.state?.toLowerCase()
          break

        case 'parent-issue':
          // Parent issue filter format: repo#number or just #number
          // We need to match against the parent issue stored in custom_fields
          const parentIssue = item.custom_fields['Parent issue']
          if (parentIssue && typeof parentIssue === 'string') {
            // Try to match by issue number from the filter values
            // Filter values look like: "oracommit/issues#416"
            const matches = filterValues.some(fv => {
              const numberMatch = fv.match(/#(\d+)/)
              if (numberMatch) {
                // Check if parent issue title contains this number
                const issueNumber = numberMatch[1]
                return parentIssue.toLowerCase().includes(`#${issueNumber}`)
              }
              return false
            })
            return matches
          }
          return false

        default:
          // Check custom fields
          const customValue = item.custom_fields[field]
          if (customValue !== undefined) {
            itemValue = String(customValue).toLowerCase()
          }
          break
      }

      // Check if value matches
      const hasMatch = Array.isArray(itemValue)
        ? filterValues.some(fv => itemValue.includes(fv))
        : filterValues.some(fv => itemValue === fv)

      // Apply negation logic
      if (isNegation) {
        if (hasMatch) return false
      } else {
        if (!hasMatch) return false
      }
    }

    return true
  }

  /**
   * Filter items based on GitHub view filter string
   */
  function filterItems(items: ViewItem[], filterString: string | null): ViewItem[] {
    if (!filterString) return items

    const filters = parseFilterString(filterString)
    if (filters.size === 0) return items

    return items.filter(item => matchesFilters(item, filters))
  }

  return {
    parseFilterString,
    matchesFilters,
    filterItems
  }
}
