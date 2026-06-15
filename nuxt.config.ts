import { defineNuxtConfig } from 'nuxt/config'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@nuxt/eslint',
    '@nuxt/test-utils',
    '@nuxt/ui',
    '@nuxt/scripts',
    '@nuxt/icon',
    '@pinia/nuxt',
    'pinia-plugin-persistedstate/nuxt'
  ],

  icon: {
    // Avoid collision with our existing Icon atom
    componentName: 'NuxtIcon',
  },

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
    githubOwner: process.env.GITHUB_OWNER || 'GitHub',
    githubRepo: process.env.GITHUB_REPO || 'issues',
    
    // Public config (exposed to client)
    public: {
      githubOwner: process.env.GITHUB_OWNER || 'GitHub',
      brandColors: process.env.BRAND_COLORS || '',
    }
  }
})