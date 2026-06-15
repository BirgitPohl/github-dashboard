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
    <span class="repo-row__icon" :aria-label="categoryConfig.label">{{ categoryConfig.icon }}</span>

    <span class="repo-row__name">{{ repository.name }}</span>
    <span v-if="repository.is_private" class="repo-row__lock" title="Private">🔒</span>

    <span class="repo-row__meta">
      <span class="repo-row__category">{{ categoryConfig.label }}</span>
      <span v-if="repository.language" class="repo-row__sep">·</span>
      <span v-if="repository.language" class="repo-row__lang">{{ repository.language }}</span>
    </span>

    <span class="repo-row__stats">
      <span class="repo-row__stat" title="Stars">⭐ {{ repository.stars }}</span>
      <span class="repo-row__stat" title="Forks">🍴 {{ repository.forks }}</span>
      <span class="repo-row__stat" title="Open issues">❗ {{ repository.issues }}</span>
    </span>

    <span class="repo-row__updated">{{ timeAgo }}</span>
  </a>
</template>

<style scoped>
.repo-row {
  display: grid;
  grid-template-columns: auto 1fr auto auto auto auto;
  align-items: center;
  gap: var(--spacing-3);
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

.repo-row__meta {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-1);
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
  white-space: nowrap;
}

.repo-row__category {
  color: var(--repo-accent, var(--color-neutral));
  font-weight: var(--font-weight-medium);
}

.repo-row__sep {
  opacity: 0.5;
}

.repo-row__stats {
  display: inline-flex;
  gap: var(--spacing-3);
  font-family: var(--font-family-mono);
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
  white-space: nowrap;
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
    grid-template-rows: auto auto;
    row-gap: 2px;
  }

  .repo-row__meta {
    grid-column: 2 / 4;
    grid-row: 2;
  }

  .repo-row__stats {
    grid-column: 1 / 4;
    grid-row: 3;
  }

  .repo-row__updated {
    grid-column: 3;
    grid-row: 1;
  }
}
</style>
