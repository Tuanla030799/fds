<template>
  <section class="space-y-4">
    <UiAlert
      v-if="errorMessage"
      variant="error"
    >
      {{ errorMessage }}
    </UiAlert>

    <div class="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.2fr)_420px]">
      <UiCard
        title="Danh sách preset ảnh"
        padding="md"
      >
        <div class="mb-4 grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_220px_auto]">
          <UiInput
            v-model="filters.keyword"
            placeholder="Tìm preset theo tên"
          />
          <UiSelect
            v-model="filters.status"
            :options="statusFilterOptions"
            placeholder="Tất cả trạng thái"
          />
          <UiButton @click="fetchPresets">
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
              :label="row.status"
              :variant="row.status === 'active' ? 'success' : row.status === 'draft' ? 'warning' : 'neutral'"
            />
          </template>

          <template #cell-image="{ row }">
            <img
              v-if="row.imageUrl"
              :src="row.imageUrl"
              alt="preset"
              class="h-20 w-20 rounded-[var(--ui-radius-md)] border border-[var(--ui-border)] object-cover"
            >
            <UiBadge
              v-else
              label="No image"
              variant="neutral"
            />
          </template>

          <template #cell-actions="{ row }">
            <UiButton
              variant="outline"
              @click="removePreset(row.id)"
            >
              Xóa
            </UiButton>
          </template>

          <template #empty>
            <UiEmpty
              title="Chưa có preset"
              description="Upload preset đầu tiên để client chọn ở step đầu."
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
        title="Upload preset mới"
        padding="md"
      >
        <UiForm class="space-y-4">
          <UiFormItem label="Tên preset">
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

          <UiFormItem label="Tags (phân tách bằng dấu phẩy)">
            <UiInput
              v-model="form.tagsText"
              placeholder="áo, hoodie, basic"
            />
          </UiFormItem>

          <UiFormItem label="Ghi chú">
            <UiTextarea
              v-model="form.note"
              rows="4"
              placeholder="Mô tả thêm về preset"
            />
          </UiFormItem>

          <UiFormItem label="Ảnh preset">
            <UiInput
              type="file"
              accept="image/*"
              @change="onFileChange"
            />
          </UiFormItem>

          <UiButton
            :loading="submitting"
            block
            @click="createPreset"
          >
            Upload preset
          </UiButton>
        </UiForm>
      </UiCard>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { UiAlert, UiBadge, UiButton, UiCard, UiEmpty, UiForm, UiFormItem, UiInput, UiPagination, UiSelect, UiTable, UiTextarea } from '@/components/ui'
import { adminPresetService } from '@/services/admin/preset.service'
import type { AdminPresetRow } from '@/types/admin'
import type { PresetStatus } from '@/types/designer'

const columns = [
  { key: 'name', label: 'Preset' },
  { key: 'status', label: 'Trạng thái' },
  { key: 'image', label: 'Ảnh' },
  { key: 'actions', label: 'Hành động' },
]

const statusFilterOptions = [
  { label: 'Active', value: 'active' },
  { label: 'Draft', value: 'draft' },
  { label: 'Archived', value: 'archived' },
]

const filters = reactive({
  keyword: '',
  status: '',
})

const form = reactive({
  name: '',
  status: 'active' as PresetStatus,
  tagsText: '',
  note: '',
})

const items = ref<AdminPresetRow[]>([])
const selectedFile = ref<File | null>(null)
const errorMessage = ref('')
const submitting = ref(false)
const page = ref(1)
const limit = ref(10)
const total = ref(0)

function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  selectedFile.value = input.files?.[0] || null
}

async function fetchPresets() {
  errorMessage.value = ''
  try {
    const result = await adminPresetService.list({
      page: page.value,
      limit: limit.value,
      keyword: filters.keyword || undefined,
      status: (filters.status || undefined) as PresetStatus | undefined,
    })
    items.value = result.items
    total.value = result.meta.pagination?.total || result.items.length
  } catch (error: unknown) {
    errorMessage.value = (error as Error)?.message || 'Không thể tải preset.'
  }
}

async function createPreset() {
  if (!form.name.trim() || !selectedFile.value) {
    errorMessage.value = 'Vui lòng nhập tên preset và chọn ảnh.'
    return
  }

  submitting.value = true
  errorMessage.value = ''

  try {
    const created = await adminPresetService.create({
      name: form.name.trim(),
      status: form.status,
      tags: form.tagsText.split(',').map((item) => item.trim()).filter(Boolean),
      note: form.note.trim(),
      imageFile: selectedFile.value,
    })
    items.value = [created, ...items.value]
    total.value += 1
    form.name = ''
    form.status = 'active'
    form.tagsText = ''
    form.note = ''
    selectedFile.value = null
  } catch (error: unknown) {
    errorMessage.value = (error as Error)?.message || 'Không thể tạo preset.'
  } finally {
    submitting.value = false
  }
}

async function removePreset(id: string | number) {
  try {
    await adminPresetService.remove(id)
    items.value = items.value.filter((item) => item.id !== id)
    total.value = Math.max(0, total.value - 1)
  } catch (error: unknown) {
    errorMessage.value = (error as Error)?.message || 'Không thể xóa preset.'
  }
}

function onPageChange(nextPage: number) {
  page.value = nextPage
  fetchPresets()
}

onMounted(fetchPresets)
</script>
