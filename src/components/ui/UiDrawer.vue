<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-50 bg-slate-950/45"
      @click.self="emit('close')"
    >
      <div class="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-[var(--ui-surface)] shadow-2xl">
        <div class="flex items-center justify-between gap-3 border-b border-[var(--ui-border)] px-4 py-4 sm:px-5">
          <div>
            <h3
              v-if="title"
              class="text-base font-semibold text-[var(--ui-text)]"
            >
              {{ title }}
            </h3>
            <p
              v-if="description"
              class="mt-1 text-sm text-[var(--ui-text-soft)]"
            >
              {{ description }}
            </p>
          </div>
          <button
            type="button"
            class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--ui-border)] text-[var(--ui-text-soft)] transition hover:bg-[var(--ui-surface-soft)]"
            @click="emit('close')"
          >
            ✕
          </button>
        </div>
        <div class="flex-1 overflow-y-auto p-4 sm:p-5">
          <slot />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  open: boolean
  title?: string
  description?: string
}>(), {
  title: '',
  description: '',
})

const emit = defineEmits<{
  close: []
}>()
</script>
