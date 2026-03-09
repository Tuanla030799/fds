<template>
  <div class="space-y-2">
    <div
      v-if="label || $slots.label"
      class="flex items-start justify-between gap-3"
    >
      <label class="block text-sm font-medium text-[var(--ui-text-muted)]">
        <slot name="label">{{ label }}</slot>
      </label>
      <slot name="extra" />
    </div>
    <slot />
    <p
      v-if="hint"
      class="text-xs leading-5 text-[var(--ui-text-soft)]"
    >
      {{ hint }}
    </p>
    <p
      v-if="error"
      class="text-xs leading-5 text-[var(--ui-danger)]"
    >
      {{ error }}
    </p>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    label?: string
    hint?: string
    error?: string
  }>(),
  {
    label: '',
    hint: '',
    error: '',
  },
)
</script>
