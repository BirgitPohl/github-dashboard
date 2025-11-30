/**
 * Composable for grouping project items based on view configuration
 */

import type { ViewItem } from './useViewFiltering'
import type { ProjectV2FieldConfiguration } from '../server/utils/github-graphql'

export interface GroupedItems {
  name: string
  count: number
  items: ViewItem[]
  color?: string // Color from field options (e.g., Status options)
}

export const useViewGrouping = () => {
  /**
   * Get the value of a field from an item
   */
  function getFieldValue(item: ViewItem, fieldName: string): string {
    // Try exact match in custom fields first
    if (item.custom_fields[fieldName] !== undefined) {
      const value = item.custom_fields[fieldName]

      // Handle iteration fields (object with title)
      if (typeof value === 'object' && value !== null && 'title' in value) {
        return String((value as { title: string }).title)
      }

      return String(value)
    }

    // Try case-insensitive match in custom fields
    const fieldNameLower = fieldName.toLowerCase()
    for (const [key, value] of Object.entries(item.custom_fields)) {
      if (key.toLowerCase() === fieldNameLower) {
        // Handle iteration fields (object with title)
        if (typeof value === 'object' && value !== null && 'title' in value) {
          return String((value as { title: string }).title)
        }
        return String(value)
      }
    }

    // Check built-in fields
    switch (fieldNameLower) {
      case 'status':
        return item.status || 'No Status'

      case 'state':
        return item.state || 'Unknown'

      case 'type':
        return item.type || 'Unknown'

      case 'repository':
      case 'repo':
        return item.repository || 'No Repository'

      case 'assignee':
      case 'assignees':
        return item.assignees.length > 0 ? item.assignees[0].login : 'Unassigned'

      default:
        return 'No Value'
    }
  }

  /**
   * Group items by field
   */
  function groupItems(
    items: ViewItem[],
    fieldName: string | null | undefined,
    fieldConfig?: ProjectV2FieldConfiguration | null
  ): GroupedItems[] {
    if (!fieldName) {
      // No grouping - return single group with all items
      return [{
        name: 'All Items',
        count: items.length,
        items
      }]
    }

    // Build color map from field options (for SingleSelectField)
    const colorMap = new Map<string, string>()
    if (fieldConfig?.options) {
      for (const option of fieldConfig.options) {
        colorMap.set(option.name, option.color)
      }
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
        items,
        color: colorMap.get(name)
      }))
      .sort((a, b) => {
        // Empty/no value groups come FIRST
        const aIsEmpty = a.name === 'No Value' || a.name === 'No Status' || a.name === 'Unknown' || a.name === 'Unassigned'
        const bIsEmpty = b.name === 'No Value' || b.name === 'No Status' || b.name === 'Unknown' || b.name === 'Unassigned'

        if (aIsEmpty && !bIsEmpty) return -1
        if (!aIsEmpty && bIsEmpty) return 1

        // Otherwise sort alphabetically
        return a.name.localeCompare(b.name)
      })

    return groupedArray
  }

  return {
    getFieldValue,
    groupItems
  }
}
