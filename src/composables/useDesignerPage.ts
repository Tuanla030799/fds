import { computed, reactive, ref } from "vue";
import {
  MENU_ITEMS,
  PRESET_OPTIONS,
  PRESET_ROWS,
  TABLE_COLUMNS,
  WIZARD_STEPS,
} from "@/data/designer";
import { useObjectUrl } from "@/composables/useObjectUrl";
import { useTheme } from "@/composables/useTheme";
import { useTimedNotice } from "@/composables/useTimedNotice";
import { useToast } from "@/composables/useToast";
import { useAppStore } from "@/stores/app";
import { usePresetStore } from "@/stores/preset";
import type { PresetRow, PresetStatus, WizardStep } from "@/types/designer";

const PAGE_SIZE = 4;

export function useDesignerPage() {
  const appStore = useAppStore();
  appStore.hydrate();

  const presetStore = usePresetStore();
  if (!presetStore.loaded) {
    presetStore.setPresets(PRESET_ROWS);
  }

  const { themeModel, themeOptions } = useTheme();
  const { toasts, push: pushToast, remove: removeToast } = useToast();
  const { notice, setNotice, clearNotice } = useTimedNotice<
    "success" | "error"
  >();
  const { objectUrl: bgUrl, setFile, revoke } = useObjectUrl();

  const step = ref<WizardStep>(0);
  const exportedPng = ref("");
  const openDrawer = ref(false);
  const drawerPresetName = ref("");
  const drawerNote = ref("");
  const samplePreset = ref<"flat" | "puff" | "satin">("flat");
  const currentPage = ref(1);
  const sampleFlags = reactive({
    metallic: false,
    outline: true,
    autoCenter: true,
  });

  const accessTokenModel = computed({
    get: () => appStore.accessToken,
    set: (value: string) => {
      appStore.setAccessToken(value);
    },
  });

  const presetRows = computed(() => presetStore.items);
  const apiLoading = computed(() => appStore.isLoading || presetStore.loading);

  const pagedPresets = computed(() => {
    const start = (currentPage.value - 1) * PAGE_SIZE;
    return presetRows.value.slice(start, start + PAGE_SIZE);
  });

  function next() {
    step.value = Math.min(2, step.value + 1) as WizardStep;
  }

  function prev() {
    step.value = Math.max(0, step.value - 1) as WizardStep;
  }

  function resetSampleFlags() {
    samplePreset.value = "flat";
    sampleFlags.metallic = false;
    sampleFlags.outline = true;
    sampleFlags.autoCenter = true;
  }

  function clearAll() {
    revoke();
    step.value = 0;
    exportedPng.value = "";
    clearNotice();
    pushToast("Đã reset toàn bộ màn hình demo.", "info", "Đặt lại");
  }

  function handleSaveTemplate() {
    // Đây chỉ là demo, nên chức năng lưu preset sẽ mở drawer để nhập tên và note,
    // sau đó hiển thị toast thông báo đã lưu thành công. Thực tế có thể gọi API.
  }

  function onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    setFile(file);
    exportedPng.value = "";
    step.value = 0;
    setNotice("success", "Đã tải ảnh nền.");
    pushToast("Ảnh nền đã được nạp vào editor.", "success", "Upload xong");
    input.value = "";
  }

  function onExported(payload: { pngDataUrl: string }) {
    exportedPng.value = payload.pngDataUrl;
    setNotice("success", "Đã export PNG thành công.");
    pushToast(
      "PNG đã sẵn sàng ở bước Kết quả.",
      "success",
      "Export thành công",
    );
  }

  function onMenuSelect(key: string) {
    if (key === "reset") resetSampleFlags();
    pushToast(`Bạn vừa chọn action: ${key}`, "info", "Dropdown");
  }

  function onTagClose() {
    pushToast("Đã đóng tag demo.", "info", "Tag");
  }

  function previewPreset(row: PresetRow) {
    pushToast(`Preview preset: ${row.name}`, "info", "Preview");
  }

  function duplicatePreset(row: PresetRow) {
    pushToast(`Đã clone preset: ${row.name}`, "success", "Clone");
  }

  function saveDrawerPreset() {
    openDrawer.value = false;
    pushToast(
      `Đã lưu preset demo: ${drawerPresetName.value || "Untitled"}`,
      "success",
      "Preset saved",
    );
  }

  async function fetchPresetList() {
    try {
      await presetStore.fetchPresets();
      pushToast("Đã đồng bộ preset từ API.", "success", "API fetch");
    } catch {
      pushToast(
        presetStore.errorMessage || "Gọi API thất bại.",
        "error",
        "API error",
      );
    }
  }

  function badgeVariant(status: PresetStatus) {
    if (status === "active") return "success";
    if (status === "draft") return "warning";
    return "neutral";
  }

  return {
    MENU_ITEMS,
    PAGE_SIZE,
    PRESET_OPTIONS,
    TABLE_COLUMNS,
    WIZARD_STEPS,
    accessTokenModel,
    apiLoading,
    badgeVariant,
    bgUrl,
    clearAll,
    currentPage,
    drawerNote,
    drawerPresetName,
    duplicatePreset,
    exportedPng,
    fetchPresetList,
    next,
    notice,
    onExported,
    onFileChange,
    onMenuSelect,
    onTagClose,
    openDrawer,
    pagedPresets,
    presetRows,
    previewPreset,
    prev,
    pushToast,
    removeToast,
    sampleFlags,
    samplePreset,
    saveDrawerPreset,
    step,
    themeModel,
    themeOptions,
    toasts,
    handleSaveTemplate,
  };
}
