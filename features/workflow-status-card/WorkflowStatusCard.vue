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
  gap: 12px;
}

.status-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 2px;
}

.workflow-info {
  flex: 1;
  min-width: 0;
}

.workflow-name {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 4px 0;
  line-height: 1.2;
  word-break: break-word;
}

.repository-name {
  font-size: 13px;
  color: #6b7280;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  word-break: break-word;
}

.private-badge {
  background: #fef3c7;
  color: #92400e;
  padding: 1px 6px;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 500;
  text-transform: uppercase;
}

.card-details {
  margin-bottom: 16px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 14px;
}

.detail-row span:first-child {
  color: #6b7280;
}

.detail-row span:last-child {
  color: #374151;
  font-weight: 500;
}

.status-text {
  font-weight: 600;
}

.view-link {
  color: #2563eb;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: color 0.2s ease;
}

.view-link:hover {
  color: #1d4ed8;
  text-decoration: underline;
}

.branch-name {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  background: #f3f4f6;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
}
</style>
