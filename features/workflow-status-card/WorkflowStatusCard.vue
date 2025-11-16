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
          <h3 class="workflow-name">
            {{ workflow.name }}
          </h3>
          <p class="repository-name">
            {{ workflow.repository }}
            <span v-if="workflow.is_private" class="private-badge">Private</span>
          </p>
        </div>
      </div>
    </template>

    <template #body>
      <div class="card-details">
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
          <span>Last run:</span>
          <span>{{ timeAgo }}</span>
        </div>

        <div class="detail-row">
          <span>Branch:</span>
          <span class="branch-name">{{ workflow.branch }}</span>
        </div>

        <div class="detail-row">
          <span>Run #:</span>
          <span>{{ workflow.run_number }}</span>
        </div>
      </div>
    </template>

    <template #bottom>
      <a
        :href="workflow.html_url"
        target="_blank"
        class="view-link"
      >
        View Details →
      </a>
    </template>
  </BaseCard>
</template>

<style scoped>
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
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-1) 0;
  line-height: var(--line-height-tight);
  word-break: break-word;
}

.repository-name {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  margin: 0;
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  word-break: break-word;
}

.private-badge {
  background: var(--color-warning-50);
  color: var(--color-warning-700);
  padding: 1px var(--spacing-2);
  border-radius: var(--radius-lg);
  font-size: 10px;
  font-weight: var(--font-weight-medium);
  text-transform: uppercase;
}

.card-details {
  margin-bottom: var(--spacing-4);
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-2);
  font-size: var(--font-size-sm);
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

.branch-name {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  background: var(--color-gray-100);
  padding: var(--spacing-1) var(--spacing-2);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
}
</style>
