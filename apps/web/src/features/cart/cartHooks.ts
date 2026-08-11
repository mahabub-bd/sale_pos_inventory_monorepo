import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store";
import type {
  AddToCartPayload,
  ApplyCartDiscountPayload,
  ApplyCartTaxPayload,
  ReduxCartState as CartState,
  SetCartCashRegisterPayload,
  SetCartCustomerPayload,
  SetCartPaymentPayload,
  SetCartWarehousePayload,
  UpdateCartItemPayload,
} from "../../types/cart";
import {
  selectBalanceDue,
  selectCartCashRegisterId,
  selectCartCustomerId,
  selectCartDiscount,
  selectCartError,
  selectCartItems,
  selectCartItemsCount,
  selectCartNotes,
  selectCartPayment,
  selectCartReferenceNumber,
  selectCartState,
  selectCartStatistics,
  selectCartStatus,
  selectCartSummary,
  selectCartTax,
  selectCartWarehouseId,
  selectChangeDue,
  selectIsCartEmpty,
  selectIsCartHeld,
  selectIsCartReadyForCheckout,
  selectIsPaymentSufficient,
} from "./cartSelectors";
import {
  addToCart,
  applyDiscount,
  applyTax,
  clearCart,
  clearPayment,
  holdCart,
  releaseCart,
  removeCustomer,
  removeDiscount,
  removeFromCart,
  removeTax,
  setCashRegister,
  setCustomer,
  setError,
  setNotes,
  setPayment,
  setReferenceNumber,
  setStatus,
  setWarehouse,
  updateCartItem,
} from "./cartSlice";

// Typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector = <T>(selector: (state: RootState) => T): T =>
  useSelector(selector);

// Cart hooks
export const useCart = () => {
  const dispatch = useAppDispatch();

  return {
    // State
    items: useAppSelector(selectCartItems),
    summary: useAppSelector(selectCartSummary),
    customer: useAppSelector(selectCartCustomerId),
    warehouse: useAppSelector(selectCartWarehouseId),
    cashRegister: useAppSelector(selectCartCashRegisterId),
    discount: useAppSelector(selectCartDiscount),
    tax: useAppSelector(selectCartTax),
    payment: useAppSelector(selectCartPayment),
    status: useAppSelector(selectCartStatus),
    error: useAppSelector(selectCartError),
    notes: useAppSelector(selectCartNotes),
    referenceNumber: useAppSelector(selectCartReferenceNumber),

    // Computed values
    isEmpty: useAppSelector(selectIsCartEmpty),
    isHeld: useAppSelector(selectIsCartHeld),
    isReady: useAppSelector(selectIsCartReadyForCheckout),
    itemsCount: useAppSelector(selectCartItemsCount),
    statistics: useAppSelector(selectCartStatistics),
    isPaymentSufficient: useAppSelector(selectIsPaymentSufficient),
    changeDue: useAppSelector(selectChangeDue),
    balanceDue: useAppSelector(selectBalanceDue),

    // Actions
    addToCart: (payload: AddToCartPayload) => dispatch(addToCart(payload)),
    removeFromCart: (productId: number) => dispatch(removeFromCart(productId)),
    updateCartItem: (payload: UpdateCartItemPayload) =>
      dispatch(updateCartItem(payload)),
    applyDiscount: (payload: ApplyCartDiscountPayload) =>
      dispatch(applyDiscount(payload)),
    removeDiscount: () => dispatch(removeDiscount()),
    applyTax: (payload: ApplyCartTaxPayload) => dispatch(applyTax(payload)),
    removeTax: () => dispatch(removeTax()),
    setCustomer: (payload: SetCartCustomerPayload) =>
      dispatch(setCustomer(payload)),
    removeCustomer: () => dispatch(removeCustomer()),
    setWarehouse: (payload: SetCartWarehousePayload) =>
      dispatch(setWarehouse(payload)),
    setCashRegister: (payload: SetCartCashRegisterPayload) =>
      dispatch(setCashRegister(payload)),
    setPayment: (payload: SetCartPaymentPayload) => dispatch(setPayment(payload)),
    clearPayment: () => dispatch(clearPayment()),
    setNotes: (notes: string) => dispatch(setNotes(notes)),
    setReferenceNumber: (reference: string) =>
      dispatch(setReferenceNumber(reference)),
    clearCart: () => dispatch(clearCart()),
    holdCart: () => dispatch(holdCart()),
    releaseCart: () => dispatch(releaseCart()),
    setStatus: (status: CartState["status"]) => dispatch(setStatus(status)),
    setError: (error: string | null) => dispatch(setError(error)),
  };
};

// Simplified hook for just cart items
export const useCartItems = () => {
  return useAppSelector(selectCartItems);
};

// Simplified hook for cart summary
export const useCartSummary = () => {
  return useAppSelector(selectCartSummary);
};

// Hook for cart state (combined)
export const useCartState = () => {
  return useAppSelector(selectCartState);
};

// Hook for cart actions only
export const useCartActions = () => {
  const dispatch = useAppDispatch();

  return {
    addToCart: (payload: AddToCartPayload) => dispatch(addToCart(payload)),
    removeFromCart: (productId: number) => dispatch(removeFromCart(productId)),
    updateCartItem: (payload: UpdateCartItemPayload) =>
      dispatch(updateCartItem(payload)),
    applyDiscount: (payload: ApplyCartDiscountPayload) =>
      dispatch(applyDiscount(payload)),
    removeDiscount: () => dispatch(removeDiscount()),
    applyTax: (payload: ApplyCartTaxPayload) => dispatch(applyTax(payload)),
    removeTax: () => dispatch(removeTax()),
    setCustomer: (payload: SetCartCustomerPayload) =>
      dispatch(setCustomer(payload)),
    removeCustomer: () => dispatch(removeCustomer()),
    setWarehouse: (payload: SetCartWarehousePayload) =>
      dispatch(setWarehouse(payload)),
    setCashRegister: (payload: SetCartCashRegisterPayload) =>
      dispatch(setCashRegister(payload)),
    setPayment: (payload: SetCartPaymentPayload) => dispatch(setPayment(payload)),
    clearPayment: () => dispatch(clearPayment()),
    setNotes: (notes: string) => dispatch(setNotes(notes)),
    setReferenceNumber: (reference: string) =>
      dispatch(setReferenceNumber(reference)),
    clearCart: () => dispatch(clearCart()),
    holdCart: () => dispatch(holdCart()),
    releaseCart: () => dispatch(releaseCart()),
    setStatus: (status: CartState["status"]) => dispatch(setStatus(status)),
    setError: (error: string | null) => dispatch(setError(error)),
  };
};

// Hook for checking cart readiness
export const useCartReadiness = () => {
  const isEmpty = useAppSelector(selectIsCartEmpty);
  const isReady = useAppSelector(selectIsCartReadyForCheckout);
  const isHeld = useAppSelector(selectIsCartHeld);
  const isPaymentSufficient = useAppSelector(selectIsPaymentSufficient);

  return {
    isEmpty,
    isReady,
    isHeld,
    isPaymentSufficient,
    canCheckout: isReady && !isHeld,
    canCompletePayment: isReady && isPaymentSufficient,
  };
};

// Hook for cart calculations
export const useCartCalculations = () => {
  const summary = useAppSelector(selectCartSummary);
  const statistics = useAppSelector(selectCartStatistics);
  const changeDue = useAppSelector(selectChangeDue);
  const balanceDue = useAppSelector(selectBalanceDue);

  return {
    summary,
    statistics,
    changeDue,
    balanceDue,
  };
};
