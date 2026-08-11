import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import CustomersReportView from "./components/CustomersReportView";
export default function CustomersReportPage() {
  return (
    <div>
      <PageMeta
        title="Customer Report"
        description="View and generate Customer reports"
      />
      <PageBreadcrumb pageTitle="Customer Report" />

      {/* Page Container */}
      <div className="flex flex-col gap-5 min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/5">
        {/* Customer Report View */}
        <CustomersReportView />
      </div>
    </div>
  );
}
