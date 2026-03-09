<template>
  <RouterView />
  <GlobalLoading />
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import GlobalLoading from '@/components/common/GlobalLoading.vue'
</script>
