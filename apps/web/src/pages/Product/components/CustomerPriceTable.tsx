import { Users } from "lucide-react";

interface CustomerPrice {
  id: number;
  customer_id: number;
  customer_name?: string;
  customer_code?: string;
  sale_price: number | string;
  is_active: boolean;
}

interface Props {
  sellingPrice: number;
  prices: CustomerPrice[];
}

export default function CustomerPriceTable({ sellingPrice, prices }: Props) {
  if (!prices.length) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border overflow-hidden">
      <div className="px-6 py-4 border-b flex items-center gap-2">
        <Users className="w-5 h-5 text-gray-400" />
        <h2 className="font-semibold">Customer-Specific Prices</h2>
      </div>

      <div className="p-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="py-2 text-left">Customer</th>
              <th className="py-2 text-left">Code</th>
              <th className="py-2 text-left">Sale Price</th>
              <th className="py-2 text-center">Discount</th>
              <th className="py-2 text-center">Status</th>
            </tr>
          </thead>

          <tbody>
            {prices.map((price) => {
              const sale = Number(price.sale_price);
              const discount = sellingPrice - sale;
              const discountPct =
                sellingPrice > 0
                  ? ((discount / sellingPrice) * 100).toFixed(1)
                  : "0";

              return (
                <tr
                  key={price.id}
                  className="border-b last:border-0 hover:bg-gray-50 dark:hover:bg-gray-900/30"
                >
                  <td className="py-2">
                    {price.customer_name || `Customer #${price.customer_id}`}
                  </td>

                  <td className="py-2 font-mono text-gray-500">
                    {price.customer_code || `#${price.customer_id}`}
                  </td>

                  <td className="py-2 font-semibold text-green-600">
                    ৳{sale.toLocaleString()}
                  </td>

                  <td className="py-2 text-center">
                    {discount > 0 ? (
                      <>
                        <div className="text-red-600">
                          -৳{discount.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-400">
                          ({discountPct}%)
                        </div>
                      </>
                    ) : (
                      "—"
                    )}
                  </td>

                  <td className="py-2 text-center">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        price.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {price.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <p className="mt-4 text-sm text-gray-500">
          <span className="font-medium">{prices.length}</span> customer(s) have
          special pricing
        </p>
      </div>
    </div>
  );
}
