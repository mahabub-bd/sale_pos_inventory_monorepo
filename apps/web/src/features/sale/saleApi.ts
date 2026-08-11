import { ApiResponse } from "../../types";
import { Last30DaysAnalytics, MonthWiseAnalytics } from "../../types/analytics";
import {
  CreateSalePayload,
  GetSalesParams,
  SaleListResponse,
  SaleResponse,
  ShippingStatusData,
  ShippingStatusHistory,
  CreateShippingStatusPayload,
  UpdateShippingStatusPayload,
} from "../../types/sales";
import { generateItemTag, generateListTags } from "../../utlis";
import { apiSlice } from "../apiSlice";

export const salesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // 🔹 GET ALL SALES
    getSales: builder.query<SaleListResponse, GetSalesParams>({
      query: ({ page = 1, limit = 10, ...filters }) => ({
        url: `/sales/list`,
        params: { page, limit, ...filters },
      }),
      providesTags: (result) => generateListTags(result, "Sales"),
    }),

    // 🔹 GET SALE BY ID
    getSaleById: builder.query<ApiResponse<SaleResponse>, string | number>({
      query: (id) => `/sales/${id}`,
      providesTags: (_result, _error, id) => generateItemTag("Sales", id),
    }),

    // 🔹 CREATE SALE
    createSale: builder.mutation<
      ApiResponse<SaleResponse>,
      CreateSalePayload
    >({
      query: (data) => ({
        url: "/sales",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Sales", id: "LIST" }],
    }),

    // 🔹 GET LAST 30 DAYS ANALYTICS
    getLast30DaysAnalytics: builder.query<
      ApiResponse<Last30DaysAnalytics>,
      void
    >({
      query: () => "/sales/analytics/last-30-days",
      providesTags: ["Sales"],
    }),

    // 🔹 GET MONTH-WISE ANALYTICS
    getMonthWiseAnalytics: builder.query<
      ApiResponse<MonthWiseAnalytics>,
      { year: number }
    >({
      query: ({ year }) => `/sales/analytics/month-wise?year=${year}`,
      providesTags: ["Sales"],
    }),

    // 🔹 GET SHIPPING STATUS BY SALE ID
    getShippingStatus: builder.query<ApiResponse<ShippingStatusData>, number>({
      query: (saleId) => `/sales/${saleId}/shipping-status`,
      providesTags: (_result, _error, id) => [
        { type: "Sales", id: `SHIPPING-${id}` },
      ],
    }),

    // 🔹 GET SHIPPING STATUS HISTORY
    getShippingStatusHistory: builder.query<
      ApiResponse<ShippingStatusHistory[]>,
      number
    >({
      query: (saleId) => `/sales/${saleId}/shipping-status/history`,
      providesTags: (_result, _error, id) => [
        { type: "Sales", id: `SHIPPING-HISTORY-${id}` },
      ],
    }),

    // 🔹 CREATE SHIPPING STATUS
    createShippingStatus: builder.mutation<
      ApiResponse<ShippingStatusData>,
      { saleId: number; data: CreateShippingStatusPayload }
    >({
      query: ({ saleId, data }) => ({
        url: `/sales/${saleId}/shipping-status`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (_result, _error, { saleId }) => [
        { type: "Sales", id: `SHIPPING-${saleId}` },
        { type: "Sales", id: `SHIPPING-HISTORY-${saleId}` },
      ],
    }),

    // 🔹 UPDATE SHIPPING STATUS
    updateShippingStatus: builder.mutation<
      ApiResponse<ShippingStatusData>,
      { saleId: number; data: UpdateShippingStatusPayload }
    >({
      query: ({ saleId, data }) => ({
        url: `/sales/${saleId}/shipping-status`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_result, _error, { saleId }) => [
        { type: "Sales", id: `SHIPPING-${saleId}` },
        { type: "Sales", id: `SHIPPING-HISTORY-${saleId}` },
      ],
    }),

    // 🔹 DELETE SHIPPING STATUS
    deleteShippingStatus: builder.mutation<void, number>({
      query: (saleId) => ({
        url: `/sales/${saleId}/shipping-status`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, saleId) => [
        { type: "Sales", id: `SHIPPING-${saleId}` },
        { type: "Sales", id: `SHIPPING-HISTORY-${saleId}` },
      ],
    }),
  }),
});

export const {
  useGetSalesQuery,
  useGetSaleByIdQuery,
  useCreateSaleMutation,
  useGetLast30DaysAnalyticsQuery,
  useGetMonthWiseAnalyticsQuery,
  useGetShippingStatusQuery,
  useGetShippingStatusHistoryQuery,
  useCreateShippingStatusMutation,
  useUpdateShippingStatusMutation,
  useDeleteShippingStatusMutation,
} = salesApi;
