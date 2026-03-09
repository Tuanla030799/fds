import type { MenuItem, PresetRow, SelectOption, TableColumn } from '@/types/designer'

export const WIZARD_STEPS = [
  { title: 'Chọn ảnh', desc: 'Upload nền' },
  { title: 'Thiết kế', desc: 'Thêm chữ và icon' },
  { title: 'Kết quả', desc: 'Xem PNG xuất ra' },
] as const

export const PRESET_OPTIONS: SelectOption<'flat' | 'puff' | 'satin'>[] = [
  { label: 'Flat stitch', value: 'flat' },
  { label: '3D puff', value: 'puff' },
  { label: 'Satin', value: 'satin' },
]

export const MENU_ITEMS: MenuItem[] = [
  { key: 'duplicate', label: 'Nhân bản preset', meta: 'Ctrl+D' },
  { key: 'archive', label: 'Lưu vào preset', meta: 'Save' },
  { key: 'reset', label: 'Reset UI demo', meta: 'Clear' },
]

export const TABLE_COLUMNS: TableColumn<'name' | 'status' | 'tags' | 'actions'>[] = [
  { key: 'name', label: 'Preset' },
  { key: 'status', label: 'Trạng thái' },
  { key: 'tags', label: 'Tags' },
  { key: 'actions', label: 'Hành động' },
]

export const PRESET_ROWS: PresetRow[] = [
  { id: 1, name: 'Classic Varsity', status: 'active', tags: ['cap', 'satin'], note: 'Font varsity, outline 2px.' },
  { id: 2, name: 'Street Puff', status: 'draft', tags: ['3d', 'hoodie'], note: 'Dùng cho mockup hoodie streetwear.' },
  { id: 3, name: 'Minimal Mono', status: 'active', tags: ['mono', 'logo'], note: 'Tối ưu logo nhỏ trên ngực trái.' },
  { id: 4, name: 'Script Premium', status: 'archived', tags: ['script', 'gold'], note: 'Preset script kèm metallic thread.' },
  { id: 5, name: 'Team Patch', status: 'draft', tags: ['patch', 'team'], note: 'Ứng dụng cho áo CLB và patch rời.' },
  { id: 6, name: 'Kids Soft', status: 'active', tags: ['kids', 'soft'], note: 'Bo tròn và mật độ mũi thưa hơn.' },
]
