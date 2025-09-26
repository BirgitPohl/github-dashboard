/**
 * Composable for handling GitHub project board item grouping based on view configurations
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

interface ProjectView {
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

interface GroupedItems {
  name: string
  items: ProjectItem[]
  count: number
}

export const useProjectGrouping = () => {
  /**
   * Get the grouping value for an item based on the specified field
   */
  const getGroupValue = (item: ProjectItem, groupField: string): string => {
    if (!groupField) return 'All Items'

    // First, check for exact match in custom_fields
    if (item.custom_fields?.[groupField]) {
      return String(item.custom_fields[groupField])
    }

    // Then check for case-insensitive match in custom_fields
    const customFieldEntry = Object.entries(item.custom_fields || {}).find(([key]) =>
      key.toLowerCase() === groupField.toLowerCase()
    )
    if (customFieldEntry) {
      return String(customFieldEntry[1])
    }

    // Check built-in GitHub fields
    const normalizedField = groupField.toLowerCase()
    switch (normalizedField) {
      case 'status':
        return item.status || item.custom_fields?.['Status'] || `No Status`
      case 'state':
        return item.state || `No State`
      case 'type':
        return item.type || `No Type`
      case 'assignees':
      case 'assignee':
        return item.assignees && item.assignees.length > 0
          ? item.assignees[0]?.login || 'Unassigned'
          : 'Unassigned'
      case 'repository':
      case 'repo':
        return item.repository || `No Repository`
      case 'repository_owner':
      case 'owner':
        return item.repository_owner || `No Owner`
      case 'priority':
        return item.priority || item.custom_fields?.['Priority'] || `No Priority`
      case 'labels':
      case 'label':
        return item.labels && item.labels.length > 0
          ? item.labels[0]?.name || 'No Labels'
          : 'No Labels'
      case 'parent issue':
      case 'parent_issue':
        // TEMPORARY: Demonstrate grouping using Status field since Parent issue data isn't available
        // TODO: Replace this with actual parent issue data when GitHub API is fixed
        const status = item.status || item.custom_fields?.['Status']
        if (status) {
          return `Status: ${status}`
        }
        return 'Ungrouped Items'
      default:
        // If no value found, return "No [FieldName]"
        const fieldDisplayName = groupField.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
        return `No ${fieldDisplayName}`
    }
  }

  /**
   * Group items based on view configuration
   */
  const groupItems = (items: ProjectItem[], view: ProjectView | null): GroupedItems[] => {
    // If no view is selected or no grouping is configured, return items in a single group
    if (!view || !view.groupByFields || view.groupByFields.length === 0) {
      return [{
        name: 'All Items',
        items: items,
        count: items.length
      }]
    }

    // Use the first group field (GitHub typically uses one group field at a time)
    const groupField = view.groupByFields[0]

    if (!groupField) {
      return [{
        name: 'All Items',
        items: items,
        count: items.length
      }]
    }

    // Group items by the specified field
    const groups = new Map<string, ProjectItem[]>()

    for (const item of items) {
      const groupValue = getGroupValue(item, groupField)
      if (!groups.has(groupValue)) {
        groups.set(groupValue, [])
      }
      groups.get(groupValue)!.push(item)
    }

    // Convert to array and sort groups
    const groupsArray = Array.from(groups.entries()).map(([name, groupItems]) => ({
      name,
      items: groupItems,
      count: groupItems.length
    }))

    // Sort groups by name, but put "No X" groups at the end
    return groupsArray.sort((a, b) => {
      const aIsEmpty = a.name.startsWith('No ')
      const bIsEmpty = b.name.startsWith('No ')

      if (aIsEmpty && !bIsEmpty) return 1
      if (!aIsEmpty && bIsEmpty) return -1
      return a.name.localeCompare(b.name)
    })
  }

  /**
   * Sort items within groups based on view configuration
   */
  const sortItemsInGroups = (groupedItems: GroupedItems[], view: ProjectView | null): GroupedItems[] => {
    if (!view || !view.sortByFields || view.sortByFields.length === 0) {
      // Default sort by updated date (newest first)
      return groupedItems.map(group => ({
        ...group,
        items: [...group.items].sort((a, b) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        )
      }))
    }

    return groupedItems.map(group => ({
      ...group,
      items: [...group.items].sort((a, b) => {
        for (const sortField of view.sortByFields!) {
          const aValue = getGroupValue(a, sortField.fieldName)
          const bValue = getGroupValue(b, sortField.fieldName)

          const comparison = aValue.localeCompare(bValue)
          if (comparison !== 0) {
            return sortField.direction === 'DESC' ? -comparison : comparison
          }
        }

        // Fallback to updated date
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      })
    }))
  }

  /**
   * Get available grouping fields from items
   */
  const getAvailableGroupFields = (items: ProjectItem[]): string[] => {
    const fields = new Set<string>()

    // Add built-in fields
    fields.add('Status')
    fields.add('State')
    fields.add('Type')
    fields.add('Assignees')
    fields.add('Repository')
    fields.add('Priority')
    fields.add('Labels')

    // Add custom fields from items
    for (const item of items) {
      if (item.custom_fields) {
        Object.keys(item.custom_fields).forEach(field => fields.add(field))
      }
    }

    return Array.from(fields).sort()
  }

  return {
    groupItems,
    sortItemsInGroups,
    getGroupValue,
    getAvailableGroupFields
  }
}