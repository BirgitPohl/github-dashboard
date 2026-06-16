import { EventEmitter } from 'node:events'

const bus = new EventEmitter()
bus.setMaxListeners(0)

export const LOG_EVENT = 'log'

export interface ServerLogEntry {
  message: string
  timestamp: number
}

/**
 * Log to the server console AND broadcast to any connected SSE listeners.
 * Use in place of console.log when you want the line to surface in the
 * LogTicker on every page.
 */
export function serverLog(message: string) {
  console.log(message)
  bus.emit(LOG_EVENT, { message, timestamp: Date.now() } satisfies ServerLogEntry)
}

export function subscribeServerLogs(listener: (entry: ServerLogEntry) => void) {
  bus.on(LOG_EVENT, listener)
  return () => bus.off(LOG_EVENT, listener)
}
