import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";

import { apiSlice } from "./features/apiSlice";
import authReducer from "./features/auth/authSlice";
import cartReducer from "./features/cart/cartSlice";
import dashboardReducer from "./features/dashboard/dashboardSlice";

// Custom storage that falls back to memory storage if localStorage is not available
const createStorage = () => {
  const getStorage = () => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        return window.localStorage;
      }
      return null;
    } catch {
      return null;
    }
  };

  const storage = getStorage();

  return {
    getItem: (key: string) => {
      try {
        return storage?.getItem(key) ?? Promise.resolve(null);
      } catch {
        return Promise.resolve(null);
      }
    },
    setItem: (key: string, value: string) => {
      try {
        return storage?.setItem(key, value) ?? Promise.resolve();
      } catch {
        return Promise.resolve();
      }
    },
    removeItem: (key: string) => {
      try {
        return storage?.removeItem(key) ?? Promise.resolve();
      } catch {
        return Promise.resolve();
      }
    },
  };
};

const storage = createStorage();

const rootReducer = combineReducers({
  auth: authReducer,
  cart: cartReducer,
  dashboard: dashboardReducer,
  [apiSlice.reducerPath]: apiSlice.reducer,
});

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth", "cart", "dashboard"],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(apiSlice.middleware),
  devTools: true,
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
