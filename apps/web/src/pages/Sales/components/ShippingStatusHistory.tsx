import { Clock, User } from "lucide-react";
import { ShippingStatusHistory } from "../../../types/sales";
import { formatDate } from "../../../utlis";

interface ShippingStatusHistoryProps {
  history: ShippingStatusHistory[];
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "ordered":
      return "📦";
    case "packed":
      return "📋";
    case "shipped":
      return "🚚";
    case "in_transit":
      return "🚛";
    case "delivered":
      return "✅";
    case "cancelled":
      return "❌";
    case "returned":
      return "↩️";
    default:
      return "⏳";
  }
};

const getStatusColor = (status: string): string => {
  switch (status) {
    case "ordered":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    case "packed":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
    case "shipped":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
    case "in_transit":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    case "delivered":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    case "cancelled":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    case "returned":
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function ShippingStatusHistoryComponent({
  history,
}: ShippingStatusHistoryProps) {
  if (!history || history.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500 dark:text-gray-400 text-sm">
        <Clock className="mx-auto mb-1.5" size={24} />
        <p>No status history available</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
        <Clock size={16} />
        Status History
      </h3>

      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>

        <div className="space-y-3">
          {history.map((item) => (
            <div key={item.id} className="relative flex items-start gap-3">
              {/* Timeline Dot */}
              <div className="relative z-10 shrink-0 w-6 h-6 rounded-full bg-white dark:bg-gray-800 border-2 border-blue-500 flex items-center justify-center">
                <span className="text-xs">
                  {getStatusIcon(item.new_status)}
                </span>
              </div>

              {/* Timeline Content */}
              <div className="flex-1 pb-2">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-2.5 border border-gray-200 dark:border-gray-700 shadow-sm">
                  <div className="flex items-center justify-between mb-1.5">
                    {/* Status Transition */}
                    <div className="flex items-center gap-1.5">
                      {item.previous_status ? (
                        <>
                          <span
                            className={`px-1.5 py-0.5 rounded text-xs font-medium capitalize ${getStatusColor(item.previous_status)}`}
                          >
                            {item.previous_status.replace(/_/g, " ")}
                          </span>
                          <span className="text-gray-400 text-xs">→</span>
                        </>
                      ) : (
                        <span className="text-gray-400 text-xs italic">
                          Initial
                        </span>
                      )}
                      <span
                        className={`px-1.5 py-0.5 rounded text-xs font-medium capitalize ${getStatusColor(item.new_status)}`}
                      >
                        {item.new_status.replace(/_/g, " ")}
                      </span>
                    </div>

                    {/* Date */}
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(item.created_at)}
                    </span>
                  </div>

                  {/* Notes */}
                  {item.notes ? (
                    <p className="text-xs text-gray-600 dark:text-gray-300 mb-1.5">
                      {item.notes}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-400 dark:text-gray-500 italic mb-1.5">
                      No notes
                    </p>
                  )}

                  {/* Metadata */}
                  {item.metadata && Object.keys(item.metadata).length > 0 ? (
                    <div className="p-1.5 bg-gray-50 dark:bg-gray-700 rounded text-xs">
                      <div className="grid grid-cols-2 gap-1.5">
                        {Object.entries(item.metadata).map(([key, value]) => (
                          <div key={key}>
                            <span className="text-gray-500 dark:text-gray-400 capitalize">
                              {key.replace(/_/g, " ")}:
                            </span>{" "}
                            <span className="text-gray-700 dark:text-gray-300">
                              {value !== null &&
                              value !== undefined &&
                              value !== ""
                                ? String(value)
                                : "Not specified"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {/* User */}
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                    <User size={11} />
                    <span>{item.changed_by?.full_name || "System"}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
