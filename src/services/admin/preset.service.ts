import { httpClient } from "@/lib/http/httpClient";
import type { AdminPresetRow, ListMeta } from "@/types/admin";
import type { PresetStatus } from "@/types/designer";
import type { ApiEnvelope, QueryParams } from "@/types/http";

export interface AdminPresetListParams extends QueryParams {
  page?: number;
  limit?: number;
  keyword?: string;
  status?: PresetStatus | "";
}

export interface CreateAdminPresetPayload {
  name: string;
  status: PresetStatus;
  tags: string[];
  note: string;
  imageFile: File;
}

function normalizePreset(row: Record<string, any>): AdminPresetRow {
  return {
    id: row.id,
    name: row.name || "",
    status: (row.status || "active") as PresetStatus,
    tags: Array.isArray(row.tags) ? row.tags : [],
    note: row.note || "",
    imageUrl: row.imageUrl || row.image_url || "",
    createdAt: row.createdAt || row.created_at,
  };
}

export const adminPresetService = {
  async list(params?: AdminPresetListParams) {
    const response = await httpClient.get<ApiEnvelope<Record<string, any>[]>>(
      "/admin/presets",
      { params },
    );
    return {
      items: (response.data.data || []).map(normalizePreset),
      meta: (response.data.meta || {}) as ListMeta,
    };
  },
  async create(payload: CreateAdminPresetPayload) {
    const formData = new FormData();
    formData.append("name", payload.name);
    formData.append("status", payload.status);
    formData.append("note", payload.note);
    payload.tags.forEach((tag) => formData.append("tags[]", tag));
    formData.append("image", payload.imageFile);

    const response = await httpClient.post<ApiEnvelope<Record<string, any>>>(
      "/admin/presets",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return normalizePreset(response.data.data || {});
  },
  async remove(id: number | string) {
    const response = await httpClient.delete<ApiEnvelope<null>>(
      `/admin/presets/${id}`,
    );
    return response.data.data;
  },
};
