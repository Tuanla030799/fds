export type WizardStep = 0 | 1 | 2 | 3;

export type NoticeState<
  T extends string = "info" | "success" | "warning" | "error",
> = {
  type: T;
  text: string;
} | null;

export type PresetStatus = "active" | "draft" | "archived";

export type PresetRow = {
  id: number;
  name: string;
  status: PresetStatus;
  tags: string[];
  note: string;
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
