<script setup lang="ts">
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

const statusConfig = computed(() => {
  const status = props.project.state
  
  switch (status) {
    case 'OPEN':
      return {
        color: '#10b981', // Green
        bgColor: '#f0fdf4',
        borderColor: '#10b981',
        icon: '🚀',
        label: 'Active'
      }
    case 'CLOSED':
      return {
        color: '#6b7280', // Gray
        bgColor: '#f9fafb',
        borderColor: '#6b7280',
        icon: '✅',
        label: 'Closed'
      }
    default:
      return {
        color: '#6b7280', // Gray
        bgColor: '#f9fafb',
        borderColor: '#6b7280',
        icon: '📋',
        label: 'Unknown'
      }
  }
})

const timeAgo = computed(() => {
  const now = new Date()
  const updated = new Date(props.project.updatedAt)
  const diffMs = now.getTime() - updated.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays > 0) {
    return `${diffDays}d ago`
  } else if (diffHours > 0) {
    return `${diffHours}h ago`
  } else {
    return 'Recent'
  }
})

const createdAgo = computed(() => {
  const now = new Date()
  const created = new Date(props.project.createdAt)
  const diffMs = now.getTime() - created.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays > 365) {
    const years = Math.floor(diffDays / 365)
    return `${years} year${years > 1 ? 's' : ''} ago`
  } else if (diffDays > 30) {
    const months = Math.floor(diffDays / 30)
    return `${months} month${months > 1 ? 's' : ''} ago`
  } else if (diffDays > 0) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  } else {
    return 'Today'
  }
})
</script>

<template>
  <div 
    class="project-card"
    :style="{ 
      backgroundColor: statusConfig.bgColor,
      borderColor: statusConfig.borderColor
    }"
  >
    <!-- Header -->
    <div class="card-header">
      <div class="project-info">
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
        <p v-if="project.shortDescription" class="project-description">{{ project.shortDescription }}</p>
      </div>
    </div>

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

    <!-- Action -->
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
  </div>
</template>

<style scoped>
.project-card {
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px;
  width: 320px;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.project-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.card-header {
  margin-bottom: 16px;
}

.project-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.status-icon {
  font-size: 18px;
  flex-shrink: 0;
}

.project-name {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin: 0;
  line-height: 1.2;
  word-break: break-word;
  flex: 1;
  min-width: 0;
}

.project-link {
  color: inherit;
  text-decoration: none;
  transition: color 0.2s ease;
}

.project-link:hover {
  color: #2563eb;
}

.status-badge {
  padding: 2px 8px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  flex-shrink: 0;
}

.project-description {
  font-size: 13px;
  color: #6b7280;
  margin: 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.project-stats {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f3f4f6;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.stat-icon {
  font-size: 14px;
}

.stat-label {
  font-size: 12px;
  color: #6b7280;
}

.stat-value {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.project-details {
  margin-bottom: 16px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
  font-size: 13px;
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
  padding-top: 12px;
  border-top: 1px solid #f3f4f6;
  display: flex;
  gap: 12px;
  align-items: center;
}

.view-link {
  color: #2563eb;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: color 0.2s ease;
  flex: 1;
}

.view-link:hover {
  color: #1d4ed8;
  text-decoration: underline;
}

.primary-link {
  background: #2563eb;
  color: white;
  padding: 8px 16px;
  border-radius: 6px;
  text-decoration: none;
}

.primary-link:hover {
  background: #1d4ed8;
  text-decoration: none;
  color: white;
}

.github-link {
  color: #6b7280;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.2s ease;
}

.github-link:hover {
  color: #374151;
}
</style>