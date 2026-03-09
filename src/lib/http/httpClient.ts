import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";
import { buildSearchParams } from "@/lib/http/queryParams";
import { env } from "@/config/env";
import { pinia } from "@/stores";
import { useAppStore } from "@/stores/app";
import { ApiError } from "@/types/http";
import { adminAuthService } from "@/services/admin/auth.service";

type RetryableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

function normalizeAxiosError(error: unknown) {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data as
      | Record<string, unknown>
      | undefined;
    const message =
      (typeof responseData?.message === "string" && responseData.message) ||
      error.message ||
      "Đã có lỗi xảy ra khi gọi API.";

    return new ApiError({
      message,
      status: error.response?.status,
      code:
        typeof responseData?.code === "string" ? responseData.code : error.code,
      details: responseData,
    });
  }

  if (error instanceof Error) {
    return new ApiError({ message: error.message });
  }

  return new ApiError({ message: "Đã có lỗi không xác định." });
}

let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken() {
  const appStore = useAppStore(pinia);
  if (!appStore.refreshToken) {
    appStore.clearAuthSession();
    throw new ApiError({
      message: "Phiên đăng nhập đã hết hạn.",
      status: 401,
      code: "AUTH_EXPIRED",
    });
  }

  if (!refreshPromise) {
    appStore.startRefreshToken();
    refreshPromise = adminAuthService
      .refresh(appStore.refreshToken)
      .then((payload) => {
        appStore.setAuthSession(payload);
        return payload.accessToken;
      })
      .catch((error) => {
        appStore.clearAuthSession();
        throw error;
      })
      .finally(() => {
        appStore.finishRefreshToken();
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

function shouldSkipRefresh(config?: RetryableConfig) {
  const url = config?.url || "";
  return (
    url.includes("/admin/auth/login") ||
    url.includes("/admin/auth/refresh") ||
    url.includes("/admin/auth/logout")
  );
}

function createHttpClient(config?: AxiosRequestConfig): AxiosInstance {
  const client = axios.create({
    baseURL: env.apiBaseUrl,
    timeout: env.apiTimeout,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    ...config,
  });

  client.interceptors.request.use(
    (requestConfig: any) => {
      if (
        requestConfig.params &&
        !(requestConfig.params instanceof URLSearchParams)
      ) {
        requestConfig.paramsSerializer = (params: any) =>
          buildSearchParams(params as any).toString();
      }

      const appStore = useAppStore(pinia);
      appStore.startRequest();

      const authHeaders = appStore.accessToken
        ? { Authorization: `Bearer ${appStore.accessToken}` }
        : {};

      return {
        ...requestConfig,
        headers: {
          ...(requestConfig.headers || {}),
          ...authHeaders,
          "X-Requested-With": "XMLHttpRequest",
        },
      };
    },
    (error: AxiosError) => {
      const appStore = useAppStore(pinia);
      appStore.finishRequest();
      return Promise.reject(normalizeAxiosError(error));
    },
  );

  client.interceptors.response.use(
    (response) => {
      const appStore = useAppStore(pinia);
      appStore.finishRequest();
      return response;
    },
    async (error: AxiosError) => {
      const appStore = useAppStore(pinia);
      appStore.finishRequest();

      const originalRequest = error.config as RetryableConfig | undefined;
      if (
        error.response?.status === 401 &&
        originalRequest &&
        !originalRequest._retry &&
        !shouldSkipRefresh(originalRequest) &&
        appStore.refreshToken
      ) {
        try {
          originalRequest._retry = true;
          const nextAccessToken = await refreshAccessToken();
          originalRequest.headers = {
            ...(originalRequest.headers || {}),
            Authorization: `Bearer ${nextAccessToken}`,
          } as any;
          return client(originalRequest);
        } catch (refreshError) {
          return Promise.reject(normalizeAxiosError(refreshError));
        }
      }

      if (
        error.response?.status === 401 &&
        shouldSkipRefresh(originalRequest)
      ) {
        appStore.clearAuthSession();
      }

      return Promise.reject(normalizeAxiosError(error));
    },
  );

  return client;
}

export const httpClient = createHttpClient();
export { createHttpClient, normalizeAxiosError };
