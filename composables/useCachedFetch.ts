interface CacheConfig {
  key: string
  staleTime?: number // milliseconds
  refreshInterval?: number // milliseconds for auto-refresh
}

interface CacheMetadata {
  timestamp: number
  isRefreshing: boolean
}

/**
 * Enhanced fetch composable with client-side caching and background refresh
 * - Returns cached data immediately for instant page transitions
 * - Refreshes data in background without blocking UI
 * - Tracks cache freshness and loading states
 */
export const useCachedFetch = <T>(
  url: string,
  config: CacheConfig,
  fetchOptions: Record<string, any> = {}
) => {
  const { key, staleTime = 5 * 60 * 1000, refreshInterval } = config

  // State keys
  const cacheKey = `cache:${key}`
  const metaKey = `cache-meta:${key}`

  // Shared state across pages
  const cachedData = useState<T | null>(cacheKey, () => null)
  const cacheMeta = useState<CacheMetadata>(metaKey, () => ({
    timestamp: 0,
    isRefreshing: false,
  }))

  // Check if cache is still fresh
  const isCacheStale = computed(() => {
    if (!cacheMeta.value.timestamp) return true
    return Date.now() - cacheMeta.value.timestamp > staleTime
  })

  // Fetch with caching logic
  const { data, pending, error, refresh, status, execute } = useFetch<T>(url, {
    ...fetchOptions,
    server: false,
    immediate: false, // Don't execute automatically

    // Update cache and metadata on successful response
    onResponse({ response }) {
      if (response._data) {
        cachedData.value = response._data
        cacheMeta.value = {
          timestamp: Date.now(),
          isRefreshing: false,
        }
      }
    },

    onRequest() {
      cacheMeta.value.isRefreshing = true
    },

    onRequestError() {
      cacheMeta.value.isRefreshing = false
    },

    onResponseError() {
      cacheMeta.value.isRefreshing = false
    },
  })

  // Execute fetch immediately on mount if no cache or cache is stale
  onMounted(async () => {
    if (!cachedData.value || isCacheStale.value) {
      await execute()
    }
  })

  // Auto-refresh at interval if specified
  let refreshTimer: NodeJS.Timeout | null = null
  if (refreshInterval) {
    onMounted(() => {
      refreshTimer = setInterval(() => {
        if (!document.hidden) {
          execute()
        }
      }, refreshInterval)
    })

    onUnmounted(() => {
      if (refreshTimer) {
        clearInterval(refreshTimer)
      }
    })
  }

  // Refresh when page becomes visible (user returns to tab)
  onMounted(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isCacheStale.value) {
        execute()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    onUnmounted(() => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    })
  })

  return {
    data: computed(() => cachedData.value || data.value),
    pending: computed(() => !cachedData.value && pending.value),
    isRefreshing: computed(() => cacheMeta.value.isRefreshing && !!cachedData.value),
    error,
    refresh,
    status,
    lastUpdated: computed(() => cacheMeta.value.timestamp),
    isCacheStale,
  }
}
