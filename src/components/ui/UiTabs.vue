<template>
  <div class="space-y-4">
    <div class="grid grid-cols-1 gap-2 rounded-[var(--ui-radius-md)] bg-[var(--ui-surface-soft)] p-1 sm:grid-cols-none sm:auto-cols-fr sm:grid-flow-col">
      <button
        v-for="item in items"
        :key="item.key"
        type="button"
        class="rounded-[calc(var(--ui-radius-md)-4px)] px-4 py-2.5 text-sm font-medium transition"
        :class="item.key === modelValue ? 'bg-[var(--ui-surface)] text-[var(--ui-primary)] shadow-sm' : 'text-[var(--ui-text-muted)] hover:bg-[var(--ui-surface)]/70'"
        @click="$emit('update:modelValue', item.key)"
      >
        {{ item.label }}
      </button>
    </div>
    <slot />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: string
  items: Array<{ key: string; label: string }>
}>()

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>
