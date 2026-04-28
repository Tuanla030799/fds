import { httpClient } from "@/lib/http/httpClient";
import { resolveFileUrl } from "@/lib/fileUrl";
import type { TemplateRow, TemplateStatus } from "@/types/designer";
import type { ApiEnvelope, QueryParams } from "@/types/http";

export interface TemplateListParams extends QueryParams {
  page?: number;
  limit?: number;
  keyword?: string;
  status?: TemplateStatus;
  tags?: string[];
}

function normalizeTemplateRow(row: Record<string, any>): TemplateRow {
  const imageUrl =
    row.imageUrl || row.image_url || row.thumbnailUrl || row.thumbnail_url || "";

  return {
    id: row.id,
    fileId: row.fileId || row.file_id,
    name: row.name || "Untitled template",
    status: (row.status || "ACTIVE") as TemplateStatus,
    tags: Array.isArray(row.tags) ? row.tags : [],
    note: row.note || "",
    imageUrl: resolveFileUrl(imageUrl),
  };
}

export const templateService = {
  async list(params?: TemplateListParams) {
    const response = await httpClient.get<ApiEnvelope<Record<string, any>[]>>(
      "/templates",
      {
        params,
      },
    );
    return (response.data.data || []).map(normalizeTemplateRow);
  },
};
