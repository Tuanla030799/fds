<template>
  <div
    ref="rootRef"
    class="relative inline-flex"
  >
    <div @click="toggle">
      <slot name="trigger">
        <button
          type="button"
          class="inline-flex min-h-11 items-center justify-center rounded-[var(--ui-radius-md)] border border-[var(--ui-border)] bg-[var(--ui-surface)] px-4 py-3 text-sm font-semibold text-[var(--ui-text)] transition hover:bg-[var(--ui-surface-soft)]"
        >
          {{ triggerText }}
        </button>
      </slot>
    </div>
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="translate-y-1 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="translate-y-1 opacity-0"
    >
      <div
        v-if="open"
        :class="panelClasses"
      >
        <div
          v-if="title"
          class="mb-1 text-sm font-semibold text-[var(--ui-text)]"
        >
          {{ title }}
        </div>
        <div class="text-sm leading-6 text-[var(--ui-text-muted)]">
          <slot>{{ content }}</slot>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { cn } from '@/utils/cn'

const props = withDefaults(defineProps<{
  triggerText?: string
  title?: string
  content?: string
  placement?: 'left' | 'right'
}>(), {
  triggerText: 'Xem thêm',
  title: '',
  content: '',
  placement: 'left',
})

const open = ref(false)
const rootRef = ref<HTMLElement | null>(null)

const panelClasses = computed(() => cn(
  'absolute top-full z-30 mt-2 w-72 rounded-[var(--ui-radius-lg)] border border-[var(--ui-border)] bg-[var(--ui-surface)] p-4 shadow-2xl',
  props.placement === 'right' ? 'right-0' : 'left-0',
))

function toggle() {
  open.value = !open.value
}
function onDocClick(event: MouseEvent) {
  if (!rootRef.value?.contains(event.target as Node)) open.value = false
}
document.addEventListener('click', onDocClick)
onBeforeUnmount(() => document.removeEventListener('click', onDocClick))
</script>
