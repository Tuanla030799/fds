import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  shallowRef,
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
const MIN_OBJECT_SIZE = 10;
const TEXT_RESIZE_HANDLE_SIZE = 18;

type TextResizeEdge = {
  left: boolean;
  right: boolean;
  top: boolean;
  bottom: boolean;
};

type TextResizeState = TextResizeEdge & {
  object: TaggedObject;
  pointerId: number;
  startX: number;
  startY: number;
  startLeft: number;
  startTop: number;
  startWidth: number;
  startHeight: number;
  baseWidth: number;
  baseHeight: number;
};

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
  const activeTextSelected = ref(false);
  const textWidth = ref("");
  const textHeight = ref("");
  const iconPickerOpen = ref(false);
  const activeTab = ref<"text" | "style" | "actions">("text");
  const syncing = ref(false);
  const resizeObserver = ref<ResizeObserver | null>(null);
  const upperCanvasEl = ref<HTMLCanvasElement | null>(null);
  const canvasScale = ref(1);
  const textResizeState = shallowRef<TextResizeState | null>(null);
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

  const textWidthModel = computed({
    get: () => textWidth.value,
    set: (value: string) => resizeActiveText("width", value),
  });

  const textHeightModel = computed({
    get: () => textHeight.value,
    set: (value: string) => resizeActiveText("height", value),
  });

  function render() {
    canvas.value?.requestRenderAll();
  }

  function getActiveObject() {
    return canvas.value?.getActiveObject() as TaggedObject | null | undefined;
  }

  function getDisplaySize(target: TaggedObject) {
    return {
      width: Math.round(target.getScaledWidth()),
      height: Math.round(target.getScaledHeight()),
    };
  }

  function syncActiveTextSize(target: TaggedObject) {
    const size = getDisplaySize(target);
    textWidth.value = String(size.width);
    textHeight.value = String(size.height);
  }

  function resizeActiveText(axis: "width" | "height", value: string) {
    if (!canvas.value) return;
    const active = getActiveObject();
    if (!active || active.dataType !== "text") return;
    if (!value.trim()) {
      if (axis === "width") textWidth.value = "";
      else textHeight.value = "";
      return;
    }

    const nextSize = Number(value);
    if (!Number.isFinite(nextSize)) return;

    const clampedSize = Math.min(
      axis === "width" ? CANVAS_BASE_SIZE.width : CANVAS_BASE_SIZE.height,
      Math.max(MIN_OBJECT_SIZE, nextSize),
    );
    const baseSize =
      axis === "width"
        ? active.width || active.getScaledWidth()
        : active.height || active.getScaledHeight();
    if (!baseSize) return;

    active.set({
      [axis === "width" ? "scaleX" : "scaleY"]: clampedSize / baseSize,
    });
    active.setCoords();
    syncActiveTextSize(active);
    render();
  }

  function getTextResizeEdge(target: TaggedObject, pointer: fabric.Point) {
    const rect = target.getBoundingRect();
    const handleSize = Math.min(
      TEXT_RESIZE_HANDLE_SIZE / canvasScale.value,
      rect.width / 3,
      rect.height / 3,
    );
    const withinX =
      pointer.x >= rect.left - handleSize &&
      pointer.x <= rect.left + rect.width + handleSize;
    const withinY =
      pointer.y >= rect.top - handleSize &&
      pointer.y <= rect.top + rect.height + handleSize;

    if (!withinX || !withinY) return null;

    const relativeX = rect.width ? (pointer.x - rect.left) / rect.width : 0.5;
    const relativeY = rect.height ? (pointer.y - rect.top) / rect.height : 0.5;
    const nearLeft = Math.abs(pointer.x - rect.left) <= handleSize;
    const nearRight =
      Math.abs(pointer.x - (rect.left + rect.width)) <= handleSize;
    const nearTop = Math.abs(pointer.y - rect.top) <= handleSize;
    const nearBottom =
      Math.abs(pointer.y - (rect.top + rect.height)) <= handleSize;
    const inLeftCorner = relativeX <= 0.25;
    const inRightCorner = relativeX >= 0.75;
    const inTopCorner = relativeY <= 0.25;
    const inBottomCorner = relativeY >= 0.75;

    const left = nearLeft && (!nearTop && !nearBottom || inTopCorner || inBottomCorner);
    const right =
      nearRight && (!nearTop && !nearBottom || inTopCorner || inBottomCorner);
    const top = nearTop && (!nearLeft && !nearRight || inLeftCorner || inRightCorner);
    const bottom =
      nearBottom && (!nearLeft && !nearRight || inLeftCorner || inRightCorner);
    const edge = { left, right, top, bottom };

    return edge.left || edge.right || edge.top || edge.bottom ? edge : null;
  }

  function getTextResizeCursor(edge: TextResizeEdge) {
    if ((edge.left && edge.top) || (edge.right && edge.bottom)) {
      return "nwse-resize";
    }
    if ((edge.right && edge.top) || (edge.left && edge.bottom)) {
      return "nesw-resize";
    }
    if (edge.left || edge.right) return "ew-resize";
    if (edge.top || edge.bottom) return "ns-resize";
    return "";
  }

  function onCanvasPointerDown(event: PointerEvent) {
    if (!canvas.value || event.button !== 0) return;
    const active = getActiveObject();
    if (!active || active.dataType !== "text") return;

    const pointer = canvas.value.getScenePoint(event);
    const edge = getTextResizeEdge(active, pointer);
    if (!edge) return;

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    const rect = active.getBoundingRect();
    const baseWidth = active.width || active.getScaledWidth();
    const baseHeight = active.height || active.getScaledHeight();
    if (!baseWidth || !baseHeight) return;

    textResizeState.value = {
      ...edge,
      object: active,
      pointerId: event.pointerId,
      startX: pointer.x,
      startY: pointer.y,
      startLeft: Number(active.left || 0),
      startTop: Number(active.top || 0),
      startWidth: rect.width,
      startHeight: rect.height,
      baseWidth,
      baseHeight,
    };

    upperCanvasEl.value?.setPointerCapture?.(event.pointerId);
  }

  function onCanvasPointerMove(event: PointerEvent) {
    if (!canvas.value) return;

    const resizeState = textResizeState.value;
    if (!resizeState) {
      const active = getActiveObject();
      if (!active || active.dataType !== "text") {
        upperCanvasEl.value?.style.removeProperty("cursor");
        return;
      }

      const edge = getTextResizeEdge(active, canvas.value.getScenePoint(event));
      if (upperCanvasEl.value) {
        upperCanvasEl.value.style.cursor = edge ? getTextResizeCursor(edge) : "";
      }
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    const pointer = canvas.value.getScenePoint(event);
    const deltaX = pointer.x - resizeState.startX;
    const deltaY = pointer.y - resizeState.startY;
    const nextProps: Partial<{
      left: number;
      top: number;
      scaleX: number;
      scaleY: number;
    }> = {};

    if (resizeState.left || resizeState.right) {
      const nextWidth = Math.max(
        MIN_OBJECT_SIZE,
        resizeState.startWidth +
          (resizeState.right ? deltaX : 0) -
          (resizeState.left ? deltaX : 0),
      );
      nextProps.scaleX = nextWidth / resizeState.baseWidth;
      if (resizeState.left) nextProps.left = resizeState.startLeft + deltaX;
    }

    if (resizeState.top || resizeState.bottom) {
      const nextHeight = Math.max(
        MIN_OBJECT_SIZE,
        resizeState.startHeight +
          (resizeState.bottom ? deltaY : 0) -
          (resizeState.top ? deltaY : 0),
      );
      nextProps.scaleY = nextHeight / resizeState.baseHeight;
      if (resizeState.top) nextProps.top = resizeState.startTop + deltaY;
    }

    resizeState.object.set(nextProps);
    resizeState.object.setCoords();
    syncActiveTextSize(resizeState.object);
    render();
  }

  function onCanvasPointerUp(event: PointerEvent) {
    const resizeState = textResizeState.value;
    if (!resizeState) return;

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    resizeState.object.setCoords();
    syncActiveTextSize(resizeState.object);
    canvas.value?.fire("object:modified", { target: resizeState.object });
    textResizeState.value = null;
    upperCanvasEl.value?.releasePointerCapture?.(resizeState.pointerId);
    upperCanvasEl.value?.style.removeProperty("cursor");
  }

  function bindTextResizeEvents(fabricCanvas: fabric.Canvas) {
    upperCanvasEl.value = (
      fabricCanvas as fabric.Canvas & { upperCanvasEl?: HTMLCanvasElement }
    ).upperCanvasEl || null;
    upperCanvasEl.value?.addEventListener("pointerdown", onCanvasPointerDown, {
      capture: true,
    });
    upperCanvasEl.value?.addEventListener("pointermove", onCanvasPointerMove, {
      capture: true,
    });
    upperCanvasEl.value?.addEventListener("pointerup", onCanvasPointerUp, {
      capture: true,
    });
    upperCanvasEl.value?.addEventListener("pointercancel", onCanvasPointerUp, {
      capture: true,
    });
  }

  function unbindTextResizeEvents() {
    upperCanvasEl.value?.removeEventListener("pointerdown", onCanvasPointerDown, {
      capture: true,
    });
    upperCanvasEl.value?.removeEventListener("pointermove", onCanvasPointerMove, {
      capture: true,
    });
    upperCanvasEl.value?.removeEventListener("pointerup", onCanvasPointerUp, {
      capture: true,
    });
    upperCanvasEl.value?.removeEventListener("pointercancel", onCanvasPointerUp, {
      capture: true,
    });
    upperCanvasEl.value?.style.removeProperty("cursor");
    upperCanvasEl.value = null;
  }

  function syncScaleToOuter() {
    if (!canvas.value || !canvasOuterRef.value) return;

    const outerWidth = Math.max(
      280,
      Math.floor(canvasOuterRef.value.getBoundingClientRect().width),
    );
    const scale = outerWidth / CANVAS_BASE_SIZE.width;
    canvasScale.value = scale;
    const outerHeight = Math.floor(CANVAS_BASE_SIZE.height * scale);

    canvasOuterRef.value.style.height = `${outerHeight}px`;

    canvas.value.setDimensions(
      {
        width: `${outerWidth}px`,
        height: `${outerHeight}px`,
      },
      { cssOnly: true },
    );
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
    if (!active || (canvas.value.getActiveObjects?.() || []).length > 1) {
      activeTextSelected.value = false;
      textWidth.value = "";
      textHeight.value = "";
      return;
    }

    syncing.value = true;

    if (active.dataType === "text") {
      const activeText = active as ActiveTextObject;
      activeTextSelected.value = true;
      syncActiveTextSize(active);
      fontFamily.value = activeText.fontFamily || fontFamily.value;
      fontSize.value = Number(activeText.fontSize || fontSize.value);
      fillColor.value = activeText.fill || fillColor.value;
    } else if (active.dataType === "icon") {
      activeTextSelected.value = false;
      textWidth.value = "";
      textHeight.value = "";
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

    const textbox = new fabric.Text(value, {
      left: CANVAS_BASE_SIZE.width * 0.35,
      top: CANVAS_BASE_SIZE.height * 0.35,
      fontFamily: fontFamily.value,
      fontSize: fontSize.value,
      fill: fillColor.value,
      hasControls: true,
      lockScalingX: false,
      lockScalingY: false,
      lockUniScaling: false,
      cornerSize: 14,
      touchCornerSize: 28,
      transparentCorners: false,
      padding: 4,
    }) as TaggedObject;

    textbox.setControlsVisibility?.({
      tl: true,
      tr: true,
      bl: true,
      br: true,
      ml: true,
      mr: true,
      mt: true,
      mb: true,
      mtr: true,
    });

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
      enablePointerEvents: true,
    });

    canvas.value = fabricCanvas;
    fabricCanvas.on("selection:created", syncUiFromActive as never);
    fabricCanvas.on("selection:updated", syncUiFromActive as never);
    fabricCanvas.on("selection:cleared", syncUiFromActive as never);
    fabricCanvas.on("object:scaling", syncUiFromActive as never);
    fabricCanvas.on("object:modified", syncUiFromActive as never);
    bindTextResizeEvents(fabricCanvas);

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
    unbindTextResizeEvents();
    resizeObserver.value?.disconnect();
    if (rafId.value) cancelAnimationFrame(rafId.value);
    if (canvas.value) {
      canvas.value.off("selection:created", syncUiFromActive as never);
      canvas.value.off("selection:updated", syncUiFromActive as never);
      canvas.value.off("selection:cleared", syncUiFromActive as never);
      canvas.value.off("object:scaling", syncUiFromActive as never);
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
    activeTextSelected,
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
    textHeightModel,
    textWidthModel,
    addText,
  };
}
