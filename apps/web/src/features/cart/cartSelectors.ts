import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "../../store";
import type { ReduxCartItem as CartItem } from "../../types/cart";

// Basic selectors
export const selectCartItems = (state: RootState) => state.cart.items;
export const selectCartCustomerId = (state: RootState) =>
  state.cart.customer_id;
export const selectCartWarehouseId = (state: RootState) =>
  state.cart.warehouse_id;
export const selectCartCashRegisterId = (state: RootState) =>
  state.cart.cash_register_id;
export const selectCartDiscount = (state: RootState) => state.cart.discount;
export const selectCartTax = (state: RootState) => state.cart.tax;
export const selectCartPayment = (state: RootState) => state.cart.payment;
export const selectCartSummary = (state: RootState) => state.cart.summary;
export const selectCartStatus = (state: RootState) => state.cart.status;
export const selectCartError = (state: RootState) => state.cart.error;
export const selectCartNotes = (state: RootState) => state.cart.notes;
export const selectCartReferenceNumber = (state: RootState) =>
  state.cart.reference_number;
export const selectCartHeldAt = (state: RootState) => state.cart.held_at;

// Memoized selectors

// Total items count (sum of all quantities)
export const selectCartItemsCount = createSelector([selectCartItems], (items) =>
  items.reduce((count, item) => count + item.quantity, 0),
);

// Unique items count (number of different products)
export const selectCartUniqueItemsCount = createSelector(
  [selectCartItems],
  (items) => items.length,
);

// Check if cart is empty
export const selectIsCartEmpty = createSelector(
  [selectCartItems],
  (items) => items.length === 0,
);

// Check if cart is held
export const selectIsCartHeld = createSelector([selectCartHeldAt], (heldAt) =>
  Boolean(heldAt),
);

// Check if cart is ready for checkout
export const selectIsCartReadyForCheckout = createSelector(
  [selectCartItems, selectCartWarehouseId, selectCartCashRegisterId],
  (items, warehouseId, cashRegisterId) =>
    items.length > 0 && Boolean(warehouseId) && Boolean(cashRegisterId),
);

// Get cart item by product id
export const selectCartItemByProductId = createSelector(
  [selectCartItems, (_: RootState, productId: number) => productId],
  (items, productId) => items.find((item) => item.id === productId),
);

// Get items grouped by warehouse
export const selectCartItemsByWarehouse = createSelector(
  [selectCartItems],
  (items) => {
    const grouped = items.reduce(
      (acc, item) => {
        if (!acc[item.warehouse_id]) {
          acc[item.warehouse_id] = [];
        }
        acc[item.warehouse_id].push(item);
        return acc;
      },
      {} as Record<number, CartItem[]>,
    );
    return grouped;
  },
);

// Calculate total quantity per item
export const selectCartItemQuantities = createSelector(
  [selectCartItems],
  (items) =>
    items.reduce(
      (acc, item) => {
        acc[item.id] = item.quantity;
        return acc;
      },
      {} as Record<number, number>,
    ),
);

// Check if payment is sufficient
export const selectIsPaymentSufficient = createSelector(
  [selectCartSummary],
  (summary) => summary.paid_amount >= summary.total,
);

// Calculate change due
export const selectChangeDue = createSelector([selectCartSummary], (summary) =>
  Math.max(0, summary.paid_amount - summary.total),
);

// Calculate balance due
export const selectBalanceDue = createSelector([selectCartSummary], (summary) =>
  Math.max(0, summary.total - summary.paid_amount),
);

// Get discount display text
export const selectDiscountDisplayText = createSelector(
  [selectCartDiscount],
  (discount) => {
    if (discount.value === 0) return "No discount";
    if (discount.type === "percentage") {
      return `${discount.value}% discount`;
    }
    return `$${discount.value.toFixed(2)} discount`;
  },
);

// Get tax display text
export const selectTaxDisplayText = createSelector([selectCartTax], (tax) => {
  if (tax.percentage === 0) return "No tax";
  return `${tax.percentage}% tax`;
});

// Combined cart state for easy access
export const selectCartState = createSelector(
  [
    selectCartItems,
    selectCartSummary,
    selectCartStatus,
    selectCartWarehouseId,
    selectCartCashRegisterId,
    selectCartCustomerId,
    selectIsCartEmpty,
    selectIsCartHeld,
    selectIsCartReadyForCheckout,
  ],
  (
    items,
    summary,
    status,
    warehouseId,
    cashRegisterId,
    customerId,
    isEmpty,
    isHeld,
    isReady,
  ) => ({
    items,
    summary,
    status,
    warehouseId,
    cashRegisterId,
    customerId,
    isEmpty,
    isHeld,
    isReady,
  }),
);

// Cart statistics
export const selectCartStatistics = createSelector(
  [selectCartItems, selectCartSummary],
  (items, summary) => ({
    totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
    uniqueItems: items.length,
    subtotal: summary.subtotal,
    totalDiscount: summary.total_discount,
    totalTax: summary.total_tax,
    total: summary.total,
    averageItemPrice: items.length > 0 ? summary.subtotal / items.length : 0,
  }),
);
