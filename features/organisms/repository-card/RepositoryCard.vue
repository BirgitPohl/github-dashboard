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
        <Icon :icon="categoryConfig.icon" size="lg" decorative />
        <Header :level="3" size="base" class="project-name">
          {{ repository.name }}
        </Header>
        <Tag v-if="repository.is_private" label="Private" variant="warning" size="sm" />
      </div>
      <Text variant="secondary" size="xs" line-clamp="2" class="project-description">
        {{ repository.description }}
      </Text>
    </template>

    <template #body>
      <!-- Stats -->
      <div class="project-stats">
        <div class="stat-item">
          <Icon icon="⭐" size="sm" decorative />
          <Text variant="tertiary" size="xs" weight="medium">{{ repository.stars }}</Text>
        </div>
        <div class="stat-item">
          <Icon icon="🍴" size="sm" decorative />
          <Text variant="tertiary" size="xs" weight="medium">{{ repository.forks }}</Text>
        </div>
        <div class="stat-item">
          <Icon icon="❗" size="sm" decorative />
          <Text variant="tertiary" size="xs" weight="medium">{{ repository.issues }}</Text>
        </div>
      </div>

      <!-- Tech Stack -->
      <div v-if="repository.tech_stack.length > 0" class="tech-stack">
        <Text variant="secondary" size="xs" class="tech-label">Tech:</Text>
        <div class="tech-tags">
          <Tag
            v-for="tech in repository.tech_stack.slice(0, 3)"
            :key="tech"
            :label="tech"
            variant="default"
            size="sm"
          />
          <Tag
            v-if="repository.tech_stack.length > 3"
            :label="`+${repository.tech_stack.length - 3}`"
            variant="default"
            size="sm"
          />
        </div>
      </div>

      <!-- Details -->
      <div class="project-details">
        <div class="detail-row">
          <Text variant="secondary" size="xs">Category:</Text>
          <Text
            variant="tertiary"
            size="xs"
            weight="semibold"
            :style="{ color: categoryConfig.color }"
          >
            {{ categoryConfig.label }}
          </Text>
        </div>

        <div class="detail-row">
          <Text variant="secondary" size="xs">Updated:</Text>
          <Text variant="tertiary" size="xs" weight="medium">{{ timeAgo }}</Text>
        </div>

        <div class="detail-row">
          <Text variant="secondary" size="xs">Size:</Text>
          <Text variant="tertiary" size="xs" weight="medium">{{ sizeFormatted }}</Text>
        </div>
      </div>
    </template>

    <template #bottom>
      <Link
        :href="repository.html_url"
        variant="primary"
        size="sm"
        external
      >
        View Repository →
      </Link>
    </template>
  </BaseCard>
</template>

<style scoped>
/* Layout structure only - typography and colors handled by atoms */
.project-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  margin-bottom: var(--spacing-2);
  flex-wrap: wrap;
}

.project-name {
  word-break: break-word;
  flex: 1;
  min-width: 0;
}

.project-description {
  margin: 0;
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

.tech-stack {
  margin-bottom: var(--spacing-4);
  padding-bottom: var(--spacing-3);
  border-bottom: 1px solid var(--color-gray-100);
}

.tech-label {
  display: block;
  margin-bottom: var(--spacing-2);
}

.tech-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-1);
}

.project-details {
  margin-bottom: var(--spacing-4);
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-2);
}
</style>
