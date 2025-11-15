<script setup lang="ts">
import { computed } from 'vue'

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

const statusConfig = computed(() => {
  const state = props.workflow.state?.toLowerCase() || 'unknown'
  const status = props.workflow.status?.toLowerCase() || ''
  
  if (state === 'active') {
    return {
      color: '#10b981', // Green
      textColor: 'text-green-700',
      bgColor: '#f0fdf4', // Light green background
      borderColor: '#10b981',
      icon: '●',
      label: 'Active'
    }
  } else if (state === 'disabled') {
    return {
      color: '#6b7280', // Gray
      textColor: 'text-gray-700',
      bgColor: '#f9fafb', // Light gray background
      borderColor: '#6b7280',
      icon: '●',
      label: 'Disabled'
    }
  } else if (status.includes('failure') || status.includes('error') || status.includes('failed')) {
    return {
      color: '#ef4444', // Red
      textColor: 'text-red-700',
      bgColor: '#fef2f2', // Light red background
      borderColor: '#ef4444',
      icon: '●',
      label: 'Failed'
    }
  } else if (status.includes('success') || status.includes('completed') || status.includes('passed')) {
    return {
      color: '#10b981', // Green
      textColor: 'text-green-700',
      bgColor: '#f0fdf4', // Light green background
      borderColor: '#10b981',
      icon: '●',
      label: 'Passed'
    }
  } else {
    return {
      color: '#6b7280', // Gray
      textColor: 'text-gray-700',
      bgColor: '#f9fafb', // Light gray background
      borderColor: '#6b7280',
      icon: '●',
      label: state || 'Unknown'
    }
  }
})

const { formatTimeAgoSimple } = useDateTime()
const timeAgo = computed(() => formatTimeAgoSimple(props.workflow.updated_at))
</script>

<template>
  <div 
    class="workflow-card"
    :style="{ 
      backgroundColor: statusConfig.bgColor,
      borderColor: statusConfig.borderColor
    }"
  >
    <!-- Status and Name -->
    <div class="card-header">
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
    </div>

    <!-- Details -->
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

    <!-- Action -->
    <div class="card-action">
      <a 
        :href="workflow.html_url"
        target="_blank"
        class="view-link"
      >
        View Details →
      </a>
    </div>
  </div>
</template>

<style scoped>
.workflow-card {
  background: white; /* Will be overridden by inline style */
  border: 2px solid #e5e7eb; /* Will be overridden by inline style */
  border-radius: 8px;
  padding: 20px;
  width: 250px;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.workflow-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-header {
  margin-bottom: 16px;
}

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

.card-action {
  padding-top: 16px;
  border-top: 1px solid #f3f4f6;
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

.branches-section {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f3f4f6;
}

.branches-label {
  color: #6b7280;
  font-size: 12px;
  display: block;
  margin-bottom: 6px;
}

.branches-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.branch-tag {
  background: #e5e7eb;
  color: #374151;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}
</style>
