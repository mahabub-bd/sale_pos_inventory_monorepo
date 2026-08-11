import { ChevronLeft, FileDown, Truck, Wallet } from "lucide-react";
import { useState } from "react";
import { useParams } from "react-router";

import IconButton from "../../../components/common/IconButton";
import Loading from "../../../components/common/Loading";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import Badge from "../../../components/ui/badge/Badge";

import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";

import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import Info from "../../../components/common/Info";
import Button from "../../../components/ui/button/Button";
import { useLazyGetInvoicePdfQuery } from "../../../features/invoice/invoiceApi";
import {
  useGetSaleByIdQuery,
  useGetShippingStatusHistoryQuery,
  useGetShippingStatusQuery,
} from "../../../features/sale/saleApi";
import { SaleItem, SalePayment, ShippingStatus } from "../../../types/sales";
import SalePaymentModal from "./SalePaymentModal";
import ShippingStatusHistoryComponent from "./ShippingStatusHistory";
import ShippingStatusModal from "./ShippingStatusModal";

export default function SaleDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading, isError, refetch } = useGetSaleByIdQuery(String(id));
  const [getInvoicePdf, { isLoading: isDownloadingPdf }] =
    useLazyGetInvoicePdfQuery();

  // Fetch shipping status
  const { data: shippingData, refetch: refetchShipping } =
    useGetShippingStatusQuery(Number(id));
  const { data: shippingHistoryData } = useGetShippingStatusHistoryQuery(
    Number(id),
  );

  const sale = data?.data;
  const shippingStatus = shippingData?.data;
  const shippingHistory = shippingHistoryData?.data;

  // Modal state
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [shippingModalOpen, setShippingModalOpen] = useState(false);

  // Helper function for shipping status badge
  const getShippingStatusBadge = (status: ShippingStatus) => {
    const colors: Record<ShippingStatus, string> = {
      ordered: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      packed:
        "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      shipped:
        "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      in_transit:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      delivered:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      returned: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
    };

    return (
      <span
        className={`px-2 py-1 rounded-md text-xs font-medium capitalize ${
          colors[status] || "bg-gray-100 text-gray-800"
        }`}
      >
        {status.replace(/_/g, " ")}
      </span>
    );
  };

  const handleDownloadPdf = async () => {
    try {
      console.log("Downloading PDF for sale ID:", id, "Type: sale");
      // Force a new request with unique cache key to avoid caching issues
      const blob = await getInvoicePdf({
        type: "sale",
        id: Number(id),
      }).unwrap();
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
      // Clean up the object URL after a short delay
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 1000);
    } catch (error) {
      toast.error("Failed to open PDF");
      console.error("PDF open error:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));

      // Try alternative approach with timestamp
      try {
        console.log("Retrying with timestamp...");
        const timestamp = Date.now();
        const response = await fetch(
          `http://localhost:8000/v1/invoice/sale/${id}?t=${timestamp}`,
          {
            method: "GET",
            headers: {
              Accept: "application/pdf",
              Origin: "http://localhost:5000",
            },
            credentials: "include",
          },
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        window.open(url, "_blank");
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
        }, 1000);
      } catch (fallbackError) {
        console.error("Fallback request failed:", fallbackError);
        toast.error("Failed to open PDF. Please try again.");
      }
    }
  };

  const handleDownloadDeliveryChallan = async () => {
    try {
      console.log("Downloading Delivery Challan for sale ID:", id);
      const blob = await getInvoicePdf({
        type: "delivery_challan",
        id: Number(id),
      }).unwrap();
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 1000);
    } catch (error) {
      toast.error("Failed to open Delivery Challan");
      console.error("Delivery Challan error:", error);

      // Fallback
      try {
        const timestamp = Date.now();
        const response = await fetch(
          `http://localhost:8000/v1/invoice/delivery-challan/${id}?t=${timestamp}`,
          {
            method: "GET",
            headers: {
              Accept: "application/pdf",
              Origin: "http://localhost:5000",
            },
            credentials: "include",
          },
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        window.open(url, "_blank");
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
        }, 1000);
      } catch (fallbackError) {
        console.error("Fallback request failed:", fallbackError);
        toast.error("Failed to open Delivery Challan. Please try again.");
      }
    }
  };

  if (isLoading) return <Loading message="Loading sale details..." />;
  if (isError || !sale)
    return <p className="text-red-500 p-4">Failed to fetch sale details.</p>;

  const dueAmount = Number(sale.total) - Number(sale.paid_amount);

  return (
    <div>
      <PageMeta
        title={`Sale - ${sale.invoice_no}`}
        description="Sale Details"
      />
      <PageBreadcrumb pageTitle={`Sale Details (${sale.invoice_no})`} />

      <div className="flex flex-col gap-5 min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/5">
        <div className="flex justify-end gap-5">
          <Link to="/sales">
            <Button variant="primary" size="sm">
              <ChevronLeft size={16} />
              Back to Sales
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadPdf}
            disabled={isDownloadingPdf}
          >
            <FileDown size={16} />
            {isDownloadingPdf ? "Opening ..." : "Invoice"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadDeliveryChallan}
            disabled={isDownloadingPdf}
            className="border-green-600 text-green-600 hover:bg-green-50 dark:border-green-400 dark:text-green-400 dark:hover:bg-green-900/20"
          >
            <Truck size={16} />
            Delivery Challan
          </Button>
        </div>
        {/* Sale Info */}
        <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-medium">Sale Information</h2>

            {/* Show Pay Due button ONLY if there's a due */}
            {dueAmount > 0 && (
              <IconButton
                icon={Wallet}
                color="blue"
                tooltip="Pay Due"
                onClick={() => setPaymentModalOpen(true)}
              />
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <Info label="Invoice No" value={sale.invoice_no} />
            <Info label="Subtotal" value={`${sale.subtotal}`} />
            <Info label="Tax" value={`${sale.tax}`} />

            {/* Group Discount - only show if exists */}
            {sale.group_discount && Number(sale.group_discount) > 0 && (
              <Info
                label="Group Discount"
                value={`${sale.group_discount}`}
                className="text-blue-600 dark:text-blue-400"
              />
            )}

            {/* Manual Discount - only show if exists */}
            {sale.manual_discount && Number(sale.manual_discount) > 0 && (
              <Info
                label="Manual Discount"
                value={`${sale.manual_discount}`}
                className="text-red-600 dark:text-red-400"
              />
            )}

            {/* Total Discount */}
            <Info
              label="Total Discount"
              value={`${sale.discount}`}
              className="font-semibold"
            />

            <Info label="Total Amount" value={`${sale.total}`} />
            <Info label="Paid Amount" value={`${sale.paid_amount}`} />
            <Info label="Due Amount" value={`${dueAmount}`} />
            <Info label="Sale Type" value={`${sale.sale_type} `} />
            <div className="inline-flex items-center gap-2">
              Status:
              <Badge
                color={
                  sale.status === "completed"
                    ? "success"
                    : sale.status === "pending"
                      ? "warning"
                      : "error"
                }
              >
                {sale.status}
              </Badge>
            </div>
          </div>
        </div>

        {/* Customer Info */}
        <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
          <h2 className="text-lg font-medium mb-3">Customer Information</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <Info label="Customer Code" value={sale.customer.customer_code} />
            <Info label="Name" value={sale.customer.name} />
            <Info label="Phone" value={sale.customer.phone} />
            <Info label="Email" value={sale.customer.email || "-"} />
            <Info
              label="Reward Points"
              value={`${sale.customer.reward_points || 0}`}
            />
          </div>
        </div>

        {/* Billing & Shipping Address */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Billing Address */}
          {sale.customer.billing_address && (
            <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
              <h2 className="text-lg font-medium mb-3">Billing Address</h2>
              <div className="space-y-2 text-sm">
                <Info
                  label="Contact Name"
                  value={sale.customer.billing_address.contact_name || "-"}
                />
                <Info
                  label="Phone"
                  value={sale.customer.billing_address.phone || "-"}
                />
                <Info
                  label="Street"
                  value={sale.customer.billing_address.street || "-"}
                />
                <Info
                  label="City"
                  value={sale.customer.billing_address.city || "-"}
                />
                <Info
                  label="Country"
                  value={sale.customer.billing_address.country || "-"}
                />
              </div>
            </div>
          )}

          {/* Shipping Address */}
          {sale.customer.shipping_address && (
            <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
              <h2 className="text-lg font-medium mb-3">Shipping Address</h2>
              <div className="space-y-2 text-sm">
                <Info
                  label="Contact Name"
                  value={sale.customer.shipping_address.contact_name || "-"}
                />
                <Info
                  label="Phone"
                  value={sale.customer.shipping_address.phone || "-"}
                />
                <Info
                  label="Street"
                  value={sale.customer.shipping_address.street || "-"}
                />
                <Info
                  label="City"
                  value={sale.customer.shipping_address.city || "-"}
                />
                <Info
                  label="Country"
                  value={sale.customer.shipping_address.country || "-"}
                />
              </div>
            </div>
          )}
        </div>

        {/* Shipping Status Section - Only for Regular Sales */}
        {sale.sale_type === "regular" && (
          <>
            <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-medium flex items-center gap-2">
                  <Truck size={18} className="text-blue-600" />
                  Shipping Status
                </h2>
                {shippingStatus?.status !== "delivered" && (
                  <button
                    onClick={() => setShippingModalOpen(true)}
                    className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 border border-blue-600 rounded-lg hover:bg-blue-50"
                  >
                    {shippingStatus ? "Update Status" : "Add Status"}
                  </button>
                )}
              </div>

              {shippingStatus ? (
                <div className="space-y-3">
                  {/* Status Badge */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Current Status:
                    </span>
                    {getShippingStatusBadge(shippingStatus.status)}
                  </div>

                  {/* Tracking Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {shippingStatus.tracking_number && (
                      <Info
                        label="Tracking Number"
                        value={shippingStatus.tracking_number}
                      />
                    )}
                    {shippingStatus.carrier && (
                      <Info label="Carrier" value={shippingStatus.carrier} />
                    )}
                    {shippingStatus.delivery_company && (
                      <Info
                        label="Delivery Company"
                        value={shippingStatus.delivery_company}
                      />
                    )}
                    {shippingStatus.delivery_person && (
                      <Info
                        label="Delivery Person"
                        value={shippingStatus.delivery_person}
                      />
                    )}
                    {shippingStatus.estimated_delivery && (
                      <Info
                        label="Estimated Delivery"
                        value={new Date(
                          shippingStatus.estimated_delivery,
                        ).toLocaleDateString()}
                      />
                    )}
                    {shippingStatus.actual_delivery && (
                      <Info
                        label="Actual Delivery"
                        value={new Date(
                          shippingStatus.actual_delivery,
                        ).toLocaleDateString()}
                      />
                    )}
                    {shippingStatus.shipping_address && (
                      <Info
                        label="Shipping Address"
                        value={shippingStatus.shipping_address}
                        className="col-span-2"
                      />
                    )}
                    {shippingStatus.notes && (
                      <Info
                        label="Notes"
                        value={shippingStatus.notes}
                        className="col-span-2"
                      />
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 py-4 text-center">
                  No shipping status added yet. Click "Add Status" to create
                  one.
                </p>
              )}
            </div>

            {/* Shipping Status History */}
            {shippingHistory && shippingHistory.length > 0 && (
              <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                <ShippingStatusHistoryComponent history={shippingHistory} />
              </div>
            )}
          </>
        )}

        {/* Sale Item List */}
        <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
          <h2 className="text-lg font-medium mb-3">Sale Items</h2>

          <Table>
            <TableHeader className="border-b bg-gray-100 dark:bg-gray-700">
              <TableRow>
                <TableCell isHeader>Product</TableCell>
                <TableCell isHeader>Qty</TableCell>
                <TableCell isHeader>Unit Price</TableCell>
                <TableCell isHeader>Discount</TableCell>
                <TableCell isHeader>Tax</TableCell>
                <TableCell isHeader>Line Total</TableCell>
              </TableRow>
            </TableHeader>

            <TableBody>
              {sale.items.map((item: SaleItem) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <p className="font-medium">{item.product.name}</p>
                    <p className="text-xs text-gray-500">{item.product.sku}</p>
                  </TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{item.unit_price}</TableCell>
                  <TableCell>{item.discount}</TableCell>
                  <TableCell>{item.tax}</TableCell>
                  <TableCell>{item.line_total}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Payment History */}
        <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
          <h2 className="text-lg font-medium mb-3">Payment History</h2>

          <Table>
            <TableHeader className="border-b bg-gray-100 dark:bg-gray-700">
              <TableRow>
                <TableCell isHeader>Method</TableCell>
                <TableCell isHeader>Amount</TableCell>
                <TableCell isHeader>Account Code</TableCell>
                <TableCell isHeader>Date</TableCell>
              </TableRow>
            </TableHeader>

            <TableBody>
              {sale.payments.map((p: SalePayment) => (
                <TableRow key={p.id}>
                  <TableCell className="capitalize">{p.method}</TableCell>
                  <TableCell>{p.amount}</TableCell>
                  <TableCell>{p.account_code}</TableCell>
                  <TableCell>
                    {new Date(p.created_at).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Payment Modal */}
      {paymentModalOpen && (
        <SalePaymentModal
          isOpen={paymentModalOpen}
          onClose={() => {
            setPaymentModalOpen(false);
            refetch(); // Refresh sale details after payment
          }}
          sale={sale}
        />
      )}

      {/* Shipping Status Modal */}
      {shippingModalOpen && (
        <ShippingStatusModal
          isOpen={shippingModalOpen}
          onClose={() => {
            setShippingModalOpen(false);
            refetchShipping(); // Refresh shipping status
          }}
          saleId={Number(id)}
          saleType={sale.sale_type}
          shippingData={shippingStatus || null}
        />
      )}
    </div>
  );
}
