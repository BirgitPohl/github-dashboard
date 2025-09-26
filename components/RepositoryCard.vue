<script setup lang="ts">
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

const categoryConfig = computed(() => {
  const category = props.repository.category.toLowerCase()
  
  switch (category) {
    case 'web application':
      return {
        color: '#10b981', // Green
        bgColor: '#f0fdf4',
        borderColor: '#10b981',
        icon: '🌐',
        label: 'Web App'
      }
    case 'api/service':
      return {
        color: '#3b82f6', // Blue
        bgColor: '#eff6ff',
        borderColor: '#3b82f6',
        icon: '⚡',
        label: 'API/Service'
      }
    case 'library/component':
      return {
        color: '#8b5cf6', // Purple
        bgColor: '#f5f3ff',
        borderColor: '#8b5cf6',
        icon: '📦',
        label: 'Library'
      }
    case 'documentation':
      return {
        color: '#f59e0b', // Amber
        bgColor: '#fffbeb',
        borderColor: '#f59e0b',
        icon: '📚',
        label: 'Docs'
      }
    case 'tool/utility':
      return {
        color: '#ef4444', // Red
        bgColor: '#fef2f2',
        borderColor: '#ef4444',
        icon: '🔧',
        label: 'Tool'
      }
    default:
      return {
        color: '#6b7280', // Gray
        bgColor: '#f9fafb',
        borderColor: '#6b7280',
        icon: '📁',
        label: 'General'
      }
  }
})

const timeAgo = computed(() => {
  const now = new Date()
  const updated = new Date(props.repository.updated_at)
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

const formatSize = computed(() => {
  const kb = props.repository.size
  if (kb < 1024) return `${kb} KB`
  const mb = kb / 1024
  if (mb < 1024) return `${mb.toFixed(1)} MB`
  const gb = mb / 1024
  return `${gb.toFixed(1)} GB`
})
</script>

<template>
  <div 
    class="project-card"
    :style="{ 
      backgroundColor: categoryConfig.bgColor,
      borderColor: categoryConfig.borderColor
    }"
  >
    <!-- Header -->
    <div class="card-header">
      <div class="project-info">
        <div class="project-title">
          <span class="category-icon">{{ categoryConfig.icon }}</span>
          <h3 class="project-name">{{ repository.name }}</h3>
          <span v-if="repository.is_private" class="private-badge">Private</span>
        </div>
        <p class="project-description">{{ repository.description }}</p>
      </div>
    </div>

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
        <span>{{ formatSize }}</span>
      </div>
    </div>

    <!-- Action -->
    <div class="card-action">
      <a 
        :href="repository.html_url"
        target="_blank"
        class="view-link"
      >
        View Repository →
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
  width: 300px;
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

.category-icon {
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

.private-badge {
  background: #fef3c7;
  color: #92400e;
  padding: 2px 6px;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 500;
  text-transform: uppercase;
  flex-shrink: 0;
}

.project-description {
  font-size: 13px;
  color: #6b7280;
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
  gap: 16px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f3f4f6;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.stat-icon {
  font-size: 14px;
}

.stat-value {
  font-size: 13px;
  font-weight: 500;
  color: #374151;
}

.tech-stack {
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f3f4f6;
}

.tech-label {
  font-size: 12px;
  color: #6b7280;
  display: block;
  margin-bottom: 6px;
}

.tech-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.tech-tag {
  background: #e5e7eb;
  color: #374151;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
}

.tech-more {
  background: #d1d5db;
  color: #6b7280;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
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

.category-label {
  font-weight: 600;
}

.card-action {
  padding-top: 12px;
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
</style>