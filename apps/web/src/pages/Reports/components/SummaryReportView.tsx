import {
  Box,
  DollarSign,
  Package,
  RotateCcw,
  ShoppingCart,
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

import StatCard from "@/components/ui/badge/StatCard";
import Button from "@/components/ui/button";

import { useLazyGetSummaryReportQuery } from "@/features/report/reportApi";
import ReportFilters, { useDateRangeCalculation } from "./common/ReportFilters";
import { useBranchOptions } from "./hooks/useBranchOptions";

interface SalesSummary {
  totalSales: number;
  totalRevenue: number;
  totalPaid: number;
  averageOrderValue: number;
  outstandingAmount: number;
}

interface PurchasesSummary {
  totalPurchases: number;
  totalValue: number;
  totalPaid: number;
  totalDue: number;
}

interface InventorySummary {
  totalProducts: number;
  totalStock: number;
  availableStock: number;
  stockValue: number;
}

interface CustomerSummary {
  totalCustomers: number;
}

interface CustomerDetail {
  customerId: number;
  customerCode: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  rewardPoints: number;
  totalPurchases: number;
  totalPurchaseAmount: number;
  totalPaid: number;
  totalDue: number;
  averageOrderValue: number;
}

interface ExpenseCategorySummary {
  categoryId: number;
  categoryName: string;
  expenseCount: number;
  totalAmount: number;
  averageAmount: number;
}

interface PaymentMethodSummary {
  method: string;
  totalAmount: number;
  transactionCount: number;
}

interface SummaryData {
  sales: SalesSummary;
  purchases: PurchasesSummary;
  suppliers: any[];
  inventory: InventorySummary;
  customers: CustomerSummary;
  customerDetails: CustomerDetail[];
  expenses: ExpenseCategorySummary[];
  paymentMethods: PaymentMethodSummary[];
}

interface SummaryReportData {
  summary: SummaryData;
  meta: {
    dateRange: {
      from: string;
      to: string;
    };
  };
}

export default function SummaryReportView() {
  const [dateRange, setDateRange] = useState("custom");
  const [branchId, setBranchId] = useState<number>();

  const [fetchReport, { data, isLoading, isError }] =
    useLazyGetSummaryReportQuery();

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
    };

    if (dateRange === "custom") {
      params.fromDate = formatLocal(startDate);
      params.toDate = formatLocal(endDate);
    } else {
      params.dateRange = dateRange;
    }

    try {
      await fetchReport(params).unwrap();
      toast.success("Summary report generated");
    } catch (e: any) {
      toast.error(e?.data?.message || "Failed to generate report");
    }
  };

  const handleReset = () => {
    setDateRange("custom");
    setBranchId(undefined);
    toast.info("Filters reset");
  };

  const reportData = data?.data as SummaryReportData | undefined;
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
        title="Summary Report"
        subtitle="Comprehensive overview of business operations"
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
          </div>
        }
      />

      {isLoading && <Loading message="Generating summary report..." />}

      {isError && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          Failed to load summary report
        </div>
      )}

      {s && (
        <div className="space-y-6">
          {/* OVERVIEW KPIs */}
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
            <StatCard
              icon={ShoppingCart}
              title="Total Sales"
              value={s.sales.totalSales}
              bgColor="blue"
              compact
            />
            <StatCard
              icon={DollarSign}
              title="Revenue"
              value={formatCurrency(s.sales.totalRevenue)}
              bgColor="green"
              compact
            />
            <StatCard
              icon={TrendingUp}
              title="Avg Order"
              value={formatCurrency(s.sales.averageOrderValue)}
              bgColor="purple"
              compact
            />
            <StatCard
              icon={Users}
              title="Customers"
              value={s.customers.totalCustomers}
              bgColor="indigo"
              compact
            />
            <StatCard
              icon={Package}
              title="Products"
              value={s.inventory.totalProducts}
              bgColor="orange"
              compact
            />
            <StatCard
              icon={Box}
              title="Total Stock"
              value={s.inventory.totalStock}
              bgColor="teal"
              compact
            />
            <StatCard
              icon={Package}
              title="Stock Value"
              value={formatCurrency(s.inventory.stockValue)}
              bgColor="cyan"
              compact
            />
            <StatCard
              icon={ShoppingCart}
              title="Purchases"
              value={s.purchases.totalPurchases}
              bgColor="pink"
              compact
            />
          </div>

          {/* SALES DETAILS */}
          <div className="rounded-lg border border-gray-200 dark:border-gray-800">
            <div className="px-3 py-2 text-sm font-semibold bg-gray-50 dark:bg-gray-800">
              Sales Overview
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Total Sales
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {s.sales.totalSales}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Total Revenue
                  </p>
                  <p className="text-xl font-bold text-green-600">
                    {formatCurrency(s.sales.totalRevenue)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Total Paid
                  </p>
                  <p className="text-xl font-bold text-blue-600">
                    {formatCurrency(s.sales.totalPaid)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Outstanding
                  </p>
                  <p className="text-xl font-bold text-red-600">
                    {formatCurrency(s.sales.outstandingAmount)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* INVENTORY SUMMARY */}
          <div className="rounded-lg border border-gray-200 dark:border-gray-800">
            <div className="px-3 py-2 text-sm font-semibold bg-gray-50 dark:bg-gray-800">
              Inventory Summary
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Total Products
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {s.inventory.totalProducts}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Total Stock
                  </p>
                  <p className="text-xl font-bold text-blue-600">
                    {s.inventory.totalStock}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Available Stock
                  </p>
                  <p className="text-xl font-bold text-green-600">
                    {s.inventory.availableStock}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Stock Value
                  </p>
                  <p className="text-xl font-bold text-purple-600">
                    {formatCurrency(s.inventory.stockValue)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* PURCHASE SUMMARY */}
          <div className="rounded-lg border border-gray-200 dark:border-gray-800">
            <div className="px-3 py-2 text-sm font-semibold bg-gray-50 dark:bg-gray-800">
              Purchase Overview
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Total Purchases
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {s.purchases.totalPurchases}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Total Value
                  </p>
                  <p className="text-xl font-bold text-blue-600">
                    {formatCurrency(s.purchases.totalValue)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Total Paid
                  </p>
                  <p className="text-xl font-bold text-green-600">
                    {formatCurrency(s.purchases.totalPaid)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Total Due
                  </p>
                  <p className="text-xl font-bold text-red-600">
                    {formatCurrency(s.purchases.totalDue)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* PAYMENT METHODS */}
          {s.paymentMethods?.length > 0 && (
            <div className="rounded-lg border border-gray-200 dark:border-gray-800">
              <div className="px-3 py-2 text-sm font-semibold bg-gray-50 dark:bg-gray-800">
                Payment Methods
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableCell isHeader>Method</TableCell>
                      <TableCell isHeader className="text-right">
                        Transactions
                      </TableCell>
                      <TableCell isHeader className="text-right">
                        Total Amount
                      </TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {s.paymentMethods.map((pm, i) => (
                      <TableRow key={i}>
                        <TableCell className="capitalize font-medium">
                          {pm.method}
                        </TableCell>
                        <TableCell className="text-right">
                          {pm.transactionCount}
                        </TableCell>
                        <TableCell className="text-right font-medium text-green-600">
                          {formatCurrency(pm.totalAmount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* EXPENSE BY CATEGORY */}
          {s.expenses?.length > 0 && (
            <div className="rounded-lg border border-gray-200 dark:border-gray-800">
              <div className="px-3 py-2 text-sm font-semibold bg-gray-50 dark:bg-gray-800">
                Expenses by Category
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableCell isHeader>Category</TableCell>
                      <TableCell isHeader className="text-right">
                        Count
                      </TableCell>
                      <TableCell isHeader className="text-right">
                        Total Amount
                      </TableCell>
                      <TableCell isHeader className="text-right">
                        Average
                      </TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {s.expenses.map((expense, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">
                          {expense.categoryName}
                        </TableCell>
                        <TableCell className="text-right">
                          {expense.expenseCount}
                        </TableCell>
                        <TableCell className="text-right font-medium text-green-600">
                          {formatCurrency(expense.totalAmount)}
                        </TableCell>
                        <TableCell className="text-right text-blue-600">
                          {formatCurrency(expense.averageAmount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* TOP CUSTOMERS */}
          {s.customerDetails?.length > 0 && (
            <div className="rounded-lg border border-gray-200 dark:border-gray-800">
              <div className="px-3 py-2 text-sm font-semibold bg-gray-50 dark:bg-gray-800">
                Top Customers
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableCell isHeader>Customer</TableCell>
                      <TableCell isHeader>Code</TableCell>
                      <TableCell isHeader>Phone</TableCell>
                      <TableCell isHeader className="text-right">
                        Purchases
                      </TableCell>
                      <TableCell isHeader className="text-right">
                        Total Spent
                      </TableCell>
                      <TableCell isHeader className="text-right">
                        Reward Points
                      </TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {s.customerDetails.map((customer, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">
                          {customer.customerName}
                        </TableCell>
                        <TableCell>{customer.customerCode}</TableCell>
                        <TableCell>{customer.customerPhone}</TableCell>
                        <TableCell className="text-right">
                          {customer.totalPurchases}
                        </TableCell>
                        <TableCell className="text-right font-medium text-green-600">
                          {formatCurrency(customer.totalPurchaseAmount)}
                        </TableCell>
                        <TableCell className="text-right font-medium text-purple-600">
                          {customer.rewardPoints}
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
