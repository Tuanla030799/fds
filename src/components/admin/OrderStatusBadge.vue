<template>
  <UiBadge
    :label="statusLabel"
    :variant="statusVariant"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { UiBadge } from '@/components/ui'
import type { DesignSubmissionStatus } from '@/types/admin'

const props = defineProps<{
  status: DesignSubmissionStatus
}>()

const statusLabel = computed(() => {
  const map: Record<DesignSubmissionStatus, string> = {
    pending_confirmation: 'Chờ xác nhận',
    confirmed: 'Đã xác nhận',
    in_progress: 'Đang xử lý',
    completed: 'Hoàn thành',
    cancelled: 'Đã hủy',
  }
  return map[props.status]
})

const statusVariant = computed(() => {
  const map: Record<DesignSubmissionStatus, 'warning' | 'success' | 'primary' | 'neutral' | 'danger'> = {
    pending_confirmation: 'warning',
    confirmed: 'primary',
    in_progress: 'primary',
    completed: 'success',
    cancelled: 'danger',
  }
  return map[props.status]
})
</script>
