export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL?.trim() || '/api',
  apiTimeout: Number(import.meta.env.VITE_API_TIMEOUT || 15000),
  fileBaseUrl: import.meta.env.VITE_FILE_BASE_URL?.trim() || '',
}
