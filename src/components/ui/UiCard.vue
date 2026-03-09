<template>
  <section :class="wrapperClass">
    <header
      v-if="hasHeader"
      :class="headerClasses"
    >
      <slot name="header">
        <div>
          <h3
            v-if="title"
            class="text-sm font-semibold text-[var(--ui-text)] sm:text-base"
          >
            {{ title }}
          </h3>
          <p
            v-if="description"
            class="mt-1 text-sm leading-6 text-[var(--ui-text-soft)]"
          >
            {{ description }}
          </p>
        </div>
      </slot>
      <slot name="extra" />
    </header>
    <div :class="contentClasses">
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue'
import { cn } from '@/utils/cn'

const props = withDefaults(
  defineProps<{
    title?: string
    description?: string
    bordered?: boolean
    shadow?: boolean
    padding?: 'none' | 'sm' | 'md' | 'lg'
    bodyClass?: string
  }>(),
  {
    title: '',
    description: '',
    bordered: true,
    shadow: true,
    padding: 'md',
    bodyClass: '',
  },
)

const slots = useSlots()
const hasHeader = computed(() => Boolean(props.title || props.description || slots.header || slots.extra))
const wrapperClass = computed(() => cn('overflow-hidden rounded-[var(--ui-radius-lg)] bg-[var(--ui-surface)]', props.bordered && 'border border-[var(--ui-border)]', props.shadow && 'shadow-[var(--ui-shadow)]'))
const headerClasses = computed(() => 'flex items-start justify-between gap-3 border-b border-[var(--ui-border)] px-4 py-3 sm:px-5')
const contentClasses = computed(() => {
  const paddings = {
    none: '',
    sm: 'p-3',
    md: 'p-4 sm:p-5',
    lg: 'p-5 sm:p-6',
  }
  return cn(paddings[props.padding], props.bodyClass)
})
</script>
