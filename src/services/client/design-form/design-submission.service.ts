import { httpClient } from "@/lib/http/httpClient";
import type { ApiEnvelope } from "@/types/http";

export interface CreateDesignSubmissionPayload {
  fullName: string;
  address: string;
  phone: string;
  note?: string;
  fileId: string | number;
}

export interface DesignSubmissionResponse {
  id: string | number;
  imageUrl?: string;
}

export const designSubmissionService = {
  async create(payload: CreateDesignSubmissionPayload) {
    const response = await httpClient.post<
      ApiEnvelope<DesignSubmissionResponse>
    >("/design-submissions", payload);

    return response.data.data;
  },
};
