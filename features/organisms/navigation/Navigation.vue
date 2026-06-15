<script setup lang="ts">
const { public: { githubOwner } } = useRuntimeConfig()
const headerStats = useHeaderStats()
const headerActions = useHeaderActions()

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
      <div class="nav-links">
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
    <div v-if="headerStats.items.length || headerActions.actions.length" class="nav-substrip">
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
      <div v-if="headerActions.actions.length" class="nav-actions">
        <button
          v-for="action in headerActions.actions"
          :key="action.id"
          type="button"
          class="nav-action"
          :class="{ 'nav-action--active': action.active }"
          :title="action.label"
          :aria-label="action.label"
          :aria-pressed="!!action.active"
          @click="action.onClick"
        >
          <span>{{ action.icon }}</span>
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
  padding: var(--spacing-4) 0;
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

.nav-link:hover {
  background: var(--color-gray-100);
}

.nav-link.router-link-active {
  background: var(--color-primary-100);
}

.nav-link.router-link-active :deep(span) {
  color: var(--color-primary-700);
}

.nav-substrip {
  max-width: var(--container-max-width);
  margin: 0 auto;
  padding: 6px var(--spacing-8);
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
  font-size: 12px;
  line-height: 1;
  color: var(--color-gray-600);
}

.nav-stat__value {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-gray-900);
}

.nav-stat--success .nav-stat__value { color: var(--color-success-dark); }
.nav-stat--warning .nav-stat__value { color: var(--color-warning-dark); }
.nav-stat--info    .nav-stat__value { color: var(--color-info-dark); }

@media (max-width: 768px) {
  .nav-content {
    padding: 0 var(--spacing-4);
    flex-direction: column;
    gap: var(--spacing-3);
  }

  .nav-links {
    gap: var(--spacing-4);
  }

  .nav-substrip {
    padding: 6px var(--spacing-4);
  }

  .nav-stats {
    gap: var(--spacing-3);
  }
}
</style>
