import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
  type Ref,
} from "vue";
import * as fabric from "fabric";
import {
  CANVAS_BASE_SIZE,
  CANVAS_ICONS,
  FONT_OPTIONS,
} from "@/data/canvas-editor";
import { useTimedNotice } from "@/composables/useTimedNotice";
import type {
  ActiveIconObject,
  ActiveTextObject,
  CanvasEditorConfig,
  CanvasBackgroundFit,
  IconKey,
  TaggedObject,
} from "@/types/canvas-editor";

const DEFAULT_FONT_SIZE = 36;
const DEFAULT_FILL = "#111111";
const DEFAULT_FONT_FAMILY = "Arial";

export function useCanvasEditor(options: {
  backgroundUrl: Ref<string>;
  bgFit: Ref<CanvasBackgroundFit>;
  config: CanvasEditorConfig;
  onExported: (payload: { pngDataUrl: string }) => void;
}) {
  const { backgroundUrl, bgFit, config, onExported } = options;
  const canvasOuterRef = ref<HTMLDivElement | null>(null);
  const canvas = ref<fabric.Canvas | null>(null);
  const textInput = ref("");
  const fontFamily = ref(DEFAULT_FONT_FAMILY);
  const fontSize = ref(DEFAULT_FONT_SIZE);
  const fillColor = ref(DEFAULT_FILL);
  const iconPickerOpen = ref(false);
  const activeTab = ref<"text" | "style" | "actions">("text");
  const syncing = ref(false);
  const resizeObserver = ref<ResizeObserver | null>(null);
  const rafId = ref(0);
  const { notice, setNotice } = useTimedNotice<"info" | "error">();

  const fontSizeModel = computed({
    get: () => String(fontSize.value),
    set: (value: string) => {
      const next = Number(value);
      fontSize.value = Number.isFinite(next)
        ? Math.min(72, Math.max(12, next))
        : DEFAULT_FONT_SIZE;
    },
  });

  function render() {
    canvas.value?.requestRenderAll();
  }

  function getActiveObject() {
    return canvas.value?.getActiveObject() as TaggedObject | null | undefined;
  }

  function syncScaleToOuter() {
    if (!canvas.value || !canvasOuterRef.value) return;

    const outerWidth = Math.max(
      280,
      Math.floor(canvasOuterRef.value.getBoundingClientRect().width),
    );
    const scale = outerWidth / CANVAS_BASE_SIZE.width;
    const outerHeight = Math.floor(CANVAS_BASE_SIZE.height * scale);

    canvasOuterRef.value.style.height = `${outerHeight}px`;

    const wrapperEl = (
      canvas.value as unknown as { wrapperEl?: HTMLDivElement }
    ).wrapperEl;
    if (!wrapperEl) return;

    wrapperEl.style.width = `${CANVAS_BASE_SIZE.width}px`;
    wrapperEl.style.height = `${CANVAS_BASE_SIZE.height}px`;
    wrapperEl.style.transformOrigin = "0 0";
    wrapperEl.style.transform = `scale(${scale})`;
    canvas.value.requestRenderAll();
  }

  function fitBackgroundToCanvas() {
    if (!canvas.value) return;

    const background = canvas.value.backgroundImage as TaggedObject | undefined;
    if (!background) return;

    const canvasWidth = canvas.value.getWidth();
    const canvasHeight = canvas.value.getHeight();
    const imageWidth = (background as { width?: number }).width || canvasWidth;
    const imageHeight =
      (background as { height?: number }).height || canvasHeight;
    const containScale = Math.min(
      canvasWidth / imageWidth,
      canvasHeight / imageHeight,
    );
    const coverScale = Math.max(
      canvasWidth / imageWidth,
      canvasHeight / imageHeight,
    );
    const scale = bgFit.value === "cover" ? coverScale : containScale;

    background.set({
      originX: "center",
      originY: "center",
      left: canvasWidth / 2,
      top: canvasHeight / 2,
      scaleX: scale,
      scaleY: scale,
    });
  }

  async function setBackground(url: string) {
    if (!canvas.value) return;
    const image = await fabric.FabricImage.fromURL(url, {
      crossOrigin: "anonymous",
    });
    image.set({ selectable: false, evented: false });
    canvas.value.backgroundImage = image;
    fitBackgroundToCanvas();
    render();
  }

  function resetCanvas() {
    if (!canvas.value) return;
    canvas.value.clear();
    void setBackground(backgroundUrl.value);
    render();
  }

  function syncUiFromActive() {
    if (!canvas.value) return;
    const active = getActiveObject();
    if (!active) return;
    if ((canvas.value.getActiveObjects?.() || []).length > 1) return;

    syncing.value = true;

    if (active.dataType === "text") {
      const activeText = active as ActiveTextObject;
      fontFamily.value = activeText.fontFamily || fontFamily.value;
      fontSize.value = Number(activeText.fontSize || fontSize.value);
      fillColor.value = activeText.fill || fillColor.value;
    } else if (active.dataType === "icon") {
      const activeIcon = active as ActiveIconObject;
      const fill = activeIcon._objects?.[0]?.fill || activeIcon.fill;
      if (fill) fillColor.value = fill;
    }

    syncing.value = false;
  }

  function applyStyleToActive() {
    if (syncing.value || !canvas.value) return;
    const active = getActiveObject();
    if (!active) return;

    if (active.dataType === "text") {
      (active as ActiveTextObject).set({
        fontFamily: fontFamily.value,
        fontSize: fontSize.value,
        fill: fillColor.value,
      });
    } else if (active.dataType === "icon") {
      (active as ActiveIconObject)._objects?.forEach((part) =>
        part.set({ fill: fillColor.value }),
      );
    }

    render();
  }

  function countIcons() {
    if (!canvas.value) return 0;
    return canvas.value
      .getObjects()
      .filter((item) => (item as TaggedObject).dataType === "icon").length;
  }

  function addText() {
    const value = textInput.value.trim();
    if (!value) return;
    if (value.length > config.maxTextChars) {
      setNotice("error", `Text tối đa ${config.maxTextChars} ký tự.`);
      return;
    }
    if (!canvas.value) return;

    const textbox = new fabric.Textbox(value, {
      left: CANVAS_BASE_SIZE.width * 0.35,
      top: CANVAS_BASE_SIZE.height * 0.35,
      fontFamily: fontFamily.value,
      fontSize: fontSize.value,
      fill: fillColor.value,
      editable: true,
    }) as TaggedObject;

    textbox.dataType = "text";
    canvas.value.add(textbox);
    canvas.value.setActiveObject(textbox);
    syncUiFromActive();
    render();
    textInput.value = "";
  }

  function openIconPicker() {
    if (countIcons() >= config.maxIcons) {
      setNotice("error", `Chỉ được thêm tối đa ${config.maxIcons} icon.`);
      return;
    }
    iconPickerOpen.value = true;
  }

  async function addIcon(key: IconKey) {
    if (!canvas.value) return;
    if (countIcons() >= config.maxIcons) {
      setNotice("error", `Chỉ được thêm tối đa ${config.maxIcons} icon.`);
      return;
    }

    const icon = CANVAS_ICONS.find((item) => item.key === key);
    if (!icon) return;

    const { objects, options } = await fabric.loadSVGFromString(icon.svg);
    const obj = objects.filter((obj) => obj !== null);
    const group = fabric.util.groupSVGElements(obj, options) as TaggedObject;
    group.dataType = "icon";
    group.set({
      left: CANVAS_BASE_SIZE.width * 0.45,
      top: CANVAS_BASE_SIZE.height * 0.45,
      scaleX: 1.2,
      scaleY: 1.2,
    });
    (group as ActiveIconObject)._objects?.forEach((part) =>
      part.set({ fill: fillColor.value }),
    );

    canvas.value.add(group);
    canvas.value.setActiveObject(group);
    syncUiFromActive();
    render();
  }

  async function pickIcon(key: IconKey) {
    iconPickerOpen.value = false;
    await addIcon(key);
  }

  function removeActive() {
    if (!canvas.value) return;
    const active = getActiveObject();
    if (!active) return;
    canvas.value.remove(active);
    canvas.value.discardActiveObject();
    render();
  }

  function exportPng() {
    if (!canvas.value) return;
    const pngDataUrl = canvas.value.toDataURL({
      format: "png",
      quality: 1,
      multiplier: 2,
    });
    onExported({ pngDataUrl });
  }

  function onKeydown(event: KeyboardEvent) {
    if (event.key !== "Delete" && event.key !== "Backspace") return;
    const tag = (event.target as HTMLElement | null)?.tagName?.toLowerCase();
    if (tag === "input" || tag === "textarea" || tag === "select") return;
    removeActive();
  }

  function setupResizeObserver() {
    if (!canvasOuterRef.value) return;
    syncScaleToOuter();
    resizeObserver.value = new ResizeObserver(() => {
      if (rafId.value) cancelAnimationFrame(rafId.value);
      rafId.value = requestAnimationFrame(syncScaleToOuter);
    });
    resizeObserver.value.observe(canvasOuterRef.value);
  }

  function initCanvas() {
    if (!canvasOuterRef.value) return;

    const element = document.createElement("canvas");
    element.width = CANVAS_BASE_SIZE.width;
    element.height = CANVAS_BASE_SIZE.height;

    canvasOuterRef.value.innerHTML = "";
    canvasOuterRef.value.appendChild(element);

    const fabricCanvas = new fabric.Canvas(element, {
      selection: true,
      preserveObjectStacking: true,
    });

    canvas.value = fabricCanvas;
    fabricCanvas.on("selection:created", syncUiFromActive as never);
    fabricCanvas.on("selection:updated", syncUiFromActive as never);
    fabricCanvas.on("selection:cleared", syncUiFromActive as never);
    fabricCanvas.on("object:modified", syncUiFromActive as never);

    void setBackground(backgroundUrl.value);
    syncScaleToOuter();
  }

  onMounted(async () => {
    await nextTick();
    initCanvas();
    setupResizeObserver();
    window.addEventListener("keydown", onKeydown);
  });

  onBeforeUnmount(() => {
    window.removeEventListener("keydown", onKeydown);
    resizeObserver.value?.disconnect();
    if (rafId.value) cancelAnimationFrame(rafId.value);
    if (canvas.value) {
      canvas.value.off("selection:created", syncUiFromActive as never);
      canvas.value.off("selection:updated", syncUiFromActive as never);
      canvas.value.off("selection:cleared", syncUiFromActive as never);
      canvas.value.off("object:modified", syncUiFromActive as never);
      canvas.value.dispose();
    }
  });

  watch(backgroundUrl, resetCanvas);
  watch(bgFit, () => {
    fitBackgroundToCanvas();
    render();
  });
  watch([fontFamily, fontSize, fillColor], applyStyleToActive);

  return {
    activeTab,
    canvasOuterRef,
    exportPng,
    fillColor,
    fontFamily,
    fontOptions: FONT_OPTIONS,
    fontSizeModel,
    iconPickerOpen,
    notice,
    openIconPicker,
    pickIcon,
    removeActive,
    setIconPickerOpen: (value: boolean) => {
      iconPickerOpen.value = value;
    },
    textInput,
    addText,
  };
}
