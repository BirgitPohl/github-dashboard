<script setup lang="ts">
const { public: { githubOwner } } = useRuntimeConfig()
const headerStats = useHeaderStats()
const headerActions = useHeaderActions()

const menuOpen = ref(false)
const route = useRoute()
watch(() => route.fullPath, () => { menuOpen.value = false })

const PAGE_TITLES: Record<string, string> = {
  WorkflowsDashboard: 'Workflows',
  PullRequestsOverview: 'Pull Requests',
  RepositoriesOverview: 'Repositories',
}
const currentPageTitle = computed(() => {
  const name = typeof route.name === 'string' ? route.name : ''
  return PAGE_TITLES[name] ?? ''
})

// Keep --nav-actual-height in sync with the rendered nav so the layout's
// content offset is correct whether the bar is single-row (desktop) or
// stacked (mobile), and whether the stats strip is present or not.
const navRef = ref<HTMLElement | null>(null)
let observer: ResizeObserver | null = null

const setHeight = (px: number) => {
  document.documentElement.style.setProperty('--nav-actual-height', `${Math.ceil(px)}px`)
}

onMounted(() => {
  if (!navRef.value) return
  setHeight(navRef.value.offsetHeight)
  observer = new ResizeObserver(() => {
    if (navRef.value) setHeight(navRef.value.offsetHeight)
  })
  observer.observe(navRef.value)
})

onUnmounted(() => {
  observer?.disconnect()
  document.documentElement.style.removeProperty('--nav-actual-height')
})
</script>

<template>
  <nav ref="navRef" class="navigation">
    <div class="nav-content">
      <Header :level="1" size="2xl" variant="primary" class="nav-title">
        {{ githubOwner }}
      </Header>
      <div class="nav-mobile-cluster">
        <Text v-if="currentPageTitle" variant="primary" size="base" weight="medium" class="nav-page-title">
          {{ currentPageTitle }}
        </Text>
        <button
          type="button"
          class="nav-burger"
          :aria-expanded="menuOpen"
          aria-controls="nav-menu"
          aria-label="Toggle navigation menu"
          @click="menuOpen = !menuOpen"
        >
          <span class="nav-burger__bar" />
          <span class="nav-burger__bar" />
          <span class="nav-burger__bar" />
        </button>
      </div>
      <div id="nav-menu" class="nav-links" :class="{ 'nav-links--open': menuOpen }">
        <NuxtLink to="/" class="nav-link">
          <Text variant="secondary" size="base" weight="medium">Workflows</Text>
        </NuxtLink>
        <NuxtLink to="/pull-requests" class="nav-link">
          <Text variant="secondary" size="base" weight="medium">Pull Requests</Text>
        </NuxtLink>
        <NuxtLink to="/repositories" class="nav-link">
          <Text variant="secondary" size="base" weight="medium">Repositories</Text>
        </NuxtLink>
      </div>
    </div>
    <div v-if="headerStats.items.length || headerActions.items.length" class="nav-substrip">
      <div class="nav-stats">
        <span
          v-for="stat in headerStats.items"
          :key="stat.label"
          class="nav-stat"
          :class="stat.variant ? `nav-stat--${stat.variant}` : ''"
        >
          <span class="nav-stat__value">{{ stat.value }}</span>
          <span class="nav-stat__label">{{ stat.label }}</span>
        </span>
      </div>
      <div v-if="headerActions.items.length" class="nav-actions">
        <button
          v-for="action in headerActions.items"
          :key="action.id"
          type="button"
          class="nav-action"
          :class="{ 'nav-action--active': action.active }"
          :title="action.label"
          :aria-label="action.label"
          :aria-pressed="!!action.active"
          @click="headerActions.invoke(action.id)"
        >
          <Icon :icon="action.icon" decorative />
          <span v-if="action.dot" class="nav-action__dot" aria-hidden="true" />
        </button>
      </div>
    </div>
  </nav>
</template>

<style scoped>
/* Layout structure only - typography and colors handled by atoms */
.navigation {
  background: var(--color-bg-primary);
  border-bottom: 1px solid var(--color-border-default);
  padding: var(--spacing-2) 0;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  box-shadow: var(--shadow-sm);
}

.nav-content {
  max-width: var(--container-max-width);
  margin: 0 auto;
  padding: 0 var(--spacing-8);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-title {
  margin: 0;
}

.nav-links {
  display: flex;
  gap: var(--spacing-6);
}

.nav-link {
  text-decoration: none;
  padding: var(--spacing-2) var(--spacing-4);
  border-radius: var(--radius-md);
  transition: all var(--transition-base);
}

.nav-link:hover :deep(.text),
.nav-link.router-link-active :deep(.text) {
  color: var(--color-primary);
}

.nav-substrip {
  max-width: var(--container-max-width);
  margin: 0 auto;
  padding: var(--spacing-3) var(--spacing-8);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-4);
  border-top: 1px solid var(--color-border-default);
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  flex-shrink: 0;
}

.nav-action {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-full);
  background: var(--color-bg-primary);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.nav-action:hover {
  border-color: var(--color-border-hover);
  background: var(--color-bg-tertiary);
}

.nav-action--active {
  border-color: var(--color-primary);
  background: var(--color-primary-bright);
}

.nav-action__dot {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--color-primary);
}

.nav-stats {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-5);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  min-width: 0;
  flex: 1;
}

.nav-stat {
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
  font-size: var(--font-size-xs);
  line-height: 1;
  color: var(--color-text-secondary);
}

.nav-stat__value {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.nav-stat--success .nav-stat__value { color: var(--color-success-dark); }
.nav-stat--warning .nav-stat__value { color: var(--color-warning-dark); }
.nav-stat--info    .nav-stat__value { color: var(--color-info-dark); }

/* Mobile cluster (page title + burger) — only shown on small screens */
.nav-mobile-cluster {
  display: none;
  align-items: center;
  gap: var(--spacing-3);
}

.nav-page-title {
  white-space: nowrap;
}

.nav-burger {
  display: none;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
  width: 36px;
  height: 36px;
  padding: 0;
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-md);
  background: var(--color-bg-primary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.nav-burger:hover {
  background: var(--color-bg-tertiary);
}

.nav-burger__bar {
  display: block;
  width: 18px;
  height: 2px;
  background: var(--color-text-primary);
  margin: 0 auto;
  border-radius: 2px;
}

@media (max-width: 1100px) {
  .nav-content {
    padding: 0 var(--spacing-4);
    flex-wrap: wrap;
    gap: var(--spacing-3);
  }

  .nav-mobile-cluster {
    display: flex;
  }

  .nav-burger {
    display: flex;
  }

  .nav-links {
    display: none;
    flex-basis: 100%;
    flex-direction: column;
    gap: var(--spacing-1);
    padding-top: var(--spacing-3);
    border-top: 1px solid var(--color-border-default);
  }

  .nav-links--open {
    display: flex;
  }

  .nav-link {
    width: 100%;
  }

  .nav-substrip {
    margin-top: var(--spacing-3);
    padding: var(--spacing-3) var(--spacing-4);
  }

  .nav-stats {
    gap: var(--spacing-3);
  }
}
</style>
