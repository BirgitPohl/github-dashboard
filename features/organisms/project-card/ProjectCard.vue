<script setup lang="ts">
import { useProjectCard } from './useProjectCard'

interface Project {
  id: string
  number: number
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
        <Icon :icon="statusConfig.icon" size="lg" decorative />
        <Header :level="3" size="base" class="project-name">
          <Link :to="`/projects/${project.number}`" variant="secondary">
            {{ project.title }}
          </Link>
        </Header>
        <Tag
          :label="statusConfig.label"
          variant="primary"
          size="sm"
          :style="{
            backgroundColor: statusConfig.color + '20',
            color: statusConfig.color
          }"
        />
      </div>
      <Text
        v-if="project.shortDescription"
        variant="secondary"
        size="xs"
        line-height="base"
        :line-clamp="3"
        class="project-description"
      >
        {{ project.shortDescription }}
      </Text>
    </template>

    <template #body>
      <!-- Stats -->
      <div class="project-stats">
        <div class="stat-item">
          <Icon icon="📋" size="sm" decorative />
          <Text variant="secondary" size="xs">Items:</Text>
          <Text variant="tertiary" size="sm" weight="semibold">{{ project.items.totalCount }}</Text>
        </div>
      </div>

      <!-- Details -->
      <div class="project-details">
        <div class="detail-row">
          <Text variant="secondary" size="xs">Status:</Text>
          <Text
            variant="tertiary"
            size="xs"
            weight="semibold"
            :style="{ color: statusConfig.color }"
          >
            {{ statusConfig.label }}
          </Text>
        </div>

        <div class="detail-row">
          <Text variant="secondary" size="xs">Updated:</Text>
          <Text variant="tertiary" size="xs" weight="medium">{{ timeAgo }}</Text>
        </div>

        <div class="detail-row">
          <Text variant="secondary" size="xs">Created:</Text>
          <Text variant="tertiary" size="xs" weight="medium">{{ createdAgo }}</Text>
        </div>
      </div>
    </template>

    <template #bottom>
      <div class="card-action">
        <Button
          variant="primary"
          size="md"
          class="view-button"
          @click="navigateTo(`/projects/${project.number}`)"
        >
          View Project Board
        </Button>
        <Link
          :href="project.url"
          variant="secondary"
          size="sm"
          external
          title="Open on GitHub"
        >
          GitHub →
        </Link>
      </div>
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
  gap: var(--spacing-2);
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

.card-action {
  display: flex;
  gap: var(--spacing-3);
  align-items: center;
}

.view-button {
  flex: 1;
}
</style>
