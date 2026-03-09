import { computed } from "vue";
import { useAppStore, type ThemeName } from "@/stores/app";

const themeOptions = [
  { label: "Ocean", value: "ocean" },
  { label: "Rose", value: "rose" },
  { label: "Forest", value: "forest" },
  { label: "Grape", value: "grape" },
] as const;

export { type ThemeName };

export function useTheme() {
  const appStore = useAppStore();
  appStore.hydrate();

  return {
    theme: computed(() => appStore.theme),
    themeModel: computed({
      get: () => appStore.theme,
      set: (value: ThemeName) => {
        appStore.setTheme(value);
      },
    }),
    setTheme: appStore.setTheme,
    themeOptions,
  };
}
