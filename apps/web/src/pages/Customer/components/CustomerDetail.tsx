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
import { useNavigate } from "react-router-dom";
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
import { useGetCustomerByIdQuery } from "../../../features/customer/customerApi";
import { useHasPermission } from "../../../hooks/useHasPermission";

interface Props {
  customerId: string;
}

export default function CustomerDetail({ customerId }: Props) {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useGetCustomerByIdQuery(customerId);
  const customer = data?.data;

  const canUpdate = useHasPermission("customer.update");

  if (isLoading) return <Loading message="Loading Customer..." />;

  if (isError || !customer)
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
            <User className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Failed to Load Customer
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            We couldn't retrieve the customer details. Please try again.
          </p>
          <IconButton
            icon={ArrowLeft}
            tooltip="Back to Customers"
            color="gray"
            onClick={() => navigate("/customers")}
          >
            Back to Customers
          </IconButton>
        </div>
      </div>
    );

  const sales = customer.sales || [];

  // Calculate additional statistics
  const totalSalesCount = sales.length;
  const totalAmount = sales.reduce(
    (s: number, v: any) => s + Number(v.total),
    0
  );
  const totalPaid = sales.reduce(
    (s: number, v: any) => s + Number(v.paid_amount),
    0
  );
  const totalDue = sales.reduce(
    (s: number, v: any) => s + (Number(v.total) - Number(v.paid_amount)),
    0
  );
  const averageSaleAmount =
    totalSalesCount > 0 ? totalAmount / totalSalesCount : 0;

  // Get last purchase date
  const lastPurchase =
    sales.length > 0
      ? sales.reduce(
          (latest: any, sale: any) =>
            new Date(sale.created_at) > new Date(latest.created_at)
              ? sale
              : latest,
          sales[0]
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
    totalSales: totalSalesCount,
    totalAmount,
    totalPaid,
    totalDue,
    averageSaleAmount,
    lastPurchaseDate,
  };

  const handleEdit = () => {
    navigate(`/customers/${customerId}/edit`);
  };

  const goBack = () => {
    navigate("/customers");
  };

  return (
    <>
      <PageMeta
        title={`Customer - ${customer.name}`}
        description="Customer Details"
      />
      <PageBreadcrumb pageTitle={`Customer - ${customer.name}`} />

      <div className="space-y-4">
        {/* Header Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-lg bg-linear-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                {customer.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                  {customer.name}
                </h1>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                    {customer.customer_code}
                  </span>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      customer.status
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                    }`}
                  >
                    <span
                      className={`w-1 h-1 rounded-full mr-1 ${
                        customer.status ? "bg-green-500" : "bg-red-500"
                      }`}
                    ></span>
                    {customer.status ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <IconButton
                icon={BookOpen}
                tooltip="View Ledger"
                color="purple"
                onClick={() => navigate(`/customers/${customerId}/ledger`)}
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
                Total Sales
              </p>
              <div className="w-6 h-6 rounded bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <TrendingUp className="w-3 h-3 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {summary.totalSales}
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
                Avg Sale
              </p>
              <div className="w-6 h-6 rounded bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                <TrendingUp className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              ৳{summary.averageSaleAmount.toFixed(2)}
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
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-500 dark:text-gray-400 w-24">
                    Phone:
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {customer.phone || "Not provided"}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-500 dark:text-gray-400 w-24">
                    Email:
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {customer.email || "Not provided"}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-500 dark:text-gray-400 w-24">
                    Group:
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {customer.group?.name || "Not assigned"}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-500 dark:text-gray-400 w-24">
                    Points:
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {customer.reward_points || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Account Information */}
            {customer.account && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center">
                  <User className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-2" />
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Account Information
                  </h2>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-1 gap-3">
                    <Info label="Account Code" value={customer.account.code} />
                    <Info
                      label="Account Number"
                      value={customer.account.account_number}
                    />
                    <Info label="Account Name" value={customer.account.name} />
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
                  <Info label="Customer Name" value={customer.name} />
                  <Info label="Customer Code" value={customer.customer_code} />
                  <Info
                    label="Status"
                    value={
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          customer.status
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                        }`}
                      >
                        {customer.status ? "Active" : "Inactive"}
                      </span>
                    }
                  />
                  <Info
                    label="Created At"
                    value={new Date(customer.created_at).toLocaleDateString(
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
            <div className="grid grid-cols-2 gap-4">
              {/* Billing Address */}
              {customer.billing_address && (
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
                        value={customer.billing_address.contact_name}
                      />
                      <Info
                        label="Phone"
                        value={customer.billing_address.phone}
                      />
                      <Info
                        label="Street"
                        value={customer.billing_address.street}
                      />
                      <Info
                        label="City"
                        value={customer.billing_address.city}
                      />
                      <Info
                        label="Country"
                        value={customer.billing_address.country}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Shipping Address */}
              {customer.shipping_address && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center">
                    <MapPin className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-2" />
                    <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                      Shipping Address
                    </h2>
                  </div>
                  <div className="p-4">
                    <div className="grid grid-cols-1  gap-x-4 gap-y-3">
                      <Info
                        label="Contact Name"
                        value={customer.shipping_address.contact_name}
                      />
                      <Info
                        label="Phone"
                        value={customer.shipping_address.phone}
                      />
                      <Info
                        label="Street"
                        value={customer.shipping_address.street}
                      />
                      <Info
                        label="City"
                        value={customer.shipping_address.city}
                      />
                      <Info
                        label="Country"
                        value={customer.shipping_address.country}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sales History - Full Width */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
              Sales History
            </h2>
          </div>
          <div className="p-4">
            {sales.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableCell isHeader className="text-left">
                        Date
                      </TableCell>
                      <TableCell isHeader className="text-left">
                        Invoice No
                      </TableCell>
                      <TableCell isHeader className="text-center">
                        Items
                      </TableCell>
                      <TableCell isHeader className="text-center">
                        Status
                      </TableCell>
                      <TableCell isHeader className="text-center">
                        Payment
                      </TableCell>
                      <TableCell isHeader className="text-center">
                        Method
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
                    {sales.map((sale: any) => {
                      const dueAmount =
                        Number(sale.total) - Number(sale.paid_amount);
                      const isPaid = dueAmount <= 0;

                      return (
                        <TableRow
                          key={sale.id}
                          onClick={() => navigate(`/sales/${sale.id}`)}
                          className="hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer transition-colors"
                        >
                          <TableCell className="whitespace-nowrap">
                            {formatDate(sale.created_at)}
                          </TableCell>
                          <TableCell className="text-blue-600 dark:text-blue-400 hover:underline font-mono">
                            {sale.invoice_no}
                          </TableCell>
                          <TableCell className="capitalize">
                            {sale.items?.length || 0}
                          </TableCell>
                          <TableCell className="capitalize">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                                sale.status === "completed"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                  : sale.status === "pending"
                                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                                    : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                              }`}
                            >
                              {sale.status === "completed" ? (
                                <CheckCircle className="w-3 h-3" />
                              ) : sale.status === "pending" ? (
                                <Clock className="w-3 h-3" />
                              ) : (
                                <XCircle className="w-3 h-3" />
                              )}
                              {sale.status}
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
                          <TableCell className=" capitalize">
                            {sale.payments && sale.payments.length > 0
                              ? sale.payments[0].method
                              : "-"}
                          </TableCell>
                          <TableCell className="text-right">
                            ৳{Number(sale.total).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right text-green-600 dark:text-green-400">
                            ৳{Number(sale.paid_amount).toLocaleString()}
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
                No sales history available
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
