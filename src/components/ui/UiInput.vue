<template>
  <input
    :value="modelValue"
    :type="type"
    :placeholder="placeholder"
    :maxlength="maxlength"
    :min="min"
    :max="max"
    :disabled="disabled"
    :class="classes"
    v-bind="$attrs"
    @input="onInput"
  >
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/utils/cn'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<{
  modelValue?: string | number
  type?: string
  placeholder?: string
  maxlength?: number
  min?: string | number
  max?: string | number
  disabled?: boolean
  class?: string
}>(), {
  modelValue: '',
  type: 'text',
  placeholder: '',
  maxlength: undefined,
  min: undefined,
  max: undefined,
  disabled: false,
  class: '',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const classes = computed(() => cn(
  'min-w-0 w-full rounded-[var(--ui-radius-md)] border border-[var(--ui-border-strong)] bg-[var(--ui-surface)] px-4 py-3 text-sm text-[var(--ui-text)] outline-none transition placeholder:text-[var(--ui-text-soft)] focus:border-[var(--ui-primary)] focus:ring-4 focus:ring-[var(--ui-primary-ring)] disabled:cursor-not-allowed disabled:bg-[var(--ui-surface-soft)]',
  props.class,
))

function onInput(event: Event) {
  emit('update:modelValue', (event.target as HTMLInputElement).value)
}
</script>
