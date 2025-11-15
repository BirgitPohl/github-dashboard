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
}

const props = withDefaults(defineProps<Props>(), {
  showStatus: false
})

const { getTypeIcon, getTypeText, getStateColor } = useProjectItemsTable()
const { formatDate } = useDateTime()
</script>

<style scoped>
.items-table-container {
  overflow-x: auto;
}

.items-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.items-table th {
  background: #f9fafb;
  padding: 12px;
  text-align: left;
  font-weight: 600;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
  white-space: nowrap;
}

.items-table td {
  padding: 12px;
  border-bottom: 1px solid #f3f4f6;
  vertical-align: middle;
}

.item-row:hover {
  background: #f9fafb;
}

.type-cell {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 80px;
}

.type-icon {
  font-size: 16px;
}

.type-text {
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
}

.title-cell {
  min-width: 300px;
}

.item-title {
  color: #2563eb;
  text-decoration: none;
  font-weight: 500;
  line-height: 1.4;
}

.item-title:hover {
  text-decoration: underline;
}

.repository-cell {
  min-width: 120px;
}

.repository-name {
  color: #6b7280;
  font-size: 13px;
}

.state-cell {
  min-width: 80px;
}

.state-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  text-transform: capitalize;
}

.status-cell {
  min-width: 100px;
}

.status-badge {
  background: #f3f4f6;
  color: #374151;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.no-status, .no-assignees, .no-labels {
  color: #9ca3af;
}

.assignees-cell {
  min-width: 120px;
}

.assignees {
  display: flex;
  align-items: center;
  gap: 4px;
}

.assignee-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 1px solid #e5e7eb;
}

.assignee-more {
  font-size: 12px;
  color: #6b7280;
  margin-left: 4px;
}

.labels-cell {
  min-width: 150px;
}

.labels {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
}

.label-badge {
  padding: 2px 6px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 500;
  white-space: nowrap;
}

.labels-more {
  font-size: 12px;
  color: #6b7280;
}

.updated-cell {
  min-width: 80px;
}

.updated-date {
  color: #6b7280;
  font-size: 13px;
}

@media (max-width: 768px) {
  .items-table {
    font-size: 13px;
  }

  .items-table th,
  .items-table td {
    padding: 8px;
  }
}
</style>
