import { computed, reactive, ref, onMounted } from "vue";
import {
  MENU_ITEMS,
  PRESET_OPTIONS,
  PRESET_ROWS,
  TABLE_COLUMNS,
  WIZARD_STEPS,
} from "@/data/designer";
import { useTheme } from "@/composables/useTheme";
import { useTimedNotice } from "@/composables/useTimedNotice";
import { useToast } from "@/composables/useToast";
import { useAppStore } from "@/stores/app";
import { usePresetStore } from "@/stores/preset";
import { designSubmissionService } from "@/services/client";
import type { PresetRow, PresetStatus, WizardStep } from "@/types/designer";

const PAGE_SIZE = 8;

function dataUrlToFile(dataUrl: string, filename: string) {
  const [meta, base64] = dataUrl.split(",");
  if (!meta || !base64) {
    throw new Error("Invalid data URL format.");
  }
  const mimeMatch = meta.match(/data:(.*?);base64/);
  const mimeType = mimeMatch?.[1] || "image/png";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }

  return new File([bytes], filename, { type: mimeType });
}

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

  const step = ref<WizardStep>(0);
  const exportedPng = ref("");
  const submitLoading = ref(false);
  const bgUrl = ref("");
  const selectedPresetId = ref<string | number | null>(null);

  const openDrawer = ref(false);
  const drawerPresetName = ref("");
  const drawerNote = ref("");
  const samplePreset = ref<"flat" | "puff" | "satin">("flat");
  const currentPage = ref(1);

  const customerForm = reactive({
    fullName: "",
    address: "",
    phone: "",
    note: "",
  });

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

  const canSubmitDesign = computed(() => {
    return Boolean(
      exportedPng.value &&
      customerForm.fullName.trim() &&
      customerForm.address.trim() &&
      customerForm.phone.trim(),
    );
  });

  function next() {
    step.value = Math.min(3, Number(step.value) + 1) as WizardStep;
  }

  function prev() {
    step.value = Math.max(0, Number(step.value) - 1) as WizardStep;
  }

  function resetSampleFlags() {
    samplePreset.value = "flat";
    sampleFlags.metallic = false;
    sampleFlags.outline = true;
    sampleFlags.autoCenter = true;
  }

  function resetCustomerForm() {
    customerForm.fullName = "";
    customerForm.address = "";
    customerForm.phone = "";
    customerForm.note = "";
  }

  function clearAll() {
    step.value = 0;
    exportedPng.value = "";
    resetCustomerForm();
    clearNotice();
    selectedPresetId.value = null;
    bgUrl.value = "";
    pushToast("Đã reset toàn bộ màn hình demo.", "info", "Đặt lại");
  }

  function selectPreset(preset: PresetRow) {
    selectedPresetId.value = preset.id;
    bgUrl.value = preset.imageUrl || "";
    exportedPng.value = "";
    step.value = 0;
    setNotice("success", `Đã chọn preset: ${preset.name}`);
  }

  function onExported(payload: { pngDataUrl: string }) {
    exportedPng.value = payload.pngDataUrl;
    setNotice("success", "Đã export PNG thành công.");
    pushToast(
      "PNG đã sẵn sàng ở bước xác nhận.",
      "success",
      "Export thành công",
    );
  }

  async function submitDesign() {
    if (!exportedPng.value) {
      setNotice("error", "Chưa có ảnh PNG để gửi.");
      return;
    }

    if (
      !customerForm.fullName.trim() ||
      !customerForm.address.trim() ||
      !customerForm.phone.trim()
    ) {
      setNotice(
        "error",
        "Vui lòng nhập đầy đủ họ tên, địa chỉ và số điện thoại.",
      );
      return;
    }

    submitLoading.value = true;

    try {
      const exportedFile = dataUrlToFile(
        exportedPng.value,
        "design-export.png",
      );

      await designSubmissionService.create({
        fullName: customerForm.fullName.trim(),
        address: customerForm.address.trim(),
        phone: customerForm.phone.trim(),
        note: customerForm.note.trim(),
        imageFile: exportedFile,
      });

      setNotice("success", "Đã gửi ảnh và thông tin lên server.");
      pushToast(
        "Yêu cầu đã được gửi thành công.",
        "success",
        "Submit thành công",
      );
      clearAll();
    } catch (error: any) {
      const message = error?.message || "Gửi dữ liệu thất bại.";
      setNotice("error", message);
      pushToast(message, "error", "Submit lỗi");
    } finally {
      submitLoading.value = false;
    }
  }

  function onMenuSelect(key: string) {
    if (key === "reset") resetSampleFlags();
    pushToast(`Bạn vừa chọn action: ${key}`, "info", "Dropdown");
  }

  function onTagClose() {
    pushToast("Đã đóng tag demo.", "info", "Tag");
  }

  function previewPreset(row: PresetRow) {
    selectPreset(row);
    pushToast(`Đã chọn preset: ${row.name}`, "info", "Preview");
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

  onMounted(async () => {
    await fetchPresetList();
  });

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
    canSubmitDesign,
    clearAll,
    currentPage,
    customerForm,
    drawerNote,
    drawerPresetName,
    duplicatePreset,
    exportedPng,
    fetchPresetList,
    next,
    notice,
    onExported,
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
    selectPreset,
    selectedPresetId,
    step,
    submitDesign,
    submitLoading,
    themeModel,
    themeOptions,
    toasts,
  };
}
