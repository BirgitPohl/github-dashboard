<script setup lang="ts">
const { latest } = useLogStream()

const message = computed(() => latest.value?.message ?? '')

// Hide if no new log arrives within this window
const HIDE_AFTER_MS = 2000
const dismissed = ref(true)
let hideTimer: ReturnType<typeof setTimeout> | null = null

const visible = computed(() => message.value.length > 0 && !dismissed.value)

watch(
  () => latest.value?.timestamp,
  () => {
    dismissed.value = false
    if (hideTimer) clearTimeout(hideTimer)
    hideTimer = setTimeout(() => { dismissed.value = true }, HIDE_AFTER_MS)
  },
)
</script>

<template>
  <Transition name="ticker">
    <div
      v-if="visible"
      class="log-ticker"
      role="status"
      aria-live="polite"
    >
      <span class="log-ticker__dot" />
      <span :key="latest?.timestamp" class="log-ticker__text">{{ message }}</span>
    </div>
  </Transition>
</template>

<style scoped>
.log-ticker {
  position: fixed;
  right: var(--spacing-4, 1rem);
  bottom: var(--spacing-4, 1rem);
  z-index: 200;
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-2, 0.5rem);
  max-width: min(560px, calc(100vw - 2rem));
  padding: 6px 12px;
  border-radius: 999px;
  background: var(--color-surface-inverse);
  color: var(--color-on-surface-inverse);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 12px;
  line-height: 1.4;
  box-shadow: var(--shadow-lg);
  backdrop-filter: blur(6px);
  pointer-events: none;
}

.log-ticker__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-success);
  flex-shrink: 0;
  animation: log-ticker-pulse 1.4s ease-in-out infinite;
}

.log-ticker__text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  animation: log-ticker-slide 220ms ease-out;
}

@keyframes log-ticker-pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(0.7); opacity: 0.5; }
}

@keyframes log-ticker-slide {
  from { transform: translateY(4px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.ticker-enter-active,
.ticker-leave-active {
  transition: transform 240ms ease, opacity 240ms ease;
}
.ticker-enter-from,
.ticker-leave-to {
  transform: translateY(8px);
  opacity: 0;
}
</style>
