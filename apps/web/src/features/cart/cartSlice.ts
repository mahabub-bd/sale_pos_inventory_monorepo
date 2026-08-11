import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type {
  AddToCartPayload,
  ApplyCartDiscountPayload as ApplyDiscountPayload,
  ApplyCartTaxPayload as ApplyTaxPayload,
  ReduxCartDiscount as CartDiscount,
  ReduxCartItem as CartItem,
  ReduxCartState as CartState,
  ReduxCartSummary as CartSummary,
  ReduxCartTax as CartTax,
  SetCartCashRegisterPayload as SetCashRegisterPayload,
  SetCartCustomerPayload as SetCustomerPayload,
  SetCartPaymentPayload as SetPaymentPayload,
  SetCartWarehousePayload as SetWarehousePayload,
  UpdateCartItemPayload,
} from "../../types/cart";

const initialState: CartState = {
  items: [],
  customer_id: null,
  warehouse_id: null,
  cash_register_id: null,
  discount: {
    type: "fixed",
    value: 0,
    amount: 0,
  },
  tax: {
    percentage: 0,
    amount: 0,
  },
  payment: null,
  summary: {
    subtotal: 0,
    total_discount: 0,
    total_tax: 0,
    total: 0,
    paid_amount: 0,
    change_amount: 0,
    balance_due: 0,
  },
  status: "idle",
  error: null,
  notes: "",
  reference_number: "",
};

// Helper function to calculate line total
const calculateLineTotal = (
  unitPrice: number,
  quantity: number,
  discount: number,
  tax: number,
): number => {
  const subtotal = unitPrice * quantity;
  const discountAmount = (subtotal * discount) / 100;
  const afterDiscount = subtotal - discountAmount;
  const taxAmount = (afterDiscount * tax) / 100;
  return afterDiscount + taxAmount;
};

// Helper function to calculate cart summary
const calculateSummary = (
  items: CartItem[],
  discount: CartDiscount,
  tax: CartTax,
): CartSummary => {
  const subtotal = items.reduce(
    (sum, item) => sum + item.unit_price * item.quantity,
    0,
  );
  const totalItemDiscount = items.reduce(
    (sum, item) => sum + item.discount * item.quantity,
    0,
  );

  let totalDiscount = totalItemDiscount;
  if (discount.type === "percentage") {
    totalDiscount += (subtotal * discount.value) / 100;
  } else {
    totalDiscount += discount.value;
  }

  const afterDiscount = subtotal - totalDiscount;
  const taxAmount = (afterDiscount * tax.percentage) / 100;
  const total = afterDiscount + taxAmount;

  return {
    subtotal,
    total_discount: totalDiscount,
    total_tax: taxAmount,
    total,
    paid_amount: 0,
    change_amount: 0,
    balance_due: total,
  };
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    // Add item to cart or update quantity if exists
    addToCart: (state, action: PayloadAction<AddToCartPayload>) => {
      const { product, quantity, warehouse_id } = action.payload;

      // Set warehouse if not set
      if (!state.warehouse_id) {
        state.warehouse_id = warehouse_id;
      }

      const existingItemIndex = state.items.findIndex(
        (item) => item.id === product.id,
      );

      if (existingItemIndex >= 0) {
        // Update quantity if item exists
        state.items[existingItemIndex].quantity += quantity;
        // Recalculate line total
        state.items[existingItemIndex].line_total = calculateLineTotal(
          state.items[existingItemIndex].unit_price,
          state.items[existingItemIndex].quantity,
          state.items[existingItemIndex].discount,
          state.items[existingItemIndex].tax,
        );
      } else {
        // Add new item
        const unitPrice = product.discount_price || product.selling_price;
        const newItem: CartItem = {
          id: product.id,
          name: product.name,
          sku: product.sku,
          barcode: product.barcode,
          quantity,
          unit_price: unitPrice,
          discount_price: product.discount_price,
          discount: 0,
          tax: 0,
          line_total: unitPrice * quantity,
          warehouse_id,
          product,
        };
        state.items.push(newItem);
      }

      // Recalculate summary
      state.summary = calculateSummary(state.items, state.discount, state.tax);
    },

    // Remove item from cart
    removeFromCart: (state, action: PayloadAction<number>) => {
      const productId = action.payload;
      state.items = state.items.filter((item) => item.id !== productId);
      state.summary = calculateSummary(state.items, state.discount, state.tax);
    },

    // Update item quantity
    updateCartItem: (state, action: PayloadAction<UpdateCartItemPayload>) => {
      const { product_id, quantity } = action.payload;
      const item = state.items.find((item) => item.id === product_id);

      if (item) {
        if (quantity <= 0) {
          // Remove item if quantity is 0 or negative
          state.items = state.items.filter((i) => i.id !== product_id);
        } else {
          item.quantity = quantity;
          item.line_total = calculateLineTotal(
            item.unit_price,
            quantity,
            item.discount,
            item.tax,
          );
        }
        state.summary = calculateSummary(
          state.items,
          state.discount,
          state.tax,
        );
      }
    },

    // Apply discount to entire cart
    applyDiscount: (state, action: PayloadAction<ApplyDiscountPayload>) => {
      const { type, value } = action.payload;
      state.discount.type = type;
      state.discount.value = value;
      state.summary = calculateSummary(state.items, state.discount, state.tax);
    },

    // Remove discount
    removeDiscount: (state) => {
      state.discount = {
        type: "fixed",
        value: 0,
        amount: 0,
      };
      state.summary = calculateSummary(state.items, state.discount, state.tax);
    },

    // Apply tax
    applyTax: (state, action: PayloadAction<ApplyTaxPayload>) => {
      const { percentage } = action.payload;
      state.tax.percentage = percentage;
      state.summary = calculateSummary(state.items, state.discount, state.tax);
    },

    // Remove tax
    removeTax: (state) => {
      state.tax = {
        percentage: 0,
        amount: 0,
      };
      state.summary = calculateSummary(state.items, state.discount, state.tax);
    },

    // Set customer
    setCustomer: (state, action: PayloadAction<SetCustomerPayload>) => {
      state.customer_id = action.payload.customer_id;
    },

    // Remove customer
    removeCustomer: (state) => {
      state.customer_id = null;
    },

    // Set warehouse
    setWarehouse: (state, action: PayloadAction<SetWarehousePayload>) => {
      state.warehouse_id = action.payload.warehouse_id;
    },

    // Set cash register
    setCashRegister: (state, action: PayloadAction<SetCashRegisterPayload>) => {
      state.cash_register_id = action.payload.cash_register_id;
    },

    // Set payment method and amount
    setPayment: (state, action: PayloadAction<SetPaymentPayload>) => {
      const { method, account_code, paid_amount, reference } = action.payload;
      state.payment = {
        method,
        account_code,
        paid_amount,
        reference,
      };

      // Update summary with payment info
      state.summary.paid_amount = paid_amount;
      state.summary.change_amount = paid_amount - state.summary.total;
      state.summary.balance_due = Math.max(
        0,
        state.summary.total - paid_amount,
      );
    },

    // Clear payment
    clearPayment: (state) => {
      state.payment = null;
      state.summary.paid_amount = 0;
      state.summary.change_amount = 0;
      state.summary.balance_due = state.summary.total;
    },

    // Set notes
    setNotes: (state, action: PayloadAction<string>) => {
      state.notes = action.payload;
    },

    // Set reference number
    setReferenceNumber: (state, action: PayloadAction<string>) => {
      state.reference_number = action.payload;
    },

    // Clear cart
    clearCart: (state) => {
      return {
        ...initialState,
        warehouse_id: state.warehouse_id,
        cash_register_id: state.cash_register_id,
      };
    },

    // Hold cart (save with timestamp)
    holdCart: (state) => {
      state.held_at = new Date().toISOString();
      state.status = "idle";
    },

    // Release held cart
    releaseCart: (state) => {
      state.held_at = undefined;
    },

    // Set cart status
    setStatus: (state, action: PayloadAction<CartState["status"]>) => {
      state.status = action.payload;
    },

    // Set error
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      if (action.payload) {
        state.status = "error";
      }
    },

    // Restore cart from storage
    restoreCart: (_state, action: PayloadAction<CartState>) => {
      return action.payload;
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateCartItem,
  applyDiscount,
  removeDiscount,
  applyTax,
  removeTax,
  setCustomer,
  removeCustomer,
  setWarehouse,
  setCashRegister,
  setPayment,
  clearPayment,
  setNotes,
  setReferenceNumber,
  clearCart,
  holdCart,
  releaseCart,
  setStatus,
  setError,
  restoreCart,
} = cartSlice.actions;

export default cartSlice.reducer;
