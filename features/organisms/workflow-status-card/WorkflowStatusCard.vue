<script setup lang="ts">
import { useWorkflowStatusCard } from './useWorkflowStatusCard'

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

const props = defineProps<{
  workflow: Workflow
}>()

const { getStatusConfig } = useWorkflowStatusCard()
const { formatTimeAgoSimple } = useDateTime()

const statusConfig = computed(() => getStatusConfig(props.workflow))
const timeAgo = computed(() => formatTimeAgoSimple(props.workflow.updated_at))
</script>

<template>
  <a
    :href="workflow.html_url"
    target="_blank"
    rel="noopener"
    class="wf-row"
    :style="{ '--row-bg': statusConfig.color, '--row-fg': statusConfig.onColor }"
  >
    <Icon :icon="statusConfig.icon" class="wf-row__icon" decorative />

    <span class="wf-row__main">
      <span class="wf-row__name">{{ workflow.name }}</span>
      <span class="wf-row__sub">
        <span>{{ workflow.repository }}</span>
        <span class="wf-row__sep">·</span>
        <span>{{ workflow.branch }}</span>
        <Icon v-if="workflow.is_private" icon="lucide:lock" size="xs" class="wf-row__lock" aria-label="Private" />
      </span>
    </span>

    <span class="wf-row__status">{{ statusConfig.label }}</span>
    <span class="wf-row__run">#{{ workflow.run_number }}</span>
    <span class="wf-row__time">{{ timeAgo }}</span>
  </a>
</template>

<style scoped>
.wf-row {
  display: grid;
  grid-template-columns: subgrid;
  grid-column: 1 / -1;
  align-items: center;
  column-gap: var(--spacing-3);
  padding: var(--spacing-2) var(--spacing-4);
  background: var(--row-bg, var(--color-neutral));
  color: var(--row-fg, var(--color-text-inverse));
  text-decoration: none;
  font-size: var(--font-size-sm);
  line-height: 1.3;
  border-bottom: 1px solid color-mix(in srgb, currentColor 15%, transparent);
  transition: filter var(--transition-fast);
}

.wf-row:hover {
  filter: brightness(1.08);
}

.wf-row__icon {
  font-size: var(--font-size-base);
  line-height: 1;
}

.wf-row__main {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.wf-row__name {
  font-weight: var(--font-weight-semibold);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.wf-row__sub {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-2);
  font-size: var(--font-size-xs);
  opacity: 0.9;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.wf-row__sep {
  opacity: 0.6;
}

.wf-row__lock {
  font-size: var(--font-size-2xs);
}

.wf-row__status {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  white-space: nowrap;
}

.wf-row__run {
  font-family: var(--font-family-mono);
  font-size: var(--font-size-xs);
  opacity: 0.9;
  white-space: nowrap;
}

.wf-row__time {
  font-size: var(--font-size-xs);
  opacity: 0.85;
  white-space: nowrap;
  min-width: 4ch;
  text-align: right;
}

@media (max-width: 640px) {
  .wf-row {
    grid-template-columns: auto 1fr auto;
    grid-template-rows: auto auto;
    row-gap: 2px;
  }

  .wf-row__status {
    grid-column: 3;
    grid-row: 1;
  }

  .wf-row__run,
  .wf-row__time {
    grid-row: 2;
    font-size: var(--font-size-2xs);
  }

  .wf-row__run {
    grid-column: 2;
    text-align: left;
  }

  .wf-row__time {
    grid-column: 3;
  }
}
</style>
