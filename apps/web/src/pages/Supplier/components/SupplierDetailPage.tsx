import { formatDate } from "@/utlis";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  Edit,
  Mail,
  MapPin,
  Phone,
  TrendingUp,
  User,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import IconButton from "../../../components/common/IconButton";
import Info from "../../../components/common/Info";
import Loading from "../../../components/common/Loading";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { useGetSupplierByIdQuery } from "../../../features/suppliers/suppliersApi";
import { useHasPermission } from "../../../hooks/useHasPermission";

import SupplierFormModal from "./SupplierFormModal";

export default function SupplierDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading, isError } = useGetSupplierByIdQuery(String(id));
  const supplier = data?.data;

  const canUpdate = useHasPermission("suppliers.update");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  if (isLoading) return <Loading message="Loading Supplier..." />;

  if (isError || !supplier)
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
            <User className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Failed to Load Supplier
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            We couldn't retrieve the supplier details. Please try again.
          </p>
          <IconButton
            icon={ArrowLeft}
            tooltip="Back to Suppliers"
            color="gray"
            onClick={() => navigate("/suppliers")}
          >
            Back to Suppliers
          </IconButton>
        </div>
      </div>
    );

  // Calculate purchase summary
  const purchases = supplier.purchase_history || [];

  // Calculate additional statistics
  const totalPurchasesCount = purchases.length;
  const totalAmount = purchases.reduce(
    (s: number, v: any) => s + Number(v.total),
    0
  );
  const totalPaid = purchases.reduce(
    (s: number, v: any) => s + Number(v.paid_amount),
    0
  );
  const totalDue = purchases.reduce(
    (s: number, v: any) => s + (Number(v.total) - Number(v.paid_amount)),
    0
  );
  const averagePurchaseAmount =
    totalPurchasesCount > 0 ? totalAmount / totalPurchasesCount : 0;

  // Get last purchase date
  const lastPurchase =
    purchases.length > 0
      ? purchases.reduce(
          (latest: any, purchase: any) =>
            new Date(purchase.created_at) > new Date(latest.created_at)
              ? purchase
              : latest,
          purchases[0]
        )
      : null;
  const lastPurchaseDate = lastPurchase
    ? new Date(lastPurchase.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "N/A";

  const summary = {
    totalPurchases: totalPurchasesCount,
    totalAmount,
    totalPaid,
    totalDue,
    averagePurchaseAmount,
    lastPurchaseDate,
  };

  const handleEdit = () => {
    setIsEditModalOpen(true);
  };

  const goBack = () => {
    navigate("/suppliers");
  };

  return (
    <>
      <PageMeta
        title={`Supplier - ${supplier.name}`}
        description="Supplier Details"
      />
      <PageBreadcrumb pageTitle={`Supplier - ${supplier.name}`} />

      <div className="space-y-4">
        {/* Header Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-lg bg-linear-to-br from-green-500 to-green-600 flex items-center justify-center text-white font-bold text-lg">
                {supplier.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                  {supplier.name}
                </h1>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                    {supplier.supplier_code}
                  </span>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      supplier.status
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                    }`}
                  >
                    <span
                      className={`w-1 h-1 rounded-full mr-1 ${
                        supplier.status ? "bg-green-500" : "bg-red-500"
                      }`}
                    ></span>
                    {supplier.status ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <IconButton
                icon={BookOpen}
                tooltip="View Ledger"
                color="purple"
                onClick={() => navigate(`/suppliers/${id}/ledger`)}
              />
              {canUpdate && (
                <IconButton
                  icon={Edit}
                  tooltip="Edit"
                  color="blue"
                  onClick={handleEdit}
                />
              )}
              <IconButton
                icon={ArrowLeft}
                tooltip="Back"
                color="gray"
                onClick={goBack}
              />
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                Total Purchases
              </p>
              <div className="w-6 h-6 rounded bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <TrendingUp className="w-3 h-3 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {summary.totalPurchases}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                Total Amount
              </p>
              <div className="w-6 h-6 rounded bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <DollarSign className="w-3 h-3 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              ৳{summary.totalAmount.toLocaleString()}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                Paid
              </p>
              <div className="w-6 h-6 rounded bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle className="w-3 h-3 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              ৳{summary.totalPaid.toLocaleString()}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                Due
              </p>
              <div className="w-6 h-6 rounded bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <XCircle className="w-3 h-3 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              ৳{summary.totalDue.toLocaleString()}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                Avg Purchase
              </p>
              <div className="w-6 h-6 rounded bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                <TrendingUp className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              ৳{summary.averagePurchaseAmount.toFixed(2)}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                Last Purchase
              </p>
              <div className="w-6 h-6 rounded bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <Calendar className="w-3 h-3 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <p className="text-sm font-bold text-gray-900 dark:text-white">
              {summary.lastPurchaseDate}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Column */}
          <div className="lg:col-span-1 space-y-4">
            {/* Contact Information */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center">
                <Phone className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-2" />
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Contact Information
                </h2>
              </div>
              <div className="p-4 space-y-2">
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-500 dark:text-gray-400 w-28">
                    Person:
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {supplier.contact_person || "Not provided"}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-500 dark:text-gray-400 w-28">
                    Phone:
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {supplier.phone || "Not provided"}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-500 dark:text-gray-400 w-28">
                    Email:
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {supplier.email || "Not provided"}
                  </span>
                </div>
              </div>
            </div>

            {/* Account Information */}
            {supplier.account && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center">
                  <User className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-2" />
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Account Information
                  </h2>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-1 gap-3">
                    <Info label="Account Code" value={supplier.account.code} />
                    <Info
                      label="Account Number"
                      value={supplier.account.account_number}
                    />
                    <Info label="Account Name" value={supplier.account.name} />
                    <Info label="Account Type" value={supplier.account.type} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-4">
            {/* Basic Information */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Basic Information
                </h2>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
                  <Info label="Supplier Name" value={supplier.name} />
                  <Info label="Supplier Code" value={supplier.supplier_code} />
                  <Info
                    label="Status"
                    value={
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          supplier.status
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                        }`}
                      >
                        {supplier.status ? "Active" : "Inactive"}
                      </span>
                    }
                  />
                  <Info
                    label="Payment Terms"
                    value={supplier.payment_terms || "Not provided"}
                  />
                  <Info
                    label="Total Products"
                    value={supplier.products?.length || 0}
                  />
                  <Info
                    label="Created At"
                    value={new Date(supplier.created_at).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Billing and Shipping Addresses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Billing Address */}
              {supplier.billing_address && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center">
                    <MapPin className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-2" />
                    <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                      Billing Address
                    </h2>
                  </div>
                  <div className="p-4">
                    <div className="grid grid-cols-1 gap-x-4 gap-y-3">
                      <Info
                        label="Contact Name"
                        value={supplier.billing_address.contact_name}
                      />
                      <Info
                        label="Phone"
                        value={supplier.billing_address.phone}
                      />
                      <Info
                        label="Street"
                        value={supplier.billing_address.street}
                      />
                      <Info
                        label="City"
                        value={supplier.billing_address.city}
                      />
                      <Info
                        label="Country"
                        value={supplier.billing_address.country}
                      />
                      {supplier.billing_address.postal_code && (
                        <Info
                          label="Postal Code"
                          value={supplier.billing_address.postal_code}
                        />
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Shipping Address */}
              {supplier.shipping_address && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center">
                    <MapPin className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-2" />
                    <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                      Shipping Address
                    </h2>
                  </div>
                  <div className="p-4">
                    <div className="grid grid-cols-1 gap-x-4 gap-y-3">
                      <Info
                        label="Contact Name"
                        value={supplier.shipping_address.contact_name}
                      />
                      <Info
                        label="Phone"
                        value={supplier.shipping_address.phone}
                      />
                      <Info
                        label="Street"
                        value={supplier.shipping_address.street}
                      />
                      <Info
                        label="City"
                        value={supplier.shipping_address.city}
                      />
                      <Info
                        label="Country"
                        value={supplier.shipping_address.country}
                      />
                      {supplier.shipping_address.postal_code && (
                        <Info
                          label="Postal Code"
                          value={supplier.shipping_address.postal_code}
                        />
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Products Information */}
            {supplier.products && supplier.products.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Products ({supplier.products.length})
                  </h2>
                </div>
                <div className="p-4">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableCell isHeader className="text-left">
                            SKU
                          </TableCell>
                          <TableCell isHeader className="text-left">
                            Product Name
                          </TableCell>
                          <TableCell isHeader className="text-right">
                            Purchase Price
                          </TableCell>
                          <TableCell isHeader className="text-right">
                            Selling Price
                          </TableCell>
                          <TableCell isHeader className="text-center">
                            Status
                          </TableCell>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {supplier.products.slice(0, 5).map((product: any) => (
                          <TableRow
                            key={product.id}
                            onClick={() =>
                              navigate(`/products/view/${product.id}`)
                            }
                            className="hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer transition-colors"
                          >
                            <TableCell className="font-mono text-xs">
                              {product.sku}
                            </TableCell>
                            <TableCell className="text-blue-600 dark:text-blue-400 hover:underline">
                              {product.name}
                            </TableCell>
                            <TableCell className="text-right">
                              ৳{Number(product.purchase_price).toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right">
                              ৳{Number(product.selling_price).toFixed(2)}
                            </TableCell>
                            <TableCell className="text-center">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                  product.status
                                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                    : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                                }`}
                              >
                                {product.status ? "Active" : "Inactive"}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  {supplier.products.length > 5 && (
                    <div className="mt-3 text-center">
                      <Link
                        to={`/products?supplier=${supplier.id}`}
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        View all {supplier.products.length} products →
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Purchase History - Full Width */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
              Purchase History
            </h2>
          </div>
          <div className="p-4">
            {purchases.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableCell isHeader className="text-left">
                        Date
                      </TableCell>
                      <TableCell isHeader className="text-left">
                        PO No
                      </TableCell>
                      <TableCell isHeader className="text-center">
                        Status
                      </TableCell>
                      <TableCell isHeader className="text-center">
                        Payment
                      </TableCell>
                      <TableCell isHeader className="text-center">
                        Warehouse
                      </TableCell>
                      <TableCell isHeader className="text-right">
                        Total
                      </TableCell>
                      <TableCell isHeader className="text-right">
                        Paid
                      </TableCell>
                      <TableCell isHeader className="text-right">
                        Due
                      </TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {purchases.map((purchase: any) => {
                      const dueAmount =
                        Number(purchase.total) - Number(purchase.paid_amount);
                      const isPaid = dueAmount <= 0;

                      return (
                        <TableRow
                          key={purchase.id}
                          onClick={() => navigate(`/purchases/${purchase.id}`)}
                          className="hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer transition-colors"
                        >
                          <TableCell className="whitespace-nowrap">
                            {formatDate(purchase.created_at)}
                          </TableCell>
                          <TableCell className="text-blue-600 dark:text-blue-400 hover:underline font-mono">
                            {purchase.po_no}
                          </TableCell>
                          <TableCell className="capitalize">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                                purchase.status === "approved" ||
                                purchase.status === "fully_received" ||
                                purchase.status === "closed"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                  : purchase.status === "draft" ||
                                      purchase.status === "sent" ||
                                      purchase.status === "partial_received"
                                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                                    : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                              }`}
                            >
                              {purchase.status === "approved" ||
                              purchase.status === "fully_received" ||
                              purchase.status === "closed" ? (
                                <CheckCircle className="w-3 h-3" />
                              ) : purchase.status === "draft" ||
                                purchase.status === "sent" ||
                                purchase.status === "partial_received" ? (
                                <Clock className="w-3 h-3" />
                              ) : (
                                <XCircle className="w-3 h-3" />
                              )}
                              {purchase.status.replace(/_/g, " ")}
                            </span>
                          </TableCell>
                          <TableCell className="capitalize">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                                isPaid
                                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                  : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                              }`}
                            >
                              {isPaid ? (
                                <CheckCircle className="w-3 h-3" />
                              ) : (
                                <XCircle className="w-3 h-3" />
                              )}
                              {isPaid ? "Paid" : "Due"}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            {purchase.warehouse?.name || "-"}
                          </TableCell>
                          <TableCell className="text-right">
                            ৳{Number(purchase.total).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right text-green-600 dark:text-green-400">
                            ৳{Number(purchase.paid_amount).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right text-red-600 dark:text-red-400 font-medium">
                            ৳{dueAmount.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400 text-sm py-8">
                No purchase history available
              </p>
            )}
          </div>
        </div>

        {/* Edit Modal */}
        <SupplierFormModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          supplier={supplier}
        />
      </div>
    </>
  );
}
