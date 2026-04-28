import type {
  MenuItem,
  SelectOption,
  TableColumn,
  TemplateRow,
} from "@/types/designer";

export const WIZARD_STEPS = [
  { title: "Chọn ảnh" },
  { title: "Thiết kế" },
  { title: "Xác nhận ảnh" },
  { title: "Thông tin" },
] as const;

export const TEMPLATE_OPTIONS: SelectOption<"flat" | "puff" | "satin">[] = [
  { label: "Flat stitch", value: "flat" },
  { label: "3D puff", value: "puff" },
  { label: "Satin", value: "satin" },
];

export const MENU_ITEMS: MenuItem[] = [
  { key: "duplicate", label: "Nhân bản template", meta: "Ctrl+D" },
  { key: "archive", label: "Lưu vào template", meta: "Save" },
  { key: "reset", label: "Reset UI demo", meta: "Clear" },
];

export const TABLE_COLUMNS: TableColumn<
  "name" | "status" | "tags" | "actions"
>[] = [
  { key: "name", label: "Tên" },
  { key: "status", label: "Trạng thái" },
  { key: "tags", label: "Tags" },
  { key: "actions", label: "Hành động" },
];

export const TEMPLATE_ROWS: TemplateRow[] = [
  {
    id: 1,
    name: "Classic Varsity",
    status: "ACTIVE",
    tags: ["cap", "satin"],
    note: "Font varsity, outline 2px.",
  },
  {
    id: 2,
    name: "Street Puff",
    status: "INACTIVE",
    tags: ["3d", "hoodie"],
    note: "Dùng cho mockup hoodie streetwear.",
  },
  {
    id: 3,
    name: "Minimal Mono",
    status: "ACTIVE",
    tags: ["mono", "logo"],
    note: "Tối ưu logo nhỏ trên ngực trái.",
  },
  {
    id: 4,
    name: "Script Premium",
    status: "INACTIVE",
    tags: ["script", "gold"],
    note: "Template script kèm metallic thread.",
  },
  {
    id: 5,
    name: "Team Patch",
    status: "INACTIVE",
    tags: ["patch", "team"],
    note: "Ứng dụng cho áo CLB và patch rời.",
  },
  {
    id: 6,
    name: "Kids Soft",
    status: "ACTIVE",
    tags: ["kids", "soft"],
    note: "Bo tròn và mật độ mũi thưa hơn.",
  },
];
