import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";

import ConfirmDialog from "../../../components/common/ConfirmDialog";
import IconButton from "../../../components/common/IconButton";
import Loading from "../../../components/common/Loading";
import PageHeader from "../../../components/common/PageHeader";
import Pagination from "../../../components/ui/pagination/Pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import {
  useDeletePermissionMutation,
  useGetPermissionsQuery,
} from "../../../features/permissions/permissionsApi";
import { useHasPermission } from "../../../hooks/useHasPermission";
import { Permission } from "../../../types/role";
import PermissionFormModal from "./PermissionFormModal";

// Constants
const DEFAULT_PAGE = 1;
const DEFAULT_ITEMS_PER_PAGE = 10;
const TOAST_MESSAGES = {
  DELETE_SUCCESS: "Permission deleted successfully",
  FETCH_ERROR: "Failed to fetch permissions",
  DELETE_ERROR: "Failed to delete permission",
} as const;

export default function PermissionList() {
  // ===== State Management =====
  const [currentPage, setCurrentPage] = useState(DEFAULT_PAGE);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editPermission, setEditPermission] = useState<Permission | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [permissionToDelete, setPermissionToDelete] =
    useState<Permission | null>(null);

  // ===== Data Fetching =====
  const { data, isLoading, isError } = useGetPermissionsQuery({
    page: currentPage,
    limit: DEFAULT_ITEMS_PER_PAGE,
  });
  const [deletePermission] = useDeletePermissionMutation();

  // ===== Permissions =====
  const canUpdate = useHasPermission("permission.update");
  const canDelete = useHasPermission("permission.delete");

  // ===== Computed Values =====
  const permissions = data?.data || [];
  const meta = data?.meta;

  // ===== Event Handlers =====
  const openCreateModal = () => {
    setEditPermission(null);
    setIsModalOpen(true);
  };

  const openEditModal = (permission: Permission) => {
    setEditPermission(permission);
    setIsModalOpen(true);
  };

  const openDeleteDialog = (permission: Permission) => {
    setPermissionToDelete(permission);
    setIsDeleteModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditPermission(null);
  };

  const closeDeleteDialog = () => {
    setIsDeleteModalOpen(false);
    setPermissionToDelete(null);
  };

  const confirmDelete = async () => {
    if (!permissionToDelete) return;

    try {
      await deletePermission(permissionToDelete.id).unwrap();
      toast.success(TOAST_MESSAGES.DELETE_SUCCESS);
      closeDeleteDialog();

      // Navigate to previous page if current page becomes empty
      if (permissions.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      }
    } catch (error) {
      console.error(TOAST_MESSAGES.DELETE_ERROR, error);
      toast.error(TOAST_MESSAGES.DELETE_ERROR);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // ===== Render Helpers =====
  if (isLoading) {
    return <Loading message="Loading Permissions" />;
  }

  if (isError) {
    return <p className="p-5 text-red-500">{TOAST_MESSAGES.FETCH_ERROR}</p>;
  }

  return (
    <>
      {/* Page Header */}
      <PageHeader
        title="Permissions Management"
        onAdd={openCreateModal}
        addLabel="Add"
        permission="permission.create"
        icon={<Plus size={16} />}
      />

      {/* Permissions Table */}
      <div className="overflow-hidden rounded-xl border bg-white dark:bg-white/5">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell isHeader className="table-header w-62.5">
                  Key
                </TableCell>
                <TableCell isHeader className="table-header w-75">
                  Description
                </TableCell>
                <TableCell isHeader className="table-header text-right w-25">
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody>
              {permissions.map((permission) => (
                <TableRow key={permission.id}>
                  <TableCell className="table-body">{permission.key}</TableCell>
                  <TableCell className="table-body">
                    {permission.description}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right">
                    <PermissionActions
                      permission={permission}
                      canUpdate={canUpdate}
                      canDelete={canDelete}
                      onEdit={openEditModal}
                      onDelete={openDeleteDialog}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {meta && (
          <div className="p-4 border-t">
            <Pagination
              meta={meta}
              onPageChange={handlePageChange}
              currentPageItems={permissions.length}
            />
          </div>
        )}
      </div>

      {/* Form Modal */}
      <PermissionFormModal
        isOpen={isModalOpen}
        onClose={closeModal}
        permission={editPermission}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        title="Delete Permission"
        message={`Are you sure you want to delete "${permissionToDelete?.key}"?`}
        confirmLabel="Yes, Delete"
        cancelLabel="Cancel"
        onConfirm={confirmDelete}
        onCancel={closeDeleteDialog}
      />
    </>
  );
}

// ===== Sub-Components =====

interface PermissionActionsProps {
  permission: Permission;
  canUpdate: boolean;
  canDelete: boolean;
  onEdit: (permission: Permission) => void;
  onDelete: (permission: Permission) => void;
}

function PermissionActions({
  permission,
  canUpdate,
  canDelete,
  onEdit,
  onDelete,
}: PermissionActionsProps) {
  return (
    <div className="flex justify-end gap-2">
      {canUpdate && (
        <IconButton
          icon={Pencil}
          onClick={() => onEdit(permission)}
          color="blue"
          aria-label={`Edit permission ${permission.key}`}
        />
      )}
      {canDelete && (
        <IconButton
          icon={Trash2}
          onClick={() => onDelete(permission)}
          color="red"
          aria-label={`Delete permission ${permission.key}`}
        />
      )}
    </div>
  );
}
