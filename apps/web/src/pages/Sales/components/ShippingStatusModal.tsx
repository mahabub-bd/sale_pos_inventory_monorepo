import { ShippingStatus, ShippingStatusData } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowRight,
  CheckCircle,
  Clock,
  Package,
  Truck,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { z } from "zod";
import DatePicker from "../../../components/form/date-picker";
import {
  FormField,
  SelectField,
} from "../../../components/form/form-elements/SelectFiled";
import Input from "../../../components/form/input/InputField";
import Button from "../../../components/ui/button/Button";
import { Modal } from "../../../components/ui/modal";
import {
  useCreateShippingStatusMutation,
  useUpdateShippingStatusMutation,
} from "../../../features/sale/saleApi";
import { useHasPermission } from "../../../hooks/useHasPermission";

// Zod schema for shipping status validation
const shippingStatusSchema = z.object({
  status: z.enum(
    [
      "ordered",
      "packed",
      "shipped",
      "in_transit",
      "delivered",
      "cancelled",
      "returned",
    ],
    {
      message: "Status is required",
    },
  ),
  tracking_number: z.string().optional(),
  carrier: z.string().optional(),
  delivery_company: z.string().optional(),
  delivery_person: z.string().optional(),
  shipping_address: z.string().optional(),
  notes: z.string().optional(),
});

type ShippingStatusFormData = z.infer<typeof shippingStatusSchema>;

interface ShippingStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  saleId: number;
  saleType: string;
  shippingData: ShippingStatusData | null;
}

const shippingStatusOptions = [
  { id: "ordered", name: "Ordered" },
  { id: "packed", name: "Packed" },
  { id: "shipped", name: "Shipped" },
  { id: "in_transit", name: "In Transit" },
  { id: "delivered", name: "Delivered" },
  { id: "cancelled", name: "Cancelled" },
  { id: "returned", name: "Returned" },
];

const getStatusIcon = (status: ShippingStatus) => {
  switch (status) {
    case "ordered":
      return <Package size={16} />;
    case "packed":
      return <Package size={16} />;
    case "shipped":
      return <Truck size={16} />;
    case "in_transit":
      return <Truck size={16} />;
    case "delivered":
      return <CheckCircle size={16} />;
    case "cancelled":
      return <XCircle size={16} />;
    case "returned":
      return <ArrowRight size={16} />;
    default:
      return <Clock size={16} />;
  }
};

const getStatusColor = (status: ShippingStatus): string => {
  switch (status) {
    case "ordered":
      return "text-blue-600 bg-blue-100";
    case "packed":
      return "text-purple-600 bg-purple-100";
    case "shipped":
      return "text-orange-600 bg-orange-100";
    case "in_transit":
      return "text-yellow-600 bg-yellow-100";
    case "delivered":
      return "text-green-600 bg-green-100";
    case "cancelled":
      return "text-red-600 bg-red-100";
    case "returned":
      return "text-gray-600 bg-gray-100";
    default:
      return "text-gray-600 bg-gray-100";
  }
};

export default function ShippingStatusModal({
  isOpen,
  onClose,
  saleId,
  saleType,
  shippingData,
}: ShippingStatusModalProps) {
  const canUpdate = useHasPermission("sale.update");
  const [updateShippingStatus, { isLoading: isUpdating }] =
    useUpdateShippingStatusMutation();
  const [createShippingStatus, { isLoading: isCreating }] =
    useCreateShippingStatusMutation();

  // State for date picker
  const [estimatedDelivery, setEstimatedDelivery] = useState<Date | null>(null);

  const isEdit = !!shippingData;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ShippingStatusFormData>({
    resolver: zodResolver(shippingStatusSchema),
    defaultValues: {
      status: shippingData?.status || "ordered",
      tracking_number: shippingData?.tracking_number || "",
      carrier: shippingData?.carrier || "",
      delivery_company: shippingData?.delivery_company || "",
      delivery_person: shippingData?.delivery_person || "",
      shipping_address: shippingData?.shipping_address || "",
      notes: shippingData?.notes || "",
    },
  });

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      reset({
        status: shippingData?.status || "ordered",
        tracking_number: shippingData?.tracking_number || "",
        carrier: shippingData?.carrier || "",
        delivery_company: shippingData?.delivery_company || "",
        delivery_person: shippingData?.delivery_person || "",
        shipping_address: shippingData?.shipping_address || "",
        notes: shippingData?.notes || "",
      });

      // Set date picker value
      if (shippingData?.estimated_delivery) {
        const date = new Date(shippingData.estimated_delivery);
        setEstimatedDelivery(isNaN(date.getTime()) ? null : date);
      } else {
        setEstimatedDelivery(null);
      }
    } else {
      // Reset date when modal closes
      setEstimatedDelivery(null);
    }
  }, [isOpen, shippingData, reset]);

  const onSubmit = async (data: ShippingStatusFormData) => {
    try {
      const payload = {
        status: data.status,
        ...(data.tracking_number && {
          tracking_number: data.tracking_number,
        }),
        ...(data.carrier && { carrier: data.carrier }),
        ...(data.delivery_company && {
          delivery_company: data.delivery_company,
        }),
        ...(data.delivery_person && {
          delivery_person: data.delivery_person,
        }),
        ...(estimatedDelivery && {
          estimated_delivery: estimatedDelivery.toISOString().split("T")[0],
        }),
        ...(data.shipping_address && {
          shipping_address: data.shipping_address,
        }),
        ...(data.notes && { notes: data.notes }),
      };

      if (isEdit) {
        await updateShippingStatus({
          saleId,
          data: payload,
        }).unwrap();
        toast.success("Shipping status updated successfully!");
      } else {
        await createShippingStatus({
          saleId,
          data: payload,
        }).unwrap();
        toast.success("Shipping status created successfully!");
      }

      onClose();
    } catch (err: any) {
      console.error("Error submitting shipping status:", err);
      toast.error(err?.data?.message || "Failed to save shipping status");
    }
  };

  const isSubmitting = isUpdating || isCreating;

  const getDescription = () => {
    if (saleType === "pos") {
      return "Shipping status is only available for regular sales";
    }
    if (shippingData) {
      return "Update shipping status and tracking information";
    }
    return "Create shipping status for this order";
  };

  return (
    <Modal
      className="max-w-4xl max-h-[90vh] overflow-y-auto scrollbar-hide"
      isOpen={isOpen}
      onClose={onClose}
      title="Shipping Status"
      description={getDescription()}
    >
      {saleType === "pos" ? (
        <div className="flex flex-col items-center justify-center py-8">
          <XCircle className="text-red-500 mb-3" size={48} />
          <p className="text-gray-600 text-center">
            Shipping status is not available for POS sales.
            <br />
            Only regular sales can have shipping tracking.
          </p>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4 py-4"
        >
          {/* Current Status Display */}
          {shippingData && (
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                Current Status
              </h4>
              <div className="flex items-center gap-2">
                <div
                  className={`p-2 rounded-full ${getStatusColor(shippingData.status)}`}
                >
                  {getStatusIcon(shippingData.status)}
                </div>
                <span className="text-lg font-semibold capitalize">
                  {shippingData.status.replace("_", " ")}
                </span>
              </div>
            </div>
          )}

          {/* Status */}
          <SelectField
            label="Status *"
            data={shippingStatusOptions}
            value={watch("status")}
            onChange={(value) => setValue("status", value as any)}
            placeholder="Select status"
          />
          {errors.status && (
            <p className="text-red-500 text-sm -mt-3">
              {errors.status.message as string}
            </p>
          )}

          {/* Tracking Number */}
          {shippingData?.tracking_number !== null &&
            shippingData?.tracking_number !== undefined && (
              <FormField label="Tracking Number">
                <Input
                  {...register("tracking_number")}
                  placeholder="Enter tracking number"
                />
              </FormField>
            )}

          {/* Carrier & Delivery Company */}
          {(shippingData?.carrier !== null &&
            shippingData?.carrier !== undefined) ||
          (shippingData?.delivery_company !== null &&
            shippingData?.delivery_company !== undefined) ? (
            <div className="grid grid-cols-2 gap-4">
              {shippingData?.carrier !== null &&
                shippingData?.carrier !== undefined && (
                  <FormField label="Carrier">
                    <Input
                      {...register("carrier")}
                      placeholder="e.g., FedEx, UPS"
                    />
                  </FormField>
                )}

              {shippingData?.delivery_company !== null &&
                shippingData?.delivery_company !== undefined && (
                  <FormField label="Delivery Company">
                    <Input
                      {...register("delivery_company")}
                      placeholder="Delivery company"
                    />
                  </FormField>
                )}
            </div>
          ) : null}

          {/* Delivery Person */}
          {shippingData?.delivery_person !== null &&
            shippingData?.delivery_person !== undefined && (
              <FormField label="Delivery Person">
                <Input
                  {...register("delivery_person")}
                  placeholder="Delivery person name"
                />
              </FormField>
            )}

          {/* Estimated Delivery Date */}
          <div>
            <DatePicker
              id="estimated-delivery"
              label="Estimated Delivery Date"
              value={estimatedDelivery}
              onChange={(value) =>
                setEstimatedDelivery(Array.isArray(value) ? value[0] : value)
              }
              placeholder="Select estimated delivery date"
              disableFuture={false}
              isRequired={false}
            />
          </div>

          {/* Shipping Address */}
          <FormField label="Shipping Address">
            <textarea
              {...register("shipping_address")}
              placeholder="Enter shipping address"
              rows={2}
              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
            />
          </FormField>

          {/* Notes */}
          <FormField label="Notes">
            <textarea
              {...register("notes")}
              placeholder="Additional notes"
              rows={2}
              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
            />
          </FormField>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t mt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            {canUpdate && (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : isEdit ? "Update" : "Create"}
              </Button>
            )}
          </div>
        </form>
      )}
    </Modal>
  );
}
