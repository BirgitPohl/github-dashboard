<script setup lang="ts">
const { public: { githubOwner } } = useRuntimeConfig()
const headerStats = useHeaderStats()

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
    <div v-if="headerStats.items.length" class="nav-stats">
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

.nav-stats {
  max-width: var(--container-max-width);
  margin: 0 auto;
  padding: 6px var(--spacing-8);
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-5);
  border-top: 1px solid var(--color-border-default);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
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

  .nav-stats {
    padding: 6px var(--spacing-4);
    gap: var(--spacing-3);
  }
}
</style>
