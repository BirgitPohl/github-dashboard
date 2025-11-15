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

const { data, error, pending: loading, refresh, isRefreshing, lastUpdated } = useCachedFetch<{ workflows: Workflow[] }>(
  '/api/workflows',
  {
    key: 'workflows',
    staleTime: 5 * 60 * 1000, // 5 minutes
  }
)

const { shouldShowSkeleton, shouldShowRefreshIndicator } = useLoadingState()

const workflows = computed(() => {
  // Sort workflows by newest first (updated_at)
  return (data.value?.workflows || []).sort((a, b) => {
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  })
})

const showSkeleton = computed(() => shouldShowSkeleton(!!data.value, loading.value))
const showRefreshIndicator = computed(() => shouldShowRefreshIndicator(!!data.value, isRefreshing.value))
</script>

<template>
  <div class="dashboard">
    <!-- Refresh Indicator (shown when refreshing with cached data) -->
    <RefreshIndicator
      v-if="showRefreshIndicator"
      :is-refreshing="isRefreshing"
      :last-updated="lastUpdated"
    />

    <!-- Skeleton Loading (shown on initial load with no cached data) -->
    <div v-if="showSkeleton" class="loading">
      <SkeletonGrid :count="6" />
    </div>

    <!-- Error State -->
    <div v-else-if="error && !data" class="error">
      <ErrorBoxErrorBox
        :error="error"
        @retry="refresh"
      />
    </div>

    <!-- Content (shown when we have data, even if refreshing in background) -->
    <div v-else-if="data" class="content">
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
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  padding: 32px;
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
</style>