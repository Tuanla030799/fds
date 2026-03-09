import { httpClient } from "@/lib/http/httpClient";
import type { AuthTokenPayload } from "@/types/admin";
import type { ApiEnvelope } from "@/types/http";

export interface LoginPayload {
  email: string;
  password: string;
}

export const adminAuthService = {
  async login(payload: LoginPayload) {
    const response = await httpClient.post<ApiEnvelope<AuthTokenPayload>>(
      "/admin/auth/login",
      payload,
    );
    return response.data.data;
  },
  async refresh(refreshToken: string) {
    const response = await httpClient.post<ApiEnvelope<AuthTokenPayload>>(
      "/admin/auth/refresh",
      {
        refreshToken,
      },
    );
    return response.data.data;
  },
  async logout(refreshToken?: string) {
    const response = await httpClient.post<ApiEnvelope<null>>(
      "/admin/auth/logout",
      {
        refreshToken,
      },
    );
    return response.data.data;
  },
};
