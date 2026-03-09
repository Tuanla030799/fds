<template>
  <div :class="classes">
    <slot>{{ message }}</slot>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/utils/cn'

const props = withDefaults(defineProps<{
  variant?: 'info' | 'success' | 'warning' | 'error'
  message?: string
  class?: string
}>(), {
  variant: 'info',
  message: '',
  class: '',
})

const classes = computed(() => {
  const variants = {
    info: 'border-[var(--ui-primary)]/15 bg-[var(--ui-primary-soft)] text-[var(--ui-primary)]',
    success: 'border-emerald-200 bg-[var(--ui-success-soft)] text-[var(--ui-success)]',
    warning: 'border-amber-200 bg-[var(--ui-warning-soft)] text-[var(--ui-warning)]',
    error: 'border-red-200 bg-[var(--ui-danger-soft)] text-[var(--ui-danger)]',
  }
  return cn('rounded-[var(--ui-radius-md)] border px-4 py-3 text-sm', variants[props.variant], props.class)
})
</script>
