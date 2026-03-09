<template>
  <button
    :type="nativeType"
    :disabled="disabled || loading"
    :class="classes"
    v-bind="$attrs"
  >
    <span
      v-if="loading"
      class="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"
    />
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/utils/cn'

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'dark'
    size?: 'sm' | 'md' | 'lg'
    block?: boolean
    loading?: boolean
    disabled?: boolean
    nativeType?: 'button' | 'submit' | 'reset'
  }>(),
  {
    variant: 'primary',
    size: 'md',
    block: false,
    loading: false,
    disabled: false,
    nativeType: 'button',
  },
)

const classes = computed(() => {
  const variants = {
    primary: 'bg-[var(--ui-primary)] text-white hover:bg-[var(--ui-primary-hover)]',
    secondary: 'border border-[var(--ui-border)] bg-[var(--ui-surface)] text-[var(--ui-text)] hover:bg-[var(--ui-surface-muted)]',
    outline: 'border border-[var(--ui-border-strong)] bg-transparent text-[var(--ui-text)] hover:bg-[var(--ui-surface-soft)]',
    danger: 'border border-red-200 bg-[var(--ui-danger-soft)] text-[var(--ui-danger)] hover:brightness-95',
    ghost: 'bg-transparent text-[var(--ui-text-muted)] hover:bg-[var(--ui-surface-soft)]',
    dark: 'bg-[var(--ui-text)] text-white hover:opacity-90',
  }

  const sizes = {
    sm: 'min-h-9 rounded-[var(--ui-radius-sm)] px-3 py-2 text-sm',
    md: 'min-h-11 rounded-[var(--ui-radius-md)] px-4 py-3 text-sm',
    lg: 'min-h-12 rounded-[var(--ui-radius-md)] px-5 py-3.5 text-base',
  }

  return cn(
    'inline-flex items-center justify-center gap-2 font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ui-primary-ring)] disabled:cursor-not-allowed disabled:opacity-50',
    variants[props.variant],
    sizes[props.size],
    props.block && 'w-full',
  )
})
</script>
