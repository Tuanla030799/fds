import { computed, reactive, ref, onMounted } from "vue";
import {
  MENU_ITEMS,
  TEMPLATE_OPTIONS,
  TEMPLATE_ROWS,
  TABLE_COLUMNS,
  WIZARD_STEPS,
} from "@/data/designer";
import { useTheme } from "@/composables/useTheme";
import { useTimedNotice } from "@/composables/useTimedNotice";
import { useToast } from "@/composables/useToast";
import { useAppStore } from "@/stores/app";
import { useTemplateStore } from "@/stores/template";
import { designSubmissionService } from "@/services/client";
import { fileService, type UploadedFile } from "@/services/file.service";
import type { TemplateRow, TemplateStatus, WizardStep } from "@/types/designer";

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

  const templateStore = useTemplateStore();
  if (!templateStore.loaded) {
    templateStore.setTemplates(TEMPLATE_ROWS);
  }

  const { themeModel, themeOptions } = useTheme();
  const { toasts, push: pushToast, remove: removeToast } = useToast();
  const { notice, setNotice, clearNotice } = useTimedNotice<
    "success" | "error"
  >();

  const step = ref<WizardStep>(0);
  const exportedPng = ref("");
  const uploadedDesignFile = ref<UploadedFile | null>(null);
  const uploadedDesignSource = ref("");
  const imageUploadLoading = ref(false);
  const submitLoading = ref(false);
  const bgUrl = ref("");
  const selectedTemplateId = ref<string | number | null>(null);

  const openDrawer = ref(false);
  const drawerTemplateName = ref("");
  const drawerNote = ref("");
  const sampleTemplate = ref<"flat" | "puff" | "satin">("flat");
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

  const templateRows = computed(() => templateStore.items);
  const apiLoading = computed(() => appStore.isLoading || templateStore.loading);

  const pagedTemplates = computed(() => {
    const start = (currentPage.value - 1) * PAGE_SIZE;
    return templateRows.value.slice(start, start + PAGE_SIZE);
  });

  const canSubmitDesign = computed(() => {
    return Boolean(
      uploadedDesignFile.value?.fileId &&
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
    sampleTemplate.value = "flat";
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
    uploadedDesignFile.value = null;
    uploadedDesignSource.value = "";
    resetCustomerForm();
    clearNotice();
    selectedTemplateId.value = null;
    bgUrl.value = "";
    pushToast("Đã reset toàn bộ màn hình demo.", "info", "Đặt lại");
  }

  function selectTemplate(template: TemplateRow) {
    selectedTemplateId.value = template.id;
    bgUrl.value = template.imageUrl || "";
    exportedPng.value = "";
    uploadedDesignFile.value = null;
    uploadedDesignSource.value = "";
    step.value = 0;
    setNotice("success", `Đã chọn template: ${template.name}`);
  }

  function onExported(payload: { pngDataUrl: string }) {
    exportedPng.value = payload.pngDataUrl;
    uploadedDesignFile.value = null;
    uploadedDesignSource.value = "";
    setNotice("success", "Đã export PNG thành công.");
    pushToast(
      "PNG đã sẵn sàng ở bước xác nhận.",
      "success",
      "Export thành công",
    );
    if (step.value === 1) next();
  }

  async function confirmDesignImage() {
    if (!exportedPng.value) {
      setNotice("error", "Chưa có ảnh PNG để xác nhận.");
      return;
    }

    if (
      uploadedDesignFile.value?.fileId &&
      uploadedDesignSource.value === exportedPng.value
    ) {
      next();
      return;
    }

    imageUploadLoading.value = true;

    try {
      const exportedFile = dataUrlToFile(
        exportedPng.value,
        "design-export.png",
      );
      const uploadedFile = await fileService.upload(exportedFile, {
        scope: "client",
      });

      if (!uploadedFile.fileId) {
        throw new Error("API upload không trả về fileId.");
      }

      uploadedDesignFile.value = uploadedFile;
      uploadedDesignSource.value = exportedPng.value;
      setNotice("success", "Đã upload ảnh thiết kế thành công.");
      pushToast(
        "Ảnh đã được upload và sẵn sàng gửi đơn.",
        "success",
        "Upload thành công",
      );
      next();
    } catch (error: any) {
      const message = error?.message || "Upload ảnh thiết kế thất bại.";
      setNotice("error", message);
      pushToast(message, "error", "Upload lỗi");
    } finally {
      imageUploadLoading.value = false;
    }
  }

  async function submitDesign() {
    if (!uploadedDesignFile.value?.fileId) {
      setNotice("error", "Chưa có fileId ảnh thiết kế để gửi.");
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
      await designSubmissionService.create({
        fullName: customerForm.fullName.trim(),
        address: customerForm.address.trim(),
        phone: customerForm.phone.trim(),
        note: customerForm.note.trim(),
        fileId: uploadedDesignFile.value.fileId,
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

  function previewTemplate(row: TemplateRow) {
    selectTemplate(row);
    pushToast(`Đã chọn template: ${row.name}`, "info", "Preview");
  }

  function duplicateTemplate(row: TemplateRow) {
    pushToast(`Đã clone template: ${row.name}`, "success", "Clone");
  }

  function saveDrawerTemplate() {
    openDrawer.value = false;
    pushToast(
      `Đã lưu template demo: ${drawerTemplateName.value || "Untitled"}`,
      "success",
      "Template saved",
    );
  }

  async function fetchTemplateList() {
    try {
      await templateStore.fetchTemplates();
    } catch {
      pushToast(
        templateStore.errorMessage || "Gọi API thất bại.",
        "error",
        "API error",
      );
    }
  }

  function badgeVariant(status: TemplateStatus) {
    if (status === "ACTIVE") return "success";
    return "neutral";
  }

  onMounted(async () => {
    await fetchTemplateList();
  });

  return {
    MENU_ITEMS,
    PAGE_SIZE,
    TEMPLATE_OPTIONS,
    TABLE_COLUMNS,
    WIZARD_STEPS,
    accessTokenModel,
    apiLoading,
    badgeVariant,
    bgUrl,
    canSubmitDesign,
    clearAll,
    confirmDesignImage,
    currentPage,
    customerForm,
    drawerNote,
    drawerTemplateName,
    duplicateTemplate,
    exportedPng,
    fetchTemplateList,
    imageUploadLoading,
    next,
    notice,
    onExported,
    onMenuSelect,
    onTagClose,
    openDrawer,
    pagedTemplates,
    templateRows,
    previewTemplate,
    prev,
    pushToast,
    removeToast,
    sampleFlags,
    sampleTemplate,
    saveDrawerTemplate,
    selectTemplate,
    selectedTemplateId,
    step,
    submitDesign,
    submitLoading,
    themeModel,
    themeOptions,
    toasts,
    uploadedDesignFile,
  };
}
