<template>
  <section class="space-y-4">
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
      <div class="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_220px_180px_auto]">
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

        <template #cell-status="{ row }">
          <div class="space-y-2">
            <OrderStatusBadge :status="row.status" />
            <UiSelect
              v-model="statusDraft[row.id]"
              :options="statusOptions"
              @update:model-value="updateRowStatus(row.id)"
            />
          </div>
        </template>

        <template #cell-image="{ row }">
          <img
            v-if="row.imageUrl"
            :src="row.imageUrl"
            alt="order"
            class="h-20 w-20 rounded-[var(--ui-radius-md)] border border-[var(--ui-border)] object-cover"
          >
          <UiBadge
            v-else
            label="No image"
            variant="neutral"
          />
        </template>

        <template #cell-actions="{ row }">
          <div class="flex flex-col gap-2">
            <UiButton
              variant="outline"
              @click="removeRow(row.id)"
            >
              Xóa
            </UiButton>
          </div>
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
  </section>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { UiAlert, UiBadge, UiButton, UiCard, UiEmpty, UiInput, UiPagination, UiSelect, UiTable } from '@/components/ui'
import OrderStatusBadge from '@/components/admin/OrderStatusBadge.vue'
import { adminDesignSubmissionService } from '@/services/admin/design-submission.service'
import type { DesignSubmissionRow, DesignSubmissionStatus } from '@/types/admin'

const columns = [
  { key: 'fullName', label: 'Khách hàng' },
  { key: 'address', label: 'Địa chỉ' },
  { key: 'status', label: 'Trạng thái' },
  { key: 'image', label: 'Ảnh' },
  { key: 'actions', label: 'Hành động' },
]

const statusOptions = [
  { label: 'Chờ xác nhận', value: 'pending_confirmation' },
  { label: 'Đã xác nhận', value: 'confirmed' },
  { label: 'Đang xử lý', value: 'in_progress' },
  { label: 'Hoàn thành', value: 'completed' },
  { label: 'Đã hủy', value: 'cancelled' },
]

const orderOptions = [
  { label: 'Mới nhất', value: 'desc' },
  { label: 'Cũ nhất', value: 'asc' },
]

const filters = reactive({
  keyword: '',
  status: '',
  order: 'desc',
})

const items = ref<DesignSubmissionRow[]>([])
const errorMessage = ref('')
const page = ref(1)
const limit = ref(10)
const total = ref(0)
const statusDraft = reactive<Record<string | number, DesignSubmissionStatus>>({})

async function fetchOrders() {
  errorMessage.value = ''
  try {
    const result = await adminDesignSubmissionService.list({
      page: page.value,
      limit: limit.value,
      keyword: filters.keyword || undefined,
      status: (filters.status || undefined) as DesignSubmissionStatus | undefined,
      order: filters.order as 'asc' | 'desc',
      sort: 'createdAt',
    })
    items.value = result.items
    total.value = result.meta.pagination?.total || result.items.length
    result.items.forEach((item) => {
      statusDraft[item.id] = item.status
    })
  } catch (error: unknown) {
    errorMessage.value = (error as Error)?.message || 'Không thể tải danh sách đơn hàng.'
  }
}

async function updateRowStatus(id: string | number) {
  const nextStatus = statusDraft[id]
  if (!nextStatus) return
  try {
    const updated = await adminDesignSubmissionService.updateStatus(id, nextStatus)
    const target = items.value.find((item) => item.id === id)
    if (target) target.status = updated.status
  } catch (error: unknown) {
    errorMessage.value = (error as Error)?.message || 'Không thể cập nhật trạng thái.'
  }
}

async function removeRow(id: string | number) {
  try {
    await adminDesignSubmissionService.remove(id)
    items.value = items.value.filter((item) => item.id !== id)
    total.value = Math.max(0, total.value - 1)
  } catch (error: unknown) {
    errorMessage.value = (error as Error)?.message || 'Không thể xóa đơn hàng.'
  }
}

function onPageChange(nextPage: number) {
  page.value = nextPage
  fetchOrders()
}

onMounted(fetchOrders)
</script>
