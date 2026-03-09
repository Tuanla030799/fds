<template>
  <label :class="wrapperClasses">
    <input
      :checked="modelValue"
      :disabled="disabled"
      type="checkbox"
      class="peer sr-only"
      v-bind="$attrs"
      @change="onChange"
    >
    <span :class="boxClasses">
      <svg
        viewBox="0 0 16 16"
        class="h-3.5 w-3.5"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M3.5 8.5L6.5 11.5L12.5 4.5"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </span>
    <span class="min-w-0 flex-1">
      <span
        v-if="label || $slots.default"
        class="block text-sm font-medium text-[var(--ui-text)]"
      >
        <slot>{{ label }}</slot>
      </span>
      <span
        v-if="description"
        class="mt-1 block text-xs leading-5 text-[var(--ui-text-soft)]"
      >{{ description }}</span>
    </span>
  </label>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/utils/cn'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<{
  modelValue?: boolean
  label?: string
  description?: string
  disabled?: boolean
}>(), {
  modelValue: false,
  label: '',
  description: '',
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const wrapperClasses = computed(() => cn(
  'flex cursor-pointer items-start gap-3 rounded-[var(--ui-radius-md)] border border-transparent p-1 transition',
  props.disabled && 'cursor-not-allowed opacity-60',
))

const boxClasses = computed(() => cn(
  'mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-white transition',
  props.modelValue
    ? 'border-[var(--ui-primary)] bg-[var(--ui-primary)]'
    : 'border-[var(--ui-border-strong)] bg-[var(--ui-surface)] text-transparent',
))

function onChange(event: Event) {
  emit('update:modelValue', (event.target as HTMLInputElement).checked)
}
</script>
