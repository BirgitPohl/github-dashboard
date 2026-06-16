<script setup lang="ts">
import { useRepositoryCard } from './useRepositoryCard'

interface Repository {
  id: number
  name: string
  full_name: string
  description: string
  language: string
  is_private: boolean
  stars: number
  forks: number
  issues: number
  updated_at: string
  created_at: string
  html_url: string
  topics: string[]
  size: number
  default_branch: string
  category: string
  tech_stack: string[]
}

const props = defineProps<{
  repository: Repository
}>()

const { getCategoryConfig } = useRepositoryCard()
const { formatTimeAgoSimple } = useDateTime()

const categoryConfig = computed(() => getCategoryConfig(props.repository.category))
const timeAgo = computed(() => formatTimeAgoSimple(props.repository.updated_at))
</script>

<template>
  <a
    :href="repository.html_url"
    target="_blank"
    rel="noopener"
    class="repo-row"
    :style="{ '--repo-accent': categoryConfig.color }"
  >
    <Icon :icon="categoryConfig.icon" class="repo-row__icon" :aria-label="categoryConfig.label" />

    <span class="repo-row__name-cell">
      <span class="repo-row__name">{{ repository.name }}</span>
      <Icon v-if="repository.is_private" icon="lucide:lock" size="xs" class="repo-row__lock" aria-label="Private" />
    </span>

    <span class="repo-row__category">{{ categoryConfig.label }}</span>

    <span class="repo-row__lang">{{ repository.language || '' }}</span>

    <span class="repo-row__stat" title="Stars">
      <Icon icon="lucide:star" size="xs" decorative />
      {{ repository.stars }}
    </span>

    <span class="repo-row__stat" title="Forks">
      <Icon icon="lucide:git-fork" size="xs" decorative />
      {{ repository.forks }}
    </span>

    <span class="repo-row__stat" title="Open issues">
      <Icon icon="lucide:circle-dot" size="xs" decorative />
      {{ repository.issues }}
    </span>

    <span class="repo-row__updated">{{ timeAgo }}</span>
  </a>
</template>

<style scoped>
.repo-row {
  display: grid;
  grid-template-columns: subgrid;
  grid-column: 1 / -1;
  align-items: center;
  column-gap: var(--spacing-3);
  padding: var(--spacing-2) var(--spacing-4);
  border-left: 3px solid var(--repo-accent, var(--color-neutral));
  border-bottom: 1px solid var(--color-border-default);
  background: var(--color-bg-primary);
  text-decoration: none;
  color: inherit;
  font-size: var(--font-size-sm);
  line-height: 1.3;
  transition: background var(--transition-fast);
}

.repo-row__name-cell {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-2);
  min-width: 0;
}

.repo-row:hover {
  background: var(--color-bg-tertiary);
}

.repo-row__icon {
  font-size: var(--font-size-base);
  line-height: 1;
}

.repo-row__name {
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.repo-row__lock {
  font-size: var(--font-size-xs);
  opacity: 0.7;
}

.repo-row__category {
  color: var(--repo-accent, var(--color-neutral));
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-xs);
  white-space: nowrap;
}

.repo-row__lang {
  color: var(--color-text-secondary);
  font-size: var(--font-size-2xs);
  opacity: 0.85;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}

.repo-row__stat {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-family: var(--font-family-mono);
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
  white-space: nowrap;
  justify-self: end;
}

.repo-row__updated {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  white-space: nowrap;
  min-width: 4ch;
  text-align: right;
}

@media (max-width: 640px) {
  .repo-row {
    grid-template-columns: auto 1fr auto;
    grid-template-rows: auto auto auto;
    row-gap: 2px;
  }

  .repo-row__category,
  .repo-row__lang {
    grid-column: 2 / 4;
    grid-row: 2;
    justify-self: start;
  }

  .repo-row__lang {
    grid-row: 2;
    justify-self: end;
  }

  .repo-row__stat {
    grid-row: 3;
    justify-self: start;
  }

  .repo-row__updated {
    grid-column: 3;
    grid-row: 1;
  }
}
</style>
