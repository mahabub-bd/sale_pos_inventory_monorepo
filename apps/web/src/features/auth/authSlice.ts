import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Warehouse } from "../../types/branch";
import { User } from "../../types/user";

interface AuthState {
  user: User | null;
  token: string | null;
  permissions: string[];
  expiresAt: number | null;
  defaultWarehouse: Warehouse | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  permissions: [],
  expiresAt: null,
  defaultWarehouse: null,
};

const getDefaultWarehouse = (user: User | null): Warehouse | null => {
  return user?.branches?.find((branch) => branch.default_warehouse)
    ?.default_warehouse ?? null;
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{
        token: string;
        user: User;
        permissions: string[];
        expiresAt: number;
      }>
    ) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.permissions = action.payload.permissions;
      state.expiresAt = action.payload.expiresAt;
      state.defaultWarehouse = getDefaultWarehouse(action.payload.user);
    },

    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        state.defaultWarehouse = getDefaultWarehouse(state.user);
      }
    },

    logout: (state) => {
      state.token = null;
      state.user = null;
      state.permissions = [];
      state.expiresAt = null;
      state.defaultWarehouse = null;
    },
  },
});

export const { setCredentials, updateUser, logout } = authSlice.actions;
export default authSlice.reducer;
