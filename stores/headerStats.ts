import { defineStore } from 'pinia'

export interface HeaderStatItem {
  label: string
  value: number | string
  variant?: 'default' | 'success' | 'warning' | 'info'
}

interface State {
  items: HeaderStatItem[]
}

/**
 * Compact per-page stats shown in the navigation bar below the menu.
 * Each page sets `items` from its own data and clears them on unmount
 * so they don't leak to the next route.
 */
export const useHeaderStats = defineStore('headerStats', {
  state: (): State => ({ items: [] }),
  actions: {
    set(items: HeaderStatItem[]) {
      this.items = items
    },
    clear() {
      this.items = []
    },
  },
})
