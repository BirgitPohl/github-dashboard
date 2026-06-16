export interface ServerLogEntry {
  message: string
  timestamp: number
}

/**
 * Subscribes to the server-side log stream over SSE and exposes the most
 * recent message reactively. Each new server log replaces the previous one.
 * Client-only — no-ops during SSR.
 */
export function useLogStream() {
  const latest = useState<ServerLogEntry | null>('serverLogLatest', () => null)

  if (import.meta.server) return { latest }

  let source: EventSource | null = null
  let retryTimer: ReturnType<typeof setTimeout> | null = null

  const open = () => {
    source = new EventSource('/api/log-stream')
    source.onmessage = (e) => {
      try {
        latest.value = JSON.parse(e.data) as ServerLogEntry
      } catch {
        // ignore malformed payloads
      }
    }
    source.onerror = () => {
      source?.close()
      source = null
      retryTimer = setTimeout(open, 2000)
    }
  }

  onMounted(open)
  onUnmounted(() => {
    if (retryTimer) clearTimeout(retryTimer)
    source?.close()
  })

  return { latest }
}
