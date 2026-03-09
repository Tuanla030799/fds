<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex bg-slate-950/45"
      :class="mobileSheet ? 'items-end sm:items-center sm:justify-center sm:p-4' : 'items-center justify-center p-4'"
      @click.self="emit('close')"
    >
      <div :class="panelClasses">
        <div class="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3
              v-if="title"
              class="text-base font-semibold text-[var(--ui-text)]"
            >
              {{ title }}
            </h3>
            <p
              v-if="description"
              class="mt-1 text-sm text-[var(--ui-text-soft)]"
            >
              {{ description }}
            </p>
          </div>
          <button
            type="button"
            class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--ui-border)] text-[var(--ui-text-soft)] transition hover:bg-[var(--ui-surface-soft)]"
            @click="emit('close')"
          >
            ✕
          </button>
        </div>
        <slot />
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/utils/cn'

const props = withDefaults(defineProps<{
  open: boolean
  title?: string
  description?: string
  mobileSheet?: boolean
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl'
}>(), {
  title: '',
  description: '',
  mobileSheet: true,
  maxWidth: 'lg',
})

const emit = defineEmits<{
  close: []
}>()

const panelClasses = computed(() => {
  const widths = {
    sm: 'sm:max-w-sm',
    md: 'sm:max-w-md',
    lg: 'sm:max-w-xl',
    xl: 'sm:max-w-2xl',
  }
  return cn(
    'w-full bg-[var(--ui-surface)] p-4 shadow-2xl sm:p-5',
    props.mobileSheet ? 'rounded-t-[var(--ui-radius-lg)] sm:rounded-[var(--ui-radius-lg)]' : 'rounded-[var(--ui-radius-lg)]',
    widths[props.maxWidth],
  )
})
</script>
