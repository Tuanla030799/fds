<template>
  <header class="flex flex-col gap-4 border-b border-[var(--ui-border)] bg-[var(--ui-surface)] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
    <div>
      <div class="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ui-text-soft)]">
        Admin workspace
      </div>
      <h1 class="mt-1 text-xl font-bold tracking-tight text-[var(--ui-text)] sm:text-2xl">
        {{ title }}
      </h1>
      <p
        v-if="description"
        class="mt-1 text-sm text-[var(--ui-text-muted)]"
      >
        {{ description }}
      </p>
    </div>

    <div class="flex items-center gap-3">
      <UiBadge
        :label="appStore.adminProfile?.role || 'admin'"
        variant="primary"
        size="md"
      />
      <UiCard
        padding="sm"
        class="min-w-[220px]"
      >
        <div class="text-sm font-semibold text-[var(--ui-text)]">
          {{ appStore.adminDisplayName }}
        </div>
        <div class="text-xs text-[var(--ui-text-soft)]">
          {{ appStore.adminProfile?.email || 'No email' }}
        </div>
      </UiCard>
      <UiButton
        variant="outline"
        @click="$emit('logout')"
      >
        Đăng xuất
      </UiButton>
    </div>
  </header>
</template>

<script setup lang="ts">
import { UiBadge, UiButton, UiCard } from '@/components/ui'
import { useAppStore } from '@/stores/app'

defineEmits<{
  logout: []
}>()

defineProps<{
  title: string
  description?: string
}>()

const appStore = useAppStore()
</script>
