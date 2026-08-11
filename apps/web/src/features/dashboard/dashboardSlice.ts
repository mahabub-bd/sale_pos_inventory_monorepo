import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface DashboardState {
  selectedBranchId: number | null;
  dateRange: string;
}

const initialState: DashboardState = {
  selectedBranchId: null,
  dateRange: "this_year",
};

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    setSelectedBranch: (state, action: PayloadAction<number | null>) => {
      state.selectedBranchId = action.payload;
    },

    setDateRange: (state, action: PayloadAction<string>) => {
      state.dateRange = action.payload;
    },

    clearDashboardSettings: (state) => {
      state.selectedBranchId = null;
      state.dateRange = "this_year";
    },
  },
});

export const { setSelectedBranch, setDateRange, clearDashboardSettings } =
  dashboardSlice.actions;

export default dashboardSlice.reducer;
