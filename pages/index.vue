<script setup lang="ts">
definePageMeta({
  name: 'WorkflowsDashboard'
})

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

useHead({
  title: 'Workflows - GitHub Dashboard',
  meta: [
    { name: 'description', content: 'Beautiful dashboard for monitoring GitHub workflow states' }
  ]
})

const { data, error, pending: loading } = await useFetch<{ workflows: Workflow[] }>('/api/workflows')
const workflows = computed(() => {
  // Sort workflows by newest first (updated_at)
  return (data.value?.workflows || []).sort((a, b) => {
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  })
})
</script>

<template>
  <div class="dashboard">
    <div class="header">
      <h1>GitHub Workflows</h1>
      <p>Monitor workflows across all repositories</p>
    </div>

    <div v-if="loading" class="loading">
      <div class="spinner" />
      <span>Loading workflows...</span>
    </div>

    <div v-else-if="error" class="error">
      <div class="error-box">
        <h3>Error</h3>
        <p>{{ error.message || error || 'Failed to load workflows' }}</p>
      </div>
    </div>

    <div v-else class="content">
      <div class="workflows-container">
        <WorkflowStatusCard
          v-for="workflow in workflows"
          :key="workflow.id"
          :workflow="workflow"
        />
      </div>

      <div v-if="workflows.length === 0" class="empty-state">
        <h3>No workflows found</h3>
        <p>This repository doesn't have any workflows.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  padding: 32px;
}

.header {
  max-width: 1200px;
  margin: 0 auto 48px auto;
}

.header h1 {
  font-size: 30px;
  font-weight: bold;
  color: #111827;
  margin-bottom: 8px;
}

.header p {
  color: #6b7280;
}

.loading {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 80px 0;
  gap: 12px;
}

.spinner {
  width: 24px;
  height: 24px;
  border: 2px solid #111827;
  border-top: 2px solid transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading span {
  color: #6b7280;
}

.error {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: center;
  padding: 80px 0;
}

.error-box {
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 24px;
  max-width: 400px;
}

.error-box h3 {
  color: #dc2626;
  font-weight: 600;
  margin-bottom: 8px;
}

.error-box p {
  color: #dc2626;
  font-size: 14px;
}

.content {
  max-width: 1200px;
  margin: 0 auto;
}

.workflows-container {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  justify-content: flex-start;
}

.empty-state {
  text-align: center;
  padding: 80px 0;
}

.empty-state h3 {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 8px;
}

.empty-state p {
  color: #6b7280;
}
</style>