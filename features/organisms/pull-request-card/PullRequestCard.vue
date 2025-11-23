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
  review_status?: 'approved' | 'changes_requested' | 'pending' | 'commented'
  check_status?: 'success' | 'failure' | 'pending' | 'neutral'
  comments?: {
    total: number
    unresolved: number
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

const {
  formatTimeAgo,
  getStateClass,
  getStateIcon,
  getStateBorderColor,
  getCheckIcon,
  getCheckLabel,
  getReviewIcon,
  getReviewLabel
} = usePullRequestCard()

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
    :href="pullRequest.html_url"
    :class="cardClasses"
  >
    <template #header>
      <div class="pr-card__header">
        <div class="pr-card__title-row">
          <Icon :icon="getStateIcon(pullRequest)" size="base" decorative />
          <Text variant="secondary" size="base" weight="semibold">#{{ pullRequest.number }}</Text>
          <Header :level="3" size="base" variant="primary" class="pr-card__title">
            {{ pullRequest.title }}
          </Header>
        </div>
        <div class="pr-card__header-right">
          <div v-if="showRepository" class="pr-card__repository">
            <Text variant="tertiary" size="sm">{{ pullRequest.repository.name }}</Text>
          </div>
        </div>
      </div>
    </template>

    <template #body>
      <div class="pr-card__status-row">
        <!-- CI/Pipeline Status -->
        <div v-if="pullRequest.check_status" class="pr-card__check-status" :class="`check-status--${pullRequest.check_status}`">
          <Icon :icon="getCheckIcon(pullRequest.check_status)" size="sm" decorative />
          <Text variant="secondary" size="sm">{{ getCheckLabel(pullRequest.check_status) }}</Text>
        </div>

        <!-- Review Status -->
        <div v-if="pullRequest.review_status" class="pr-card__review-status" :class="`review-status--${pullRequest.review_status}`">
          <Icon :icon="getReviewIcon(pullRequest.review_status)" size="sm" decorative />
          <Text variant="secondary" size="sm">{{ getReviewLabel(pullRequest.review_status) }}</Text>
        </div>

        <!-- Comment Count -->
        <div v-if="pullRequest.comments && pullRequest.comments.total > 0" class="pr-card__comments">
          <Icon icon="💬" size="sm" decorative />
          <Text variant="secondary" size="sm">
            {{ pullRequest.comments.unresolved }}/{{ pullRequest.comments.total }}
          </Text>
        </div>
      </div>

      <div class="pr-card__meta">
        <div class="pr-card__author">
          <UserAvatar
            :src="pullRequest.user.avatar_url"
            :alt="pullRequest.user.login"
            :tooltip="pullRequest.user.login"
            size="sm"
          />
          <Text variant="secondary" size="sm">{{ pullRequest.user.login }}</Text>
        </div>

        <BranchIndicator
          :source-branch="pullRequest.head.ref"
          :target-branch="pullRequest.base.ref"
        />

        <Text variant="secondary" size="sm">{{ formatTimeAgo(pullRequest.updated_at) }}</Text>
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
        <Text variant="secondary" size="sm">Assigned to:</Text>
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
/* Layout structure only - typography and colors handled by atoms */
.pr-card__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--spacing-2);
}

.pr-card__title-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  flex: 1;
  min-width: 0;
}

.pr-card__title {
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pr-card__header-right {
  flex-shrink: 0;
}

.pr-card__repository {
  background: var(--color-border-default);
  padding: var(--spacing-1) var(--spacing-2);
  border-radius: var(--radius-md);
}

.pr-card__status-row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-4);
  align-items: center;
  margin-bottom: var(--spacing-3);
}

.pr-card__check-status,
.pr-card__review-status,
.pr-card__comments {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
}

/* Check status colors */
.check-status--success {
  color: var(--color-success-500);
}

.check-status--failure {
  color: var(--color-error-500);
}

.check-status--pending {
  color: var(--color-warning-500);
}

.check-status--neutral {
  color: var(--color-gray-500);
}

/* Review status colors */
.review-status--approved {
  color: var(--color-success-500);
}

.review-status--changes_requested {
  color: var(--color-error-500);
}

.review-status--commented {
  color: var(--color-info-500);
}

.review-status--pending {
  color: var(--color-gray-500);
}

.pr-card__comments {
  color: var(--color-gray-500);
}

.pr-card__meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-4);
  align-items: center;
  margin-bottom: var(--spacing-3);
}

.pr-card__author {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.pr-card__labels {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-2);
  margin-bottom: var(--spacing-3);
}

.pr-card__assignees {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.assignees-list {
  display: flex;
  gap: var(--spacing-1);
}

/* State-specific styling */
.state-open {
  border-left: var(--spacing-1) solid var(--color-success-500);
}

.state-draft {
  border-left: var(--spacing-1) solid var(--color-warning-500);
}

.state-merged {
  border-left: var(--spacing-1) solid var(--color-purple-500);
}

.state-closed {
  border-left: var(--spacing-1) solid var(--color-error-500);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .pr-card__header {
    flex-direction: column;
    align-items: flex-start;
  }

  .pr-card__title-row {
    flex-wrap: wrap;
  }

  .pr-card__status-row {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-2);
  }

  .pr-card__meta {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-2);
  }
}
</style>
