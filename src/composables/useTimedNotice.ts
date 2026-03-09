import { onBeforeUnmount, ref } from "vue";
import type { NoticeState } from "@/types/designer";

export function useTimedNotice<
  T extends string = "info" | "success" | "warning" | "error",
>(duration = 2400) {
  const notice = ref<NoticeState<T>>(null);
  let timer = 0;

  function clearNotice() {
    if (timer) {
      window.clearTimeout(timer);
      timer = 0;
    }
    notice.value = null;
  }

  function setNotice(type: T, text: string) {
    notice.value = { type, text };
    if (timer) window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      notice.value = null;
      timer = 0;
    }, duration);
  }

  onBeforeUnmount(() => {
    if (timer) window.clearTimeout(timer);
  });

  return {
    notice,
    setNotice,
    clearNotice,
  };
}
