<template>
  <div class="grid grid-cols-1 gap-3 sm:grid-cols-4">
    <div
      v-for="(item, index) in items"
      :key="item.title + index"
      class="rounded-[var(--ui-radius-md)] border p-3 transition"
      :class="index <= current ? 'border-[var(--ui-primary)]/20 bg-[var(--ui-primary-soft)]' : 'border-[var(--ui-border)] bg-[var(--ui-surface-soft)]'"
    >
      <div class="flex items-center gap-3">
        <div
          class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
          :class="index <= current ? 'bg-[var(--ui-primary)] text-white' : 'border border-[var(--ui-border)] bg-[var(--ui-surface)] text-[var(--ui-text-soft)]'"
        >
          {{ index + 1 }}
        </div>
        <div class="min-w-0">
          <div class="truncate text-sm font-semibold text-[var(--ui-text)]">
            {{ item.title }}
          </div>
          <div
            v-if="item.desc"
            class="text-xs text-[var(--ui-text-soft)]"
          >
            {{ item.desc }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  items: Array<{ title: string; desc?: string }>
  current: number
}>()
</script>
