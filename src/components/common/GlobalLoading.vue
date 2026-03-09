<template>
  <Transition name="fade">
    <div
      v-if="isLoading"
      class="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/25 px-4 backdrop-blur-[2px]"
    >
      <div class="flex w-full max-w-xs items-center gap-3 rounded-[var(--ui-radius-lg)] border border-[var(--ui-border)] bg-[var(--ui-surface)] px-4 py-4 shadow-2xl">
        <span class="h-5 w-5 animate-spin rounded-full border-2 border-[var(--ui-primary)] border-r-transparent" />
        <div>
          <p class="text-sm font-semibold text-[var(--ui-text)]">
            Đang tải dữ liệu
          </p>
          <p class="text-xs text-[var(--ui-text-soft)]">
            Vui lòng đợi một chút...
          </p>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()
const { isLoading } = storeToRefs(appStore)
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.18s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
