<template>
  <section
    class="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-4 sm:px-6 sm:py-6 lg:px-8"
  >
    <div class="space-y-3">
      <UiBadge
        variant="primary"
        label="/admin"
      />
      <div>
        <h1
          class="text-2xl font-bold tracking-tight text-[var(--ui-text)] sm:text-3xl"
        >
          Admin starter layout
        </h1>
        <p
          class="mt-2 max-w-2xl text-sm leading-6 text-[var(--ui-text-muted)] sm:text-base"
        >
          Đây là base cho dashboard/admin sau này. Layout đã tách riêng để bạn
          phát triển preset manager, asset manager hoặc order management.
        </p>
      </div>
    </div>

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

    <div
      class="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]"
    >
      <UiCard
        title="Roadmap admin"
        description="Các module hợp lý để phát triển tiếp từ base hiện tại."
      >
        <div class="space-y-3">
          <div
            v-for="item in roadmap"
            :key="item.title"
            class="rounded-[var(--ui-radius-md)] border border-[var(--ui-border)] px-4 py-4"
          >
            <div class="flex items-center justify-between gap-3">
              <div>
                <div class="font-semibold text-[var(--ui-text)]">
                  {{ item.title }}
                </div>
                <div class="text-sm text-[var(--ui-text-soft)]">
                  {{ item.desc }}
                </div>
              </div>
              <UiTag
                :label="item.tag"
                variant="outline"
              />
            </div>
          </div>
        </div>
      </UiCard>

      <UiCard
        title="Đi nhanh"
        padding="md"
      >
        <div class="space-y-3">
          <RouterLink
            to="/guide"
            class="block no-underline"
          >
            <UiButton
              block
              variant="secondary"
            >
              Xem guide / pattern
            </UiButton>
          </RouterLink>
          <RouterLink
            to="/fds"
            class="block no-underline"
          >
            <UiButton block>
              Đi tới FDS designer
            </UiButton>
          </RouterLink>
          <UiEmpty
            title="Admin modules chưa bật"
            description="Tạm thời đây là khung layout. Bạn có thể thêm nested route như /admin/presets hoặc /admin/orders ở bước sau."
          />
        </div>
      </UiCard>
    </div>
  </section>
</template>

<script setup lang="ts">
import { RouterLink } from "vue-router";
import { UiBadge, UiButton, UiCard, UiEmpty, UiTag } from "@/components/ui";

const stats = [
  {
    label: "Presets",
    value: "24",
    desc: "Số preset mockup hiện có trong hệ thống.",
  },
  {
    label: "Assets",
    value: "128",
    desc: "Số icon / design assets sẵn sàng dùng lại.",
  },
  {
    label: "Drafts",
    value: "8",
    desc: "Các cấu hình đang ở trạng thái draft chờ hoàn thiện.",
  },
];

const roadmap = [
  {
    title: "Preset manager",
    desc: "CRUD preset, filter theo trạng thái, tag, font, vật liệu.",
    tag: "next",
  },
  {
    title: "Asset library",
    desc: "Quản lý icon, texture, font và nhóm asset dùng trong editor.",
    tag: "ready",
  },
  {
    title: "Orders / approvals",
    desc: "Theo dõi mockup cần duyệt, trạng thái sản xuất hoặc phản hồi khách hàng.",
    tag: "later",
  },
];
</script>
