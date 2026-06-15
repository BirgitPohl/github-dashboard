import { defineStore } from 'pinia'

export interface HeaderAction {
  id: string
  icon: string
  label: string
  active?: boolean
  dot?: boolean
  onClick: () => void
}

export interface HeaderActionMeta {
  id: string
  icon: string
  label: string
  active?: boolean
  dot?: boolean
}

interface State {
  items: HeaderActionMeta[]
}

/**
 * Click handlers live outside Pinia state — they cannot be serialized into
 * the SSR payload (devalue throws on functions). The store keeps only the
 * presentational metadata in reactive state; this module-level map holds
 * the matching handlers, keyed by action id.
 */
const handlers = new Map<string, () => void>()

/**
 * Per-page action buttons rendered in the navigation bar. Pages register
 * their actions on mount and clear them on unmount so they don't leak.
 */
export const useHeaderActions = defineStore('headerActions', {
  state: (): State => ({ items: [] }),
  actions: {
    set(actions: HeaderAction[]) {
      handlers.clear()
      this.items = actions.map(({ onClick, ...meta }) => {
        handlers.set(meta.id, onClick)
        return meta
      })
    },
    clear() {
      this.items = []
      handlers.clear()
    },
    invoke(id: string) {
      handlers.get(id)?.()
    },
  },
})
