<template>
  <section class="ui-page flex min-h-screen items-center justify-center px-4 py-10">
    <div class="w-full max-w-lg">
      <UiCard padding="lg">
        <div class="text-center">
          <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--ui-primary-soft)] text-2xl font-bold text-[var(--ui-primary)]">
            404
          </div>
          <h1 class="mt-5 text-2xl font-bold text-[var(--ui-text)]">
            Trang không tồn tại
          </h1>
          <p class="mt-2 text-sm leading-6 text-[var(--ui-text-muted)]">
            Route bạn truy cập chưa được cấu hình hoặc đã bị thay đổi. Hãy quay lại các khu chính của app.
          </p>
          <div class="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <RouterLink
              to="/fds"
              class="block no-underline"
            >
              <UiButton block>
                Về /fds
              </UiButton>
            </RouterLink>
            <RouterLink
              to="/guide"
              class="block no-underline"
            >
              <UiButton
                block
                variant="secondary"
              >
                Mở /guide
              </UiButton>
            </RouterLink>
            <RouterLink
              to="/admin"
              class="block no-underline"
            >
              <UiButton
                block
                variant="outline"
              >
                Mở /admin
              </UiButton>
            </RouterLink>
          </div>
        </div>
      </UiCard>
    </div>
  </section>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { UiButton, UiCard } from '@/components/ui'
</script>
