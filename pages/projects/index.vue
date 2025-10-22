<script setup lang="ts">
definePageMeta({
  name: 'ProjectsOverview'
})

useHead({
  title: 'Project Boards - GitHub Dashboard'
})

interface Project {
  id: string
  title: string
  description: string
  url: string
  created_at: string
  updated_at: string
  status: 'open' | 'closed'
  items_count: number
}

const { data: projects, pending, error } = await useFetch<Project[]>('/api/projects')

// Total stats
const totalStats = computed(() => {
  if (!projects.value) return { totalProjects: 0, totalItems: 0 }
  
  return {
    totalProjects: projects.value.length,
    totalItems: projects.value.reduce((sum: number, project: Project) => sum + project.items_count, 0)
  }
})
</script>

<template>
  <div class="projects-page">
    <header class="page-header">
      <h1>GitHub Project Boards</h1>
      <p>Organization project boards and planning tools</p>
    </header>

    <!-- Loading State -->
    <div v-if="pending" class="loading-state">
      <div class="loading-spinner" />
      <p>Loading projects...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <h3>Failed to load project boards</h3>
      <div class="error-details">
        <p>{{ error.data?.message || error.message || 'Unknown error occurred' }}</p>
        
        <!-- Special handling for scope errors -->
        <div v-if="error.statusCode === 403" class="scope-error">
          <h4>🔑 Token Scope Issue</h4>
          <p>Your GitHub token needs additional permissions to access Project Boards.</p>
          <div class="scope-instructions">
            <p><strong>To fix this:</strong></p>
            <ol>
              <li>Go to <a href="https://github.com/settings/tokens" target="_blank">GitHub Token Settings</a></li>
              <li>Edit your existing token or create a new one</li>
              <li>Add the <code>read:project</code> scope</li>
              <li>Update your <code>.env</code> file with the new token</li>
              <li>Restart the development server</li>
            </ol>
          </div>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div v-else-if="projects && projects.length > 0">
      <!-- Stats Overview -->
      <div class="stats-overview">
        <div class="stat-card">
          <div class="stat-icon">📋</div>
          <div class="stat-content">
            <div class="stat-value">{{ totalStats.totalProjects }}</div>
            <div class="stat-label">Project Boards</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">📝</div>
          <div class="stat-content">
            <div class="stat-value">{{ totalStats.totalItems }}</div>
            <div class="stat-label">Total Items</div>
          </div>
        </div>
      </div>

      <!-- Projects Grid -->
      <div class="projects-section">
        <h2>All Project Boards</h2>
        <div class="projects-grid">
          <ProjectCard 
            v-for="project in projects" 
            :key="project.id"
            :project="project"
          />
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="projects && projects.length === 0" class="empty-state">
      <div class="empty-icon">📋</div>
      <h3>No Project Boards Found</h3>
      <p>This organization doesn't have any GitHub Project Boards yet.</p>
      <a 
        :href="`https://github.com/orgs/Oracommit/projects`" 
        target="_blank"
        class="create-project-link"
      >
        Create First Project Board →
      </a>
    </div>
  </div>
</template>

<style scoped>
.projects-page {
  padding: 20px;
  min-height: 100vh;
  background: #f8fafc;
}

.page-header {
  margin-bottom: 32px;
  text-align: center;
}

.page-header h1 {
  font-size: 32px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 8px 0;
}

.page-header p {
  font-size: 16px;
  color: #6b7280;
  margin: 0;
}

.loading-state {
  text-align: center;
  padding: 60px 20px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e5e7eb;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-state p {
  color: #6b7280;
  font-size: 16px;
}

.error-state {
  text-align: center;
  padding: 60px 20px;
  color: #ef4444;
  max-width: 600px;
  margin: 0 auto;
}

.error-state h3 {
  margin: 0 0 16px 0;
  font-size: 20px;
}

.error-details p {
  margin: 0 0 16px 0;
  font-size: 14px;
  color: #6b7280;
}

.scope-error {
  background: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 8px;
  padding: 20px;
  margin-top: 20px;
  text-align: left;
}

.scope-error h4 {
  color: #92400e;
  margin: 0 0 12px 0;
  font-size: 16px;
}

.scope-error p {
  color: #92400e;
  margin: 0 0 12px 0;
}

.scope-instructions {
  background: white;
  border-radius: 6px;
  padding: 16px;
  margin-top: 12px;
}

.scope-instructions ol {
  margin: 8px 0 0 0;
  padding-left: 20px;
  color: #374151;
}

.scope-instructions code {
  background: #f3f4f6;
  padding: 2px 4px;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
  font-size: 13px;
}

.scope-instructions a {
  color: #2563eb;
  text-decoration: underline;
}

.stats-overview {
  display: flex;
  gap: 20px;
  margin-bottom: 32px;
  flex-wrap: wrap;
  justify-content: center;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  min-width: 200px;
}

.stat-icon {
  font-size: 24px;
  width: 48px;
  height: 48px;
  background: #f3f4f6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #111827;
}

.stat-label {
  font-size: 14px;
  color: #6b7280;
}

.projects-section {
  margin-bottom: 32px;
}

.projects-section h2 {
  font-size: 24px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 20px 0;
  text-align: center;
}

.projects-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-state h3 {
  font-size: 20px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 8px 0;
}

.empty-state p {
  color: #6b7280;
  margin: 0 0 20px 0;
}

.create-project-link {
  color: #2563eb;
  text-decoration: none;
  font-weight: 500;
  padding: 8px 16px;
  border: 1px solid #2563eb;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.create-project-link:hover {
  background: #2563eb;
  color: white;
}

@media (max-width: 768px) {
  .projects-page {
    padding: 16px;
  }
  
  .stats-overview {
    gap: 16px;
  }
  
  .stat-card {
    min-width: 160px;
    padding: 20px;
  }
  
  .projects-grid {
    gap: 16px;
  }
}
</style>