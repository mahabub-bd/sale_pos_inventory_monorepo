import { useState } from "react";
import { toast } from "react-toastify";

import Loading from "../../../components/common/Loading";
import PageHeader from "../../../components/common/PageHeader";
import Select from "../../../components/form/Select";
import Badge from "../../../components/ui/badge/Badge";
import { Modal } from "../../../components/ui/modal";

import {
  useLazyGetStockReportQuery,
} from "../../../features/report/reportApi";
import { Report } from "../../../features/report/types";
import { formatDate } from "../../../utlis";

export default function StockReportView() {
  const [warehouseId, setWarehouseId] = useState<number | undefined>();
  const [productId, setProductId] = useState<number | undefined>();
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [brandId, setBrandId] = useState<number | undefined>();
  const [reportData, setReportData] = useState<Report | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [fetchReport, { isLoading, isError }] = useLazyGetStockReportQuery();

  const handleGenerateReport = async () => {
    try {
      const result = await fetchReport({
        warehouse_id: warehouseId,
        product_id: productId,
        category_id: categoryId,
        brand_id: brandId,
      }).unwrap();

      if (result?.data) {
        setReportData(result.data);
        setIsModalOpen(true);
        toast.success("Stock report generated successfully");
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to generate stock report");
    }
  };

  const handleDownload = () => {
    if (reportData?.file_url) {
      window.open(reportData.file_url, "_blank");
      toast.success("Opening report download");
    } else {
      toast.error("No download URL available");
    }
  };

  return (
    <>
      <PageHeader
        title="Stock Report"
        subtitle="Generate and view stock reports"
        className="mb-6"
      />

      {/* Filters */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Warehouse
            </label>
            <Select
              value={warehouseId?.toString() || ""}
              onChange={(val) => setWarehouseId(val ? parseInt(val) : undefined)}
              options={[
                { value: "", label: "All Warehouses" },
                { value: "1", label: "Warehouse 1" },
                { value: "2", label: "Warehouse 2" },
              ]}
              placeholder="Select warehouse"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Product
            </label>
            <Select
              value={productId?.toString() || ""}
              onChange={(val) => setProductId(val ? parseInt(val) : undefined)}
              options={[
                { value: "", label: "All Products" },
                { value: "1", label: "Product 1" },
                { value: "2", label: "Product 2" },
              ]}
              placeholder="Select product"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Category
            </label>
            <Select
              value={categoryId?.toString() || ""}
              onChange={(val) => setCategoryId(val ? parseInt(val) : undefined)}
              options={[
                { value: "", label: "All Categories" },
                { value: "1", label: "Category 1" },
                { value: "2", label: "Category 2" },
              ]}
              placeholder="Select category"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Brand
            </label>
            <Select
              value={brandId?.toString() || ""}
              onChange={(val) => setBrandId(val ? parseInt(val) : undefined)}
              options={[
                { value: "", label: "All Brands" },
                { value: "1", label: "Brand 1" },
                { value: "2", label: "Brand 2" },
              ]}
              placeholder="Select brand"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={handleGenerateReport}
              disabled={isLoading}
              className="w-full rounded-lg bg-primary px-4 py-2.5 text-white hover:bg-primary/90 disabled:opacity-50"
            >
              {isLoading ? "Generating..." : "Generate Report"}
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && <Loading message="Generating stock report..." />}

      {/* Error State */}
      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          Failed to load stock report. Please try again.
        </div>
      )}

      {/* Report Modal */}
      {isModalOpen && reportData && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Stock Report Details"
          className="max-w-4xl"
        >
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Report Title
              </label>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {reportData.title}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Type
                </label>
                <p className="text-gray-900 dark:text-white capitalize">
                  {reportData.type.replace(/_/g, " ")}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Status
                </label>
                <Badge
                  color={
                    reportData.status === "completed"
                      ? "success"
                      : reportData.status === "failed"
                      ? "error"
                      : "warning"
                  }
                >
                  {reportData.status.toUpperCase()}
                </Badge>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Total Records
                </label>
                <p className="text-gray-900 dark:text-white">
                  {reportData.total_records ?? "N/A"}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Generated At
                </label>
                <p className="text-gray-900 dark:text-white">
                  {reportData.generated_at
                    ? formatDate(reportData.generated_at)
                    : "Not generated yet"}
                </p>
              </div>
            </div>

            {reportData.data && Object.keys(reportData.data).length > 0 && (
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Report Data
                </label>
                <pre className="mt-1 max-h-64 overflow-auto rounded-lg bg-gray-100 p-3 text-xs dark:bg-gray-800">
                  {JSON.stringify(reportData.data, null, 2)}
                </pre>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Close
              </button>
              {reportData.status === "completed" && reportData.file_url && (
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary/90"
                >
                  Download Report
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
