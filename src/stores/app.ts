import { computed, ref } from "vue";
import { defineStore } from "pinia";
import type { AdminProfile, AuthTokenPayload } from "@/types/admin";

export type ThemeName = "ocean" | "rose" | "forest" | "grape";

const THEME_KEY = "fds-ui-theme";
const ACCESS_TOKEN_KEY = "fds-access-token";
const REFRESH_TOKEN_KEY = "fds-refresh-token";
const ADMIN_PROFILE_KEY = "fds-admin-profile";
const DEFAULT_THEME: ThemeName = "ocean";

function isThemeName(value: string | null): value is ThemeName {
  return (
    value === "ocean" ||
    value === "rose" ||
    value === "forest" ||
    value === "grape"
  );
}

function applyTheme(next: ThemeName) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (next === DEFAULT_THEME) root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", next);
}

function parseAdminProfile(raw: string | null): AdminProfile | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AdminProfile;
  } catch {
    return null;
  }
}

export const useAppStore = defineStore("app", () => {
  const initialized = ref(false);
  const theme = ref<ThemeName>(DEFAULT_THEME);
  const accessToken = ref("");
  const refreshToken = ref("");
  const adminProfile = ref<AdminProfile | null>(null);
  const requestCount = ref(0);
  const refreshingToken = ref(false);

  const isLoading = computed(() => requestCount.value > 0);
  const isAuthenticated = computed(() => Boolean(accessToken.value));
  const adminDisplayName = computed(
    () => adminProfile.value?.fullName || adminProfile.value?.email || "Admin",
  );

  function hydrate() {
    if (initialized.value || typeof window === "undefined") return;
    initialized.value = true;

    const storedTheme = window.localStorage.getItem(THEME_KEY);
    if (isThemeName(storedTheme)) theme.value = storedTheme;

    accessToken.value = window.localStorage.getItem(ACCESS_TOKEN_KEY) || "";
    refreshToken.value = window.localStorage.getItem(REFRESH_TOKEN_KEY) || "";
    adminProfile.value = parseAdminProfile(
      window.localStorage.getItem(ADMIN_PROFILE_KEY),
    );
    applyTheme(theme.value);
  }

  function setTheme(next: ThemeName) {
    theme.value = next;
    applyTheme(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(THEME_KEY, next);
    }
  }

  function setAuthSession(payload: AuthTokenPayload) {
    accessToken.value = payload.accessToken.trim();
    refreshToken.value = payload.refreshToken.trim();
    adminProfile.value = payload.admin;

    if (typeof window !== "undefined") {
      window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken.value);
      window.localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken.value);
      window.localStorage.setItem(
        ADMIN_PROFILE_KEY,
        JSON.stringify(payload.admin),
      );
    }
  }

  function setAccessToken(token: string) {
    accessToken.value = token.trim();
    if (typeof window !== "undefined") {
      if (accessToken.value)
        window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken.value);
      else window.localStorage.removeItem(ACCESS_TOKEN_KEY);
    }
  }

  function setRefreshToken(token: string) {
    refreshToken.value = token.trim();
    if (typeof window !== "undefined") {
      if (refreshToken.value)
        window.localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken.value);
      else window.localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  }

  function setAdminProfile(profile: AdminProfile | null) {
    adminProfile.value = profile;
    if (typeof window !== "undefined") {
      if (profile)
        window.localStorage.setItem(ADMIN_PROFILE_KEY, JSON.stringify(profile));
      else window.localStorage.removeItem(ADMIN_PROFILE_KEY);
    }
  }

  function clearAuthSession() {
    setAccessToken("");
    setRefreshToken("");
    setAdminProfile(null);
  }

  function startRefreshToken() {
    refreshingToken.value = true;
  }

  function finishRefreshToken() {
    refreshingToken.value = false;
  }

  function startRequest() {
    requestCount.value += 1;
  }

  function finishRequest() {
    requestCount.value = Math.max(0, requestCount.value - 1);
  }

  return {
    accessToken,
    adminDisplayName,
    adminProfile,
    clearAuthSession,
    finishRefreshToken,
    finishRequest,
    hydrate,
    initialized,
    isAuthenticated,
    isLoading,
    refreshingToken,
    refreshToken,
    requestCount,
    setAccessToken,
    setAdminProfile,
    setAuthSession,
    setRefreshToken,
    setTheme,
    startRefreshToken,
    startRequest,
    theme,
  };
});
