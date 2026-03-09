<template>
  <div
    ref="rootRef"
    class="relative inline-block text-left"
  >
    <div @click="toggle">
      <slot name="trigger">
        <button
          type="button"
          class="inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--ui-radius-md)] border border-[var(--ui-border)] bg-[var(--ui-surface)] px-4 py-3 text-sm font-semibold text-[var(--ui-text)] transition hover:bg-[var(--ui-surface-soft)]"
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
        :class="menuClasses"
      >
        <button
          v-for="item in items"
          :key="item.key"
          type="button"
          class="flex w-full items-center justify-between gap-3 rounded-[calc(var(--ui-radius-md)-4px)] px-3 py-2.5 text-left text-sm transition hover:bg-[var(--ui-surface-soft)]"
          @click="onPick(item.key)"
        >
          <span class="font-medium text-[var(--ui-text)]">{{ item.label }}</span>
          <span
            v-if="item.meta"
            class="text-xs text-[var(--ui-text-soft)]"
          >{{ item.meta }}</span>
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { cn } from '@/utils/cn'

type DropdownItem = { key: string; label: string; meta?: string }

const props = withDefaults(defineProps<{
  items?: DropdownItem[]
  triggerText?: string
  placement?: 'left' | 'right'
}>(), {
  items: () => [],
  triggerText: 'Mở menu',
  placement: 'right',
})

const emit = defineEmits<{
  select: [key: string]
}>()

const open = ref(false)
const rootRef = ref<HTMLElement | null>(null)

const menuClasses = computed(() => cn(
  'absolute z-30 mt-2 min-w-56 rounded-[var(--ui-radius-lg)] border border-[var(--ui-border)] bg-[var(--ui-surface)] p-2 shadow-2xl',
  props.placement === 'right' ? 'right-0' : 'left-0',
))

function toggle() {
  open.value = !open.value
}
function onPick(key: string) {
  emit('select', key)
  open.value = false
}
function onDocClick(event: MouseEvent) {
  if (!rootRef.value?.contains(event.target as Node)) open.value = false
}
document.addEventListener('click', onDocClick)
onBeforeUnmount(() => document.removeEventListener('click', onDocClick))
</script>
