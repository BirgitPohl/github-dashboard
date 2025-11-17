import { defineNuxtConfig } from 'nuxt/config'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@nuxt/eslint',
    '@nuxt/test-utils',
    '@nuxt/ui',
    '@nuxt/scripts'
  ],

  // Enable auto-imports for components and composables
  components: [
    {
      path: '~/components',
      pathPrefix: false,
    },
    {
      path: '~/features',
      pathPrefix: false,
      pattern: '**/*.vue'
    }
  ],

  // Configure path aliases and TypeScript
  alias: {
    '~': '.',
    '@': '.',
  },

  typescript: {
    typeCheck: false, // Disable during development for faster builds
  },

  runtimeConfig: {
    // Server-side only (not exposed to client)
    githubToken: process.env.GITHUB_TOKEN,
    githubOwner: process.env.GITHUB_OWNER || 'Oracommit',
    githubRepo: process.env.GITHUB_REPO || 'issues',
    
    // Public config (exposed to client)
    public: {
      // Add any public config here if needed
    }
  }
})