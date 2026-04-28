<template>
  <div
    ref="rootRef"
    class="relative inline-block text-left"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
  >
    <div
      ref="triggerRef"
      class="cursor-pointer"
      @click="toggle"
    >
      <slot name="trigger">
        <button
          type="button"
          class="inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--ui-radius-md)] border border-[var(--ui-border)] bg-[var(--ui-surface)] px-4 py-3 text-sm font-semibold text-[var(--ui-text)] transition hover:bg-[var(--ui-surface-soft)]"
        >
          {{ triggerText }}
        </button>
      </slot>
    </div>

    <Teleport to="body">
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
          :style="menuStyle"
          @mouseenter="onMouseEnter"
          @mouseleave="onMouseLeave"
        >
          <button
            v-for="item in items"
            :key="item.key"
            type="button"
            class="flex w-full cursor-pointer items-center justify-between gap-3 rounded-[calc(var(--ui-radius-md)-4px)] px-3 py-2.5 text-left text-sm transition hover:bg-[var(--ui-surface-soft)]"
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
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref } from 'vue'
import { cn } from '@/utils/cn'

type DropdownItem = { key: string; label: string; meta?: string }

const props = withDefaults(defineProps<{
  items?: DropdownItem[]
  triggerText?: string
  placement?: 'left' | 'right'
  openOnHover?: boolean
}>(), {
  items: () => [],
  triggerText: 'Mở menu',
  placement: 'right',
  openOnHover: false,
})

const emit = defineEmits<{
  select: [key: string]
}>()

const open = ref(false)
const rootRef = ref<HTMLElement | null>(null)
const triggerRef = ref<HTMLElement | null>(null)
const menuStyle = ref<Record<string, string>>({})
let closeTimer: number | undefined

const menuClasses = computed(() => cn(
  'fixed z-[80] min-w-56 rounded-[var(--ui-radius-lg)] border border-[var(--ui-border)] bg-[var(--ui-surface)] p-2 shadow-2xl',
))

async function updateMenuPosition() {
  await nextTick()
  const rect = triggerRef.value?.getBoundingClientRect()
  if (!rect) return

  menuStyle.value = {
    top: `${rect.bottom + 8}px`,
    ...(props.placement === 'right'
      ? { right: `${Math.max(8, window.innerWidth - rect.right)}px` }
      : { left: `${Math.max(8, rect.left)}px` }),
  }
}

function setOpen(value: boolean) {
  open.value = value
  if (value) void updateMenuPosition()
}

function toggle() {
  if (props.openOnHover) return
  setOpen(!open.value)
}
function onPick(key: string) {
  emit('select', key)
  setOpen(false)
}
function onDocClick(event: MouseEvent) {
  if (!rootRef.value?.contains(event.target as Node)) setOpen(false)
}
function onMouseEnter() {
  if (!props.openOnHover) return
  if (closeTimer) window.clearTimeout(closeTimer)
  setOpen(true)
}
function onMouseLeave() {
  if (!props.openOnHover) return
  closeTimer = window.setTimeout(() => setOpen(false), 120)
}
document.addEventListener('click', onDocClick)
window.addEventListener('resize', updateMenuPosition)
window.addEventListener('scroll', updateMenuPosition, true)
onBeforeUnmount(() => {
  document.removeEventListener('click', onDocClick)
  window.removeEventListener('resize', updateMenuPosition)
  window.removeEventListener('scroll', updateMenuPosition, true)
  if (closeTimer) window.clearTimeout(closeTimer)
})
</script>
