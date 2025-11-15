<script setup lang="ts">
import { usePullRequestCard } from './usePullRequestCard'

interface PullRequest {
  id: number
  number: number
  title: string
  state: 'open' | 'closed' | 'merged'
  html_url: string
  created_at: string
  updated_at: string
  closed_at: string | null
  merged_at: string | null
  draft: boolean
  user: {
    login: string
    avatar_url: string
    html_url: string
  }
  assignees: Array<{
    login: string
    avatar_url: string
  }>
  labels: Array<{
    name: string
    color: string
  }>
  head: {
    ref: string
    repo: {
      name: string
      full_name: string
    } | null
  }
  base: {
    ref: string
  }
  repository: {
    name: string
    full_name: string
  }
}

interface Props {
  /**
   * The pull request data
   */
  pullRequest: PullRequest
  /**
   * Whether to show the repository name
   */
  showRepository?: boolean
  /**
   * Custom CSS classes
   */
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  showRepository: true,
  class: ''
})

const { formatTimeAgo, getStateClass, getStateIcon, getStateBorderColor } = usePullRequestCard()

// Compute CSS classes
const cardClasses = computed(() => {
  const classes = [getStateClass(props.pullRequest)]

  if (props.class) {
    classes.push(props.class)
  }

  return classes.join(' ')
})
</script>

<template>
  <BaseCard
    width="full"
    :border-color="getStateBorderColor(pullRequest)"
    :class="cardClasses"
  >
    <template #header>
      <div class="pr-card__header">
        <div class="pr-card__status">
          <span class="pr-card__icon">{{ getStateIcon(pullRequest) }}</span>
          <span class="pr-card__number">#{{ pullRequest.number }}</span>
        </div>
        <div v-if="showRepository" class="pr-card__repository">
          {{ pullRequest.repository.name }}
        </div>
      </div>
    </template>

    <template #body>
      <Header
        :level="3"
        size="md"
        variant="primary"
        class="pr-card__title"
      >
        <a :href="pullRequest.html_url" target="_blank" rel="noopener noreferrer">
          {{ pullRequest.title }}
        </a>
      </Header>

      <div class="pr-card__meta">
        <div class="pr-card__author">
          <UserAvatar
            :src="pullRequest.user.avatar_url"
            :alt="pullRequest.user.login"
            :tooltip="pullRequest.user.login"
            size="sm"
          />
          <span class="author-name">{{ pullRequest.user.login }}</span>
        </div>

        <BranchIndicator
          :source-branch="pullRequest.head.ref"
          :target-branch="pullRequest.base.ref"
        />

        <div class="pr-card__time">
          {{ formatTimeAgo(pullRequest.updated_at) }}
        </div>
      </div>

      <div v-if="pullRequest.labels.length > 0" class="pr-card__labels">
        <LabelBadge
          v-for="label in pullRequest.labels"
          :key="label.name"
          :name="label.name"
          :color="label.color"
        />
      </div>

      <div v-if="pullRequest.assignees.length > 0" class="pr-card__assignees">
        <span class="assignees-label">Assigned to:</span>
        <div class="assignees-list">
          <UserAvatar
            v-for="assignee in pullRequest.assignees"
            :key="assignee.login"
            :src="assignee.avatar_url"
            :alt="assignee.login"
            :tooltip="assignee.login"
            size="md"
          />
        </div>
      </div>
    </template>
  </BaseCard>
</template>

<style scoped>
.pr-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pr-card__status {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pr-card__icon {
  font-size: 16px;
}

.pr-card__number {
  font-weight: 600;
  color: #6b7280;
}

.pr-card__repository {
  font-size: 14px;
  color: #374151;
  background: #e5e7eb;
  padding: 4px 8px;
  border-radius: 6px;
}

.pr-card__title {
  margin: 0 0 12px 0;
  font-size: 18px;
  font-weight: 600;
  line-height: 1.4;
}

.pr-card__title a {
  color: #111827;
  text-decoration: none;
}

.pr-card__title a:hover {
  text-decoration: underline;
}

.pr-card__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
  margin-bottom: 12px;
  font-size: 14px;
  color: #6b7280;
}

.pr-card__author {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pr-card__labels {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.pr-card__assignees {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #6b7280;
}

.assignees-list {
  display: flex;
  gap: 4px;
}

/* State-specific styling */
.state-open {
  border-left: 4px solid #10b981;
}

.state-draft {
  border-left: 4px solid #f59e0b;
}

.state-merged {
  border-left: 4px solid #8b5cf6;
}

.state-closed {
  border-left: 4px solid #ef4444;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .pr-card__header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .pr-card__meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .pr-card__title {
    font-size: 16px;
  }
}
</style>
