import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
} from "axios";
import { buildSearchParams } from "@/lib/http/queryParams";
import { env } from "@/config/env";
import { pinia } from "@/stores";
import { useAppStore } from "@/stores/app";
import { ApiError } from "@/types/http";

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
    (error: AxiosError) => {
      const appStore = useAppStore(pinia);
      appStore.finishRequest();

      if (error.response?.status === 401) {
        appStore.clearAccessToken();
      }

      return Promise.reject(normalizeAxiosError(error));
    },
  );

  return client;
}

export const httpClient = createHttpClient();
export { createHttpClient, normalizeAxiosError };
