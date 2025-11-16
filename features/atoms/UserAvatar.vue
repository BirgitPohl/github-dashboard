<script setup lang="ts">
interface Props {
  /**
   * Avatar image URL
   */
  src: string
  /**
   * Alt text for the image
   */
  alt: string
  /**
   * Size variant
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  /**
   * Optional tooltip text
   */
  tooltip?: string
  /**
   * Whether the avatar is clickable (shows pointer cursor)
   */
  clickable?: boolean
  /**
   * Custom CSS classes
   */
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  tooltip: '',
  clickable: false,
  class: ''
})

// Compute CSS classes
const avatarClasses = computed(() => {
  const classes = ['user-avatar', `user-avatar--${props.size}`]

  if (props.clickable) {
    classes.push('user-avatar--clickable')
  }

  if (props.class) {
    classes.push(props.class)
  }

  return classes.join(' ')
})
</script>

<template>
  <img
    :src="src"
    :alt="alt"
    :title="tooltip || alt"
    :class="avatarClasses"
  >
</template>

<style scoped>
.user-avatar {
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.user-avatar--clickable {
  cursor: pointer;
}

.user-avatar--clickable:hover {
  transform: scale(1.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

/* Size variants */
.user-avatar--xs {
  width: 16px;
  height: 16px;
}

.user-avatar--sm {
  width: 20px;
  height: 20px;
}

.user-avatar--md {
  width: 24px;
  height: 24px;
}

.user-avatar--lg {
  width: 32px;
  height: 32px;
}

.user-avatar--xl {
  width: 40px;
  height: 40px;
}
</style>
