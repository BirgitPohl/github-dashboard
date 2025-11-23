/**
 * Composable for project progress graph data aggregation
 * Calculates time-series data showing open vs closed items over time
 */

interface ProjectItem {
  id: string
  type: 'ISSUE' | 'PULL_REQUEST' | 'DRAFT_ISSUE'
  state: string
  created_at: string
  updated_at: string
  [key: string]: any
}

interface TimeSeriesPoint {
  date: string
  open: number
  closed: number
  total: number
}

export const useProjectGraph = () => {
  /**
   * Calculate time-series data for the last 30 days
   * Shows how many items were open vs closed on each day
   */
  const calculateTimeSeriesData = (items: ProjectItem[]): TimeSeriesPoint[] => {
    if (items.length === 0) {
      return []
    }

    // Generate array of last 30 days
    const days = 30
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const timePoints: TimeSeriesPoint[] = []

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)

      // Count items that existed on this date
      let open = 0
      let closed = 0

      for (const item of items) {
        const createdDate = new Date(item.created_at)
        createdDate.setHours(0, 0, 0, 0)

        // Item must have been created before or on this date
        if (createdDate <= date) {
          const isClosed = item.state.toLowerCase() === 'closed'

          if (isClosed) {
            closed++
          } else {
            open++
          }
        }
      }

      const total = open + closed

      timePoints.push({
        date: date.toISOString().split('T')[0], // YYYY-MM-DD
        open,
        closed,
        total
      })
    }

    return timePoints
  }

  /**
   * Format date for display (MM/DD)
   */
  const formatDateLabel = (dateStr: string): string => {
    const date = new Date(dateStr)
    const month = date.getMonth() + 1
    const day = date.getDate()
    return `${month}/${day}`
  }

  return {
    calculateTimeSeriesData,
    formatDateLabel
  }
}
