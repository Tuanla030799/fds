<template>
  <div :class="classes">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/utils/cn'

const props = withDefaults(defineProps<{
  layout?: 'vertical' | 'inline'
  class?: string
}>(), {
  layout: 'vertical',
  class: '',
})

const classes = computed(() => cn(props.layout === 'inline' ? 'flex flex-wrap items-end gap-3' : 'space-y-4'))
</script>
