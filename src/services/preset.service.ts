import { httpClient } from '@/lib/http/httpClient'
import type { PresetRow, PresetStatus } from '@/types/designer'
import type { ApiEnvelope, QueryParams } from '@/types/http'

export interface PresetListParams extends QueryParams {
  page?: number
  limit?: number
  keyword?: string
  status?: PresetStatus
  tags?: string[]
}

export const presetService = {
  async list(params?: PresetListParams) {
    const response = await httpClient.get<ApiEnvelope<PresetRow[]>>('/presets', {
      params,
    })
    return response.data.data
  },
}
