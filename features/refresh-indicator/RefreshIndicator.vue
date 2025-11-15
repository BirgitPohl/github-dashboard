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
  bottom: 24px;
  right: 24px;
  z-index: 50;
  pointer-events: none;
}

.indicator-content {
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid #e5e7eb;
  border-radius: 24px;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(8px);
}

.indicator-icon {
  font-size: 16px;
  display: inline-block;
  transition: transform 0.3s ease;
}

.indicator-icon.spinning {
  animation: spin 1s linear infinite;
}

.indicator-text {
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
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
    bottom: 16px;
    right: 16px;
  }

  .indicator-content {
    padding: 6px 12px;
  }

  .indicator-icon {
    font-size: 14px;
  }

  .indicator-text {
    font-size: 12px;
  }
}
</style>
