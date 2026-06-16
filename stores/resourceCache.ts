import { defineStore } from 'pinia'

export interface ResourceEntry<T = unknown> {
  data: T | null
  error: unknown | null
  lastUpdated: number
  isRefreshing: boolean
}

interface State {
  entries: Record<string, ResourceEntry>
}

const createEntry = (): ResourceEntry => ({
  data: null,
  error: null,
  lastUpdated: 0,
  isRefreshing: false,
})

export const useResourceCache = defineStore('resourceCache', {
  state: (): State => ({ entries: {} }),

  actions: {
    ensure(key: string) {
      if (!this.entries[key]) this.entries[key] = createEntry()
    },
    setRefreshing(key: string, value: boolean) {
      this.ensure(key)
      this.entries[key].isRefreshing = value
    },
    setData<T>(key: string, data: T) {
      this.ensure(key)
      this.entries[key].data = data
      this.entries[key].error = null
      this.entries[key].lastUpdated = Date.now()
      this.entries[key].isRefreshing = false
    },
    setError(key: string, error: unknown) {
      this.ensure(key)
      this.entries[key].error = error
      this.entries[key].isRefreshing = false
    },
  },

  persist: {
    afterHydrate(ctx) {
      const entries = (ctx.store.$state as State).entries
      for (const key in entries) entries[key].isRefreshing = false
    },
  },
})
