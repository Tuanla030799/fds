<template>
  <section class="space-y-6">
    <div class="grid grid-cols-1 gap-4 xl:grid-cols-3">
      <UiCard
        v-for="item in stats"
        :key="item.label"
        :title="item.label"
        padding="md"
      >
        <div class="text-3xl font-bold tracking-tight text-[var(--ui-text)]">
          {{ item.value }}
        </div>
        <p class="mt-2 text-sm text-[var(--ui-text-soft)]">
          {{ item.desc }}
        </p>
      </UiCard>
    </div>

    <div class="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
      <UiCard
        title="Đi nhanh"
        description="Các khu chức năng chính trong admin."
      >
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <RouterLink
            to="/admin/orders"
            class="no-underline"
          >
            <UiButton block>
              Đi tới đơn hàng
            </UiButton>
          </RouterLink>
          <RouterLink
            to="/admin/presets"
            class="no-underline"
          >
            <UiButton
              block
              variant="outline"
            >
              Đi tới preset ảnh
            </UiButton>
          </RouterLink>
        </div>
      </UiCard>

      <UiCard
        title="Tài khoản hiện tại"
        padding="md"
      >
        <div class="space-y-3">
          <div>
            <div class="text-sm font-semibold text-[var(--ui-text)]">
              {{ appStore.adminDisplayName }}
            </div>
            <div class="text-sm text-[var(--ui-text-soft)]">
              {{ appStore.adminProfile?.email }}
            </div>
          </div>
          <UiBadge
            :label="appStore.adminProfile?.role || 'admin'"
            variant="primary"
            size="md"
          />
        </div>
      </UiCard>
    </div>
  </section>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { UiBadge, UiButton, UiCard } from '@/components/ui'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()

const stats = [
  { label: 'Orders', value: 'Live API', desc: 'Danh sách đơn hàng lấy trực tiếp từ backend admin.' },
  { label: 'Presets', value: 'Live API', desc: 'Preset ảnh cho client chọn ở bước đầu tiên.' },
  { label: 'Session', value: 'JWT', desc: 'Sử dụng access token + refresh token trong store.' },
]
</script>
