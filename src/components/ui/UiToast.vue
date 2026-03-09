<template>
  <Teleport to="body">
    <div class="pointer-events-none fixed inset-x-0 top-4 z-[60] flex justify-center px-4 sm:justify-end sm:px-6">
      <div class="flex w-full max-w-sm flex-col gap-2">
        <TransitionGroup name="toast">
          <div
            v-for="item in items"
            :key="item.id"
            :class="itemClasses(item.variant)"
            class="pointer-events-auto overflow-hidden rounded-[var(--ui-radius-lg)] border px-4 py-3 shadow-2xl"
          >
            <div class="flex items-start gap-3">
              <div class="min-w-0 flex-1">
                <div
                  v-if="item.title"
                  class="text-sm font-semibold text-[var(--ui-text)]"
                >
                  {{ item.title }}
                </div>
                <div class="text-sm leading-6 text-[var(--ui-text-muted)]">
                  {{ item.message }}
                </div>
              </div>
              <button
                type="button"
                class="text-[var(--ui-text-soft)]"
                @click="$emit('remove', item.id)"
              >
                ✕
              </button>
            </div>
          </div>
        </TransitionGroup>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { cn } from '@/utils/cn'
import type { ToastItem, ToastVariant } from '@/composables/useToast'

defineProps<{
  items: readonly ToastItem[]
}>()

defineEmits<{
  remove: [id: number]
}>()

function itemClasses(variant: ToastVariant) {
  const map = {
    info: 'border-sky-200 bg-sky-50',
    success: 'border-emerald-200 bg-emerald-50',
    warning: 'border-amber-200 bg-amber-50',
    error: 'border-red-200 bg-red-50',
  }
  return cn(map[variant])
}
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.18s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
