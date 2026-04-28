<template>
  <div class="space-y-3">
    <UiUpload
      :title="title"
      :description="description"
      :accept="accept"
      :disabled="disabled || uploading"
      :trigger-text="triggerText"
      @change="onFileChange"
    >
      <span v-if="uploading">Đang upload...</span>
      <span v-else>{{ triggerText }}</span>

      <template #extra>
        <UiButton
          v-if="modelValue"
          variant="outline"
          size="sm"
          :disabled="disabled || uploading"
          @click="clearFile"
        >
          Xóa file
        </UiButton>
      </template>
    </UiUpload>

    <UiAlert
      v-if="localError"
      variant="error"
    >
      {{ localError }}
    </UiAlert>

    <div
      v-if="modelValue"
      class="rounded-[var(--ui-radius-md)] border border-[var(--ui-border)] bg-[var(--ui-surface)] p-3"
    >
      <div class="flex gap-3">
        <img
          v-if="previewUrl"
          :src="previewUrl"
          alt="uploaded file"
          class="h-20 w-20 shrink-0 rounded-[var(--ui-radius-sm)] border border-[var(--ui-border)] object-cover"
        >
        <div class="min-w-0 flex-1 text-sm">
          <div class="font-semibold text-[var(--ui-text)]">
            File ID: {{ modelValue.fileId }}
          </div>
          <div
            v-if="modelValue.path"
            class="mt-1 truncate text-[var(--ui-text-soft)]"
          >
            {{ modelValue.path }}
          </div>
          <a
            v-if="modelValue.url"
            class="mt-2 inline-block text-[var(--ui-primary)] hover:underline"
            :href="modelValue.url"
            target="_blank"
            rel="noreferrer"
          >
            Xem file
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { UiAlert, UiButton, UiUpload } from '@/components/ui'
import { fileService, type FileUploadScope, type UploadedFile } from '@/services/file.service'

const props = withDefaults(defineProps<{
  modelValue?: UploadedFile | null
  scope?: FileUploadScope
  title?: string
  description?: string
  accept?: string
  maxSizeMb?: number
  disabled?: boolean
  triggerText?: string
}>(), {
  modelValue: null,
  scope: 'client',
  title: 'Upload file',
  description: '',
  accept: '*/*',
  maxSizeMb: 10,
  disabled: false,
  triggerText: 'Chọn file',
})

const emit = defineEmits<{
  'update:modelValue': [value: UploadedFile | null]
  uploaded: [value: UploadedFile]
  error: [message: string]
}>()

const uploading = ref(false)
const localError = ref('')

const previewUrl = computed(() => {
  if (!props.modelValue?.url || !props.accept.includes('image')) {
    return ''
  }
  return props.modelValue.url
})

async function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''

  if (!file) {
    return
  }

  if (props.maxSizeMb > 0 && file.size > props.maxSizeMb * 1024 * 1024) {
    const message = `File không được vượt quá ${props.maxSizeMb}MB.`
    localError.value = message
    emit('error', message)
    return
  }

  uploading.value = true
  localError.value = ''

  try {
    const uploadedFile = await fileService.upload(file, { scope: props.scope })
    if (!uploadedFile.fileId) {
      throw new Error('API upload không trả về fileId.')
    }
    emit('update:modelValue', uploadedFile)
    emit('uploaded', uploadedFile)
  } catch (error: unknown) {
    const message = (error as Error)?.message || 'Không thể upload file.'
    localError.value = message
    emit('error', message)
  } finally {
    uploading.value = false
  }
}

function clearFile() {
  localError.value = ''
  emit('update:modelValue', null)
}
</script>
