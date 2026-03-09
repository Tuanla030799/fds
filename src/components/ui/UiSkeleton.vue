<template>
  <div :class="wrapperClass">
    <div
      v-if="avatar"
      class="h-10 w-10 shrink-0 rounded-full bg-[var(--ui-surface-soft)]"
    />
    <div class="min-w-0 flex-1 space-y-2">
      <div
        v-for="index in rows"
        :key="index"
        :class="rowClass(index)"
        class="animate-pulse rounded-full bg-[var(--ui-surface-soft)]"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/utils/cn'

const props = withDefaults(
  defineProps<{
    rows?: number
    avatar?: boolean
    compact?: boolean
  }>(),
  {
    rows: 3,
    avatar: false,
    compact: false,
  },
)

const wrapperClass = computed(() => cn('flex items-start gap-3', props.compact ? 'py-1' : 'py-2'))

function rowClass(index: number) {
  const widths = ['w-11/12', 'w-9/12', 'w-7/12', 'w-5/12']
  return cn(props.compact ? 'h-3' : 'h-4', widths[(index - 1) % widths.length])
}
</script>
