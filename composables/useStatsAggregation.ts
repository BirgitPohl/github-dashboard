/**
 * Reusable composable for computing aggregate statistics from arrays
 * Provides common statistical operations to avoid duplication across pages
 */
export const useStatsAggregation = () => {
  /**
   * Sum a numeric field across all items in an array
   * @param items - Array of objects
   * @param field - Field name to sum
   * @returns Total sum of the field values
   */
  const computeSum = <T extends Record<string, any>>(items: T[], field: keyof T): number => {
    return items.reduce((sum, item) => sum + (Number(item[field]) || 0), 0)
  }

  /**
   * Count total items, optionally filtered by a predicate
   * @param items - Array of items
   * @param predicate - Optional filter function
   * @returns Count of items matching the predicate (or total if no predicate)
   */
  const computeCount = <T>(items: T[], predicate?: (item: T) => boolean): number => {
    if (!predicate) return items.length
    return items.filter(predicate).length
  }

  /**
   * Group items by a field and return counts per group
   * @param items - Array of objects
   * @param field - Field name to group by
   * @returns Record of field values to counts
   */
  const computeGroupBy = <T extends Record<string, any>>(
    items: T[],
    field: keyof T
  ): Record<string, number> => {
    const groups: Record<string, number> = {}

    for (const item of items) {
      const value = String(item[field])
      groups[value] = (groups[value] || 0) + 1
    }

    return groups
  }

  /**
   * Compute average of a numeric field
   * @param items - Array of objects
   * @param field - Field name to average
   * @returns Average value or 0 if no items
   */
  const computeAverage = <T extends Record<string, any>>(items: T[], field: keyof T): number => {
    if (items.length === 0) return 0
    return computeSum(items, field) / items.length
  }

  /**
   * Find maximum value of a field
   * @param items - Array of objects
   * @param field - Field name to find max
   * @returns Maximum value or 0 if no items
   */
  const computeMax = <T extends Record<string, any>>(items: T[], field: keyof T): number => {
    if (items.length === 0) return 0
    return Math.max(...items.map(item => Number(item[field]) || 0))
  }

  /**
   * Find minimum value of a field
   * @param items - Array of objects
   * @param field - Field name to find min
   * @returns Minimum value or 0 if no items
   */
  const computeMin = <T extends Record<string, any>>(items: T[], field: keyof T): number => {
    if (items.length === 0) return 0
    return Math.min(...items.map(item => Number(item[field]) || 0))
  }

  return {
    computeSum,
    computeCount,
    computeGroupBy,
    computeAverage,
    computeMax,
    computeMin
  }
}
