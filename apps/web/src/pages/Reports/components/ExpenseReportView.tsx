import {
  Calculator,
  CreditCard,
  DollarSign,
  Folder,
  RotateCcw,
  TrendingUp,
  Wallet,
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

import { useLazyGetExpenseReportQuery } from "@/features/report/reportApi";
import ComparisonSection from "./common/ComparisonSection";
import ReportFilters, { useDateRangeCalculation } from "./common/ReportFilters";
import { useBranchOptions } from "./hooks/useBranchOptions";
import { useExpenseCategoryOptions } from "./hooks/useExpenseCategoryOptions";

interface ExpenseDetail {
  id: number;
  title: string;
  description: string;
  amount: string;
  receiptUrl: string | null;
  paymentMethod: string;
  date: string;
  category: string;
  branch: string;
  createdBy: string;
}

interface ExpenseSummary {
  totalExpenses: number;
  totalAmount: number;
  averageExpense: number;
  totalCategories: number;
  totalBranches: number;
}

interface ExpenseReportData {
  summary: ExpenseSummary;
  details: ExpenseDetail[];
  comparison?: any;
  meta: {
    dateRange: {
      from: string;
      to: string;
    };
    expensesByCategory?: Array<{
      categoryId: number;
      categoryName: string;
      count: string;
      totalAmount: string;
    }>;
    expensesByPaymentMethod?: Array<{
      paymentMethod: string;
      count: string;
      totalAmount: string;
    }>;
  };
}

export default function ExpenseReportView() {
  const [dateRange, setDateRange] = useState("custom");
  const [branchId, setBranchId] = useState<number>();
  const [categoryId, setCategoryId] = useState<number>();
  const [includeComparison, setIncludeComparison] = useState(false);

  const [fetchReport, { data, isLoading, isError }] =
    useLazyGetExpenseReportQuery();

  const { startDate, endDate } = useDateRangeCalculation(dateRange);

  const branchOptions = useBranchOptions();
  const expenseCategoryOptions = useExpenseCategoryOptions();

  const handleGenerateReport = async () => {
    if (!startDate || !endDate) {
      toast.error("Please select both start and end dates");
      return;
    }

    const formatLocal = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
        d.getDate(),
      ).padStart(2, "0")}`;

    const params: any = {
      branch_id: branchId,
      expense_category_id: categoryId,
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
      toast.success("Expense report generated");
    } catch (e: any) {
      toast.error(e?.data?.message || "Failed to generate report");
    }
  };

  const handleReset = () => {
    setDateRange("custom");
    setBranchId(undefined);
    setCategoryId(undefined);
    setIncludeComparison(false);
    toast.info("Filters reset");
  };

  const reportData = data?.data as ExpenseReportData | undefined;
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
        title="Expense Report"
        subtitle="Track and analyze expenses"
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
          {
            label: "Category",
            value: categoryId?.toString() || "",
            onChange: (v) => setCategoryId(v ? +v : undefined),
            options: expenseCategoryOptions,
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

      {isLoading && <Loading message="Generating expense report..." />}

      {isError && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          Failed to load expense report
        </div>
      )}

      {s && (
        <div className="space-y-4">
          {/* KPI GRID */}
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-5">
            <StatCard
              icon={Wallet}
              title="Total Expenses"
              value={s.totalExpenses}
              bgColor="blue"
              compact
            />
            <StatCard
              icon={DollarSign}
              title="Total Amount"
              value={formatCurrency(s.totalAmount)}
              bgColor="green"
              compact
            />
            <StatCard
              icon={Calculator}
              title="Average"
              value={formatCurrency(s.averageExpense)}
              bgColor="purple"
              compact
            />
            <StatCard
              icon={Folder}
              title="Categories"
              value={s.totalCategories}
              bgColor="orange"
              compact
            />
            <StatCard
              icon={TrendingUp}
              title="Branches"
              value={s.totalBranches}
              bgColor="indigo"
              compact
            />
          </div>
          <div className="grid md:grid-cols-2 grid-cols-1 gap-4">
            {/* Breakdown by Category */}
            {reportData?.meta?.expensesByCategory &&
              reportData.meta.expensesByCategory.length > 0 && (
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
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reportData.meta.expensesByCategory.map((cat, i) => (
                          <TableRow key={i}>
                            <TableCell className="font-medium">
                              {cat.categoryName}
                            </TableCell>
                            <TableCell className="text-right">
                              {cat.count}
                            </TableCell>
                            <TableCell className="text-right font-medium text-green-600">
                              {formatCurrency(cat.totalAmount)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

            {/* Breakdown by Payment Method */}
            {reportData?.meta?.expensesByPaymentMethod &&
              reportData.meta.expensesByPaymentMethod.length > 0 && (
                <div className="rounded-lg border border-gray-200 dark:border-gray-800">
                  <div className="px-3 py-2 text-sm font-semibold bg-gray-50 dark:bg-gray-800">
                    Expenses by Payment Method
                  </div>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableCell isHeader>Payment Method</TableCell>
                          <TableCell isHeader className="text-right">
                            Count
                          </TableCell>
                          <TableCell isHeader className="text-right">
                            Total Amount
                          </TableCell>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reportData.meta.expensesByPaymentMethod.map(
                          (method, i) => (
                            <TableRow key={i}>
                              <TableCell className="capitalize font-medium">
                                <div className="flex items-center gap-2">
                                  <CreditCard className="h-4 w-4" />
                                  {method.paymentMethod}
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                {method.count}
                              </TableCell>
                              <TableCell className="text-right font-medium text-green-600">
                                {formatCurrency(method.totalAmount)}
                              </TableCell>
                            </TableRow>
                          ),
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
          </div>

          {/* Comparison */}
          {includeComparison && reportData?.comparison && (
            <ComparisonSection comparison={reportData.comparison} />
          )}

          {/* DETAILS TABLE */}
          {reportData?.details?.length > 0 && (
            <div className="rounded-lg border border-gray-200 dark:border-gray-800">
              <div className="px-3 py-2 text-sm font-semibold bg-gray-50 dark:bg-gray-800">
                Expense Details
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableCell isHeader>Date</TableCell>
                      <TableCell isHeader>Title</TableCell>
                      <TableCell isHeader>Description</TableCell>
                      <TableCell isHeader>Category</TableCell>
                      <TableCell isHeader>Branch</TableCell>
                      <TableCell isHeader className="text-right">
                        Amount
                      </TableCell>
                      <TableCell isHeader>Payment Method</TableCell>
                      <TableCell isHeader>Created By</TableCell>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {reportData.details.map((expense) => (
                      <TableRow key={expense.id} className="hover:bg-gray-50">
                        <TableCell>
                          {new Date(expense.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="font-medium">
                          {expense.title}
                        </TableCell>
                        <TableCell className="max-w-40 truncate">
                          {expense.description}
                        </TableCell>
                        <TableCell>
                          <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                            {expense.category}
                          </span>
                        </TableCell>
                        <TableCell>{expense.branch}</TableCell>
                        <TableCell className="text-right font-medium text-red-600">
                          {formatCurrency(expense.amount)}
                        </TableCell>
                        <TableCell className="capitalize">
                          <div className="flex items-center gap-1">
                            <CreditCard className="h-3 w-3" />
                            {expense.paymentMethod}
                          </div>
                        </TableCell>
                        <TableCell>{expense.createdBy}</TableCell>
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
