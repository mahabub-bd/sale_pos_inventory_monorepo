import { useEffect } from "react";
import { Modal } from "../../../components/ui/modal";

import { FormField } from "../../../components/form/form-elements/SelectFiled";
import Input from "../../../components/form/input/InputField";

import {
  useCreateSupplierMutation,
  useUpdateSupplierMutation,
} from "../../../features/suppliers/suppliersApi";

import { Supplier } from "../../../types/supplier";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Button from "../../../components/ui/button/Button";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  supplier: Supplier | null;
}

/* -------------------------- ZOD VALIDATION SCHEMA -------------------------- */

const addressSchema = z.object({
  contact_name: z.string().optional(),
  phone: z.string().optional(),
  street: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  postal_code: z.string().optional(),
});

const supplierSchema = z.object({
  name: z.string().min(1, "Name is required"),
  contact_person: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email format").optional().or(z.literal("")),
  address: z.string().optional(),
  payment_terms: z.string().optional(),
  billing_address: addressSchema.optional(),
  shipping_address: addressSchema.optional(),
});

type SupplierFormType = z.infer<typeof supplierSchema>;

/* -------------------------------------------------------------------------- */

export default function SupplierFormModal({
  isOpen,
  onClose,
  supplier,
}: Props) {
  const [createSupplier] = useCreateSupplierMutation();
  const [updateSupplier] = useUpdateSupplierMutation();

  const isEdit = !!supplier;

  /* ------------------------------- RHF SETUP ------------------------------- */

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SupplierFormType>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: "",
      contact_person: "",
      phone: "",
      email: "",
      address: "",
      payment_terms: "",
      billing_address: {
        contact_name: "",
        phone: "",
        street: "",
        city: "",
        country: "",
        postal_code: "",
      },
      shipping_address: {
        contact_name: "",
        phone: "",
        street: "",
        city: "",
        country: "",
        postal_code: "",
      },
    },
  });

  /* ------------------- Reset form when modal opens/closes ------------------ */

  useEffect(() => {
    if (supplier) {
      reset({
        name: supplier.name,
        contact_person: supplier.contact_person || "",
        phone: supplier.phone || "",
        email: supplier.email || "",
        address: supplier.address || "",
        payment_terms: supplier.payment_terms || "",
        billing_address: {
          contact_name: supplier.billing_address?.contact_name || "",
          phone: supplier.billing_address?.phone || "",
          street: supplier.billing_address?.street || "",
          city: supplier.billing_address?.city || "",
          country: supplier.billing_address?.country || "",
          postal_code: supplier.billing_address?.postal_code || "",
        },
        shipping_address: {
          contact_name: supplier.shipping_address?.contact_name || "",
          phone: supplier.shipping_address?.phone || "",
          street: supplier.shipping_address?.street || "",
          city: supplier.shipping_address?.city || "",
          country: supplier.shipping_address?.country || "",
          postal_code: supplier.shipping_address?.postal_code || "",
        },
      });
    } else {
      reset({
        name: "",
        contact_person: "",
        phone: "",
        email: "",
        address: "",
        payment_terms: "",
        billing_address: {
          contact_name: "",
          phone: "",
          street: "",
          city: "",
          country: "",
          postal_code: "",
        },
        shipping_address: {
          contact_name: "",
          phone: "",
          street: "",
          city: "",
          country: "",
          postal_code: "",
        },
      });
    }
  }, [supplier, reset, isOpen]);

  /* ------------------------------ ON SUBMIT -------------------------------- */

  const onSubmit = async (data: SupplierFormType) => {
    try {
      if (isEdit && supplier) {
        await updateSupplier({ id: supplier.id, body: data }).unwrap();
      } else {
        await createSupplier(data).unwrap();
      }
      onClose();
    } catch (error) {
      console.error("Supplier save failed", error);
    }
  };

  /* ------------------------------ JSX RETURN ------------------------------- */

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-4xl  max-h-[90vh] overflow-y-auto  scrollbar-hide"
      title={isEdit ? "Update Supplier" : "Add New Supplier"}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {/* Basic Information */}
        <div className="border-b border-gray-200 pb-2 mb-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Basic Information
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Name */}
          <FormField label="Name *" error={errors.name?.message}>
            <Input {...register("name")} />
          </FormField>

          {/* Contact Person */}
          <FormField label="Contact Person">
            <Input {...register("contact_person")} />
          </FormField>

          {/* Phone */}
          <FormField label="Phone">
            <Input {...register("phone")} />
          </FormField>

          {/* Email */}
          <FormField label="Email" error={errors.email?.message}>
            <Input {...register("email")} />
          </FormField>

          {/* Address */}
          <FormField label="Address">
            <Input {...register("address")} />
          </FormField>

          {/* Payment Terms */}
          <FormField label="Payment Terms">
            <Input {...register("payment_terms")} />
          </FormField>
        </div>

        {/* Billing Address */}
        <div className="border-b border-gray-200 pb-2 mb-2 mt-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Billing Address
          </h3>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <FormField label="Contact Name">
            <Input {...register("billing_address.contact_name")} />
          </FormField>

          <FormField label="Phone">
            <Input {...register("billing_address.phone")} />
          </FormField>

          <FormField label="Postal Code">
            <Input {...register("billing_address.postal_code")} />
          </FormField>

          <FormField label="Street">
            <Input {...register("billing_address.street")} />
          </FormField>

          <FormField label="City">
            <Input {...register("billing_address.city")} />
          </FormField>

          <FormField label="Country">
            <Input {...register("billing_address.country")} />
          </FormField>
        </div>

        {/* Shipping Address */}
        <div className="border-b border-gray-200 pb-2 mb-2 mt-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Shipping Address
          </h3>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <FormField label="Contact Name">
            <Input {...register("shipping_address.contact_name")} />
          </FormField>

          <FormField label="Phone">
            <Input {...register("shipping_address.phone")} />
          </FormField>

          <FormField label="Postal Code">
            <Input {...register("shipping_address.postal_code")} />
          </FormField>

          <FormField label="Street">
            <Input {...register("shipping_address.street")} />
          </FormField>

          <FormField label="City">
            <Input {...register("shipping_address.city")} />
          </FormField>

          <FormField label="Country">
            <Input {...register("shipping_address.country")} />
          </FormField>
        </div>

        <div className="flex gap-3 justify-end mt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isEdit ? "Update Supplier" : "Create Supplier"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
