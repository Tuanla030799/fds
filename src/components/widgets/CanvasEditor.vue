<template>
  <div class="space-y-4">
    <UiCard
      :shadow="false"
      class="border-[var(--ui-border)] bg-[var(--ui-surface-soft)]"
      padding="md"
    >
      <UiTabs
        v-model="activeTab"
        :items="[...CANVAS_TAB_ITEMS]"
      >
        <UiForm
          v-if="activeTab === 'text'"
          class="grid grid-cols-1 gap-3 md:grid-cols-2"
        >
          <UiFormItem
            label="Text"
            :hint="`Tối đa ${maxTextChars} ký tự`"
          >
            <UiInput
              v-model="textInput"
              :maxlength="maxTextChars"
              placeholder="Nhập text để thêu"
              @keydown.enter.prevent="addText"
            />
          </UiFormItem>

          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 md:col-span-2">
            <UiButton
              variant="outline"
              @click="addText"
            >
              Thêm text
            </UiButton>
            <UiButton
              variant="outline"
              @click="openIconPicker"
            >
              Thêm icon
            </UiButton>
          </div>
        </UiForm>

        <UiForm
          v-else-if="activeTab === 'style'"
          class="grid grid-cols-1 gap-3 md:grid-cols-3"
        >
          <UiFormItem label="Font">
            <UiSelect
              v-model="fontFamily"
              :options="fontOptions"
            />
          </UiFormItem>

          <UiFormItem label="Cỡ chữ">
            <UiInput
              v-model="fontSizeModel"
              type="number"
              min="12"
              max="72"
              inputmode="numeric"
            />
          </UiFormItem>

          <UiFormItem label="Màu">
            <label class="flex h-[50px] min-w-0 cursor-pointer items-center justify-center overflow-hidden rounded-[var(--ui-radius-md)] border border-[var(--ui-border-strong)] bg-[var(--ui-surface)] px-2">
              <input
                v-model="fillColor"
                type="color"
                class="h-10 w-full cursor-pointer border-0 bg-transparent p-0"
              >
            </label>
          </UiFormItem>
        </UiForm>

        <UiForm
          v-else
          class="grid grid-cols-1 gap-3 md:grid-cols-2"
        >
          <UiButton
            variant="danger"
            @click="removeActive"
          >
            Xóa object
          </UiButton>
          <UiButton @click="exportPng">
            Export PNG
          </UiButton>
        </UiForm>
      </UiTabs>
    </UiCard>

    <UiAlert
      v-if="notice"
      :variant="notice.type === 'error' ? 'error' : 'info'"
    >
      {{ notice.text }}
    </UiAlert>

    <div
      ref="canvasOuterRef"
      class="relative w-full min-w-0 overflow-hidden rounded-[var(--ui-radius-lg)] border border-[var(--ui-border)] bg-[var(--ui-surface)] shadow-inner"
    />

    <p class="text-xs leading-5 text-[var(--ui-text-soft)]">
      Tip: chạm hoặc chọn object để kéo, resize, rotate. Nhấn Delete hoặc Backspace để xóa.
    </p>

    <UiModal
      :open="iconPickerOpen"
      title="Chọn icon"
      :description="`Tối đa ${maxIcons} icon. Icon sẽ dùng màu đang chọn.`"
      mobile-sheet
      max-width="lg"
      @close="setIconPickerOpen(false)"
    >
      <div class="grid grid-cols-3 gap-3 sm:grid-cols-4">
        <button
          v-for="icon in CANVAS_ICONS"
          :key="icon.key"
          type="button"
          class="flex flex-col items-center justify-center gap-2 rounded-[var(--ui-radius-md)] border border-[var(--ui-border)] bg-[var(--ui-surface)] px-2 py-4 transition hover:border-[var(--ui-primary)]/30 hover:bg-[var(--ui-primary-soft)]"
          @click="pickIcon(icon.key)"
        >
          <span
            class="icon-preview"
            v-html="icon.svg"
          />
          <span class="text-xs font-medium text-[var(--ui-text-muted)]">{{ icon.label }}</span>
        </button>
      </div>
    </UiModal>
  </div>
</template>

<script setup lang="ts">
import { toRef } from 'vue'
import { CANVAS_ICONS, CANVAS_TAB_ITEMS } from '@/data/canvas-editor'
import { useCanvasEditor } from '@/composables/useCanvasEditor'
import {
  UiAlert,
  UiButton,
  UiCard,
  UiForm,
  UiFormItem,
  UiInput,
  UiModal,
  UiSelect,
  UiTabs,
} from '@/components/ui'
import type { CanvasBackgroundFit } from '@/types/canvas-editor'

const props = withDefaults(
  defineProps<{
    backgroundUrl: string
    maxTextChars?: number
    maxIcons?: number
    bgFit?: CanvasBackgroundFit
  }>(),
  {
    maxTextChars: 12,
    maxIcons: 2,
    bgFit: 'contain',
  },
)

const emit = defineEmits<{
  exported: [{ pngDataUrl: string }]
}>()

const {
  activeTab,
  addText,
  canvasOuterRef,
  exportPng,
  fillColor,
  fontFamily,
  fontOptions,
  fontSizeModel,
  iconPickerOpen,
  notice,
  openIconPicker,
  pickIcon,
  removeActive,
  setIconPickerOpen,
  textInput,
} = useCanvasEditor({
  backgroundUrl: toRef(props, 'backgroundUrl'),
  bgFit: toRef(props, 'bgFit'),
  config: {
    maxTextChars: props.maxTextChars,
    maxIcons: props.maxIcons,
    bgFit: props.bgFit,
  },
  onExported: (payload) => emit('exported', payload),
})
</script>

<style scoped>
.icon-preview :deep(svg) {
  width: 44px;
  height: 44px;
  fill: currentColor;
  color: #0f172a;
}
</style>
