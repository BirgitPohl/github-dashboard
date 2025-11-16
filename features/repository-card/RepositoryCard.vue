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

const { getCategoryConfig, formatSize } = useRepositoryCard()
const { formatTimeAgoSimple } = useDateTime()

const categoryConfig = computed(() => getCategoryConfig(props.repository.category))
const timeAgo = computed(() => formatTimeAgoSimple(props.repository.updated_at))
const sizeFormatted = computed(() => formatSize(props.repository.size))
</script>

<template>
  <BaseCard
    width="300px"
    :border-color="categoryConfig.borderColor"
    :bg-color="categoryConfig.bgColor"
  >
    <template #header>
      <div class="project-title">
        <span class="category-icon">{{ categoryConfig.icon }}</span>
        <h3 class="project-name">
          {{ repository.name }}
        </h3>
        <span v-if="repository.is_private" class="private-badge">Private</span>
      </div>
      <p class="project-description">
        {{ repository.description }}
      </p>
    </template>

    <template #body>
      <!-- Stats -->
      <div class="project-stats">
        <div class="stat-item">
          <span class="stat-icon">⭐</span>
          <span class="stat-value">{{ repository.stars }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-icon">🍴</span>
          <span class="stat-value">{{ repository.forks }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-icon">❗</span>
          <span class="stat-value">{{ repository.issues }}</span>
        </div>
      </div>

      <!-- Tech Stack -->
      <div v-if="repository.tech_stack.length > 0" class="tech-stack">
        <span class="tech-label">Tech:</span>
        <div class="tech-tags">
          <span
            v-for="tech in repository.tech_stack.slice(0, 3)"
            :key="tech"
            class="tech-tag"
          >
            {{ tech }}
          </span>
          <span v-if="repository.tech_stack.length > 3" class="tech-more">
            +{{ repository.tech_stack.length - 3 }}
          </span>
        </div>
      </div>

      <!-- Details -->
      <div class="project-details">
        <div class="detail-row">
          <span>Category:</span>
          <span
            class="category-label"
            :style="{ color: categoryConfig.color }"
          >
            {{ categoryConfig.label }}
          </span>
        </div>

        <div class="detail-row">
          <span>Updated:</span>
          <span>{{ timeAgo }}</span>
        </div>

        <div class="detail-row">
          <span>Size:</span>
          <span>{{ sizeFormatted }}</span>
        </div>
      </div>
    </template>

    <template #bottom>
      <a
        :href="repository.html_url"
        target="_blank"
        class="view-link"
      >
        View Repository →
      </a>
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

.category-icon {
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

.private-badge {
  background: var(--color-warning-50);
  color: var(--color-warning-700);
  padding: var(--spacing-1) var(--spacing-2);
  border-radius: var(--radius-lg);
  font-size: 10px;
  font-weight: var(--font-weight-medium);
  text-transform: uppercase;
  flex-shrink: 0;
}

.project-description {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  margin: 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
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
  gap: var(--spacing-1);
}

.stat-icon {
  font-size: var(--font-size-sm);
}

.stat-value {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-tertiary);
}

.tech-stack {
  margin-bottom: var(--spacing-4);
  padding-bottom: var(--spacing-3);
  border-bottom: 1px solid var(--color-gray-100);
}

.tech-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  display: block;
  margin-bottom: var(--spacing-2);
}

.tech-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-1);
}

.tech-tag {
  background: var(--color-border-default);
  color: var(--color-text-tertiary);
  padding: var(--spacing-1) var(--spacing-2);
  border-radius: var(--radius-xl);
  font-size: 11px;
  font-weight: var(--font-weight-medium);
}

.tech-more {
  background: var(--color-gray-300);
  color: var(--color-text-secondary);
  padding: var(--spacing-1) var(--spacing-2);
  border-radius: var(--radius-xl);
  font-size: 11px;
  font-weight: var(--font-weight-medium);
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

.category-label {
  font-weight: var(--font-weight-semibold);
}

.view-link {
  color: var(--color-primary-600);
  text-decoration: none;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  transition: color var(--transition-base);
}

.view-link:hover {
  color: var(--color-primary-700);
  text-decoration: underline;
}
</style>
