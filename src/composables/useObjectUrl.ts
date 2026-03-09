import { onBeforeUnmount, ref } from "vue";

export function useObjectUrl() {
  const objectUrl = ref("");

  function revoke() {
    if (objectUrl.value) {
      URL.revokeObjectURL(objectUrl.value);
      objectUrl.value = "";
    }
  }

  function setFile(file: File) {
    revoke();
    objectUrl.value = URL.createObjectURL(file);
    return objectUrl.value;
  }

  onBeforeUnmount(revoke);

  return {
    objectUrl,
    setFile,
    revoke,
  };
}
