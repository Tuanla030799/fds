<template>
  <span :class="classes">
    <slot>{{ label }}</slot>
    <button
      v-if="closable"
      type="button"
      class="ml-1 text-current/70 hover:text-current"
      @click="$emit('close')"
    >✕</button>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/utils/cn'

defineEmits<{
  close: []
}>()

const props = withDefaults(
  defineProps<{
    label?: string
    variant?: 'outline' | 'soft' | 'primary'
    closable?: boolean
  }>(),
  {
    label: '',
    variant: 'soft',
    closable: false,
  },
)

const classes = computed(() => {
  const variants = {
    outline: 'border-[var(--ui-border-strong)] bg-transparent text-[var(--ui-text-muted)]',
    soft: 'border-transparent bg-[var(--ui-surface-soft)] text-[var(--ui-text)]',
    primary: 'border-transparent bg-[var(--ui-primary-soft)] text-[var(--ui-primary)]',
  }
  return cn('inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-medium', variants[props.variant])
})
</script>
