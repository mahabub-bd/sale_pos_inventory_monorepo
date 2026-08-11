import {
  Activity,
  AlertCircle,
  BarChart3,
  Building2,
  Calendar,
  DollarSign,
  Package,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

import Loading from "@/components/common/Loading";
import StatCard from "@/components/common/stat-card";
import Select from "@/components/form/Select";
import {
  setDateRange as setDateRangeAction,
  setSelectedBranch,
} from "@/features/dashboard/dashboardSlice";
import { useGetDashboardDataQuery } from "@/features/report/reportApi";
import { useBranchOptions } from "@/pages/Reports/components/hooks/useBranchOptions";
import { RootState } from "@/store";

export default function EcommerceMetrics() {
  const dispatch = useDispatch();

  const { user, defaultWarehouse } = useSelector(
    (state: RootState) => state.auth,
  );
  const { selectedBranchId, dateRange } = useSelector(
    (state: RootState) => state.dashboard,
  );

  const fullName = user?.full_name || user?.username || "User";
  const warehouse =
    defaultWarehouse ??
    user?.branches?.find((branch) => branch.default_warehouse)
      ?.default_warehouse;

  const { data, isLoading, isError } = useGetDashboardDataQuery(
    { dateRange, branch_id: selectedBranchId || undefined },
    { refetchOnMountOrArgChange: true },
  );

  const branchOptions = useBranchOptions();

  const handleBranchChange = (value: string) => {
    const branchId = value ? +value : null;
    dispatch(setSelectedBranch(branchId));
  };

  const handleDateRangeChange = (value: string) => {
    dispatch(setDateRangeAction(value));
  };

  if (isLoading) return <Loading message="Loading dashboard..." />;

  if (isError) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
        Failed to load dashboard data
      </div>
    );
  }

  const dashboard = data?.data;
  const today = dashboard?.today;
  const period = dashboard?.period;
  const previous = dashboard?.previousPeriod;
  const inventory = dashboard?.inventory;

  const growth = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const revenueGrowth = growth(period?.revenue || 0, previous?.revenue || 0);
  const salesGrowth = growth(
    period?.salesCount || 0,
    previous?.salesCount || 0,
  );
  const profitGrowth = growth(period?.netProfit || 0, previous?.netProfit || 0);

  // Get period label for display
  const getPeriodLabel = () => {
    const labels: Record<string, string> = {
      this_year: "This Year",
      last_year: "Last Year",
      this_month: "This Month",
      last_month: "Last Month",
      this_week: "This Week",
      last_week: "Last Week",
      today: "Today",
      yesterday: "Yesterday",
    };
    return labels[dateRange] || "Period";
  };

  return (
    <div className="space-y-6">
      {/* HEADER + FILTERS */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome back, <span className="text-blue-600">{fullName}</span>
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Here's what's happening with your business today
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex h-10 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 dark:border-gray-700 dark:bg-gray-800">
            <Package className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {warehouse?.name || "No Warehouse"}
            </span>
          </div>

          <div className="flex h-10 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 dark:border-gray-700 dark:bg-gray-800">
            <Building2 className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            <Select
              value={selectedBranchId?.toString() || "all"}
              onChange={handleBranchChange}
              placeholder="All Branches"
              options={branchOptions}
              className="min-w-28 border-0 bg-transparent p-0 text-sm font-medium dark:!bg-gray-800 dark:!text-gray-200"
            />
          </div>

          <div className="flex h-10 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 dark:border-gray-700 dark:bg-gray-800">
            <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            <Select
              value={dateRange}
              onChange={handleDateRangeChange}
              options={[
                { value: "this_year", label: "This Year" },
                { value: "last_year", label: "Last Year" },
                { value: "this_month", label: "This Month" },
                { value: "last_month", label: "Last Month" },
                { value: "this_week", label: "This Week" },
                { value: "last_week", label: "Last Week" },
                { value: "today", label: "Today" },
                { value: "yesterday", label: "Yesterday" },
              ]}
              className="min-w-28 border-0 bg-transparent p-0 text-sm font-medium dark:!bg-gray-800 dark:!text-gray-200"
            />
          </div>
        </div>
      </div>

      {/* KEY METRICS - HERO CARDS */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={DollarSign}
          title="Total Revenue"
          value={`৳${(period?.revenue || 0).toLocaleString()}`}
          bgColor="green"
          badge={{
            icon: revenueGrowth >= 0 ? TrendingUp : TrendingDown,
            text: `${revenueGrowth >= 0 ? "+" : ""}${revenueGrowth.toFixed(1)}%`,
            color: revenueGrowth >= 0 ? "success" : "danger",
          }}
        />

        <StatCard
          icon={BarChart3}
          title="Net Profit"
          value={`৳${(period?.netProfit || 0).toLocaleString()}`}
          bgColor={(period?.netProfit || 0) >= 0 ? "purple" : "pink"}
          badge={{
            icon: profitGrowth >= 0 ? TrendingUp : TrendingDown,
            text: `${profitGrowth >= 0 ? "+" : ""}${profitGrowth.toFixed(1)}%`,
            color: profitGrowth >= 0 ? "success" : "danger",
          }}
        />

        <StatCard
          icon={ShoppingCart}
          title="Total Sales"
          value={period?.salesCount || 0}
          bgColor="blue"
          badge={{
            icon: salesGrowth >= 0 ? TrendingUp : TrendingDown,
            text: `${salesGrowth >= 0 ? "+" : ""}${salesGrowth.toFixed(1)}%`,
            color: salesGrowth >= 0 ? "success" : "danger",
          }}
        />
      </div>

      {/* TODAY'S PERFORMANCE */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-gray-700 dark:text-gray-300" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Today's Performance
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-4">
          <StatCard
            icon={DollarSign}
            title="Revenue"
            value={`৳${(today?.revenue || 0).toLocaleString()}`}
            bgColor="green"
            compact
          />

          <StatCard
            icon={ShoppingCart}
            title="Sales"
            value={today?.salesCount || 0}
            bgColor="blue"
            compact
          />

          <StatCard
            icon={BarChart3}
            title="Profit"
            value={`৳${(today?.netProfit || 0).toLocaleString()}`}
            bgColor="purple"
            compact
          />

          <StatCard
            icon={Package}
            title="Purchase"
            value={`৳${(today?.purchaseAmount || 0).toLocaleString()}`}
            bgColor="orange"
            compact
          />
        </div>
      </div>

      {/* PERIOD OVERVIEW */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-gray-700 dark:text-gray-300" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {getPeriodLabel()} Overview
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          <StatCard
            icon={TrendingUp}
            title="Gross Profit"
            value={`৳${(period?.profit || 0).toLocaleString()}`}
            bgColor="green"
            compact
          />

          <StatCard
            icon={TrendingDown}
            title="Expenses"
            value={`৳${(period?.expense || 0).toLocaleString()}`}
            bgColor="pink"
            compact
          />

          <StatCard
            icon={Package}
            title="Purchase"
            value={`৳${(period?.purchaseAmount || 0).toLocaleString()}`}
            bgColor="orange"
            compact
          />

          <StatCard
            icon={TrendingUp}
            title="Gross (Today)"
            value={`৳${(today?.profit || 0).toLocaleString()}`}
            bgColor="green"
            compact
          />
        </div>
      </div>

      {/* INVENTORY STATUS */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-gray-700 dark:text-gray-300" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Inventory Status
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          <StatCard
            icon={Package}
            title="Total Products"
            value={`${inventory?.totalProducts || 0}`}
            bgColor="blue"
            compact
          />

          <StatCard
            icon={AlertCircle}
            title="Low Stock Items"
            value={`${inventory?.lowStockCount || 0}`}
            bgColor={(inventory?.lowStockCount || 0) > 0 ? "pink" : "green"}
            badge={{
              text:
                (inventory?.lowStockCount || 0) > 0
                  ? "Needs attention"
                  : "All good",
              color: (inventory?.lowStockCount || 0) > 0 ? "danger" : "success",
            }}
            compact
          />

          <StatCard
            icon={DollarSign}
            title="Inventory Value"
            value={`৳${((inventory?.totalProducts || 0) * 1000).toLocaleString()}`}
            bgColor="purple"
            compact
          />
        </div>
      </div>
    </div>
  );
}

