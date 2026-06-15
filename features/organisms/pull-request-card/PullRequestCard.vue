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
  pullRequest: PullRequest
  showRepository?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showRepository: true,
})

const {
  formatTimeAgo,
  getStateIcon,
  getStateRowColors,
  getCheckIcon,
  getReviewIcon,
} = usePullRequestCard()

const rowColors = computed(() => getStateRowColors(props.pullRequest))

const unresolvedComments = computed(() => props.pullRequest.comments?.unresolved ?? 0)

// Hide the "commented" review badge when every comment is resolved —
// other review verdicts (approved / changes_requested / pending) always show.
const showReviewIcon = computed(() => {
  const status = props.pullRequest.review_status
  if (!status) return false
  if (status === 'commented') return unresolvedComments.value > 0
  return true
})
</script>

<template>
  <a
    :href="pullRequest.html_url"
    target="_blank"
    rel="noopener"
    class="pr-row"
    :style="{ '--row-bg': rowColors.bg, '--row-fg': rowColors.fg }"
  >
    <Icon :icon="getStateIcon(pullRequest)" class="pr-row__icon" decorative />

    <span class="pr-row__main">
      <span class="pr-row__title-line">
        <span class="pr-row__number">#{{ pullRequest.number }}</span>
        <span class="pr-row__title">{{ pullRequest.title }}</span>
      </span>
      <span class="pr-row__sub">
        <span v-if="showRepository">{{ pullRequest.repository.name }}</span>
        <span v-if="showRepository" class="pr-row__sep">·</span>
        <span>@{{ pullRequest.user.login }}</span>
        <span class="pr-row__sep">·</span>
        <span class="pr-row__branch">{{ pullRequest.head.ref }} → {{ pullRequest.base.ref }}</span>
      </span>
    </span>

    <span class="pr-row__signals">
      <Icon v-if="pullRequest.check_status" :icon="getCheckIcon(pullRequest.check_status)" size="sm" :aria-label="`Checks: ${pullRequest.check_status}`" />
      <Icon v-if="showReviewIcon" :icon="getReviewIcon(pullRequest.review_status!)" size="sm" :aria-label="`Review: ${pullRequest.review_status}`" />
      <span v-if="pullRequest.comments && pullRequest.comments.total > 0" class="pr-row__comments" title="Comments">
        {{ pullRequest.comments.unresolved }}/{{ pullRequest.comments.total }}
        <Icon icon="lucide:message-circle" size="sm" decorative />
      </span>
    </span>

    <span class="pr-row__time">{{ formatTimeAgo(pullRequest.updated_at) }}</span>
  </a>
</template>

<style scoped>
.pr-row {
  display: grid;
  grid-template-columns: auto 1fr auto auto;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-2) var(--spacing-4);
  background: var(--row-bg, var(--color-neutral));
  color: var(--row-fg, var(--color-text-inverse));
  text-decoration: none;
  font-size: var(--font-size-sm);
  line-height: 1.3;
  border-bottom: 1px solid color-mix(in srgb, currentColor 15%, transparent);
  transition: filter var(--transition-fast);
}

.pr-row:hover {
  filter: brightness(1.08);
}

.pr-row__icon {
  font-size: var(--font-size-base);
  line-height: 1;
}

.pr-row__main {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.pr-row__title-line {
  display: flex;
  align-items: baseline;
  gap: var(--spacing-2);
  min-width: 0;
}

.pr-row__number {
  font-family: var(--font-family-mono);
  font-size: var(--font-size-xs);
  opacity: 0.85;
  flex-shrink: 0;
}

.pr-row__title {
  font-weight: var(--font-weight-semibold);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pr-row__sub {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-2);
  font-size: var(--font-size-xs);
  opacity: 0.9;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pr-row__sep {
  opacity: 0.6;
}

.pr-row__branch {
  font-family: var(--font-family-mono);
}

.pr-row__signals {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-2);
  font-size: var(--font-size-xs);
  white-space: nowrap;
}

.pr-row__comments {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.pr-row__time {
  font-size: var(--font-size-xs);
  opacity: 0.85;
  white-space: nowrap;
  min-width: 4ch;
  text-align: right;
}

@media (max-width: 640px) {
  .pr-row {
    grid-template-columns: auto 1fr auto;
    grid-template-rows: auto auto;
    row-gap: 2px;
  }

  .pr-row__signals {
    grid-column: 1 / 4;
    grid-row: 2;
    font-size: var(--font-size-2xs);
  }

  .pr-row__time {
    grid-column: 3;
    grid-row: 1;
  }
}
</style>
