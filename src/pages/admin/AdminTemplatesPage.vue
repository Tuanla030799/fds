<template>
  <section class="space-y-4">
    <UiToast
      :items="toasts"
      @remove="removeToast"
    />

    <UiAlert
      v-if="errorMessage"
      variant="error"
    >
      {{ errorMessage }}
    </UiAlert>

    <div class="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.2fr)_420px]">
      <UiCard
        title="Danh sách template ảnh"
        padding="md"
      >
        <div
          class="mb-4 grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_220px_auto]"
        >
          <UiInput
            v-model="filters.keyword"
            placeholder="Tìm template theo tên"
          />
          <UiSelect
            v-model="filters.status"
            :options="statusFilterOptions"
            placeholder="Tất cả trạng thái"
          />
          <UiButton @click="fetchTemplates">
            Tải lại
          </UiButton>
        </div>

        <UiTable
          :columns="columns"
          :rows="items"
          row-key="id"
        >
          <template #cell-name="{ row }">
            <div>
              <div class="font-semibold text-[var(--ui-text)]">
                {{ row.name }}
              </div>
              <div class="mt-1 flex flex-wrap gap-1">
                <UiBadge
                  v-for="tag in row.tags"
                  :key="tag"
                  :label="tag"
                  variant="neutral"
                />
              </div>
            </div>
          </template>

          <template #cell-status="{ row }">
            <UiBadge
              :label="getStatusLabel(row.status)"
              :variant="getStatusVariant(row.status)"
            />
          </template>

          <template #cell-image="{ row }">
            <button
              v-if="row.imageUrl"
              type="button"
              class="block cursor-pointer rounded-[var(--ui-radius-md)] outline-none transition hover:opacity-90 focus:ring-4 focus:ring-[var(--ui-primary-ring)]"
              @click="openImageModal(row)"
            >
              <img
                :src="row.imageUrl"
                alt="template"
                class="h-20 w-20 rounded-[var(--ui-radius-md)] border border-[var(--ui-border)] object-cover"
              >
            </button>
            <UiBadge
              v-else
              label="No image"
              variant="neutral"
            />
          </template>

          <template #cell-actions="{ row }">
            <UiDropdown
              trigger-text="Thao tác"
              placement="right"
              open-on-hover
              :items="getActionItems(row)"
              @select="handleRowAction(row, $event)"
            />
          </template>

          <template #empty>
            <UiEmpty
              title="Chưa có template"
              description="Upload template đầu tiên để client chọn ở step đầu."
            />
          </template>

          <template #footer>
            <UiPagination
              :page="page"
              :total="total"
              :page-size="limit"
              @update:page="onPageChange"
            />
          </template>
        </UiTable>
      </UiCard>

      <UiCard
        title="Upload template mới"
        padding="md"
      >
        <UiForm class="space-y-4">
          <UiFormItem label="Tên template">
            <UiInput
              v-model="form.name"
              placeholder="Ví dụ: Mẫu áo basic trắng"
            />
          </UiFormItem>

          <UiFormItem label="Trạng thái">
            <UiSelect
              v-model="form.status"
              :options="statusFilterOptions"
            />
          </UiFormItem>

          <UiFormItem label="Ghi chú">
            <UiTextarea
              v-model="form.note"
              rows="4"
              placeholder="Mô tả thêm về template"
            />
          </UiFormItem>

          <UiFormItem label="Ảnh template">
            <FileUpload
              v-model="uploadedFile"
              scope="admin"
              accept="image/*"
              title="Ảnh template"
              description="File sẽ được upload trước, template chỉ lưu fileId."
              trigger-text="Chọn ảnh"
              @error="errorMessage = $event"
            />
          </UiFormItem>

          <UiButton
            :loading="submitting"
            block
            @click="createTemplate"
          >
            Upload template
          </UiButton>
        </UiForm>
      </UiCard>
    </div>

    <UiModal
      :open="imageModalOpen"
      title="Chi tiết ảnh"
      :description="selectedImageTitle"
      max-width="xl"
      @close="closeImageModal"
    >
      <img
        v-if="selectedImageUrl"
        :src="selectedImageUrl"
        alt="template detail"
        class="block max-h-[75vh] w-full rounded-[var(--ui-radius-md)] border border-[var(--ui-border)] object-contain"
      >
    </UiModal>

    <UiModal
      :open="deleteModalOpen"
      title="Xác nhận xóa"
      max-width="md"
      @close="closeDeleteModal"
    >
      <div class="space-y-4">
        <p class="text-sm leading-6 text-[var(--ui-text-muted)]">
          Bạn có chắc chắn muốn xóa mẫu ảnh
          <span class="font-semibold text-[var(--ui-text)]">
            {{ deletingTemplate?.name }}
          </span>
          không?
        </p>

        <div class="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <UiButton
            variant="outline"
            @click="closeDeleteModal"
          >
            Hủy
          </UiButton>
          <UiButton
            variant="danger"
            @click="confirmDeleteTemplate"
          >
            Xóa
          </UiButton>
        </div>
      </div>
    </UiModal>
  </section>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import FileUpload from "@/components/common/FileUpload.vue";
import {
  UiAlert,
  UiBadge,
  UiButton,
  UiCard,
  UiDropdown,
  UiEmpty,
  UiForm,
  UiFormItem,
  UiInput,
  UiModal,
  UiPagination,
  UiSelect,
  UiTable,
  UiTextarea,
  UiToast,
} from "@/components/ui";
import { useToast } from "@/composables/useToast";
import { adminTemplateService } from "@/services/admin/template.service";
import type { UploadedFile } from "@/services/file.service";
import type { AdminTemplateRow } from "@/types/admin";
import type { TemplateStatus } from "@/types/designer";

const columns = [
  { key: "name", label: "Template" },
  { key: "status", label: "Trạng thái" },
  { key: "image", label: "Ảnh" },
  { key: "actions", label: "Thao tác" },
];

const statusFilterOptions = [
  { label: "Đang hoạt động", value: "ACTIVE" },
  { label: "Ngừng hoạt động", value: "INACTIVE" },
];

const actionStatusOptions = [
  { label: "Đang hoạt động", value: "ACTIVE" },
  { label: "Ngừng Hoạt Động", value: "INACTIVE" },
];

const filters = reactive({
  keyword: "",
  status: "",
});

const form = reactive({
  name: "",
  status: "ACTIVE" as TemplateStatus,
  note: "",
});

const { toasts, push: pushToast, remove: removeToast } = useToast();
const items = ref<AdminTemplateRow[]>([]);
const uploadedFile = ref<UploadedFile | null>(null);
const errorMessage = ref("");
const submitting = ref(false);
const page = ref(1);
const limit = ref(10);
const total = ref(0);
const imageModalOpen = ref(false);
const selectedImageUrl = ref("");
const selectedImageTitle = ref("");
const deleteModalOpen = ref(false);
const deletingTemplate = ref<AdminTemplateRow | null>(null);

async function fetchTemplates() {
  errorMessage.value = "";
  try {
    const result = await adminTemplateService.list({
      page: page.value,
      limit: limit.value,
      keyword: filters.keyword || undefined,
      status: (filters.status || undefined) as TemplateStatus | undefined,
    });
    items.value = result.items;
    total.value = result.meta.pagination?.total || result.items.length;
  } catch (error: unknown) {
    errorMessage.value = (error as Error)?.message || "Không thể tải template.";
  }
}

async function createTemplate() {
  if (!form.name.trim() || !uploadedFile.value?.fileId) {
    errorMessage.value = "Vui lòng nhập tên template và chọn ảnh.";
    return;
  }

  submitting.value = true;
  errorMessage.value = "";

  try {
    await adminTemplateService.create({
      name: form.name.trim(),
      status: form.status,
      tags: [],
      note: form.note.trim(),
      fileId: uploadedFile.value.fileId,
    });
    form.name = "";
    form.status = "ACTIVE";
    form.note = "";
    uploadedFile.value = null;
    await fetchTemplates();
    pushToast("Template đã được tạo thành công.", "success", "Tạo thành công");
  } catch (error: unknown) {
    const message = (error as Error)?.message || "Không thể tạo template.";
    errorMessage.value = message;
    pushToast(message, "error", "Tạo thất bại");
  } finally {
    submitting.value = false;
  }
}

function getStatusLabel(status: TemplateStatus) {
  return (
    statusFilterOptions.find((option) => option.value === status)?.label ||
    status
  );
}

function getStatusVariant(status: TemplateStatus) {
  if (status === "ACTIVE") return "success";
  return "neutral";
}

function getActionItems(row: AdminTemplateRow) {
  return [
    ...actionStatusOptions
      .filter((option) => option.value !== row.status)
      .map((option) => ({
        key: `status:${option.value}`,
        label: option.label,
      })),
    { key: "delete", label: "Xóa" },
  ];
}

function openImageModal(row: AdminTemplateRow) {
  selectedImageUrl.value = row.imageUrl || "";
  selectedImageTitle.value = row.name;
  imageModalOpen.value = true;
}

function closeImageModal() {
  imageModalOpen.value = false;
  selectedImageUrl.value = "";
  selectedImageTitle.value = "";
}

function openDeleteModal(row: AdminTemplateRow) {
  deletingTemplate.value = row;
  deleteModalOpen.value = true;
}

function closeDeleteModal() {
  deleteModalOpen.value = false;
  deletingTemplate.value = null;
}

async function updateTemplateStatus(id: string | number, status: TemplateStatus) {
  try {
    await adminTemplateService.updateStatus(id, status);
    await fetchTemplates();
    pushToast(
      "Trạng thái template đã được cập nhật.",
      "success",
      "Cập nhật thành công",
    );
  } catch (error: unknown) {
    const message =
      (error as Error)?.message || "Không thể cập nhật trạng thái template.";
    errorMessage.value = message;
    pushToast(message, "error", "Cập nhật thất bại");
  }
}

async function handleRowAction(row: AdminTemplateRow, key: string) {
  if (key === "delete") {
    openDeleteModal(row);
    return;
  }

  if (key.startsWith("status:")) {
    await updateTemplateStatus(
      row.id,
      key.replace("status:", "") as TemplateStatus,
    );
  }
}

async function confirmDeleteTemplate() {
  if (!deletingTemplate.value) return;
  await removeTemplate(deletingTemplate.value.id);
  closeDeleteModal();
}

async function removeTemplate(id: string | number) {
  try {
    await adminTemplateService.remove(id);
    await fetchTemplates();
    pushToast("Template đã được xóa.", "success", "Xóa thành công");
  } catch (error: unknown) {
    const message = (error as Error)?.message || "Không thể xóa template.";
    errorMessage.value = message;
    pushToast(message, "error", "Xóa thất bại");
  }
}

function onPageChange(nextPage: number) {
  page.value = nextPage;
  fetchTemplates();
}

onMounted(fetchTemplates);
</script>
