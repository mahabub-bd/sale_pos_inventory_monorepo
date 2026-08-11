import {
  ArrowLeft,
  Barcode as BarcodeIcon,
  Edit,
  Package,
  QrCode,
  Tag,
  TrendingUp,
  User,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Info from "../../../components/common/Info";
import Loading from "../../../components/common/Loading";
import { Barcode, CustomQRCode } from "../../../components/qr-barcode";
import Button from "../../../components/ui/button/Button";
import ResponsiveImage from "../../../components/ui/images/ResponsiveImage";
import { useGetProductByIdQuery } from "../../../features/product/productApi";
import { useHasPermission } from "../../../hooks/useHasPermission";
import { ProductType } from "../../../types/product";

interface Props {
  productId: string;
}

export default function ProductDetail({ productId }: Props) {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useGetProductByIdQuery(productId);
  const product = data?.data;

  const canUpdate = useHasPermission("product.update");

  // Helper function to format product type
  const formatProductType = (type: ProductType | undefined): string => {
    if (!type) return "Not specified";
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  if (isLoading) return <Loading message="Loading Product..." />;

  if (isError || !product)
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
            <Package className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Failed to Load Product
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            We couldn't retrieve the product details. Please try again.
          </p>
          <Button
            onClick={() => navigate("/products")}
            variant="primary"
            size="sm"
          >
            Back to Products
          </Button>
        </div>
      </div>
    );

  const handleEdit = () => {
    navigate(`/products/edit/${product.id}`);
  };

  const goBack = () => {
    navigate("/products");
  };

  // Calculate sold percentage
  const totalStock = Number(product.total_stock) || 0;
  const totalSold = Number(product.total_sold) || 0;
  const soldPercentage =
    totalStock === 0 ? 0 : Math.round((totalSold / totalStock) * 100);

  return (
    <div className="space-y-4">
      {/* Header Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-start gap-3">
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                {product.name}
              </h1>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  SKU:{" "}
                  <span className="font-mono font-medium text-gray-700 dark:text-gray-300">
                    {product.sku}
                  </span>
                </span>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    product.status
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                  }`}
                >
                  <span
                    className={`w-1 h-1 rounded-full mr-1 ${
                      product.status ? "bg-green-500" : "bg-red-500"
                    }`}
                  ></span>
                  {product.status ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {canUpdate && (
              <Button
                onClick={handleEdit}
                variant="primary"
                size="sm"
                className="gap-1"
              >
                <Edit size={14} />
                <span className="hidden sm:inline">Edit</span>
              </Button>
            )}
            <Button
              onClick={goBack}
              variant="outline"
              size="sm"
              className="gap-1"
            >
              <ArrowLeft size={14} />
              <span className="hidden sm:inline">Back</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
              Total Stock
            </p>
            <div className="w-6 h-6 rounded bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Package className="w-3 h-3 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            {product.total_stock ?? 0}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
              Available
            </p>
            <div className="w-6 h-6 rounded bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Package className="w-3 h-3 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            {product.available_stock ?? 0}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
              Total Sold
            </p>
            <div className="w-6 h-6 rounded bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <TrendingUp className="w-3 h-3 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            {product.total_sold ?? 0}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
              Sold Rate
            </p>
            <div className="w-6 h-6 rounded bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <TrendingUp className="w-3 h-3 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            {soldPercentage}%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column - Product Images */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                Product Images
              </h2>
            </div>
            <div className="p-4">
              {product.images && product.images.length > 0 ? (
                <div className="space-y-3">
                  <div className="relative overflow-hidden rounded-lg">
                    <ResponsiveImage
                      src={product.images[0].url}
                      alt={product.name}
                      className="w-full h-56 object-cover"
                    />
                  </div>
                  {product.images.length > 1 && (
                    <div className="grid grid-cols-3 gap-2">
                      {product.images.slice(1, 4).map((image, index) => (
                        <div
                          key={image.id}
                          className="relative rounded overflow-hidden bg-gray-100 dark:bg-gray-900"
                        >
                          <ResponsiveImage
                            src={image.url}
                            alt={`${product.name} ${index + 2}`}
                            className="w-full h-20 object-cover cursor-pointer hover:opacity-80 transition-opacity"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full h-56 bg-gray-100 dark:bg-gray-900 rounded-lg flex flex-col items-center justify-center">
                  <Package className="w-10 h-10 text-gray-400 dark:text-gray-600 mb-2" />
                  <p className="text-gray-500 dark:text-gray-400 text-xs">
                    No images
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* QR Code & Barcode */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                QR & Barcode
              </h2>
            </div>
            <div className="p-4 space-y-4">
              {/* QR Code Section */}
              <div className="text-center">
                <div className="inline-flex items-center justify-center mb-2 px-2 py-1 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <QrCode
                    size={14}
                    className="mr-1 text-blue-600 dark:text-blue-400"
                  />
                  <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                    QR Code
                  </span>
                </div>
                <div className="flex justify-center mb-2">
                  <div className="p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <CustomQRCode
                      value={product.sku}
                      size={100}
                      level="M"
                      includeMargin={true}
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                  {product.sku}
                </p>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700"></div>

              {/* Barcode Section */}
              <div className="text-center">
                <div className="inline-flex items-center justify-center mb-2 px-2 py-1 bg-green-50 dark:bg-green-900/20 rounded">
                  <BarcodeIcon
                    size={14}
                    className="mr-1 text-green-600 dark:text-green-400"
                  />
                  <span className="text-xs font-medium text-green-700 dark:text-green-300">
                    Barcode
                  </span>
                </div>
                <div className="flex justify-center mb-2">
                  {product.barcode ? (
                    <div className="p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <Barcode
                        value={product.barcode}
                        width={2}
                        height={45}
                        displayValue={true}
                        fontSize={11}
                      />
                    </div>
                  ) : (
                    <div className="p-4 bg-gray-50 dark:bg-gray-900 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                      <BarcodeIcon className="w-6 h-6 text-gray-400 dark:text-gray-600 mx-auto mb-1" />
                      <p className="text-gray-500 dark:text-gray-400 text-xs">
                        No barcode
                      </p>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                  {product.barcode || "Not assigned"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Product Information */}
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
                <Info label="Product Name" value={product.name} />
                <Info label="SKU" value={product.sku} />
                <Info
                  label="Product Type"
                  value={formatProductType(product.product_type)}
                />
                <Info
                  label="Barcode"
                  value={product.barcode || "Not assigned"}
                />
                <Info
                  label="Unit"
                  value={product.unit?.name || "Not specified"}
                />
                <Info
                  label="Origin"
                  value={product.origin || "Not specified"}
                />
                <Info
                  label="Expiry Date"
                  value={
                    product.expire_date
                      ? new Date(product.expire_date).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )
                      : "Not specified"
                  }
                />
                <Info
                  label="Created At"
                  value={new Date(product.created_at).toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}
                />
              </div>

              {product.description && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Pricing Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                Pricing Information
              </h2>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="text-center p-3 bg-linear-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg">
                  <p className="text-xs text-blue-700 dark:text-blue-300 mb-1">
                    Purchase Price
                  </p>
                  <p className="text-lg font-bold text-blue-900 dark:text-blue-100">
                    ৳{Number(product.purchase_price).toLocaleString()}
                  </p>
                </div>
                <div className="text-center p-3 bg-linear-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg">
                  <p className="text-xs text-green-700 dark:text-green-300 mb-1">
                    Selling Price
                  </p>
                  <p className="text-lg font-bold text-green-900 dark:text-green-100">
                    ৳{Number(product.selling_price).toLocaleString()}
                  </p>
                </div>
                <div className="text-center p-3 bg-linear-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg">
                  <p className="text-xs text-orange-700 dark:text-orange-300 mb-1">
                    Discount Price
                  </p>
                  <p className="text-lg font-bold text-orange-900 dark:text-orange-100">
                    {product.discount_price
                      ? `৳${Number(product.discount_price).toLocaleString()}`
                      : "—"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Customer-Specific Prices */}
          {product.customer_prices && product.customer_prices.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center">
                <Users className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-2" />
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Customer-Specific Prices
                </h2>
              </div>
              <div className="p-4">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700 dark:text-gray-300">
                          Customer
                        </th>
                        <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700 dark:text-gray-300">
                          Code
                        </th>
                        <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700 dark:text-gray-300">
                          Sale Price
                        </th>
                        <th className="text-center py-2 px-3 text-xs font-semibold text-gray-700 dark:text-gray-300">
                          Discount
                        </th>
                        <th className="text-center py-2 px-3 text-xs font-semibold text-gray-700 dark:text-gray-300">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {product.customer_prices.map((customerPrice) => {
                        const sellingPriceNum = Number(product.selling_price);
                        const customerPriceNum = Number(
                          customerPrice.sale_price
                        );
                        const discountAmount =
                          sellingPriceNum - customerPriceNum;
                        const discountPercentage =
                          sellingPriceNum > 0
                            ? (
                                (discountAmount / sellingPriceNum) *
                                100
                              ).toFixed(1)
                            : "0.0";

                        return (
                          <tr
                            key={customerPrice.id}
                            className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900/30"
                          >
                            <td className="py-2 px-3">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {customerPrice.customer_name ||
                                  `Customer #${customerPrice.customer_id}`}
                              </div>
                            </td>
                            <td className="py-2 px-3">
                              <div className="text-xs text-gray-700 dark:text-gray-300 font-mono">
                                {customerPrice.customer_code ||
                                  `#${customerPrice.customer_id}`}
                              </div>
                            </td>
                            <td className="py-2 px-3">
                              <div className="text-sm font-semibold text-green-600 dark:text-green-400">
                                ৳{customerPriceNum.toLocaleString()}
                              </div>
                            </td>
                            <td className="py-2 px-3 text-center">
                              {discountAmount > 0 ? (
                                <div>
                                  <div className="text-xs font-medium text-red-600 dark:text-red-400">
                                    -৳{discountAmount.toLocaleString()}
                                  </div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    ({discountPercentage}%)
                                  </div>
                                </div>
                              ) : (
                                <span className="text-gray-400 dark:text-gray-500 text-xs">
                                  —
                                </span>
                              )}
                            </td>
                            <td className="py-2 px-3 text-center">
                              {customerPrice.is_active ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                  Active
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                                  Inactive
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    <span className="font-medium">
                      {product.customer_prices.length}
                    </span>{" "}
                    customer(s) have special pricing
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Categories and Tags */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center">
              <Tag className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-2" />
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                Categories & Tags
              </h2>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
                <Info
                  label="Category"
                  value={product.category?.name || "Not assigned"}
                />
                <Info
                  label="Subcategory"
                  value={product.subcategory?.name || "Not assigned"}
                />
                <Info
                  label="Brand"
                  value={product.brand?.name || "Not assigned"}
                />
                <div className="flex items-center gap-2">
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Tags
                  </p>
                  {product.tags && product.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {product.tags.map((tag) => (
                        <span
                          key={tag.id}
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-xs">No tags</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Supplier Information */}
          {product.supplier && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center">
                <User className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-2" />
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Supplier Information
                </h2>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
                  <Info label="Supplier Name" value={product.supplier.name} />
                  <Info
                    label="Supplier Code"
                    value={product.supplier.supplier_code}
                  />
                  <Info
                    label="Contact Person"
                    value={product.supplier.contact_person || "Not provided"}
                  />
                  <Info
                    label="Phone"
                    value={product.supplier.phone || "Not provided"}
                  />
                  <Info
                    label="Email"
                    value={product.supplier.email || "Not provided"}
                  />
                  <Info
                    label="Address"
                    value={product.supplier.address || "Not provided"}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
