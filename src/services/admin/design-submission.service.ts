import { httpClient } from "@/lib/http/httpClient";
import type {
  DesignSubmissionRow,
  DesignSubmissionStatus,
  ListMeta,
} from "@/types/admin";
import type { ApiEnvelope, QueryParams } from "@/types/http";

export interface DesignSubmissionListParams extends QueryParams {
  page?: number;
  limit?: number;
  keyword?: string;
  status?: DesignSubmissionStatus | "";
  sort?: "createdAt" | "fullName" | "status";
  order?: "asc" | "desc";
}

function normalizeRow(row: Record<string, any>): DesignSubmissionRow {
  return {
    id: row.id,
    fullName: row.fullName || row.full_name || "",
    address: row.address || "",
    phone: row.phone || "",
    note: row.note || "",
    imageUrl: row.imageUrl || row.image_url || "",
    status: (row.status || "pending_confirmation") as DesignSubmissionStatus,
    createdAt: row.createdAt || row.created_at,
  };
}

export const adminDesignSubmissionService = {
  async list(params?: DesignSubmissionListParams) {
    const response = await httpClient.get<ApiEnvelope<Record<string, any>[]>>(
      "/admin/design-submissions",
      { params },
    );
    return {
      items: (response.data.data || []).map(normalizeRow),
      meta: (response.data.meta || {}) as ListMeta,
    };
  },
  async updateStatus(id: number | string, status: DesignSubmissionStatus) {
    const response = await httpClient.patch<ApiEnvelope<Record<string, any>>>(
      `/admin/design-submissions/${id}/status`,
      { status },
    );
    return normalizeRow(response.data.data || {});
  },
  async remove(id: number | string) {
    const response = await httpClient.delete<ApiEnvelope<null>>(
      `/admin/design-submissions/${id}`,
    );
    return response.data.data;
  },
};
