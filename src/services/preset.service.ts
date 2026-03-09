import { httpClient } from "@/lib/http/httpClient";
import type { PresetRow, PresetStatus } from "@/types/designer";
import type { ApiEnvelope, QueryParams } from "@/types/http";

export interface PresetListParams extends QueryParams {
  page?: number;
  limit?: number;
  keyword?: string;
  status?: PresetStatus;
  tags?: string[];
}

function normalizePresetRow(row: Record<string, any>): PresetRow {
  return {
    id: row.id,
    name: row.name || "Untitled preset",
    status: (row.status || "active") as PresetStatus,
    tags: Array.isArray(row.tags) ? row.tags : [],
    note: row.note || "",
    imageUrl:
      row.imageUrl ||
      row.image_url ||
      row.thumbnailUrl ||
      row.thumbnail_url ||
      "",
  };
}

export const presetService = {
  async list(params?: PresetListParams) {
    const response = await httpClient.get<ApiEnvelope<Record<string, any>[]>>(
      "/presets",
      {
        params,
      },
    );
    return (response.data.data || []).map(normalizePresetRow);
  },
};
