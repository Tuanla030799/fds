<template>
  <div class="overflow-hidden rounded-[var(--ui-radius-lg)] border border-[var(--ui-border)]">
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-[var(--ui-border)] bg-[var(--ui-surface)]">
        <thead class="bg-[var(--ui-surface-muted)]">
          <tr>
            <th
              v-for="column in columns"
              :key="column.key"
              class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--ui-text-soft)]"
            >
              {{ column.label }}
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-[var(--ui-border)]">
          <tr v-if="!rows.length">
            <td
              :colspan="columns.length"
              class="px-4 py-6"
            >
              <slot name="empty">
                <div class="text-sm text-[var(--ui-text-muted)]">
                  Không có dữ liệu.
                </div>
              </slot>
            </td>
          </tr>
          <tr
            v-for="(row, rowIndex) in rows"
            :key="rowKey ? row[rowKey] : rowIndex"
            class="align-top hover:bg-[var(--ui-surface-muted)]/70"
          >
            <td
              v-for="column in columns"
              :key="column.key"
              class="px-4 py-3 text-sm text-[var(--ui-text-muted)]"
            >
              <slot
                :name="`cell-${column.key}`"
                :row="row"
                :value="row[column.key]"
                :index="rowIndex"
              >
                <span class="text-[var(--ui-text)]">{{ row[column.key] }}</span>
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div
      v-if="$slots.footer"
      class="border-t border-[var(--ui-border)] bg-[var(--ui-surface)] px-4 py-3"
    >
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts" generic="T extends Record<string, any>">
import type { TableColumn } from '@/types/designer';

defineProps<{
  columns: TableColumn[]
  rows: T[]
  rowKey?: keyof T & string
}>()
</script>
