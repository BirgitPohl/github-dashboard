<script setup lang="ts">
definePageMeta({
  name: 'WorkflowsDashboard'
})

useHead({
  title: 'Workflows - GitHub Dashboard',
  meta: [
    { name: 'description', content: 'Beautiful dashboard for monitoring GitHub workflow states' }
  ]
})

const {
  data,
  error,
  refresh,
  isRefreshing,
  lastUpdated,
  showSkeleton,
  showRefreshIndicator
} = useCachedFetch<WorkflowsResponse>(
  '/api/workflows',
  {
    key: 'workflows',
    staleTime: 5 * 60 * 1000, // 5 minutes
  }
)

const workflows = computed(() => {
  // Sort workflows by newest first (updated_at)
  return (data.value?.workflows || []).sort((a, b) => {
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  })
})
</script>

<template>
  <PageLayout
    :show-skeleton="showSkeleton"
    :show-refresh-indicator="showRefreshIndicator"
    :is-refreshing="isRefreshing"
    :last-updated="lastUpdated"
    :error="error"
    :data="data"
    :on-retry="refresh"
    :skeleton-count="6"
  >
    <template #content>
      <div class="workflows-container">
        <WorkflowStatusCard
          v-for="workflow in workflows"
          :key="workflow.id"
          :workflow="workflow"
        />
      </div>

      <EmptyState
        v-if="workflows.length === 0"
        title="No workflows found"
        message="This repository doesn't have any workflows."
      />
    </template>
  </PageLayout>
</template>

<style scoped>
.workflows-container {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  justify-content: flex-start;
}
</style>