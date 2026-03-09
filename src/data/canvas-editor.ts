import type { SelectOption } from '@/types/designer'
import type { EditorTab, IconOption } from '@/types/canvas-editor'

export const CANVAS_BASE_SIZE = {
  width: 1200,
  height: 750,
} as const

export const CANVAS_ICONS: IconOption[] = [
  { key: 'heart', label: 'Heart', svg: '<svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24"><path d="M12 21s-7-4.6-9.2-8.5C.7 8.7 3 6 6.2 6c1.7 0 3.1.9 3.8 2 .7-1.1 2.1-2 3.8-2C17 6 19.3 8.7 21.2 12.5 19 16.4 12 21 12 21z"/></svg>' },
  { key: 'star', label: 'Star', svg: '<svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24"><path d="M12 17.3l-6.2 3.7 1.7-7.1L2 9.2l7.3-.6L12 2l2.7 6.6 7.3.6-5.5 4.7 1.7 7.1z"/></svg>' },
  { key: 'flower', label: 'Flower', svg: '<svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24"><path d="M12 22c-2 0-3-1.5-3-3 0-.8.2-1.6.6-2.2-1 .2-2.1 0-2.9-.6-1.4-1-1.7-2.9-.7-4.3.5-.7 1.2-1.1 2-1.3-.6-.7-1-1.6-1-2.5 0-1.8 1.5-3.3 3.3-3.3.8 0 1.6.3 2.2.8.6-.5 1.4-.8 2.2-.8 1.8 0 3.3 1.5 3.3 3.3 0 .9-.4 1.8-1 2.5.8.2 1.5.6 2 1.3 1 1.4.7 3.3-.7 4.3-.8.6-1.9.8-2.9.6.4.6.6 1.4.6 2.2 0 1.5-1 3-3 3zm0-10a2 2 0 100 4 2 2 0 000-4z"/></svg>' },
  { key: 'smile', label: 'Smile', svg: '<svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24"><path d="M12 22C6.5 22 2 17.5 2 12S6.5 2 12 2s10 4.5 10 10-4.5 10-10 10zm-4-8c.7 2 2.2 3 4 3s3.3-1 4-3h-8zm1-3a1 1 0 100-2 1 1 0 000 2zm6 0a1 1 0 100-2 1 1 0 000 2z"/></svg>' },
  { key: 'crown', label: 'Crown', svg: '<svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24"><path d="M5 16l-2-9 5 4 4-7 4 7 5-4-2 9H5zm0 2h14v2H5v-2z"/></svg>' },
]

export const FONT_OPTIONS: SelectOption[] = [
  { label: 'Arial', value: 'Arial' },
  { label: 'Times New Roman', value: 'Times New Roman' },
  { label: 'Courier New', value: 'Courier New' },
]

export const CANVAS_TAB_ITEMS: ReadonlyArray<{ key: EditorTab; label: string }> = [
  { key: 'text', label: 'Text' },
  { key: 'style', label: 'Style' },
  { key: 'actions', label: 'Actions' },
] as const
