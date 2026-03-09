<template>
  <section
    class="ui-page mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-4 sm:px-6 sm:py-6 lg:px-8"
  >
    <UiToast
      :items="toasts"
      @remove="removeToast"
    />

    <div class="mb-5 flex flex-col gap-3 sm:mb-6">
      <div>
        <h1
          class="text-2xl font-bold tracking-tight text-[var(--ui-text)] sm:text-3xl"
        >
          Giả lập thêu chữ trên mẫu có sẵn
        </h1>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-4">
      <UiCard padding="lg">
        <UiSteps
          :items="[...WIZARD_STEPS]"
          :current="step"
        />

        <UiAlert
          v-if="notice"
          class="mt-4"
          :variant="notice.type === 'error' ? 'error' : 'success'"
        >
          {{ notice.text }}
        </UiAlert>

        <div
          v-if="step === 0"
          class="mt-4 space-y-4"
        >
          <UiUpload
            title="Chọn ảnh"
            description="Hỗ trợ jpg, png, webp."
            accept="image/*"
            trigger-text="Chọn ảnh từ thiết bị"
            @change="onFileChange"
          >
            <template #extra>
              <UiButton
                :disabled="!bgUrl"
                variant="outline"
                block
                class="sm:w-auto"
                @click="clearAll"
              >
                Xóa ảnh
              </UiButton>
            </template>
          </UiUpload>

          <UiCard
            v-if="bgUrl"
            title="Preview ảnh nền"
            padding="sm"
          >
            <img
              :src="bgUrl"
              alt="Preview background"
              class="block max-h-[420px] w-full rounded-[var(--ui-radius-md)] border border-[var(--ui-border)] object-contain"
            >
          </UiCard>

          <div class="flex flex-col gap-3 sm:flex-row">
            <UiButton
              :disabled="!bgUrl"
              class="sm:w-auto"
              block
              @click="next"
            >
              Tiếp theo
            </UiButton>
          </div>
        </div>

        <div
          v-else-if="step === 1"
          class="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]"
        >
          <UiCard
            title="Khu vực thiết kế"
            padding="sm"
          >
            <CanvasEditor
              v-if="bgUrl"
              :background-url="bgUrl"
              :max-text-chars="12"
              :max-icons="2"
              bg-fit="contain"
              @exported="onExported"
            />
          </UiCard>

          <aside class="min-w-0 space-y-4">
            <UiCard
              v-if="exportedPng"
              title="Preview nhanh"
              padding="sm"
            >
              <img
                :src="exportedPng"
                alt="Export preview"
                class="block w-full rounded-[var(--ui-radius-md)] border border-[var(--ui-border)]"
              >
            </UiCard>
            <UiCard
              title="Điều khiển"
              padding="md"
            >
              <p class="text-sm leading-6 text-[var(--ui-text-muted)]">
                Bấm
                <span class="font-semibold text-[var(--ui-text)]">Export PNG</span>
                để tạo ảnh kết quả, rồi sang bước Kết quả.
              </p>
              <div class="mt-4 flex flex-col gap-3">
                <UiButton
                  variant="outline"
                  @click="prev"
                >
                  Quay lại
                </UiButton>
                <UiButton
                  :disabled="!exportedPng"
                  @click="next"
                >
                  Sang kết quả
                </UiButton>
              </div>
            </UiCard>
          </aside>
        </div>

        <div
          v-else
          class="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]"
        >
          <UiCard
            title="Kết quả PNG"
            padding="sm"
          >
            <div v-if="exportedPng">
              <img
                :src="exportedPng"
                alt="PNG result"
                class="block w-full rounded-[var(--ui-radius-md)] border border-[var(--ui-border)]"
              >
            </div>
            <UiAlert
              v-else
              variant="warning"
            >
              Chưa có PNG. Hãy quay lại bước Thiết kế và bấm Export PNG.
            </UiAlert>
          </UiCard>

          <UiCard title="Hành động">
            <div class="flex flex-col gap-3">
              <UiButton
                variant="outline"
                @click="prev"
              >
                Quay lại
              </UiButton>
              <UiButton
                variant="dark"
                @click="clearAll"
              >
                Làm lại từ đầu
              </UiButton>
              <UiButton
                variant="primary"
                @click="handleSaveTemplate"
              >
                Lưu mẫu
              </UiButton>
            </div>
          </UiCard>
        </div>
      </UiCard>
    </div>
  </section>
</template>

<script setup lang="ts">
import CanvasEditor from "@/components/widgets/CanvasEditor.vue";
import {
  UiAlert,
  UiButton,
  UiCard,
  UiSteps,
  UiToast,
  UiUpload,
} from "@/components/ui";
import { useDesignerPage } from "@/composables/useDesignerPage";

const {
  WIZARD_STEPS,
  bgUrl,
  clearAll,
  exportedPng,
  next,
  notice,
  onExported,
  onFileChange,
  prev,
  removeToast,
  step,
  toasts,
  handleSaveTemplate,
} = useDesignerPage();
</script>
