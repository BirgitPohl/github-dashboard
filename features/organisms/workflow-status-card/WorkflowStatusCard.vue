<script setup lang="ts">
import { useWorkflowStatusCard } from './useWorkflowStatusCard'

interface Workflow {
  id: string
  workflow_id: number
  name: string
  repository: string
  branch: string
  state: string
  status: string
  updated_at: string
  html_url: string
  workflow_url: string
  badge_url: string
  run_number: number
  event: string
  is_private: boolean
}

const props = defineProps<{
  workflow: Workflow
}>()

const { getStatusConfig } = useWorkflowStatusCard()
const { formatTimeAgoSimple } = useDateTime()

const statusConfig = computed(() => getStatusConfig(props.workflow))
const timeAgo = computed(() => formatTimeAgoSimple(props.workflow.updated_at))
</script>

<template>
  <BaseCard
    width="300px"
    :border-color="statusConfig.borderColor"
    :bg-color="statusConfig.bgColor"
  >
    <template #header>
      <div class="status-row">
        <div
          class="status-dot"
          :style="{ backgroundColor: statusConfig.color }"
        />
        <div class="workflow-info">
          <Header :level="3" size="base" class="workflow-name">
            {{ workflow.name }}
          </Header>
          <div class="repository-name">
            <Text variant="secondary" size="xs">{{ workflow.repository }}</Text>
            <Tag v-if="workflow.is_private" label="Private" variant="warning" size="sm" />
          </div>
        </div>
      </div>
    </template>

    <template #body>
      <div class="card-details">
        <div class="detail-row">
          <Text variant="secondary" size="sm">Status:</Text>
          <Text
            variant="tertiary"
            size="sm"
            weight="semibold"
            :style="{ color: statusConfig.color }"
          >
            {{ statusConfig.label }}
          </Text>
        </div>

        <div class="detail-row">
          <Text variant="secondary" size="sm">Last run:</Text>
          <Text variant="tertiary" size="sm" weight="medium">{{ timeAgo }}</Text>
        </div>

        <div class="detail-row">
          <Text variant="secondary" size="sm">Branch:</Text>
          <Tag :label="workflow.branch" variant="default" size="sm" class="branch-tag" />
        </div>

        <div class="detail-row">
          <Text variant="secondary" size="sm">Run #:</Text>
          <Text variant="tertiary" size="sm" weight="medium">{{ workflow.run_number }}</Text>
        </div>
      </div>
    </template>

    <template #bottom>
      <Link
        :href="workflow.html_url"
        variant="primary"
        size="sm"
        external
      >
        View Details →
      </Link>
    </template>
  </BaseCard>
</template>

<style scoped>
/* Layout structure only - typography and colors handled by atoms */
.status-row {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-3);
}

.status-dot {
  width: var(--spacing-3);
  height: var(--spacing-3);
  border-radius: var(--radius-full);
  flex-shrink: 0;
  margin-top: var(--spacing-1);
}

.workflow-info {
  flex: 1;
  min-width: 0;
}

.workflow-name {
  margin: 0 0 var(--spacing-1) 0;
  word-break: break-word;
}

.repository-name {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  word-break: break-word;
}

.card-details {
  margin-bottom: var(--spacing-4);
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-2);
}

.branch-tag {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}
</style>
