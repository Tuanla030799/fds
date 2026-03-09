import { readonly, ref } from "vue";

export type ToastVariant = "info" | "success" | "warning" | "error";
export type ToastItem = {
  id: number;
  title?: string;
  message: string;
  variant: ToastVariant;
};

const toasts = ref<ToastItem[]>([]);
let seed = 1;

export function useToast() {
  function remove(id: number) {
    toasts.value = toasts.value.filter((item) => item.id !== id);
  }

  function push(message: string, variant: ToastVariant = "info", title = "") {
    const id = seed++;
    toasts.value = [...toasts.value, { id, title, message, variant }];

    if (typeof window !== "undefined") {
      window.setTimeout(() => remove(id), 2600);
    }

    return id;
  }

  return {
    toasts: readonly(toasts),
    push,
    remove,
  };
}
