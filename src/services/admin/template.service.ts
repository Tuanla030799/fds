import { httpClient } from "@/lib/http/httpClient";
import { resolveFileUrl } from "@/lib/fileUrl";
import type { AdminTemplateRow, ListMeta } from "@/types/admin";
import type { TemplateStatus } from "@/types/designer";
import type { ApiEnvelope, QueryParams } from "@/types/http";

export interface AdminTemplateListParams extends QueryParams {
  page?: number;
  limit?: number;
  keyword?: string;
  status?: TemplateStatus | "";
}

export interface CreateAdminTemplatePayload {
  name: string;
  status: TemplateStatus;
  tags: string[];
  note: string;
  fileId: string | number;
}

function normalizeTemplate(row: Record<string, any>): AdminTemplateRow {
  const imageUrl = row.imageUrl || row.image_url || "";

  return {
    id: row.id,
    fileId: row.fileId || row.file_id,
    name: row.name || "",
    status: (row.status || "ACTIVE") as TemplateStatus,
    tags: Array.isArray(row.tags) ? row.tags : [],
    note: row.note || "",
    imageUrl: resolveFileUrl(imageUrl),
    createdAt: row.createdAt || row.created_at,
  };
}

export const adminTemplateService = {
  async list(params?: AdminTemplateListParams) {
    const response = await httpClient.get<ApiEnvelope<Record<string, any>[]>>(
      "/admin/templates",
      { params },
    );
    return {
      items: (response.data.data || []).map(normalizeTemplate),
      meta: (response.data.meta || {}) as ListMeta,
    };
  },
  async create(payload: CreateAdminTemplatePayload) {
    const response = await httpClient.post<ApiEnvelope<Record<string, any>>>(
      "/admin/templates",
      payload,
    );
    return normalizeTemplate(response.data.data || {});
  },
  async updateStatus(id: number | string, status: TemplateStatus) {
    const response = await httpClient.patch<ApiEnvelope<Record<string, any>>>(
      `/admin/templates/${id}/status`,
      { status },
    );
    return normalizeTemplate(response.data.data || {});
  },
  async remove(id: number | string) {
    const response = await httpClient.delete<ApiEnvelope<null>>(
      `/admin/templates/${id}`,
    );
    return response.data.data;
  },
};
