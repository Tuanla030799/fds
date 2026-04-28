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

    <UiCard
      title="Bộ lọc đơn hàng"
      padding="md"
    >
      <div
        class="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_220px_180px_auto]"
      >
        <UiInput
          v-model="filters.keyword"
          placeholder="Tìm theo tên, số điện thoại"
        />
        <UiSelect
          v-model="filters.status"
          :options="statusOptions"
          placeholder="Tất cả trạng thái"
        />
        <UiSelect
          v-model="filters.order"
          :options="orderOptions"
          placeholder="Thứ tự"
        />
        <UiButton @click="fetchOrders">
          Tải lại
        </UiButton>
      </div>
    </UiCard>

    <UiCard
      title="Danh sách đơn hàng"
      padding="md"
    >
      <UiTable
        :columns="columns"
        :rows="items"
        row-key="id"
      >
        <template #cell-fullName="{ row }">
          <div>
            <div class="font-semibold text-[var(--ui-text)]">
              {{ row.fullName }}
            </div>
            <div class="text-xs text-[var(--ui-text-soft)]">
              {{ row.phone }}
            </div>
          </div>
        </template>

        <template #cell-address="{ row }">
          <div class="max-w-[280px] whitespace-pre-line text-[var(--ui-text)]">
            {{ row.address }}
          </div>
        </template>

        <template #cell-note="{ row }">
          <div
            class="max-w-[260px] whitespace-pre-line text-[var(--ui-text-muted)]"
          >
            {{ row.note || "—" }}
          </div>
        </template>

        <template #cell-status="{ row }">
          <OrderStatusBadge :status="row.status" />
        </template>

        <template #cell-image="{ row }">
          <button
            v-if="row.imageUrl"
            type="button"
            class="block rounded-[var(--ui-radius-md)] outline-none transition hover:opacity-90 focus:ring-4 focus:ring-[var(--ui-primary-ring)] cursor-pointer"
            @click="openImageModal(row)"
          >
            <img
              :src="row.imageUrl"
              alt="order"
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
            title="Chưa có đơn hàng"
            description="Chưa có dữ liệu phù hợp với bộ lọc hiện tại."
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
        alt="order detail"
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
          Bạn có chắc chắn muốn xóa đơn hàng của
          <span class="font-semibold text-[var(--ui-text)]">
            {{ deletingOrder?.fullName }}
          </span>
          -
          <span class="font-semibold text-[var(--ui-text)]">
            {{ deletingOrder?.phone }}
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
            @click="confirmDeleteOrder"
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
import {
  UiAlert,
  UiBadge,
  UiButton,
  UiCard,
  UiDropdown,
  UiEmpty,
  UiInput,
  UiModal,
  UiPagination,
  UiSelect,
  UiTable,
  UiToast,
} from "@/components/ui";
import OrderStatusBadge from "@/components/admin/OrderStatusBadge.vue";
import { useToast } from "@/composables/useToast";
import { adminDesignSubmissionService } from "@/services/admin/design-submission.service";
import type {
  DesignSubmissionRow,
  DesignSubmissionStatus,
} from "@/types/admin";

const columns = [
  { key: "fullName", label: "Khách hàng" },
  { key: "address", label: "Địa chỉ" },
  { key: "note", label: "Ghi chú" },
  { key: "status", label: "Trạng thái" },
  { key: "image", label: "Ảnh" },
  { key: "actions", label: "Hành động" },
];

const statusOptions = [
  { label: "Chờ xác nhận", value: "pending_confirmation" },
  { label: "Đã xác nhận", value: "confirmed" },
  { label: "Đang xử lý", value: "in_progress" },
  { label: "Hoàn thành", value: "completed" },
  { label: "Đã hủy", value: "cancelled" },
];

const actionStatusOptions = [
  { label: "Xác nhận", value: "confirmed" },
  { label: "Đang xử lý", value: "in_progress" },
  { label: "Hoàn thành", value: "completed" },
  { label: "Hủy", value: "cancelled" },
];

const orderOptions = [
  { label: "Mới nhất", value: "desc" },
  { label: "Cũ nhất", value: "asc" },
];

const filters = reactive({
  keyword: "",
  status: "",
  order: "desc",
});

const { toasts, push: pushToast, remove: removeToast } = useToast();
const items = ref<DesignSubmissionRow[]>([]);
const errorMessage = ref("");
const page = ref(1);
const limit = ref(10);
const total = ref(0);
const imageModalOpen = ref(false);
const selectedImageUrl = ref("");
const selectedImageTitle = ref("");
const deleteModalOpen = ref(false);
const deletingOrder = ref<DesignSubmissionRow | null>(null);

async function fetchOrders() {
  errorMessage.value = "";
  try {
    const result = await adminDesignSubmissionService.list({
      page: page.value,
      limit: limit.value,
      keyword: filters.keyword || undefined,
      status: (filters.status || undefined) as
        | DesignSubmissionStatus
        | undefined,
      order: filters.order as "asc" | "desc",
      sort: "createdAt",
    });
    items.value = result.items;
    total.value = result.meta.pagination?.total || result.items.length;
  } catch (error: unknown) {
    errorMessage.value =
      (error as Error)?.message || "Không thể tải danh sách đơn hàng.";
  }
}

function getActionItems(row: DesignSubmissionRow) {
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

function openImageModal(row: DesignSubmissionRow) {
  selectedImageUrl.value = row.imageUrl;
  selectedImageTitle.value = row.fullName;
  imageModalOpen.value = true;
}

function closeImageModal() {
  imageModalOpen.value = false;
  selectedImageUrl.value = "";
  selectedImageTitle.value = "";
}

function openDeleteModal(row: DesignSubmissionRow) {
  deletingOrder.value = row;
  deleteModalOpen.value = true;
}

function closeDeleteModal() {
  deleteModalOpen.value = false;
  deletingOrder.value = null;
}

async function updateRowStatus(
  id: string | number,
  nextStatus: DesignSubmissionStatus,
) {
  try {
    await adminDesignSubmissionService.updateStatus(id, nextStatus);
    await fetchOrders();
    pushToast(
      "Trạng thái đơn hàng đã được cập nhật.",
      "success",
      "Cập nhật thành công",
    );
  } catch (error: unknown) {
    const message =
      (error as Error)?.message || "Không thể cập nhật trạng thái.";
    errorMessage.value = message;
    pushToast(message, "error", "Cập nhật thất bại");
  }
}

async function handleRowAction(row: DesignSubmissionRow, key: string) {
  if (key === "delete") {
    openDeleteModal(row);
    return;
  }

  if (key.startsWith("status:")) {
    await updateRowStatus(
      row.id,
      key.replace("status:", "") as DesignSubmissionStatus,
    );
  }
}

async function confirmDeleteOrder() {
  if (!deletingOrder.value) return;
  await removeRow(deletingOrder.value.id);
  closeDeleteModal();
}

async function removeRow(id: string | number) {
  try {
    await adminDesignSubmissionService.remove(id);
    await fetchOrders();
    pushToast("Đơn hàng đã được xóa.", "success", "Xóa thành công");
  } catch (error: unknown) {
    const message = (error as Error)?.message || "Không thể xóa đơn hàng.";
    errorMessage.value = message;
    pushToast(message, "error", "Xóa thất bại");
  }
}

function onPageChange(nextPage: number) {
  page.value = nextPage;
  fetchOrders();
}

onMounted(fetchOrders);
</script>
