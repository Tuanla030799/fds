<template>
  <div class="ui-page min-h-screen bg-[var(--ui-surface-muted)] lg:grid lg:grid-cols-[280px_minmax(0,1fr)]">
    <div class="hidden lg:block lg:min-h-screen">
      <AdminSidebarNav />
    </div>

    <div class="min-w-0">
      <AdminTopbar
        :title="pageTitle"
        :description="pageDescription"
        @logout="handleLogout"
      />

      <div class="border-b border-[var(--ui-border)] bg-[var(--ui-surface)] px-4 py-3 lg:hidden">
        <div class="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <RouterLink
            v-for="item in quickLinks"
            :key="item.to"
            :to="item.to"
            class="no-underline"
          >
            <UiButton
              block
              variant="outline"
            >
              {{ item.label }}
            </UiButton>
          </RouterLink>
        </div>
      </div>

      <main class="min-w-0 px-4 py-4 sm:px-6 sm:py-6">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import { UiButton } from '@/components/ui'
import AdminSidebarNav from '@/components/admin/SidebarNav.vue'
import AdminTopbar from '@/components/admin/Topbar.vue'
import { adminAuthService } from '@/services/admin/auth.service'
import { useAppStore } from '@/stores/app'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()

const quickLinks = [
  { label: 'Dashboard', to: '/admin/dashboard' },
  { label: 'Đơn hàng', to: '/admin/orders' },
  { label: 'Templates', to: '/admin/templates' },
  { label: 'Client', to: '/fds' },
]

const pageTitle = computed(() => String(route.meta.title || 'FDS Admin'))
const pageDescription = computed(() => String(route.meta.description || 'Quản trị đơn hàng, template và phiên đăng nhập admin.'))

async function handleLogout() {
  try {
    if (appStore.refreshToken) {
      await adminAuthService.logout(appStore.refreshToken)
    }
  } catch {
    // swallow logout network error, still clear local session
  } finally {
    appStore.clearAuthSession()
    router.replace({ name: 'admin-login' })
  }
}
</script>
