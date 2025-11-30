/**
 * Composable for sorting project items based on view configuration
 */

import type { ViewItem } from './useViewFiltering'
import { useViewGrouping } from './useViewGrouping'

export interface SortConfig {
  field: string
  direction: 'ASC' | 'DESC'
}

export const useViewSorting = () => {
  const { getFieldValue } = useViewGrouping()

  /**
   * Compare two values for sorting
   */
  function compareValues(a: string | number, b: string | number, direction: 'ASC' | 'DESC'): number {
    // Handle numbers
    if (typeof a === 'number' && typeof b === 'number') {
      return direction === 'ASC' ? a - b : b - a
    }

    // Handle dates (ISO string format)
    const aDate = Date.parse(String(a))
    const bDate = Date.parse(String(b))
    if (!isNaN(aDate) && !isNaN(bDate)) {
      return direction === 'ASC' ? aDate - bDate : bDate - aDate
    }

    // Handle strings (case-insensitive)
    const aStr = String(a).toLowerCase()
    const bStr = String(b).toLowerCase()

    if (direction === 'ASC') {
      return aStr.localeCompare(bStr)
    } else {
      return bStr.localeCompare(aStr)
    }
  }

  /**
   * Sort items by field and direction
   */
  function sortItems(items: ViewItem[], sortConfig: SortConfig | null): ViewItem[] {
    if (!sortConfig) return items

    const sorted = [...items]

    sorted.sort((a, b) => {
      const aValue = getFieldValue(a, sortConfig.field)
      const bValue = getFieldValue(b, sortConfig.field)

      // Handle empty values - push to end
      if (!aValue && !bValue) return 0
      if (!aValue) return 1
      if (!bValue) return -1

      return compareValues(aValue, bValue, sortConfig.direction)
    })

    return sorted
  }

  /**
   * Sort items by multiple sort configs (priority order)
   */
  function sortItemsMultiple(items: ViewItem[], sortConfigs: SortConfig[]): ViewItem[] {
    if (sortConfigs.length === 0) return items

    const sorted = [...items]

    sorted.sort((a, b) => {
      // Try each sort config in order until we get a non-zero result
      for (const config of sortConfigs) {
        const aValue = getFieldValue(a, config.field)
        const bValue = getFieldValue(b, config.field)

        if (!aValue && !bValue) continue
        if (!aValue) return 1
        if (!bValue) return -1

        const result = compareValues(aValue, bValue, config.direction)
        if (result !== 0) return result
      }

      return 0
    })

    return sorted
  }

  return {
    compareValues,
    sortItems,
    sortItemsMultiple
  }
}
