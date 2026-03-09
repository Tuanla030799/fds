<template>
  <label :class="wrapperClasses">
    <span class="min-w-0 flex-1">
      <span
        v-if="label || $slots.default"
        class="block text-sm font-medium text-[var(--ui-text)]"
      ><slot>{{ label }}</slot></span>
      <span
        v-if="description"
        class="mt-1 block text-xs leading-5 text-[var(--ui-text-soft)]"
      >{{ description }}</span>
    </span>
    <button
      type="button"
      :disabled="disabled"
      :class="trackClasses"
      @click="emit('update:modelValue', !modelValue)"
    >
      <span :class="thumbClasses" />
    </button>
  </label>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/utils/cn'

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
  'flex items-center gap-3 rounded-[var(--ui-radius-md)] border border-transparent p-1',
  props.disabled && 'opacity-60',
))

const trackClasses = computed(() => cn(
  'relative inline-flex h-7 w-12 shrink-0 rounded-full transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ui-primary-ring)]',
  props.modelValue ? 'bg-[var(--ui-primary)]' : 'bg-[var(--ui-border-strong)]',
  props.disabled && 'cursor-not-allowed',
))

const thumbClasses = computed(() => cn(
  'absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition',
  props.modelValue ? 'left-6' : 'left-1',
))
</script>
