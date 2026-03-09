import type * as fabric from 'fabric'
import type { SelectOption } from '@/types/designer'

export type IconKey = 'heart' | 'star' | 'flower' | 'smile' | 'crown'
export type EditorTab = 'text' | 'style' | 'actions'
export type CanvasBackgroundFit = 'contain' | 'cover'

export type TaggedObject = fabric.FabricObject & { dataType?: 'text' | 'icon' }

export type IconOption = {
  key: IconKey
  label: string
  svg: string
}

export type ActiveTextObject = TaggedObject & {
  fontFamily?: string
  fontSize?: number
  fill?: string
  set: (payload: { fontFamily?: string; fontSize?: number; fill?: string }) => void
}

export type SvgPart = {
  fill?: string
  set: (payload: { fill: string }) => void
}

export type ActiveIconObject = TaggedObject & {
  _objects?: SvgPart[]
  fill?: string
}

export type CanvasEditorConfig = {
  maxTextChars: number
  maxIcons: number
  bgFit: CanvasBackgroundFit
}

export type CanvasEditorState = {
  textInput: string
  fontFamily: SelectOption['value']
  fontSize: number
  fillColor: string
  activeTab: EditorTab
  iconPickerOpen: boolean
}
