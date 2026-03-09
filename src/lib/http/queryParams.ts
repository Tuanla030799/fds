import type { QueryParamPrimitive, QueryParams } from '@/types/http'

function normalizeValue(value: Exclude<QueryParamPrimitive, undefined>): string {
  if (value instanceof Date) return value.toISOString()
  if (typeof value === 'boolean') return value ? 'true' : 'false'
  if (value === null) return ''
  return String(value)
}

export function buildSearchParams(params?: QueryParams): URLSearchParams {
  const searchParams = new URLSearchParams()

  if (!params) return searchParams

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined) return

    if (Array.isArray(value)) {
      value
        .filter((item): item is Exclude<QueryParamPrimitive, undefined> => item !== undefined)
        .forEach((item) => {
          searchParams.append(key, normalizeValue(item))
        })
      return
    }

    searchParams.append(key, normalizeValue(value))
  })

  return searchParams
}

export function withQueryParams(url: string, params?: QueryParams) {
  const searchParams = buildSearchParams(params)
  const query = searchParams.toString()

  if (!query) return url
  return `${url}${url.includes('?') ? '&' : '?'}${query}`
}
