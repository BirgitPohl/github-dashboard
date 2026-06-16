import { subscribeServerLogs, type ServerLogEntry } from '../utils/logBus'

export default defineEventHandler((event) => {
  setResponseHeader(event, 'Content-Type', 'text/event-stream')
  setResponseHeader(event, 'Cache-Control', 'no-cache, no-transform')
  setResponseHeader(event, 'Connection', 'keep-alive')
  setResponseHeader(event, 'X-Accel-Buffering', 'no')

  const res = event.node.res
  res.flushHeaders?.()

  const send = (entry: ServerLogEntry) => {
    res.write(`data: ${JSON.stringify(entry)}\n\n`)
  }

  // Heartbeat so proxies / browsers don't reap the idle connection
  const heartbeat = setInterval(() => res.write(': ping\n\n'), 15000)
  const unsubscribe = subscribeServerLogs(send)

  const cleanup = () => {
    clearInterval(heartbeat)
    unsubscribe()
  }
  event.node.req.on('close', cleanup)
  event.node.req.on('error', cleanup)

  // Keep the handler open; the response ends when the client disconnects.
  return new Promise<void>(() => {})
})
