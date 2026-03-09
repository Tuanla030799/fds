<template>
  <section
    class="mx-auto flex min-h-[calc(100vh-73px)] w-full max-w-7xl flex-col gap-6 px-4 py-4 sm:px-6 sm:py-6 lg:px-8"
  >
    <div class="space-y-3">
      <div class="flex flex-wrap items-center gap-2">
        <UiBadge
          variant="primary"
          label="/guide"
        />
        <UiBadge
          variant="success"
          label="Reusable patterns"
        />
      </div>
      <div>
        <h1
          class="text-2xl font-bold tracking-tight text-[var(--ui-text)] sm:text-3xl"
        >
          Guide & pattern library
        </h1>
        <p
          class="mt-2 max-w-3xl text-sm leading-6 text-[var(--ui-text-muted)] sm:text-base"
        >
          Toàn bộ phần hướng dẫn, demo component và pattern tích hợp Axios +
          Pinia được gom về đây để màn
          <code>/fds</code> tập trung cho flow chính.
        </p>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
      <UiCard
        title="Route map"
        description="Sơ đồ route hiện tại để bạn mở rộng sau này."
      >
        <div class="grid grid-cols-1 gap-3 md:grid-cols-3">
          <UiCard
            bordered
            :shadow="false"
            padding="sm"
            class="border-dashed"
          >
            <div class="space-y-2">
              <UiBadge
                variant="primary"
                label="/fds"
              />
              <p class="text-sm text-[var(--ui-text-muted)]">
                Flow chính để upload ảnh, chỉnh text/icon và export mockup.
              </p>
            </div>
          </UiCard>
          <UiCard
            bordered
            :shadow="false"
            padding="sm"
            class="border-dashed"
          >
            <div class="space-y-2">
              <UiBadge
                variant="success"
                label="/guide"
              />
              <p class="text-sm text-[var(--ui-text-muted)]">
                Giữ hướng dẫn, examples, pattern UI để dễ tra cứu và copy lại.
              </p>
            </div>
          </UiCard>
          <UiCard
            bordered
            :shadow="false"
            padding="sm"
            class="border-dashed"
          >
            <div class="space-y-2">
              <UiBadge
                variant="warning"
                label="/admin"
              />
              <p class="text-sm text-[var(--ui-text-muted)]">
                Khu admin tách layout riêng, phù hợp CRUD, preset manager, asset
                manager.
              </p>
            </div>
          </UiCard>
        </div>
      </UiCard>

      <UiCard
        title="Quick links"
        padding="md"
      >
        <div class="space-y-3">
          <RouterLink
            v-for="item in links"
            :key="item.to"
            :to="item.to"
            class="block no-underline"
          >
            <div
              class="rounded-[var(--ui-radius-md)] border border-[var(--ui-border)] px-4 py-3 transition hover:bg-[var(--ui-surface-soft)]"
            >
              <div class="font-semibold text-[var(--ui-text)]">
                {{ item.label }}
              </div>
              <div class="text-sm text-[var(--ui-text-soft)]">
                {{ item.desc }}
              </div>
            </div>
          </RouterLink>
        </div>
      </UiCard>
    </div>

    <div class="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
      <UiCard
        title="Mini design system"
        padding="md"
      >
        <div class="space-y-4">
          <UiForm>
            <UiFormItem
              label="Trạng thái thêu"
              hint="Các component này dùng lại trực tiếp cho form setting sau này."
            >
              <UiRadio
                v-model="samplePreset"
                :options="PRESET_OPTIONS"
                stacked
              />
            </UiFormItem>

            <UiFormItem label="Tùy chọn nhanh">
              <div class="space-y-3">
                <UiCheckbox
                  v-model="sampleFlags.metallic"
                  label="Metallic thread"
                  description="Thêm hiệu ứng chỉ ánh kim cho preset hiển thị."
                />
                <UiCheckbox
                  v-model="sampleFlags.outline"
                  label="Outline"
                  description="Tạo viền đậm quanh nội dung thêu."
                />
                <UiSwitch
                  v-model="sampleFlags.autoCenter"
                  label="Auto center"
                  description="Tự căn giữa object khi thêm mới trên canvas."
                />
              </div>
            </UiFormItem>
          </UiForm>

          <div class="flex flex-wrap gap-2">
            <UiTag label="Embroidery" />
            <UiTag
              label="Preset active"
              variant="primary"
            />
            <UiTag
              label="Closable tag"
              closable
              @close="onTagClose"
            />
          </div>

          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <UiDropdown
              :items="MENU_ITEMS"
              trigger-text="Menu hành động"
              @select="onMenuSelect"
            />
            <UiPopover
              title="Mẹo mobile"
              content="Ưu tiên tabs, drawer và bottom sheet cho thao tác một tay trên điện thoại."
              trigger-text="Popover hướng dẫn"
              placement="right"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <UiButton
              block
              variant="secondary"
              @click="openDrawer = true"
            >
              Mở drawer demo
            </UiButton>
            <UiButton
              block
              variant="outline"
              @click="
                pushToast(
                  'Đây là toast mẫu để bạn gắn vào action thành công.',
                  'success',
                  'Saved',
                )
              "
            >
              Bắn toast
            </UiButton>
          </div>
        </div>
      </UiCard>

      <UiCard
        title="API / global store"
        description="Pattern chuẩn: components gọi store, store gọi service, service dùng axios httpClient."
        padding="md"
      >
        <UiForm class="space-y-4">
          <UiFormItem
            label="Access token"
            hint="Token sẽ tự được gắn vào header Authorization qua interceptor."
          >
            <UiInput
              v-model="accessTokenModel"
              placeholder="Bearer token hoặc JWT"
            />
          </UiFormItem>
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <UiButton
              :loading="apiLoading"
              block
              @click="fetchPresetList"
            >
              Gọi GET /presets
            </UiButton>
            <UiButton
              block
              variant="outline"
              @click="
                pushToast(
                  'Store hiện quản lý theme, access token và request loading toàn cục.',
                  'info',
                  'Pinia',
                )
              "
            >
              Xem pattern store
            </UiButton>
          </div>
        </UiForm>
      </UiCard>
    </div>

    <div
      class="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]"
    >
      <UiCard
        title="Admin/data base"
        description="Dùng cho preset list, asset manager hoặc dashboard đơn giản."
      >
        <UiTable
          :columns="TABLE_COLUMNS"
          :rows="pagedPresets"
          row-key="id"
        >
          <template #cell-name="{ row }">
            <div class="flex min-w-[180px] items-center gap-3">
              <div
                class="flex h-10 w-10 items-center justify-center rounded-[var(--ui-radius-sm)] bg-[var(--ui-primary-soft)] font-semibold text-[var(--ui-primary)]"
              >
                {{ row.name.slice(0, 1) }}
              </div>
              <div class="min-w-0">
                <div class="font-semibold text-[var(--ui-text)]">
                  {{ row.name }}
                </div>
                <div class="truncate text-xs text-[var(--ui-text-soft)]">
                  {{ row.note }}
                </div>
              </div>
            </div>
          </template>
          <template #cell-status="{ value }">
            <UiBadge
              :label="(value as any)"
              :variant="badgeVariant(value as any)"
            />
          </template>
          <template #cell-tags="{ value }">
            <div class="flex min-w-[160px] flex-wrap gap-2">
              <UiTag
                v-for="tag in value"
                :key="tag"
                :label="(tag as any)"
                variant="outline"
              />
            </div>
          </template>
          <template #cell-actions="{ row }">
            <div class="flex min-w-[160px] gap-2">
              <UiButton
                size="sm"
                variant="ghost"
                @click="previewPreset(row)"
              >
                Preview
              </UiButton>
              <UiButton
                size="sm"
                variant="outline"
                @click="duplicatePreset(row)"
              >
                Clone
              </UiButton>
            </div>
          </template>
          <template #footer>
            <UiPagination
              v-model:page="currentPage"
              :page-size="PAGE_SIZE"
              :total="presetRows.length"
            />
          </template>
        </UiTable>
      </UiCard>

      <div class="space-y-4">
        <UiCard
          title="Empty state + loading"
          padding="md"
        >
          <div class="space-y-4">
            <UiEmpty
              title="Chưa có preset team"
              description="Khi chưa có dữ liệu, dùng empty state để tránh cảm giác trống và thêm CTA rõ ràng."
            >
              <template #action>
                <UiButton
                  size="sm"
                  @click="
                    pushToast(
                      'Tạo preset mới từ empty state.',
                      'info',
                      'Create',
                    )
                  "
                >
                  Tạo preset mới
                </UiButton>
              </template>
            </UiEmpty>
            <UiCard
              bordered
              :shadow="false"
              padding="sm"
              class="border-dashed"
            >
              <div class="space-y-3">
                <UiSkeleton
                  avatar
                  :rows="3"
                />
                <UiSkeleton
                  :rows="2"
                  compact
                />
              </div>
            </UiCard>
          </div>
        </UiCard>

        <UiCard
          title="Badge trạng thái"
          padding="md"
        >
          <div class="flex flex-wrap gap-2">
            <UiBadge
              label="active"
              variant="success"
            />
            <UiBadge
              label="draft"
              variant="warning"
            />
            <UiBadge
              label="archived"
              variant="neutral"
            />
            <UiBadge
              label="error"
              variant="danger"
            />
          </div>
        </UiCard>
      </div>
    </div>

    <UiDrawer
      :open="openDrawer"
      title="Drawer mobile-first"
      description="Phù hợp cho settings nâng cao hoặc bộ preset dài trên mobile."
      @close="openDrawer = false"
    >
      <UiForm class="space-y-4">
        <UiFormItem label="Tên preset">
          <UiInput
            v-model="drawerPresetName"
            placeholder="Ví dụ: Street embroidery"
          />
        </UiFormItem>
        <UiFormItem label="Ghi chú">
          <UiTextarea
            v-model="drawerNote"
            placeholder="Mô tả preset, font, màu, độ dày chỉ..."
            rows="5"
          />
        </UiFormItem>
        <UiButton
          block
          @click="saveDrawerPreset"
        >
          Lưu preset demo
        </UiButton>
      </UiForm>
    </UiDrawer>

    <UiToast
      :items="toasts"
      @remove="removeToast"
    />
  </section>
</template>

<script setup lang="ts">
import { RouterLink } from "vue-router";
import {
  UiBadge,
  UiButton,
  UiCard,
  UiCheckbox,
  UiDrawer,
  UiDropdown,
  UiEmpty,
  UiForm,
  UiFormItem,
  UiInput,
  UiPagination,
  UiPopover,
  UiRadio,
  UiSkeleton,
  UiSwitch,
  UiTable,
  UiTag,
  UiTextarea,
  UiToast,
} from "@/components/ui";
import { useDesignerPage } from "@/composables/useDesignerPage";

const links = [
  {
    label: "Mở flow thiết kế",
    to: "/fds",
    desc: "Đi tới màn chính để upload và export mockup.",
  },
  {
    label: "Mở admin base",
    to: "/admin",
    desc: "Đi tới layout admin để phát triển dashboard.",
  },
];

const {
  MENU_ITEMS,
  PAGE_SIZE,
  PRESET_OPTIONS,
  TABLE_COLUMNS,
  accessTokenModel,
  apiLoading,
  badgeVariant,
  currentPage,
  drawerNote,
  drawerPresetName,
  duplicatePreset,
  fetchPresetList,
  onMenuSelect,
  onTagClose,
  openDrawer,
  pagedPresets,
  presetRows,
  previewPreset,
  pushToast,
  removeToast,
  sampleFlags,
  samplePreset,
  saveDrawerPreset,
  toasts,
} = useDesignerPage();
</script>
