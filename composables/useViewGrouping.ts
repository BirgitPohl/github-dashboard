/**
 * Composable for grouping project items based on view configuration
 */

import type { ViewItem } from './useViewFiltering'

export interface GroupedItems {
  name: string
  count: number
  items: ViewItem[]
}

export const useViewGrouping = () => {
  /**
   * Get the value of a field from an item
   */
  function getFieldValue(item: ViewItem, fieldName: string): string {
    // Check custom fields first
    if (item.customFields[fieldName] !== undefined) {
      const value = item.customFields[fieldName]

      // Handle iteration fields (object with title)
      if (typeof value === 'object' && value !== null && 'title' in value) {
        return String((value as { title: string }).title)
      }

      return String(value)
    }

    // Check built-in fields
    switch (fieldName.toLowerCase()) {
      case 'status':
      case 'state':
        return item.content?.state || 'Unknown'

      case 'type':
        return item.content?.__typename || 'Unknown'

      case 'repository':
      case 'repo':
        return item.content?.repository?.name || 'No Repository'

      case 'assignee':
      case 'assignees':
        const assignees = item.content?.assignees?.nodes
        return assignees && assignees.length > 0 ? assignees[0].login : 'Unassigned'

      default:
        return 'No Value'
    }
  }

  /**
   * Group items by field
   */
  function groupItems(items: ViewItem[], fieldName: string | null | undefined): GroupedItems[] {
    if (!fieldName) {
      // No grouping - return single group with all items
      return [{
        name: 'All Items',
        count: items.length,
        items
      }]
    }

    // Group items by field value
    const groups = new Map<string, ViewItem[]>()

    for (const item of items) {
      const groupValue = getFieldValue(item, fieldName)

      if (!groups.has(groupValue)) {
        groups.set(groupValue, [])
      }

      groups.get(groupValue)!.push(item)
    }

    // Convert to array and sort by group name
    const groupedArray = Array.from(groups.entries())
      .map(([name, items]) => ({
        name,
        count: items.length,
        items
      }))
      .sort((a, b) => {
        // Sort special groups first
        if (a.name === 'No Value' || a.name === 'Unknown') return 1
        if (b.name === 'No Value' || b.name === 'Unknown') return -1
        return a.name.localeCompare(b.name)
      })

    return groupedArray
  }

  return {
    getFieldValue,
    groupItems
  }
}
