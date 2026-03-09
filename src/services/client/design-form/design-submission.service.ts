import { httpClient } from "@/lib/http/httpClient";
import type { ApiEnvelope } from "@/types/http";

export interface CreateDesignSubmissionPayload {
  fullName: string;
  address: string;
  phone: string;
  note?: string;
  imageFile: File;
}

export interface DesignSubmissionResponse {
  id: string | number;
  imageUrl?: string;
}

export const designSubmissionService = {
  async create(payload: CreateDesignSubmissionPayload) {
    const formData = new FormData();
    formData.append("fullName", payload.fullName);
    formData.append("address", payload.address);
    formData.append("phone", payload.phone);
    formData.append("note", payload.note || "");
    formData.append("image", payload.imageFile);

    const response = await httpClient.post<
      ApiEnvelope<DesignSubmissionResponse>
    >("/design-submissions", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data.data;
  },
};
