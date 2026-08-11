
import { ApiResponse } from "../../types";
import { Permission } from "../../types/role";
import { apiSlice } from "../apiSlice";

export interface PermissionsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface PaginatedPermissionsResponse {
  data: Permission[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreatePermissionPayload {
  key: string;
  description: string;
}

export interface AssignPermissionsPayload {
  roleName: string;
  permissionKeys: string[];
}

export const permissionsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPermissions: builder.query<PaginatedPermissionsResponse, PermissionsQueryParams>({
      query: (params) => ({
        url: "/rbac/permission",
        method: "GET",
        params,
      }),
      providesTags: ["Permissions"],
    }),

    // Get all permissions without pagination (for dropdowns/assignment)
    getAllPermissions: builder.query<PaginatedPermissionsResponse, void>({
      query: () => ({
        url: "/rbac/permission",
        method: "GET",
        params: { limit: 250 },
      }),
      providesTags: ["Permissions"],
    }),

    createPermission: builder.mutation<
      ApiResponse<Permission>,
      CreatePermissionPayload
    >({
      query: (body) => ({
        url: "/rbac/permission",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Permissions"],
    }),
    updatePermission: builder.mutation<
      ApiResponse<Permission>,
      { id: number | string; body: Partial<Permission> }
    >({
      query: ({ id, body }) => ({
        url: `/rbac/permission/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Permissions"],
    }),

    // DELETE PERMISSION
    deletePermission: builder.mutation<ApiResponse<{ id: number }>, number>({
      query: (id) => ({
        url: `/rbac/permission/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Permissions"],
    }),
    getRolePermissions: builder.query<ApiResponse<Permission[]>, string>({
      query: (roleName) => ({
        url: `/rbac/role/${roleName}/permissions`,
        method: "GET",
      }),
      providesTags: (_result, _error, roleName) => [
        { type: "RolePermissions", id: roleName },
      ],
    }),

    assignPermissionsToRole: builder.mutation<
      ApiResponse<any>,
      AssignPermissionsPayload
    >({
      query: ({ roleName, permissionKeys }) => ({
        url: `/rbac/role/${roleName}/assign`,
        method: "POST",
        body: { permissionKeys },
      }),
      invalidatesTags: (_result, _error, { roleName }) => [
        { type: "RolePermissions", id: roleName },
        "Roles",
      ],
    }),
  }),
});

export const {
  useGetPermissionsQuery,
  useGetAllPermissionsQuery,
  useCreatePermissionMutation,
  useDeletePermissionMutation,
  useUpdatePermissionMutation,
  useGetRolePermissionsQuery,
  useAssignPermissionsToRoleMutation,
} = permissionsApi;
