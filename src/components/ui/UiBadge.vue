<template>
  <span :class="classes">
    <slot>{{ label }}</slot>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/utils/cn'

const props = withDefaults(
  defineProps<{
    label?: string
    variant?: 'primary' | 'success' | 'warning' | 'danger' | 'neutral'
    size?: 'sm' | 'md'
    dot?: boolean
    rounded?: boolean
  }>(),
  {
    label: '',
    variant: 'primary',
    size: 'sm',
    dot: false,
    rounded: true,
  },
)

const classes = computed(() => {
  const variants = {
    primary: 'border-transparent bg-[var(--ui-primary-soft)] text-[var(--ui-primary)]',
    success: 'border-transparent bg-[var(--ui-success-soft)] text-[var(--ui-success)]',
    warning: 'border-transparent bg-[var(--ui-warning-soft)] text-[var(--ui-warning)]',
    danger: 'border-transparent bg-[var(--ui-danger-soft)] text-[var(--ui-danger)]',
    neutral: 'border-[var(--ui-border)] bg-[var(--ui-surface-muted)] text-[var(--ui-text-muted)]',
  }

  const sizes = {
    sm: 'min-h-6 px-2.5 text-xs',
    md: 'min-h-7 px-3 text-sm',
  }

  return cn(
    'inline-flex items-center gap-1.5 border font-semibold',
    props.rounded ? 'rounded-full' : 'rounded-[var(--ui-radius-sm)]',
    sizes[props.size],
    variants[props.variant],
  )
})
</script>
