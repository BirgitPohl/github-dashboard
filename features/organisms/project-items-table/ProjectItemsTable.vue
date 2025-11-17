<template>
  <div class="items-table-container">
    <table class="items-table">
      <thead>
        <tr>
          <th>Type</th>
          <th>Title</th>
          <th>Repository</th>
          <th>State</th>
          <th v-if="showStatus">Status</th>
          <th v-if="showPriority">Priority</th>
          <th v-if="showSize">Size</th>
          <th v-if="showParentIssue">Parent Issue</th>
          <th v-if="showSubIssuesProgress">Sub-Issues</th>
          <th>Assignees</th>
          <th>Labels</th>
          <th>Updated</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in items" :key="item.id" class="item-row">
          <!-- Type -->
          <td class="type-cell">
            <span class="type-icon">{{ getTypeIcon(item.type) }}</span>
            <span class="type-text">{{ getTypeText(item.type) }}</span>
          </td>

          <!-- Title -->
          <td class="title-cell">
            <a :href="item.url" target="_blank" class="item-title">
              <span v-if="item.number">#{{ item.number }}</span> {{ item.title }}
            </a>
          </td>

          <!-- Repository -->
          <td class="repository-cell">
            <span class="repository-name">{{ item.repository }}</span>
          </td>

          <!-- State -->
          <td class="state-cell">
            <span
              class="state-badge"
              :style="{ backgroundColor: getStateColor(item.state) + '20', color: getStateColor(item.state) }"
            >
              {{ item.state }}
            </span>
          </td>

          <!-- Status -->
          <td v-if="showStatus" class="status-cell">
            <span v-if="item.status" class="status-badge">{{ item.status }}</span>
            <span v-else class="no-status">—</span>
          </td>

          <!-- Priority -->
          <td v-if="showPriority" class="priority-cell">
            <span v-if="item.priority || item.custom_fields['Priority']" class="priority-badge">
              {{ item.priority || item.custom_fields['Priority'] }}
            </span>
            <span v-else class="no-priority">—</span>
          </td>

          <!-- Size -->
          <td v-if="showSize" class="size-cell">
            <span v-if="item.custom_fields['Size']" class="size-badge">
              {{ item.custom_fields['Size'] }}
            </span>
            <span v-else class="no-size">—</span>
          </td>

          <!-- Parent Issue -->
          <td v-if="showParentIssue" class="parent-issue-cell">
            <span v-if="item.custom_fields['Parent issue']" class="parent-issue-text">
              {{ item.custom_fields['Parent issue'] }}
            </span>
            <span v-else class="no-parent-issue">—</span>
          </td>

          <!-- Sub-Issues Progress -->
          <td v-if="showSubIssuesProgress" class="sub-issues-cell">
            <div v-if="getSubIssuesData(item)" class="sub-issues-progress">
              <div class="progress-bar-container">
                <div
                  v-for="i in getSubIssuesData(item).total"
                  :key="i"
                  class="progress-bar"
                  :class="{
                    completed: i <= getSubIssuesData(item).completed,
                    incomplete: i > getSubIssuesData(item).completed
                  }"
                  :style="{ width: calculateBarWidth(getSubIssuesData(item).total) }"
                />
              </div>
              <span class="progress-text">
                {{ getSubIssuesData(item).completed }}/{{ getSubIssuesData(item).total }}
              </span>
            </div>
            <span v-else class="no-sub-issues">—</span>
          </td>

          <!-- Assignees -->
          <td class="assignees-cell">
            <div v-if="item.assignees.length > 0" class="assignees">
              <img
                v-for="assignee in item.assignees.slice(0, 3)"
                :key="assignee.login"
                :src="assignee.avatarUrl"
                :alt="assignee.login"
                :title="assignee.login"
                class="assignee-avatar"
              >
              <span v-if="item.assignees.length > 3" class="assignee-more">
                +{{ item.assignees.length - 3 }}
              </span>
            </div>
            <span v-else class="no-assignees">—</span>
          </td>

          <!-- Labels -->
          <td class="labels-cell">
            <div v-if="item.labels.length > 0" class="labels">
              <span
                v-for="label in item.labels.slice(0, 3)"
                :key="label.name"
                class="label-badge"
                :style="{ backgroundColor: '#' + label.color + '20', color: '#' + label.color }"
              >
                {{ label.name }}
              </span>
              <span v-if="item.labels.length > 3" class="labels-more">
                +{{ item.labels.length - 3 }}
              </span>
            </div>
            <span v-else class="no-labels">—</span>
          </td>

          <!-- Updated -->
          <td class="updated-cell">
            <span class="updated-date">{{ formatDate(item.updated_at) }}</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { useProjectItemsTable } from './useProjectItemsTable'

interface ProjectItem {
  id: string
  type: 'ISSUE' | 'PULL_REQUEST' | 'DRAFT_ISSUE'
  number?: number
  title: string
  url: string
  state: string
  repository: string
  repository_owner: string
  assignees: Array<{
    login: string
    avatarUrl: string
  }>
  labels: Array<{
    name: string
    color: string
  }>
  created_at: string
  updated_at: string
  status?: string
  priority?: string
  custom_fields: Record<string, string>
}

interface Props {
  items: ProjectItem[]
  showStatus?: boolean
  showPriority?: boolean
  showSize?: boolean
  showParentIssue?: boolean
  showSubIssuesProgress?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showStatus: false,
  showPriority: false,
  showSize: false,
  showParentIssue: false,
  showSubIssuesProgress: false
})

const { getTypeIcon, getTypeText, getStateColor } = useProjectItemsTable()
const { formatDate } = useDateTime()

// Helper function to parse sub-issues progress data
const getSubIssuesData = (item: ProjectItem): { completed: number; total: number } | null => {
  const dataStr = item.custom_fields['Sub-issues progress_data']
  if (!dataStr) return null

  try {
    const data = JSON.parse(dataStr)
    if (data.completed !== undefined && data.total !== undefined && data.total > 0) {
      return data
    }
  } catch (e) {
    console.error('Failed to parse sub-issues progress data:', e)
  }
  return null
}

// Calculate bar width based on total number of sub-issues
const calculateBarWidth = (total: number): string => {
  const containerWidth = 100 // px
  const gap = 1 // px between bars
  const availableWidth = containerWidth - (gap * (total - 1))
  const barWidth = availableWidth / total

  // Clamp between min (2px) and max (10px)
  const clampedWidth = Math.max(2, Math.min(10, barWidth))
  return `${clampedWidth}px`
}
</script>

<style scoped>
.items-table-container {
  overflow-x: auto;
}

.items-table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--font-size-sm);
}

.items-table th {
  background: var(--color-gray-50);
  padding: var(--spacing-3);
  text-align: left;
  font-weight: var(--font-weight-semibold);
  color: var(--color-gray-700);
  border-bottom: var(--border-width-thin) solid var(--color-gray-200);
  white-space: nowrap;
}

.items-table td {
  padding: var(--spacing-3);
  border-bottom: var(--border-width-thin) solid var(--color-gray-100);
  vertical-align: middle;
}

.item-row:hover {
  background: var(--color-gray-50);
}

.type-cell {
  display: flex;
  align-items: center;
  gap: var(--spacing-1-5);
  min-width: 80px;
}

.type-icon {
  font-size: var(--font-size-base);
}

.type-text {
  font-size: var(--font-size-xs);
  color: var(--color-gray-500);
  font-weight: var(--font-weight-medium);
}

.title-cell {
  min-width: 300px;
}

.item-title {
  color: var(--color-blue-600);
  text-decoration: none;
  font-weight: var(--font-weight-medium);
  line-height: 1.4;
}

.item-title:hover {
  text-decoration: underline;
}

.repository-cell {
  min-width: 120px;
}

.repository-name {
  color: var(--color-gray-500);
  font-size: var(--font-size-sm);
}

.state-cell {
  min-width: 80px;
}

.state-badge {
  padding: var(--spacing-1) var(--spacing-2);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  text-transform: capitalize;
}

.status-cell {
  min-width: 100px;
}

.status-badge {
  background: var(--color-gray-100);
  color: var(--color-gray-700);
  padding: var(--spacing-1) var(--spacing-2);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}

.priority-cell {
  min-width: 90px;
}

.priority-badge {
  background: var(--color-orange-50);
  color: var(--color-orange-500);
  padding: var(--spacing-1) var(--spacing-2);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}

.size-cell {
  min-width: 70px;
  text-align: center;
}

.size-badge {
  background: var(--color-blue-50);
  color: var(--color-primary-600);
  padding: var(--spacing-1) var(--spacing-2);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
}

.parent-issue-cell {
  min-width: 200px;
  max-width: 300px;
}

.parent-issue-text {
  color: var(--color-gray-600);
  font-size: var(--font-size-sm);
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.no-status, .no-priority, .no-size, .no-parent-issue, .no-sub-issues, .no-assignees, .no-labels {
  color: var(--color-gray-400);
}

.sub-issues-cell {
  min-width: 160px;
  max-width: 200px;
}

.sub-issues-progress {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.progress-bar-container {
  width: 100px;
  height: 8px;
  display: flex;
  gap: 1px;
  background: var(--color-gray-100);
  border-radius: var(--radius-sm);
  overflow: hidden;
  flex-shrink: 0;
}

.progress-bar {
  height: 100%;
  transition: background-color 0.2s;
}

.progress-bar.completed {
  background-color: var(--color-success-500);
}

.progress-bar.incomplete {
  background-color: var(--color-gray-200);
}

.progress-text {
  font-size: var(--font-size-xs);
  color: var(--color-gray-600);
  white-space: nowrap;
  font-weight: var(--font-weight-medium);
}

.assignees-cell {
  min-width: 120px;
}

.assignees {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
}

.assignee-avatar {
  width: 24px;
  height: 24px;
  border-radius: var(--radius-full);
  border: var(--border-width-thin) solid var(--color-gray-200);
}

.assignee-more {
  font-size: var(--font-size-xs);
  color: var(--color-gray-500);
  margin-left: var(--spacing-1);
}

.labels-cell {
  min-width: 150px;
}

.labels {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-1);
  align-items: center;
}

.label-badge {
  padding: var(--spacing-0-5) var(--spacing-1-5);
  border-radius: var(--radius-md);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  white-space: nowrap;
}

.labels-more {
  font-size: var(--font-size-xs);
  color: var(--color-gray-500);
}

.updated-cell {
  min-width: 80px;
}

.updated-date {
  color: var(--color-gray-500);
  font-size: var(--font-size-sm);
}

@media (max-width: 768px) {
  .items-table {
    font-size: var(--font-size-sm);
  }

  .items-table th,
  .items-table td {
    padding: var(--spacing-2);
  }
}
</style>
