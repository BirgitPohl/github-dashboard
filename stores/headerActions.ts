import { defineStore } from 'pinia'

export interface HeaderAction {
  id: string
  icon: string
  label: string
  active?: boolean
  dot?: boolean
  onClick: () => void
}

interface State {
  actions: HeaderAction[]
}

/**
 * Per-page action buttons rendered in the navigation bar. Pages register
 * their actions on mount and clear them on unmount so they don't leak.
 */
export const useHeaderActions = defineStore('headerActions', {
  state: (): State => ({ actions: [] }),
  actions: {
    set(actions: HeaderAction[]) {
      this.actions = actions
    },
    clear() {
      this.actions = []
    },
  },
})
