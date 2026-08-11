import {
  Calculator,
  DollarSign,
  Package,
  Percent,
  RotateCcw,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";

import Loading from "@/components/common/Loading";
import PageHeader from "@/components/common/PageHeader";
import StatCard from "@/components/ui/badge/StatCard";
import Button from "@/components/ui/button";

import { useLazyGetProfitLossReportQuery } from "@/features/report/reportApi";
import { ProfitLossReportData } from "@/types/report";

import ReportFilters, {
  useDateRangeCalculation,
} from "../common/ReportFilters";
import { useBranchOptions } from "../hooks/useBranchOptions";

export default function ProfitLossReportView() {
  const [dateRange, setDateRange] = useState<string>("custom");
  const [branchId, setBranchId] = useState<number | undefined>();

  const [fetchReport, { data, isLoading, isError }] =
    useLazyGetProfitLossReportQuery();

  const { startDate, endDate } = useDateRangeCalculation(dateRange);
  const branchOptions = useBranchOptions();

  const handleGenerateReport = async () => {
    if (!startDate || !endDate) {
      toast.error("Please select both start and end dates");
      return;
    }

    const formatDate = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
        d.getDate(),
      ).padStart(2, "0")}`;

    const params: any = { branch_id: branchId };

    if (dateRange === "custom") {
      params.start_date = formatDate(startDate);
      params.end_date = formatDate(endDate);
    } else {
      params.dateRange = dateRange;
    }

    try {
      await fetchReport(params).unwrap();
      toast.success("Profit & Loss report generated");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to generate report");
    }
  };

  const handleReset = () => {
    setDateRange("custom");
    setBranchId(undefined);
    toast.info("Filters reset");
  };

  const reportData = data?.data as ProfitLossReportData | undefined;
  const s = reportData?.summary;

  return (
    <>
      <PageHeader
        title="Profit & Loss Report"
        subtitle="Compact financial performance overview"
      />

      {/* Filters */}
      <ReportFilters
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={() => {}}
        onEndDateChange={() => {}}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        filters={[
          {
            label: "Branch",
            value: branchId?.toString() || "",
            onChange: (v) => setBranchId(v ? parseInt(v) : undefined),
            options: branchOptions,
            placeholder: "All Branches",
          },
        ]}
        actions={
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleGenerateReport}
              disabled={isLoading}
            >
              Generate
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleReset}
              disabled={isLoading}
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Reset
            </Button>
          </div>
        }
      />

      {isLoading && <Loading message="Generating report..." />}

      {isError && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          Failed to load profit & loss report
        </div>
      )}

      {s && (
        <div className="space-y-4">
          {/* KPI GRID */}
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
            <StatCard
              icon={DollarSign}
              title="Revenue"
              value={`৳${s.revenue?.toLocaleString()}`}
              bgColor="green"
              compact
            />
            <StatCard
              icon={Package}
              title="Cost of Goods Sale"
              value={`৳${s.cogs?.toLocaleString()}`}
              bgColor="orange"
              compact
            />
            <StatCard
              icon={TrendingUp}
              title="Gross Profit"
              value={`৳${s.grossProfit?.toLocaleString()}`}
              bgColor="blue"
              compact
            />
            <StatCard
              icon={TrendingUp}
              title="Net Profit"
              value={`৳${s.netProfit?.toLocaleString()}`}
              bgColor="indigo"
              compact
            />
            <StatCard
              icon={TrendingDown}
              title="Expenses"
              value={`৳${s.totalExpenses?.toLocaleString()}`}
              bgColor="red"
              compact
            />
            <StatCard
              icon={Calculator}
              title="Operating Profit"
              value={`৳${s.operatingProfit?.toLocaleString()}`}
              bgColor="cyan"
              compact
            />
            <StatCard
              icon={Percent}
              title="Gross Margin"
              value={`${s.grossProfitMargin?.toFixed(1) || 0}%`}
              bgColor="green"
              compact
            />
            <StatCard
              icon={ShoppingCart}
              title="Purchases"
              value={`৳${s.purchases?.toLocaleString()}`}
              bgColor="purple"
              compact
            />
          </div>

          {/* P&L SUMMARY */}
          <div className="rounded-lg border border-gray-200 dark:border-gray-800">
            <div className="px-3 py-2 text-sm font-semibold bg-gray-50 dark:bg-gray-800">
              Profit & Loss Summary
            </div>

            <div className="divide-y text-sm">
              {[
                ["Revenue", s.revenue, "green"],
                ["Cost of Good Sales", s.cogs, "orange"],
                ["Gross Profit", s.grossProfit, "blue"],
                ["Discounts", s.totalDiscount, "red"],
                ["Tax", s.totalTax, "green"],
                ["Expenses", s.totalExpenses, "red"],
                ["Operating Profit", s.operatingProfit, "cyan"],
              ].map(([label, value, color]) => (
                <div key={label} className="flex justify-between px-3 py-1.5">
                  <span className="text-gray-600">{label}</span>
                  <span className={`font-medium text-${color}-600`}>
                    ৳{((value as number) || 0).toLocaleString()}
                  </span>
                </div>
              ))}

              <div className="flex justify-between px-3 py-2 font-semibold bg-indigo-50 dark:bg-indigo-900/20">
                <span>Net Profit</span>
                <span className="text-indigo-600">
                  ৳{s.netProfit?.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
