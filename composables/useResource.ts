import type { MaybeRefOrGetter } from 'vue'

interface UseResourceOptions {
  staleTime?: number
  refreshInterval?: number
}

const DEFAULT_STALE_TIME = 5 * 60 * 1000

/**
 * Stale-while-revalidate resource binding backed by the Pinia cache store.
 *
 * Contract:
 * - `data` is never cleared during a refresh — the previously loaded value
 *   stays visible until a new response replaces it, so the UI never blanks.
 * - State survives page reloads via localStorage (pinia-plugin-persistedstate).
 * - Show a skeleton only when `!data && isRefreshing` (first ever load for
 *   that key); otherwise keep showing the previous data while it refreshes.
 *
 * `key` and `url` may be reactive (ref / getter). When the key changes the
 * binding rebinds to a different cache entry and triggers a fetch if needed.
 */
export function useResource<T>(
  key: MaybeRefOrGetter<string | null>,
  url: MaybeRefOrGetter<string | null>,
  options: UseResourceOptions = {},
) {
  const { staleTime = DEFAULT_STALE_TIME, refreshInterval } = options
  const cache = useResourceCache()

  const currentKey = computed<string | null>(() => toValue(key) ?? null)
  const currentUrl = computed<string | null>(() => toValue(url) ?? null)

  // Ensure the cache slot exists for the active key (outside any computed).
  watch(
    currentKey,
    (k) => { if (k) cache.ensure(k) },
    { immediate: true },
  )

  const entry = computed(() => {
    const k = currentKey.value
    return k ? cache.entries[k] ?? null : null
  })

  const data = computed(() => (entry.value?.data ?? null) as T | null)
  const error = computed(() => entry.value?.error ?? null)
  const isRefreshing = computed(() => entry.value?.isRefreshing ?? false)
  const lastUpdated = computed(() => entry.value?.lastUpdated ?? 0)
  const isStale = computed(() => {
    const ts = lastUpdated.value
    if (!ts) return true
    return Date.now() - ts > staleTime
  })

  async function refresh() {
    const k = currentKey.value
    const u = currentUrl.value
    if (!k || !u) return
    if (cache.entries[k]?.isRefreshing) return

    cache.setRefreshing(k, true)
    try {
      const response = await $fetch<T>(u)
      cache.setData(k, response)
    } catch (err) {
      cache.setError(k, err)
    }
  }

  async function ensureLoaded() {
    if (!currentKey.value || !currentUrl.value) return
    if (!data.value || isStale.value) await refresh()
  }

  onMounted(ensureLoaded)

  watch(currentKey, (next, prev) => {
    if (next && next !== prev) ensureLoaded()
  })

  if (refreshInterval) {
    let timer: ReturnType<typeof setInterval> | null = null
    onMounted(() => {
      timer = setInterval(() => {
        if (!document.hidden) refresh()
      }, refreshInterval)
    })
    onUnmounted(() => {
      if (timer) clearInterval(timer)
    })
  }

  onMounted(() => {
    const onVisibility = () => {
      if (!document.hidden && isStale.value) refresh()
    }
    document.addEventListener('visibilitychange', onVisibility)
    onUnmounted(() => document.removeEventListener('visibilitychange', onVisibility))
  })

  return {
    data,
    error,
    isRefreshing,
    lastUpdated,
    isStale,
    refresh,
    ensureLoaded,
  }
}
