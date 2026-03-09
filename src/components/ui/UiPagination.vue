<template>
  <nav class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <p class="text-sm text-[var(--ui-text-muted)]">
      Trang <span class="font-semibold text-[var(--ui-text)]">{{ page }}</span> / {{ totalPages }}
    </p>
    <div class="flex items-center gap-2">
      <button
        type="button"
        :disabled="page <= 1"
        class="ui-page-btn"
        @click="$emit('update:page', page - 1)"
      >
        Trước
      </button>
      <button
        v-for="item in visiblePages"
        :key="item"
        type="button"
        :class="['ui-page-btn', item === page && 'ui-page-btn-active']"
        @click="$emit('update:page', item)"
      >
        {{ item }}
      </button>
      <button
        type="button"
        :disabled="page >= totalPages"
        class="ui-page-btn"
        @click="$emit('update:page', page + 1)"
      >
        Sau
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    page: number
    total: number
    pageSize?: number
    siblingCount?: number
  }>(),
  {
    pageSize: 5,
    siblingCount: 1,
  },
)

defineEmits<{
  'update:page': [page: number]
}>()

const totalPages = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)))
const visiblePages = computed(() => {
  const start = Math.max(1, props.page - props.siblingCount)
  const end = Math.min(totalPages.value, props.page + props.siblingCount)
  const set = new Set<number>([1, totalPages.value])
  for (let i = start; i <= end; i += 1) set.add(i)
  return Array.from(set).sort((a, b) => a - b)
})
</script>
