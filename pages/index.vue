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

const { data, error, pending: loading, refresh } = await useFetch<{ workflows: Workflow[] }>('/api/workflows')
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
      <TypographyHeader 
        :level="1" 
        size="3xl" 
        variant="primary"
      >
        GitHub Workflows
      </TypographyHeader>
      <p>Monitor workflows across all repositories</p>
    </div>

    <div v-if="loading" class="loading">
      <LoadingSpinner message="Loading workflows..." />
    </div>

    <div v-else-if="error" class="error">
      <ErrorBoxErrorBox 
        :error="error"
        @retry="refresh"
      />
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
        <TypographyHeader 
          :level="3" 
          size="lg" 
          variant="secondary"
        >
          No workflows found
        </TypographyHeader>
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
}

.error {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: center;
  padding: 80px 0;
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

.empty-state p {
  color: #6b7280;
}
</style>