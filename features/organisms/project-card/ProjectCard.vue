<script setup lang="ts">
import { useProjectCard } from './useProjectCard'

interface Project {
  id: string
  title: string
  shortDescription?: string
  url: string
  createdAt: string
  updatedAt: string
  state: 'OPEN' | 'CLOSED'
  items: {
    totalCount: number
  }
}

const props = defineProps<{
  project: Project
}>()

const { getStatusConfig } = useProjectCard()
const { formatTimeAgoSimple, formatTimeAgoDetailed } = useDateTime()

const statusConfig = computed(() => getStatusConfig(props.project.state))
const timeAgo = computed(() => formatTimeAgoSimple(props.project.updatedAt))
const createdAgo = computed(() => formatTimeAgoDetailed(props.project.createdAt))
</script>

<template>
  <BaseCard
    width="300px"
    :border-color="statusConfig.borderColor"
    :bg-color="statusConfig.bgColor"
  >
    <template #header>
      <div class="project-title">
        <span class="status-icon">{{ statusConfig.icon }}</span>
        <h3 class="project-name">
          <NuxtLink :to="`/projects/${project.id}`" class="project-link">
            {{ project.title }}
          </NuxtLink>
        </h3>
        <span
          class="status-badge"
          :style="{
            backgroundColor: statusConfig.color + '20',
            color: statusConfig.color
          }"
        >
          {{ statusConfig.label }}
        </span>
      </div>
      <p v-if="project.shortDescription" class="project-description">
        {{ project.shortDescription }}
      </p>
    </template>

    <template #body>
      <!-- Stats -->
      <div class="project-stats">
        <div class="stat-item">
          <span class="stat-icon">📋</span>
          <span class="stat-label">Items:</span>
          <span class="stat-value">{{ project.items.totalCount }}</span>
        </div>
      </div>

      <!-- Details -->
      <div class="project-details">
        <div class="detail-row">
          <span>Status:</span>
          <span
            class="status-text"
            :style="{ color: statusConfig.color }"
          >
            {{ statusConfig.label }}
          </span>
        </div>

        <div class="detail-row">
          <span>Updated:</span>
          <span>{{ timeAgo }}</span>
        </div>

        <div class="detail-row">
          <span>Created:</span>
          <span>{{ createdAgo }}</span>
        </div>
      </div>
    </template>

    <template #bottom>
      <div class="card-action">
        <NuxtLink
          :to="`/projects/${project.id}`"
          class="view-link primary-link"
        >
          View Project Board
        </NuxtLink>
        <a
          :href="project.url"
          target="_blank"
          class="github-link"
          title="Open on GitHub"
        >
          GitHub →
        </a>
      </div>
    </template>
  </BaseCard>
</template>

<style scoped>
.project-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  margin-bottom: var(--spacing-2);
  flex-wrap: wrap;
}

.status-icon {
  font-size: var(--font-size-lg);
  flex-shrink: 0;
}

.project-name {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
  line-height: var(--line-height-tight);
  word-break: break-word;
  flex: 1;
  min-width: 0;
}

.project-link {
  color: inherit;
  text-decoration: none;
  transition: color var(--transition-base);
}

.project-link:hover {
  color: var(--color-primary-600);
}

.status-badge {
  padding: var(--spacing-1) var(--spacing-2);
  border-radius: var(--radius-lg);
  font-size: var(--font-size-2xs);
  font-weight: var(--font-weight-semibold);
  text-transform: uppercase;
  flex-shrink: 0;
}

.project-description {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  margin: 0;
  line-height: var(--line-height-base);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: var(--line-clamp-3);
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.project-stats {
  display: flex;
  gap: var(--spacing-4);
  margin-bottom: var(--spacing-4);
  padding-bottom: var(--spacing-3);
  border-bottom: 1px solid var(--color-gray-100);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.stat-icon {
  font-size: var(--font-size-sm);
}

.stat-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.stat-value {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-tertiary);
}

.project-details {
  margin-bottom: var(--spacing-4);
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-2);
  font-size: var(--font-size-xs);
}

.detail-row span:first-child {
  color: var(--color-text-secondary);
}

.detail-row span:last-child {
  color: var(--color-text-tertiary);
  font-weight: var(--font-weight-medium);
}

.status-text {
  font-weight: var(--font-weight-semibold);
}

.card-action {
  display: flex;
  gap: var(--spacing-3);
  align-items: center;
}

.view-link {
  color: var(--color-primary-600);
  text-decoration: none;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  transition: color var(--transition-base);
  flex: 1;
}

.view-link:hover {
  color: var(--color-primary-700);
  text-decoration: underline;
}

.primary-link {
  background: var(--color-primary-600);
  color: var(--color-text-inverse);
  padding: var(--spacing-2) var(--spacing-4);
  border-radius: var(--radius-md);
  text-decoration: none;
}

.primary-link:hover {
  background: var(--color-primary-700);
  text-decoration: none;
  color: var(--color-text-inverse);
}

.github-link {
  color: var(--color-text-secondary);
  text-decoration: none;
  font-size: var(--font-size-sm);
  transition: color var(--transition-base);
}

.github-link:hover {
  color: var(--color-text-tertiary);
}
</style>
