import {
  DollarSign,
  RotateCcw,
  ShoppingBag,
  TrendingUp,
  Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";

import Loading from "@/components/common/Loading";
import PageHeader from "@/components/common/PageHeader";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/common/Table";

import Checkbox from "@/components/form/input/Checkbox";
import StatCard from "@/components/ui/badge/StatCard";
import Button from "@/components/ui/button";

import { useLazyGetCustomersReportQuery } from "@/features/report/reportApi";
import { formatDate } from "@/utlis";
import ComparisonSection from "./common/ComparisonSection";
import ReportFilters, { useDateRangeCalculation } from "./common/ReportFilters";
import { useBranchOptions } from "./hooks/useBranchOptions";

interface CustomerDetail {
  saleId: number;
  invoiceNo: string;
  total: string;
  status: string;
  saleDate: string;
  customerName: string;
  customerPhone: string;
  branchName: string | null;
}

interface CustomerSummary {
  totalCustomers: number;
  totalRevenue: number;
  totalPurchases: number;
  topCustomers: Array<{
    customerId: number;
    customerName: string;
    email: string;
    phone: string;
    totalSpent: number;
    totalPurchases: number;
    avgOrderValue: number;
  }>;
}

interface CustomerReportData {
  summary: CustomerSummary;
  details: CustomerDetail[];
  comparison?: any;
  meta: {
    dateRange: {
      from: string;
      to: string;
    };
  };
}

export default function CustomersReportView() {
  const [dateRange, setDateRange] = useState("custom");
  const [branchId, setBranchId] = useState<number>();
  const [customerId, setCustomerId] = useState<number>();
  const [includeComparison, setIncludeComparison] = useState(false);

  const [fetchReport, { data, isLoading, isError }] =
    useLazyGetCustomersReportQuery();

  const { startDate, endDate } = useDateRangeCalculation(dateRange);

  const branchOptions = useBranchOptions();

  const handleGenerateReport = async () => {
    if (!startDate || !endDate) {
      toast.error("Please select both start and end dates");
      return;
    }

    const formatLocal = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
        d.getDate()
      ).padStart(2, "0")}`;

    const params: any = {
      branch_id: branchId,
      customer_id: customerId,
      includeComparison,
    };

    if (dateRange === "custom") {
      params.fromDate = formatLocal(startDate);
      params.toDate = formatLocal(endDate);
    } else {
      params.dateRange = dateRange;
    }

    try {
      await fetchReport(params).unwrap();
      toast.success("Customer report generated");
    } catch (e: any) {
      toast.error(e?.data?.message || "Failed to generate report");
    }
  };

  const handleReset = () => {
    setDateRange("custom");
    setBranchId(undefined);
    setCustomerId(undefined);
    setIncludeComparison(false);
    toast.info("Filters reset");
  };

  const reportData = data?.data as CustomerReportData | undefined;
  const s = reportData?.summary;

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    return `৳${num.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <>
      <PageHeader
        title="Customer Report"
        subtitle="Track and analyze customer purchases"
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
            onChange: (v) => setBranchId(v ? +v : undefined),
            options: branchOptions,
            placeholder: "All",
          },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleGenerateReport}
              disabled={isLoading}
            >
              Generate
            </Button>
            <Button size="sm" variant="outline" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-1" />
              Reset
            </Button>
            <Checkbox
              id="compare"
              label="Compare"
              checked={includeComparison}
              onChange={setIncludeComparison}
            />
          </div>
        }
      />

      {isLoading && <Loading message="Generating customer report..." />}

      {isError && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          Failed to load customer report
        </div>
      )}

      {s && (
        <div className="space-y-4">
          {/* KPI GRID */}
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
            <StatCard
              icon={Users}
              title="Total Customers"
              value={s.totalCustomers}
              bgColor="blue"
              compact
            />
            <StatCard
              icon={DollarSign}
              title="Total Revenue"
              value={formatCurrency(s.totalRevenue)}
              bgColor="green"
              compact
            />
            <StatCard
              icon={ShoppingBag}
              title="Total Purchases"
              value={s.totalPurchases}
              bgColor="purple"
              compact
            />
            <StatCard
              icon={TrendingUp}
              title="Avg Order Value"
              value={formatCurrency(
                s.totalRevenue / Math.max(s.totalPurchases, 1)
              )}
              bgColor="indigo"
              compact
            />
          </div>

          {/* Top Customers */}
          {s.topCustomers && s.topCustomers.length > 0 && (
            <div className="rounded-lg border border-gray-200 dark:border-gray-800">
              <div className="px-3 py-2 text-sm font-semibold bg-gray-50 dark:bg-gray-800">
                Top Customers
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableCell isHeader>Customer</TableCell>
                      <TableCell isHeader>Email</TableCell>
                      <TableCell isHeader>Phone</TableCell>
                      <TableCell isHeader className="text-right">
                        Purchases
                      </TableCell>
                      <TableCell isHeader className="text-right">
                        Total Spent
                      </TableCell>
                      <TableCell isHeader className="text-right">
                        Avg Order
                      </TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {s.topCustomers.map((customer, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">
                          {customer.customerName}
                        </TableCell>
                        <TableCell>{customer.email || "N/A"}</TableCell>
                        <TableCell>{customer.phone || "N/A"}</TableCell>
                        <TableCell className="text-right">
                          {customer.totalPurchases}
                        </TableCell>
                        <TableCell className="text-right font-medium text-green-600">
                          {formatCurrency(customer.totalSpent)}
                        </TableCell>
                        <TableCell className="text-right font-medium text-blue-600">
                          {formatCurrency(customer.avgOrderValue)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Comparison */}
          {includeComparison && reportData?.comparison && (
            <ComparisonSection comparison={reportData.comparison} />
          )}

          {/* DETAILS TABLE */}
          {reportData?.details?.length > 0 && (
            <div className="rounded-lg border border-gray-200 dark:border-gray-800">
              <div className="px-3 py-2 text-sm font-semibold bg-gray-50 dark:bg-gray-800">
                Transaction Details
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableCell isHeader>Date</TableCell>
                      <TableCell isHeader>Invoice</TableCell>
                      <TableCell isHeader>Customer</TableCell>
                      <TableCell isHeader>Phone</TableCell>
                      <TableCell isHeader>Branch</TableCell>
                      <TableCell isHeader className="text-right">
                        Amount
                      </TableCell>
                      <TableCell isHeader>Status</TableCell>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {reportData.details.map((sale) => (
                      <TableRow key={sale.saleId} className="hover:bg-gray-50">
                        <TableCell>{formatDate(sale.saleDate)}</TableCell>
                        <TableCell className="font-medium">
                          {sale.invoiceNo}
                        </TableCell>
                        <TableCell className="font-medium">
                          {sale.customerName}
                        </TableCell>
                        <TableCell>{sale.customerPhone}</TableCell>
                        <TableCell>{sale.branchName || "N/A"}</TableCell>
                        <TableCell className="text-right font-medium text-green-600">
                          {formatCurrency(sale.total)}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`rounded-full px-2 py-1 text-xs ${
                              sale.status === "completed"
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                            }`}
                          >
                            {sale.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
