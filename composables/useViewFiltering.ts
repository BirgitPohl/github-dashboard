/**
 * Composable for filtering project items based on GitHub view filter strings
 * Note: This is a simplified implementation of GitHub's filter syntax
 */

export interface ViewItem {
  id: string
  type: string
  content?: {
    __typename?: string
    title?: string
    state?: string
    closed?: boolean
    repository?: {
      name: string
    }
    assignees?: {
      nodes: Array<{
        login: string
      }>
    }
    labels?: {
      nodes: Array<{
        name: string
      }>
    }
  }
  customFields: Record<string, unknown>
}

export const useViewFiltering = () => {
  /**
   * Parse a GitHub filter string into filter conditions
   * Supports basic syntax: field:value, -field:value (negation), "quoted values"
   */
  function parseFilterString(filterString: string | null): Map<string, string[]> {
    const filters = new Map<string, string[]>()

    if (!filterString) return filters

    // Simple regex to match field:value pairs
    // Handles: field:value, field:"quoted value", -field:value (negation)
    const filterRegex = /(-)?(\w+):(?:"([^"]+)"|(\S+))/g
    let match

    while ((match = filterRegex.exec(filterString)) !== null) {
      const isNegation = match[1] === '-'
      const field = match[2]
      const value = match[3] || match[4]

      const key = isNegation ? `-${field}` : field

      if (!filters.has(key)) {
        filters.set(key, [])
      }

      filters.get(key)!.push(value.toLowerCase())
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
            itemValue = item.content?.state?.toLowerCase() === 'open' ? 'open' : undefined
          } else if (filterValues.includes('closed')) {
            itemValue = item.content?.closed ? 'closed' : undefined
          } else if (filterValues.includes('issue')) {
            itemValue = item.content?.__typename === 'Issue' ? 'issue' : undefined
          } else if (filterValues.includes('pr')) {
            itemValue = item.content?.__typename === 'PullRequest' ? 'pr' : undefined
          }
          break

        case 'assignee':
          itemValue = item.content?.assignees?.nodes.map(a => a.login.toLowerCase()) || []
          break

        case 'label':
          itemValue = item.content?.labels?.nodes.map(l => l.name.toLowerCase()) || []
          break

        case 'repo':
        case 'repository':
          itemValue = item.content?.repository?.name.toLowerCase()
          break

        case 'state':
          itemValue = item.content?.state?.toLowerCase()
          break

        default:
          // Check custom fields
          const customValue = item.customFields[field]
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
