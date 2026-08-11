export interface BaseEntity {
  id: number;
  created_at: string;
  updated_at: string;
}

export interface BaseEntityOptionalUpdate {
  id: number;
  created_at: string;
  updated_at?: string;
}

export interface BaseEntityWithStatus extends BaseEntity {
  status: boolean;
}

export interface BaseEntityWithCode {
  code: string;
  name: string;
}

export interface TimestampFields {
  created_at: string;
  updated_at: string;
}

export interface SoftDeletable {
  deleted_at?: string | null;
}

export type PaymentMethod = "cash" | "bank";

export enum PaymentTerm {
  IMMEDIATE = "immediate",
  NET_7 = "net_7",
  NET_15 = "net_15",
  NET_30 = "net_30",
  NET_45 = "net_45",
  NET_60 = "net_60",
  NET_90 = "net_90",
  CUSTOM = "custom",
}

export const PaymentTermDescription = {
  [PaymentTerm.IMMEDIATE]: "Payment Due Immediately",
  [PaymentTerm.NET_7]: "Payment Due in 7 Days",
  [PaymentTerm.NET_15]: "Payment Due in 15 Days",
  [PaymentTerm.NET_30]: "Payment Due in 30 Days",
  [PaymentTerm.NET_45]: "Payment Due in 45 Days",
  [PaymentTerm.NET_60]: "Payment Due in 60 Days",
  [PaymentTerm.NET_90]: "Payment Due in 90 Days",
  [PaymentTerm.CUSTOM]: "Custom Payment Terms",
};

export type TransactionType =
  | "sale"
  | "cash_in"
  | "cash_out"
  | "opening_balance"
  | "closing_balance"
  | "adjustment";

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface DateRangeParams {
  start_date: string;
  end_date: string;
}

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
  meta?: PaginationMeta;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ListResponse<T> {
  data: T[];
  meta?: PaginationMeta;
}

export type CreatePayload<T> = Omit<T, "id" | "created_at" | "updated_at">;

export type UpdatePayload<T> = Partial<CreatePayload<T>> & { id: number };

export interface Attachment extends TimestampFields {
  id: string | number;
  file_name: string;
  url: string;
  mime_type?: string;
  size?: string | number;
  storage_type?: string;
  uploaded_by?: string | number;
}

export interface Brand {
  id: string;
  name: string;
  description?: string | null;
  logo_attachment?: Attachment | null;
  created_at?: string;
  updated_at?: string;
}

export interface Address {
  contact_name?: string;
  phone?: string;
  street?: string;
  city?: string;
  country?: string;
  postal_code?: string;
}

// User & Auth
export * from "./role";
export * from "./user";

// Branch & Warehouse
export * from "./branch";

// HRM
export * from "./attendance";
export * from "./hrm";
export * from "./leave";
export * from "./payroll";

// Product Management
export * from "./manufacturer";
export * from "./product";

// Inventory
export * from "./inventory";

// Sales & Customers
export * from "./customer";

export * from "./quotation";
export * from "./sales";

// Purchase & Suppliers
export * from "./purchase";
export * from "./purchase-return";
export * from "./supplier";

// Production
export * from "./production";
export * from "./production-recipe";

// Financial
export * from "./accounts";
export * from "./cashregister";
export * from "./expenses";
export * from "./payment";

// POS
export * from "./cart";
export * from "./pos";
export * from "./posPage";

// Reports & Analytics
export * from "./analytics";
export * from "./report";

// Settings & System
export * from "./backup";
export * from "./settings";
