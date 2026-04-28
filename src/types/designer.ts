export type WizardStep = 0 | 1 | 2 | 3;

export type NoticeState<
  T extends string = "info" | "success" | "warning" | "error",
> = {
  type: T;
  text: T extends string ? string : never;
} | null;

export type TemplateStatus = "ACTIVE" | "INACTIVE";

export type TemplateRow = {
  id: number | string;
  fileId?: number | string;
  name: string;
  status: TemplateStatus;
  tags: string[];
  note: string;
  imageUrl?: string;
};

export type MenuItem = {
  key: string;
  label: string;
  meta?: string;
};

export type SelectOption<T extends string = string> = {
  label: string;
  value: T;
};

export type TableColumn<T extends string = string> = {
  key: T;
  label: string;
};
