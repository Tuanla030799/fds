import { env } from "@/config/env";

const ABSOLUTE_URL_PATTERN = /^(?:[a-z][a-z\d+\-.]*:)?\/\//i;

export function resolveFileUrl(url?: string | null) {
  const rawUrl = url?.trim();

  if (!rawUrl) return "";
  if (
    ABSOLUTE_URL_PATTERN.test(rawUrl) ||
    rawUrl.startsWith("data:") ||
    rawUrl.startsWith("blob:")
  ) {
    return rawUrl;
  }

  const baseUrl = env.fileBaseUrl.replace(/\/+$/, "");
  if (!baseUrl) return rawUrl;

  return `${baseUrl}/${rawUrl.replace(/^\/+/, "")}`;
}
