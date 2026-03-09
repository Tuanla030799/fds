<template>
  <div class="ui-page min-h-screen lg:grid lg:grid-cols-[280px_minmax(0,1fr)]">
    <aside class="border-b border-[var(--ui-border)] bg-[var(--ui-surface)] lg:min-h-screen lg:border-b-0 lg:border-r">
      <div class="px-4 py-4 sm:px-6 lg:px-6">
        <RouterLink to="/fds" class="inline-flex items-center gap-3 no-underline">
          <div class="flex h-10 w-10 items-center justify-center rounded-[var(--ui-radius-md)] bg-[var(--ui-text)] font-bold text-white">A</div>
          <div>
            <div class="text-sm font-semibold text-[var(--ui-text)]">Admin workspace</div>
            <div class="text-xs text-[var(--ui-text-soft)]">Ready for dashboard / CRUD</div>
          </div>
        </RouterLink>
      </div>
      <nav class="flex flex-col gap-1 px-4 pb-4 sm:px-6 lg:px-4">
        <RouterLink v-for="item in navItems" :key="item.to" :to="item.to" :class="linkClass(item.to)">{{ item.label }}</RouterLink>
      </nav>
    </aside>

    <main class="min-w-0">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRoute, RouterLink, RouterView } from 'vue-router'
import { cn } from '@/utils/cn'

const route = useRoute()
const navItems = [
  { label: 'Dashboard', to: '/admin' },
  { label: 'Guide', to: '/guide' },
  { label: 'FDS Designer', to: '/fds' },
]

function linkClass(to: string) {
  const active = route.path === to || route.path.startsWith(`${to}/`)
  return cn(
    'inline-flex min-h-11 items-center rounded-[var(--ui-radius-md)] px-3 text-sm font-medium no-underline transition',
    active
      ? 'bg-[var(--ui-primary)] text-white'
      : 'text-[var(--ui-text-muted)] hover:bg-[var(--ui-surface-soft)] hover:text-[var(--ui-text)]',
  )
}
</script>
