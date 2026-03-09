<template>
  <section class="ui-page flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
    <div class="w-full max-w-md">
      <UiCard
        title="Đăng nhập admin"
        description="Đăng nhập để vào khu vực quản trị đơn hàng và preset."
        padding="lg"
      >
        <UiAlert
          v-if="errorMessage"
          variant="error"
          class="mb-4"
        >
          {{ errorMessage }}
        </UiAlert>

        <UiForm
          class="space-y-4"
          @submit.prevent="handleLogin"
        >
          <UiFormItem label="Email">
            <UiInput
              v-model="form.email"
              type="email"
              placeholder="admin@example.com"
            />
          </UiFormItem>

          <UiFormItem label="Mật khẩu">
            <UiInput
              v-model="form.password"
              type="password"
              placeholder="Nhập mật khẩu"
            />
          </UiFormItem>

          <UiButton
            :loading="submitting"
            block
            @click="handleLogin"
          >
            Đăng nhập
          </UiButton>
        </UiForm>
      </UiCard>
    </div>
  </section>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { UiAlert, UiButton, UiCard, UiForm, UiFormItem, UiInput } from '@/components/ui'
import { adminAuthService } from '@/services/admin/auth.service'
import { useAppStore } from '@/stores/app'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()

const form = reactive({
  email: '',
  password: '',
})

const submitting = ref(false)
const errorMessage = ref('')

async function handleLogin() {
  if (!form.email.trim() || !form.password.trim()) {
    errorMessage.value = 'Vui lòng nhập đầy đủ email và mật khẩu.'
    return
  }

  submitting.value = true
  errorMessage.value = ''

  try {
    const payload = await adminAuthService.login({
      email: form.email.trim(),
      password: form.password,
    })
    appStore.setAuthSession(payload)
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/admin/dashboard'
    router.replace(redirect)
  } catch (error: unknown) {
    errorMessage.value = (error as Error)?.message || 'Đăng nhập thất bại.'
  } finally {
    submitting.value = false
  }
}
</script>
