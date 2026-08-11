import {
  Calculator,
  DollarSign,
  Package,
  Percent,
  RotateCcw,
  ShoppingBag,
  TrendingUp,
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

import { useLazyGetSalesReportQuery } from "@/features/report/reportApi";
import { SalesReportData } from "@/types/report";
import { formatDate } from "@/utlis";

import ComparisonSection from "../common/ComparisonSection";
import ReportFilters, {
  useDateRangeCalculation,
} from "../common/ReportFilters";
import { useBranchOptions } from "../hooks/useBranchOptions";
import { useCustomerOptions } from "../hooks/useCustomerOptions";
import { useProductOptions } from "../hooks/useProductOptions";

export default function SalesReportView() {
  const [dateRange, setDateRange] = useState("custom");
  const [branchId, setBranchId] = useState<number>();
  const [customerId, setCustomerId] = useState<number>();
  const [productId, setProductId] = useState<number>();
  const [includeComparison, setIncludeComparison] = useState(false);

  const [fetchReport, { data, isLoading, isError }] =
    useLazyGetSalesReportQuery();

  const { startDate, endDate } = useDateRangeCalculation(dateRange);

  const branchOptions = useBranchOptions();
  const customerOptions = useCustomerOptions();
  const productOptions = useProductOptions();

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
      product_id: productId,
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
      toast.success("Sales report generated");
    } catch (e: any) {
      toast.error(e?.data?.message || "Failed to generate report");
    }
  };

  const handleReset = () => {
    setDateRange("custom");
    setBranchId(undefined);
    setCustomerId(undefined);
    setProductId(undefined);
    setIncludeComparison(false);
    toast.info("Filters reset");
  };

  const reportData = data?.data as SalesReportData | undefined;
  const s = reportData?.summary;

  return (
    <>
      <PageHeader title="Sales Report" subtitle="Compact sales overview" />

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
            label: "Customer",
            value: customerId?.toString() || "",
            onChange: (v) => setCustomerId(v ? +v : undefined),
            options: customerOptions,
            placeholder: "All",
          },
          {
            label: "Product",
            value: productId?.toString() || "",
            onChange: (v) => setProductId(v ? +v : undefined),
            options: productOptions,
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

      {isLoading && <Loading message="Generating sales report..." />}

      {isError && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          Failed to load sales report
        </div>
      )}

      {s && (
        <div className="space-y-4">
          {/* KPI GRID */}
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
            <StatCard
              icon={ShoppingBag}
              title="Orders"
              value={s.totalOrders}
              bgColor="blue"
              compact
            />
            <StatCard
              icon={Package}
              title="Items Sold"
              value={s.totalItemsSold}
              bgColor="purple"
              compact
            />
            <StatCard
              icon={DollarSign}
              title="Revenue"
              value={`৳${s.totalRevenue?.toLocaleString()}`}
              bgColor="green"
              compact
            />
            <StatCard
              icon={TrendingUp}
              title="Net Revenue"
              value={`৳${s.netRevenue?.toLocaleString()}`}
              bgColor="indigo"
              compact
            />
            <StatCard
              icon={Percent}
              title="Discount"
              value={`৳${s.totalDiscount?.toLocaleString()}`}
              bgColor="orange"
              compact
            />
            <StatCard
              icon={Calculator}
              title="Tax"
              value={`৳${s.totalTax?.toLocaleString()}`}
              bgColor="pink"
              compact
            />
            <StatCard
              icon={DollarSign}
              title="Avg Order"
              value={`৳${(s.averageOrderValue || 0).toFixed(2)}`}
              bgColor="cyan"
              compact
            />
          </div>

          {/* Comparison */}
          {includeComparison && reportData?.comparison && (
            <ComparisonSection comparison={reportData.comparison} />
          )}

          {/* DETAILS TABLE */}
          {reportData?.details?.length > 0 && (
            <div className="rounded-lg border border-gray-200 dark:border-gray-800">
              <div className="px-3 py-2 text-sm font-semibold bg-gray-50 dark:bg-gray-800">
                Sales Details
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableCell isHeader>Invoice</TableCell>
                      <TableCell isHeader>Date</TableCell>
                      <TableCell isHeader>Customer</TableCell>
                      <TableCell isHeader>Product</TableCell>
                      <TableCell isHeader className="text-right">
                        Qty
                      </TableCell>
                      <TableCell isHeader className="text-right">
                        Price
                      </TableCell>
                      <TableCell isHeader className="text-right">
                        Total
                      </TableCell>
                      <TableCell isHeader className="text-right">
                        Discount
                      </TableCell>
                      <TableCell isHeader className="text-right">
                        Final
                      </TableCell>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {reportData.details.map((d, i) => (
                      <TableRow key={i} className="hover:bg-gray-50">
                        <TableCell className="font-medium">
                          {d.invoiceNo}
                        </TableCell>
                        <TableCell>{formatDate(d.saleDate)}</TableCell>
                        <TableCell className="max-w-40 truncate">
                          {d.customerName}
                        </TableCell>
                        <TableCell className="max-w-40 truncate">
                          {d.productName}
                        </TableCell>
                        <TableCell className="text-right">
                          {d.quantity}
                        </TableCell>
                        <TableCell className="text-right">
                          ৳{d.unitPrice}
                        </TableCell>
                        <TableCell className="text-right">
                          ৳{d.lineTotal}
                        </TableCell>
                        <TableCell className="text-right text-xs">
                          {d.groupDiscount && +d.groupDiscount > 0 && (
                            <div>G: ৳{d.groupDiscount}</div>
                          )}
                          {d.manualDiscount && +d.manualDiscount > 0 && (
                            <div>M: ৳{d.manualDiscount}</div>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-medium text-green-600">
                          ৳{d.saleTotal}
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
