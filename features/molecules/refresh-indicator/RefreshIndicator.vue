<script setup lang="ts">
interface Props {
  lastUpdated?: number
  isRefreshing?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  lastUpdated: 0,
  isRefreshing: false,
})

const { formatTimeAgo } = useDateTime()

const lastUpdatedText = computed(() => {
  if (!props.lastUpdated) return 'Never'
  return formatTimeAgo(new Date(props.lastUpdated).toISOString())
})
</script>

<template>
  <div class="refresh-indicator">
    <div class="indicator-content">
      <span class="indicator-icon" :class="{ spinning: isRefreshing }">
        🔄
      </span>
      <span class="indicator-text">
        <template v-if="isRefreshing">
          Updating...
        </template>
        <template v-else>
          Updated {{ lastUpdatedText }}
        </template>
      </span>
    </div>
  </div>
</template>

<style scoped>
.refresh-indicator {
  position: fixed;
  bottom: var(--spacing-6);
  right: var(--spacing-6);
  z-index: 50;
  pointer-events: none;
}

.indicator-content {
  background: var(--color-bg-overlay);
  border: var(--border-width-thin) solid var(--color-gray-200);
  border-radius: var(--radius-full);
  padding: var(--spacing-2) var(--spacing-4);
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  box-shadow: var(--shadow-md);
  backdrop-filter: blur(8px);
}

.indicator-icon {
  font-size: var(--font-size-base);
  display: inline-block;
  transition: transform var(--transition-slow);
}

.indicator-icon.spinning {
  animation: spin 1s linear infinite;
}

.indicator-text {
  font-size: var(--font-size-sm);
  color: var(--color-gray-500);
  font-weight: var(--font-weight-medium);
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .refresh-indicator {
    bottom: var(--spacing-4);
    right: var(--spacing-4);
  }

  .indicator-content {
    padding: var(--spacing-1-5) var(--spacing-3);
  }

  .indicator-icon {
    font-size: var(--font-size-sm);
  }

  .indicator-text {
    font-size: var(--font-size-xs);
  }
}
</style>
