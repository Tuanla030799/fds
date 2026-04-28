<template>
  <section class="ui-page mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
    <UiToast
      :items="toasts"
      @remove="removeToast"
    />

    <div class="mb-5 flex flex-col gap-3 sm:mb-6">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-[var(--ui-text)] sm:text-3xl">
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
          <UiCard
            title="Chọn ảnh mẫu từ hệ thống"
            description="Template ảnh được tải từ GET /api/templates."
            padding="md"
          >
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <button
                v-for="template in pagedTemplates"
                :key="template.id"
                type="button"
                class="rounded-[var(--ui-radius-lg)] border bg-[var(--ui-surface)] p-3 text-left transition"
                :class="selectedTemplateId === template.id ? 'border-[var(--ui-primary)] ring-4 ring-[var(--ui-primary-ring)]' : 'border-[var(--ui-border)] hover:border-[var(--ui-border-strong)]'"
                @click="selectTemplate(template)"
              >
                <div class="aspect-[4/3] overflow-hidden rounded-[var(--ui-radius-md)] border border-[var(--ui-border)] bg-[var(--ui-surface-muted)]">
                  <img
                    v-if="template.imageUrl"
                    :src="template.imageUrl"
                    :alt="template.name"
                    class="h-full w-full object-cover"
                  >
                  <div
                    v-else
                    class="flex h-full items-center justify-center text-sm text-[var(--ui-text-soft)]"
                  >
                    No image
                  </div>
                </div>
                <div class="mt-3 flex items-start justify-between gap-3">
                  <div>
                    <div class="font-semibold text-[var(--ui-text)]">
                      {{ template.name }}
                    </div>
                    <div class="mt-1 text-xs text-[var(--ui-text-soft)]">
                      {{ template.note }}
                    </div>
                  </div>
                  <UiBadge
                    :label="template.status"
                    :variant="badgeVariant(template.status)"
                  />
                </div>
              </button>
            </div>
          </UiCard>

          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div class="text-sm text-[var(--ui-text-soft)]">
              Chọn template rồi sang bước thiết kế.
            </div>
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
              ref="canvasEditorRef"
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
                Tạo ảnh kết quả để sang bước xác nhận.
              </p>

              <div class="mt-4 flex flex-col gap-3">
                <UiButton
                  variant="outline"
                  @click="prev"
                >
                  Quay lại
                </UiButton>
                <UiButton
                  variant="danger"
                  @click="removeActiveObject"
                >
                  Xóa Object
                </UiButton>
                <UiButton
                  @click="exportAndGoToConfirm"
                >
                  Sang xác nhận ảnh
                </UiButton>
              </div>
            </UiCard>
          </aside>
        </div>

        <div
          v-else-if="step === 2"
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
              Chưa có PNG. Hãy quay lại bước Thiết kế và bấm Sang xác nhận ảnh.
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
                :loading="imageUploadLoading"
                :disabled="!exportedPng"
                variant="primary"
                @click="confirmDesignImage"
              >
                Nhập thông tin người dùng
              </UiButton>
              <UiButton
                variant="dark"
                @click="clearAll"
              >
                Làm lại từ đầu
              </UiButton>
            </div>
          </UiCard>
        </div>

        <div
          v-else
          class="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]"
        >
          <UiCard
            title="Thông tin người dùng"
            padding="md"
          >
            <UiForm class="space-y-4">
              <UiFormItem label="Họ và tên">
                <UiInput
                  v-model="customerForm.fullName"
                  placeholder="Nhập họ và tên"
                />
              </UiFormItem>
              <UiFormItem label="Địa chỉ">
                <UiTextarea
                  v-model="customerForm.address"
                  rows="4"
                  placeholder="Nhập địa chỉ nhận hàng"
                />
              </UiFormItem>
              <UiFormItem label="Số điện thoại">
                <UiInput
                  v-model="customerForm.phone"
                  inputmode="tel"
                  placeholder="Nhập số điện thoại"
                />
              </UiFormItem>
              <UiFormItem label="Ghi chú">
                <UiTextarea
                  v-model="customerForm.note"
                  rows="4"
                  placeholder="Ghi chú thêm cho đơn hàng"
                />
              </UiFormItem>
            </UiForm>
          </UiCard>

          <UiCard title="Gửi lên server">
            <div class="space-y-3">
              <UiAlert
                v-if="!uploadedDesignFile"
                variant="warning"
              >
                Chưa có fileId ảnh thiết kế để gửi.
              </UiAlert>
              <UiButton
                variant="outline"
                @click="prev"
              >
                Quay lại
              </UiButton>
              <UiButton
                :loading="submitLoading"
                :disabled="!canSubmitDesign"
                variant="primary"
                @click="submitDesign"
              >
                Gửi ảnh và thông tin
              </UiButton>
              <UiButton
                variant="dark"
                @click="clearAll"
              >
                Làm lại từ đầu
              </UiButton>
            </div>
          </UiCard>
        </div>
      </UiCard>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from "vue";
import CanvasEditor from "@/components/widgets/CanvasEditor.vue";
import {
  UiAlert,
  UiBadge,
  UiButton,
  UiCard,
  UiForm,
  UiFormItem,
  UiInput,
  UiSteps,
  UiTextarea,
  UiToast,
} from "@/components/ui";
import { useDesignerPage } from "@/composables/useDesignerPage";

const {
  WIZARD_STEPS,
  badgeVariant,
  bgUrl,
  canSubmitDesign,
  clearAll,
  confirmDesignImage,
  customerForm,
  exportedPng,
  imageUploadLoading,
  next,
  notice,
  onExported,
  pagedTemplates,
  prev,
  removeToast,
  selectTemplate,
  selectedTemplateId,
  step,
  submitDesign,
  submitLoading,
  toasts,
  uploadedDesignFile,
} = useDesignerPage();

const canvasEditorRef = ref<InstanceType<typeof CanvasEditor> | null>(null);

function removeActiveObject() {
  canvasEditorRef.value?.removeActive();
}

function exportAndGoToConfirm() {
  canvasEditorRef.value?.exportPng();
}
</script>
