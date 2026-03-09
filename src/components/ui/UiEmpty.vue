<template>
  <div class="flex flex-col items-center justify-center rounded-[var(--ui-radius-lg)] border border-dashed border-[var(--ui-border-strong)] bg-[var(--ui-surface-muted)] px-5 py-10 text-center">
    <div class="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--ui-primary-soft)] text-lg text-[var(--ui-primary)]">
      <slot name="icon">
        ✦
      </slot>
    </div>
    <h3 class="text-base font-semibold text-[var(--ui-text)]">
      {{ title }}
    </h3>
    <p
      v-if="description"
      class="mt-2 max-w-md text-sm leading-6 text-[var(--ui-text-muted)]"
    >
      {{ description }}
    </p>
    <div
      v-if="$slots.action"
      class="mt-4"
    >
      <slot name="action" />
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    title?: string
    description?: string
  }>(),
  {
    title: 'Chưa có dữ liệu',
    description: '',
  },
)
</script>
