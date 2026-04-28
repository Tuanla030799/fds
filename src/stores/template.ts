import { computed, ref } from "vue";
import { defineStore } from "pinia";
import { templateService } from "@/services/template.service";
import type { TemplateRow } from "@/types/designer";
import { ApiError } from "@/types/http";

export const useTemplateStore = defineStore("template", () => {
  const items = ref<TemplateRow[]>([]);
  const loading = ref(false);
  const loaded = ref(false);
  const errorMessage = ref("");

  const total = computed(() => items.value.length);
  const hasData = computed(() => items.value.length > 0);

  async function fetchTemplates() {
    loading.value = true;
    errorMessage.value = "";

    try {
      items.value = await templateService.list();
      loaded.value = true;
    } catch (error) {
      errorMessage.value =
        error instanceof ApiError
          ? error.message
          : "Không thể tải danh sách template.";
      throw error;
    } finally {
      loading.value = false;
    }
  }

  function setTemplates(next: TemplateRow[]) {
    items.value = next;
    loaded.value = true;
  }

  return {
    errorMessage,
    fetchTemplates,
    hasData,
    items,
    loaded,
    loading,
    setTemplates,
    total,
  };
});
