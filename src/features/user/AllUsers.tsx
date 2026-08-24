// AllUsers.tsx - Updated with new UserTableRow
import { useCallback, useMemo } from 'react';
import Swal from 'sweetalert2';
import { Plus, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { FilterToolbar } from '@/components/filters/FilterToolbar';
import { useFilteredList } from '@/hooks/useFilteredList';
import { useUsers, useDeactivateUser, useExportUsersToExcel } from './Hooks/useUsers';
import { localStorageUser } from '../../utils/localStorageUser';
import { USER_TABLE_HEADERS } from '../../config/user.config';

// Radix UI Components
import { Button } from '../../components/ui/button';
import { Loader2 } from 'lucide-react';

// Custom Components
import Modal from '../../components/ui/modal';
import TextHeader from '../../components/custom/TextHeader';
import { Pagination } from '../../components/custom/Pagination';
import NetworkErrorUI from '../../components/custom/NetworkErrorUI';
import AddUserForm from './AddUserForm';
import UserCard from './UserCard';
import UserTableRow from './UsersTableRow';
import { cn } from '../../lib/utils';
import { IUser, IFilterConfig } from '../../interfaces';

// Matches the role enum and isActive flag on User.model.ts. "position" is a
// large fixed enum (~50 values) on the model — left as free text here rather
// than a 50-item select; swap to `type: 'select'` with the POSITIONS list if
// you'd rather constrain it.
// NOTE: the backend getUsers() service (not uploaded here) needs matching
// filterableFields — role/isActive as exact matches, position as regex —
// for these to actually constrain results, same as the workflow services.
const userFilterConfigs: IFilterConfig[] = [
  {
    key: 'role',
    label: 'Role',
    type: 'select',
    options: [
      { value: 'SUPER-ADMIN', label: 'Super Admin' },
      { value: 'ADMIN', label: 'Admin' },
      { value: 'REVIEWER', label: 'Reviewer' },
      { value: 'STAFF', label: 'Staff' },
    ],
    placeholder: 'All roles',
  },
  {
    key: 'isActive',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'true', label: 'Active' },
      { value: 'false', label: 'Inactive' },
    ],
    placeholder: 'All',
  },
  { key: 'position', label: 'Position', type: 'text', placeholder: 'Any' },
];

export default function AllUsers() {
  const navigate = useNavigate();
  const currentUser = localStorageUser();

  const {
    searchTerm,
    handleSearchChange,
    // sort,
    // handleSortChange,
    page,
    handlePageChange,
    limit,
    filters,
    setFilter,
    clearFilters,
    hasActiveFilters,
    activeFilterCount,
    queryParams,
    filterConfigs,
  } = useFilteredList({
    filterConfigs: userFilterConfigs,
    defaultFilters: {},
  });

  const { data, isLoading, isError } = useUsers(queryParams);
  const { deactivateUser } = useDeactivateUser();
  const { exportUsers, isExporting } = useExportUsersToExcel();
  const isSuperAdmin = currentUser?.role === 'SUPER-ADMIN';

  const users = useMemo(() => data?.data ?? [], [data?.data]);
  const totalPages = useMemo(() => data?.pagination?.pages ?? 1, [data?.pagination]);

  const handleEdit = useCallback(
    (user: IUser) => {
      navigate(`/human-resources/staff-information/${user.id}/edit`);
    },
    [navigate]
  );

  const handleDelete = useCallback(
    (id: string) => {
      Swal.fire({
        title: 'Are you sure?',
        text: 'Do you want to deactive this user?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#DC2626',
        cancelButtonColor: '#6B7280',
        confirmButtonText: 'Yes, deactive',
      }).then(result => {
        if (result.isConfirmed) {
          deactivateUser(id);
        }
      });
    },
    [deactivateUser]
  );

  const handleExport = useCallback(() => {
    exportUsers();
  }, [exportUsers]);

  if (isError) return <NetworkErrorUI />;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="sticky -top-8 z-10 bg-[#F8F8F8] pt-4 pb-2 space-y-6 border-b">
        <div className="flex flex-col md:flex-row gap-2 justify-between md:items-center">
          <TextHeader>User Management</TextHeader>
          <div className="flex items-center gap-2">
            {isSuperAdmin && (
              <Button variant="primary" size="sm" onClick={handleExport} disabled={isExporting}>
                {isExporting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Export Excel
                  </>
                )}
              </Button>
            )}
            {isSuperAdmin && (
              <Modal>
                <Modal.Open open="addUser">
                  <Button size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add User
                  </Button>
                </Modal.Open>
              </Modal>
            )}
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[280px]">
            <FilterToolbar
              searchValue={searchTerm}
              onSearchChange={handleSearchChange}
              filters={filters}
              onFilterChange={setFilter}
              filterConfigs={filterConfigs}
              activeFilterCount={activeFilterCount}
              onClearFilters={clearFilters}
              hasActiveFilters={hasActiveFilters}
              searchPlaceholder="Search users..."
            />
          </div>
        </div>

        {/* Sort stays separate from the filter popover — it's ordering, not
            a constraint on the result set — and keeps its existing
            "field:direction" format since that's what getUsers expects. */}
        {/* <select
          value={sort}
          onChange={(e) => handleSortChange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none bg-white"
        >
          <option value="">Sort</option>
          <option value="firstName:asc">Name (A-Z)</option>
          <option value="firstName:desc">Name (Z-A)</option>
          <option value="email:asc">Email (A-Z)</option>
          <option value="email:desc">Email (Z-A)</option>
          <option value="role:asc">Role (A-Z)</option>
          <option value="role:desc">Role (Z-A)</option>
        </select> */}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 hidden md:table-header-group">
              <tr>
                {USER_TABLE_HEADERS.map((header, index) => (
                  <th
                    key={index}
                    className={cn(
                      'px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
                      !header.showOnMobile && 'hidden md:table-cell',
                      'showOnTablet' in header &&
                        header.showOnTablet &&
                        'hidden sm:table-cell md:table-cell'
                    )}
                    style={{ minWidth: header.minWidth }}
                  >
                    {header.label}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={USER_TABLE_HEADERS.length} className="py-12">
                    <div className="flex justify-center items-center">
                      <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td
                    colSpan={USER_TABLE_HEADERS.length}
                    className="py-12 text-center text-gray-500"
                  >
                    <p className="font-medium">No users found</p>
                    <p className="text-sm mt-1">
                      {hasActiveFilters
                        ? 'Try adjusting your filters or search'
                        : 'Start by adding a new user'}
                    </p>
                  </td>
                </tr>
              ) : (
                users.map(user => (
                  <UserTableRow
                    key={user.id}
                    user={user!}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {(users.length >= limit || totalPages > 1) && (
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} />
      )}

      {/* Modals */}
      <Modal>
        <Modal.Window name="addUser">
          <AddUserForm />
        </Modal.Window>
        {users.map(user => (
          <Modal.Window
            noBorder
            clean
            customPadding=" sm:p-6"
            showCloseButton={false}
            key={user.id}
            name={`userCog-${user.id}`}
          >
            <UserCard user={user} />
          </Modal.Window>
        ))}
      </Modal>
    </div>
  );
}
