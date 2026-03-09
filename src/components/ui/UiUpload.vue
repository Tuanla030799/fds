<template>
  <div :class="wrapperClasses">
    <div>
      <div
        v-if="title"
        class="text-base font-semibold text-[var(--ui-text)]"
      >
        {{ title }}
      </div>
      <div
        v-if="description"
        class="mt-1 text-sm text-[var(--ui-text-soft)]"
      >
        {{ description }}
      </div>
    </div>

    <div class="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
      <label :class="triggerClasses">
        <input
          ref="inputRef"
          class="hidden"
          type="file"
          :accept="accept"
          :multiple="multiple"
          :disabled="disabled"
          @change="onChange"
        >
        <slot>
          {{ triggerText }}
        </slot>
      </label>
      <slot name="extra" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { cn } from '@/utils/cn'

const props = withDefaults(defineProps<{
  title?: string
  description?: string
  accept?: string
  multiple?: boolean
  disabled?: boolean
  triggerText?: string
  dashed?: boolean
  class?: string
}>(), {
  title: '',
  description: '',
  accept: '*/*',
  multiple: false,
  disabled: false,
  triggerText: 'Chọn file',
  dashed: true,
  class: '',
})

const emit = defineEmits<{
  change: [event: Event]
}>()

const inputRef = ref<HTMLInputElement | null>(null)

const wrapperClasses = computed(() => cn(
  'rounded-[var(--ui-radius-lg)] bg-[var(--ui-surface-soft)] p-4 sm:p-5',
  props.dashed ? 'border border-dashed border-[var(--ui-border-strong)]' : 'border border-[var(--ui-border)]',
  props.class,
))

const triggerClasses = computed(() => cn(
  'inline-flex w-full cursor-pointer items-center justify-center rounded-[var(--ui-radius-md)] px-4 py-3 text-sm font-semibold transition sm:w-auto',
  props.disabled ? 'cursor-not-allowed bg-[var(--ui-surface)] text-[var(--ui-text-soft)]' : 'bg-[var(--ui-text)] text-white hover:opacity-90',
))

function onChange(event: Event) {
  emit('change', event)
}

defineExpose({ inputRef })
</script>
