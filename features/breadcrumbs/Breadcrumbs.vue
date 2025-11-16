<script setup lang="ts">
interface BreadcrumbItem {
  /**
   * Display text for the breadcrumb
   */
  label: string
  /**
   * Optional URL/path for the breadcrumb link
   * If not provided, the item will be rendered as plain text
   */
  to?: string
  /**
   * Whether this is the current/active item
   */
  current?: boolean
}

interface Props {
  /**
   * Array of breadcrumb items
   */
  items: BreadcrumbItem[]
  /**
   * Separator character/string between items
   */
  separator?: string
  /**
   * Custom CSS classes
   */
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  separator: '/',
  class: ''
})

// Compute CSS classes
const containerClasses = computed(() => {
  const classes = ['breadcrumbs']

  if (props.class) {
    classes.push(props.class)
  }

  return classes.join(' ')
})
</script>

<template>
  <nav :class="containerClasses" aria-label="Breadcrumb">
    <ol class="breadcrumbs__list">
      <li
        v-for="(item, index) in items"
        :key="index"
        class="breadcrumbs__item"
      >
        <NuxtLink
          v-if="item.to && !item.current"
          :to="item.to"
          class="breadcrumbs__link"
        >
          {{ item.label }}
        </NuxtLink>
        <span
          v-else
          class="breadcrumbs__current"
          :aria-current="item.current ? 'page' : undefined"
        >
          {{ item.label }}
        </span>

        <span
          v-if="index < items.length - 1"
          class="breadcrumbs__separator"
          aria-hidden="true"
        >
          {{ separator }}
        </span>
      </li>
    </ol>
  </nav>
</template>

<style scoped>
.breadcrumbs {
  margin-bottom: var(--spacing-3);
}

.breadcrumbs__list {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--spacing-2);
  list-style: none;
  margin: 0;
  padding: 0;
  font-size: var(--font-size-sm);
}

.breadcrumbs__item {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.breadcrumbs__link {
  color: var(--color-blue-600);
  text-decoration: none;
  transition: color var(--transition-base), text-decoration var(--transition-base);
}

.breadcrumbs__link:hover {
  text-decoration: underline;
  color: var(--color-blue-700);
}

.breadcrumbs__current {
  color: var(--color-gray-500);
  font-weight: var(--font-weight-normal);
}

.breadcrumbs__separator {
  color: var(--color-gray-500);
  user-select: none;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .breadcrumbs__list {
    font-size: var(--font-size-sm);
    gap: var(--spacing-1-5);
  }

  .breadcrumbs__item {
    gap: var(--spacing-1-5);
  }
}
</style>
