/**
 * Composable for managing loading states with skeleton screens
 * Provides utilities to determine when to show skeletons vs spinners
 */
export const useLoadingState = () => {
  /**
   * Determine if we should show skeleton (for initial load with no cached data)
   * vs showing nothing (when we have cached data and are refreshing in background)
   */
  const shouldShowSkeleton = (hasData: boolean, isLoading: boolean): boolean => {
    return !hasData && isLoading
  }

  /**
   * Determine if we should show a refresh indicator
   * (small, non-blocking indicator that data is being updated)
   */
  const shouldShowRefreshIndicator = (hasData: boolean, isRefreshing: boolean): boolean => {
    return hasData && isRefreshing
  }

  /**
   * Determine the loading state type
   */
  const getLoadingStateType = (
    hasData: boolean,
    isLoading: boolean,
    isRefreshing: boolean
  ): 'initial' | 'refreshing' | 'ready' | 'error' => {
    if (!hasData && isLoading) return 'initial'
    if (hasData && isRefreshing) return 'refreshing'
    if (hasData) return 'ready'
    return 'ready'
  }

  return {
    shouldShowSkeleton,
    shouldShowRefreshIndicator,
    getLoadingStateType,
  }
}
