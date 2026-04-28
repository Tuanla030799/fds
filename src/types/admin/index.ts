import type { TemplateStatus } from "@/types/designer";

export type AdminRole = "super_admin" | "operator" | "viewer";
export type DesignSubmissionStatus =
  | "pending_confirmation"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled";

export interface AdminProfile {
  id: number | string;
  fullName: string;
  email: string;
  role: AdminRole;
}

export interface AuthTokenPayload {
  accessToken: string;
  refreshToken: string;
  admin: AdminProfile;
}

export interface DesignSubmissionRow {
  id: number | string;
  fullName: string;
  address: string;
  phone: string;
  note?: string;
  imageUrl: string;
  status: DesignSubmissionStatus;
  createdAt?: string;
}

export interface ListMeta {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AdminTemplateRow {
  id: number | string;
  fileId?: number | string;
  name: string;
  status: TemplateStatus;
  tags: string[];
  note: string;
  imageUrl?: string;
  createdAt?: string;
}
