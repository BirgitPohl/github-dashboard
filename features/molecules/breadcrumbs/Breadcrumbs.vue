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
        <Link
          v-if="item.to && !item.current"
          :to="item.to"
          variant="primary"
          size="sm"
          class="breadcrumbs__link"
        >
          {{ item.label }}
        </Link>
        <Text
          v-else
          variant="tertiary"
          size="sm"
          weight="normal"
          class="breadcrumbs__current"
          :aria-current="item.current ? 'page' : undefined"
        >
          {{ item.label }}
        </Text>

        <Text
          v-if="index < items.length - 1"
          variant="tertiary"
          size="sm"
          class="breadcrumbs__separator"
          aria-hidden="true"
        >
          {{ separator }}
        </Text>
      </li>
    </ol>
  </nav>
</template>

<style scoped>
/* Layout structure only - typography and colors handled by atoms */
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
}

.breadcrumbs__item {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.breadcrumbs__separator {
  user-select: none;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .breadcrumbs__list {
    gap: var(--spacing-1-5);
  }

  .breadcrumbs__item {
    gap: var(--spacing-1-5);
  }
}
</style>
