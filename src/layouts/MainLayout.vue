<template>
  <div class="ui-page min-h-screen">
    <header class="sticky top-0 z-40 border-b border-[var(--ui-border)] bg-[color:color-mix(in_srgb,var(--ui-surface)_85%,transparent)] backdrop-blur">
      <div class="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <RouterLink
          to="/fds"
          class="flex items-center gap-3 no-underline"
        >
          <div class="flex h-10 w-10 items-center justify-center rounded-[var(--ui-radius-md)] bg-[var(--ui-primary-soft)] font-bold text-[var(--ui-primary)]">
            F
          </div>
          <div>
            <p class="text-sm font-semibold text-[var(--ui-text)]">
              FDS
            </p>
            <p class="text-xs text-[var(--ui-text-soft)]">
              description
            </p>
          </div>
        </RouterLink>

        <nav class="flex flex-wrap items-center gap-2">
          <RouterLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            :class="linkClass(item.to)"
          >
            {{ item.label }}
          </RouterLink>
        </nav>
      </div>
    </header>

    <RouterView />
  </div>
</template>

<script setup lang="ts">
import { useRoute, RouterLink, RouterView } from 'vue-router'
import { cn } from '@/utils/cn'

const route = useRoute()

const navItems = [
  { label: 'Trang chủ', to: '/fds' },
  { label: 'Thiết kế', to: '/fds' },
  { label: 'Hướng dẫn', to: '/guide' },
]

function linkClass(to: string) {
  const active = route.path === to || route.path.startsWith(`${to}/`)
  return cn(
    'inline-flex min-h-10 items-center justify-center rounded-[var(--ui-radius-sm)] px-3 text-sm font-medium no-underline transition',
    active
      ? 'bg-[var(--ui-primary-soft)] text-[var(--ui-primary)]'
      : 'text-[var(--ui-text-muted)] hover:bg-[var(--ui-surface-soft)] hover:text-[var(--ui-text)]',
  )
}
</script>
