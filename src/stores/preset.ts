import { computed, ref } from "vue";
import { defineStore } from "pinia";
import { presetService } from "@/services/preset.service";
import type { PresetRow } from "@/types/designer";
import { ApiError } from "@/types/http";

export const usePresetStore = defineStore("preset", () => {
  const items = ref<PresetRow[]>([]);
  const loading = ref(false);
  const loaded = ref(false);
  const errorMessage = ref("");

  const total = computed(() => items.value.length);
  const hasData = computed(() => items.value.length > 0);

  async function fetchPresets() {
    loading.value = true;
    errorMessage.value = "";

    try {
      items.value = await presetService.list();
      loaded.value = true;
    } catch (error) {
      errorMessage.value =
        error instanceof ApiError
          ? error.message
          : "Không thể tải danh sách preset.";
      throw error;
    } finally {
      loading.value = false;
    }
  }

  function setPresets(next: PresetRow[]) {
    items.value = next;
    loaded.value = true;
  }

  return {
    errorMessage,
    fetchPresets,
    hasData,
    items,
    loaded,
    loading,
    setPresets,
    total,
  };
});
