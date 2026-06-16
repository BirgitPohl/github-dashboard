<script setup lang="ts">
definePageMeta({
  name: 'WorkflowsDashboard'
})

const { public: { githubOwner } } = useRuntimeConfig()

useHead({
  title: `Workflows - ${githubOwner}`,
  meta: [
    { name: 'description', content: 'Beautiful dashboard for monitoring GitHub workflow states' }
  ]
})

const {
  data,
  error,
  refresh,
  isRefreshing,
} = useResource<WorkflowsResponse>('workflows', '/api/workflows', {
  staleTime: 5 * 60 * 1000,
})

const isRunning = (status: string | undefined) => {
  const s = status?.toLowerCase() ?? ''
  return s.includes('in_progress') || s.includes('queued')
}

const workflows = computed(() => {
  // Running workflows first; then by most recent update.
  return [...(data.value?.workflows || [])].sort((a, b) => {
    const aRunning = isRunning(a.status) ? 0 : 1
    const bRunning = isRunning(b.status) ? 0 : 1
    if (aRunning !== bRunning) return aRunning - bRunning
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  })
})
</script>

<template>
  <PageLayout
    :is-refreshing="isRefreshing"
    :error="error"
    :data="data"
    :on-retry="refresh"
    :skeleton-count="6"
  >
    <template #content>
      <div v-if="workflows.length > 0" class="workflows-list">
        <WorkflowStatusCard
          v-for="workflow in workflows"
          :key="workflow.id"
          :workflow="workflow"
        />
      </div>

      <EmptyState
        v-else
        title="No workflows found"
        message="This repository doesn't have any workflows."
      />
    </template>
  </PageLayout>
</template>

<style scoped>
/* Parent grid declares the column tracks; every row inherits them via subgrid
 * so the icon, name, status, run-number, and time columns line up across every
 * workflow regardless of content length. */
.workflows-list {
  display: grid;
  grid-template-columns: auto 1fr auto auto auto;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

.workflows-list > :last-child {
  border-bottom: 0;
}
</style>