import {
  Calculator,
  DollarSign,
  Package,
  RotateCcw,
  ShoppingCart,
  TrendingUp,
  Truck,
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

import { useLazyGetPurchaseReportQuery } from "@/features/report/reportApi";
import { PurchaseReportData } from "@/types/report";
import { formatDate } from "@/utlis";

import ReportFilters, {
  useDateRangeCalculation,
} from "../common/ReportFilters";
import { useBranchOptions } from "../hooks/useBranchOptions";
import { useSupplierOptions } from "../hooks/useSupplierOptions";
import { useWarehouseOptions } from "../hooks/useWarehouseOptions";

export default function PurchaseReportView() {
  const [dateRange, setDateRange] = useState("custom");
  const [branchId, setBranchId] = useState<number>();
  const [supplierId, setSupplierId] = useState<number>();
  const [warehouseId, setWarehouseId] = useState<number>();

  const [fetchReport, { data, isLoading, isError }] =
    useLazyGetPurchaseReportQuery();

  const { startDate, endDate } = useDateRangeCalculation(dateRange);

  const branchOptions = useBranchOptions();
  const supplierOptions = useSupplierOptions();
  const warehouseOptions = useWarehouseOptions();

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
      supplier_id: supplierId,
      warehouse_id: warehouseId,
    };

    if (dateRange === "custom") {
      params.start_date = formatLocal(startDate);
      params.end_date = formatLocal(endDate);
    } else {
      params.dateRange = dateRange;
    }

    try {
      await fetchReport(params).unwrap();
      toast.success("Purchase report generated");
    } catch (e: any) {
      toast.error(e?.data?.message || "Failed to generate report");
    }
  };

  const handleReset = () => {
    setDateRange("custom");
    setBranchId(undefined);
    setSupplierId(undefined);
    setWarehouseId(undefined);
    toast.info("Filters reset");
  };

  const reportData = data?.data as PurchaseReportData | undefined;
  const s = reportData?.summary;

  return (
    <>
      <PageHeader
        title="Purchase Report"
        subtitle="Compact purchase overview"
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
            label: "Supplier",
            value: supplierId?.toString() || "",
            onChange: (v) => setSupplierId(v ? +v : undefined),
            options: supplierOptions,
            placeholder: "All",
          },
          {
            label: "Warehouse",
            value: warehouseId?.toString() || "",
            onChange: (v) => setWarehouseId(v ? +v : undefined),
            options: warehouseOptions,
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

      {isLoading && <Loading message="Generating purchase report..." />}

      {isError && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          Failed to load purchase report
        </div>
      )}

      {s && (
        <div className="space-y-4">
          {/* KPI GRID */}
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
            <StatCard
              icon={ShoppingCart}
              title="Orders"
              value={s.totalOrders}
              bgColor="blue"
              compact
            />
            <StatCard
              icon={Package}
              title="Items"
              value={s.totalItems}
              bgColor="purple"
              compact
            />
            <StatCard
              icon={DollarSign}
              title="Total Value"
              value={`৳${s.totalValue?.toLocaleString()}`}
              bgColor="green"
              compact
            />
            <StatCard
              icon={TrendingUp}
              title="Net Value"
              value={`৳${s.netValue?.toLocaleString()}`}
              bgColor="indigo"
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
              title="Discount"
              value={`৳${s.totalDiscount?.toLocaleString()}`}
              bgColor="orange"
              compact
            />
            <StatCard
              icon={Truck}
              title="Avg Order"
              value={`৳${((s.totalValue || 0) / (s.totalOrders || 1)).toFixed(
                2
              )}`}
              bgColor="cyan"
              compact
            />
          </div>

          {/* DETAILS TABLE */}
          {reportData?.details?.length > 0 && (
            <div className="rounded-lg border border-gray-200 dark:border-gray-800">
              <div className="px-3 py-2 text-sm font-semibold bg-gray-50 dark:bg-gray-800">
                Purchase Details
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableCell isHeader>PO</TableCell>
                      <TableCell isHeader>Date</TableCell>
                      <TableCell isHeader>Supplier</TableCell>
                      <TableCell isHeader>Warehouse</TableCell>
                      <TableCell isHeader>Status</TableCell>
                      <TableCell isHeader className="text-right">
                        Qty
                      </TableCell>
                      <TableCell isHeader className="text-right">
                        Total
                      </TableCell>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {reportData.details.map((d, i) => (
                      <TableRow key={i} className="hover:bg-gray-50">
                        <TableCell className="font-medium">
                          {d.poNumber}
                        </TableCell>
                        <TableCell>{formatDate(d.orderDate)}</TableCell>
                        <TableCell className="max-w-40 truncate">
                          {d.supplierName}
                        </TableCell>
                        <TableCell className="max-w-40 truncate">
                          {d.warehouseName}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                              d.status === "fully_received"
                                ? "bg-green-100 text-green-700"
                                : d.status === "partially_received"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : d.status === "pending"
                                    ? "bg-gray-100 text-gray-700"
                                    : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {d.status.replace(/_/g, " ").toUpperCase()}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          {d.quantity}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ৳{d.totalValue}
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
