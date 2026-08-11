// Redux Cart Types for State Management

export type ReduxCartDiscountType = "fixed" | "percentage";

export type ReduxCartPaymentMethod =
  | "cash"
  | "card"
  | "bank_transfer"
  | "mobile_payment"
  | "check"
  | "credit";

export interface ReduxCartItem {
  id: number; // product id
  name: string;
  sku: string;
  barcode: string;
  quantity: number;
  unit_price: number;
  discount_price: number;
  discount: number;
  tax: number;
  line_total: number;
  warehouse_id: number;
  product: {
    id: number;
    name: string;
    sku: string;
    barcode: string;
    description?: string;
    selling_price: number;
    purchase_price: number;
    discount_price: number;
    status: boolean;
  };
}

export interface ReduxCartDiscount {
  type: ReduxCartDiscountType;
  value: number;
  amount: number; // calculated discount amount
}

export interface ReduxCartTax {
  percentage: number;
  amount: number;
}

export interface ReduxCartPayment {
  method: ReduxCartPaymentMethod;
  account_code: string;
  paid_amount: number;
  reference?: string;
}

export interface ReduxCartSummary {
  subtotal: number;
  total_discount: number;
  total_tax: number;
  total: number;
  paid_amount: number;
  change_amount: number;
  balance_due: number;
}

export type ReduxCartStatus = "idle" | "processing" | "success" | "error";

export interface ReduxCartState {
  items: ReduxCartItem[];
  customer_id: number | null;
  warehouse_id: number | null;
  cash_register_id: number | null;
  discount: ReduxCartDiscount;
  tax: ReduxCartTax;
  payment: ReduxCartPayment | null;
  summary: ReduxCartSummary;
  status: ReduxCartStatus;
  error: string | null;
  notes?: string;
  reference_number?: string;
  held_at?: string; // ISO date string if cart is held
}

export interface AddToCartPayload {
  product: ReduxCartItem["product"];
  quantity: number;
  warehouse_id: number;
}

export interface UpdateCartItemPayload {
  product_id: number;
  quantity: number;
}

export interface ApplyCartDiscountPayload {
  type: ReduxCartDiscountType;
  value: number;
}

export interface ApplyCartTaxPayload {
  percentage: number;
}

export interface SetCartPaymentPayload {
  method: ReduxCartPaymentMethod;
  account_code: string;
  paid_amount: number;
  reference?: string;
}

export interface SetCartCustomerPayload {
  customer_id: number;
}

export interface SetCartWarehousePayload {
  warehouse_id: number;
}

export interface SetCartCashRegisterPayload {
  cash_register_id: number;
}
