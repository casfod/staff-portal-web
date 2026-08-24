// features/Vendor/AllVendors.tsx
import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import { ListPage } from '../../components/custom/ListPage';
import { FilterToolbar } from '@/components/filters/FilterToolbar';
import { useFilteredList } from '@/hooks/useFilteredList';
import { useVendors, useDeleteVendor, useExportVendorsToExcel } from './Hooks/useVendor';
import VendorTableRow from './VendorTableRow';
import { setVendor } from '../../store/vendorSlice';
import { IVendor, IFilterConfig } from '../../interfaces';
import useDeleteRequest from '../../hooks/useDeleteRequest';
import { getVendorTableHeaders } from '@/config/tableConfigs';
import { useUserRoles } from '@/hooks/useUserRoles';

// Define filter configurations for vendors
const vendorFilterConfigs: IFilterConfig[] = [
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'draft', label: 'Draft' },
      { value: 'pending', label: 'Pending' },
      { value: 'approved', label: 'Approved' },
      { value: 'rejected', label: 'Rejected' },
    ],
    placeholder: 'Filter by status...',
  },
  {
    key: 'businessState',
    label: 'State',
    type: 'select',
    options: [
      { value: 'Adamawa', label: 'Adamawa' },
      { value: 'Borno', label: 'Borno' },
      { value: 'Yobe', label: 'Yobe' },
      { value: 'Sokoto', label: 'Sokoto' },
      { value: 'Abuja', label: 'Abuja' },
    ],
    placeholder: 'Filter by state...',
  },
  {
    key: 'businessType',
    label: 'Business Type',
    type: 'select',
    options: [
      { value: 'Sole Proprietorship', label: 'Sole Proprietorship' },
      { value: 'Partnership', label: 'Partnership' },
      { value: 'Corporation', label: 'Corporation' },
      { value: 'Limited Liability Company (LLC)', label: 'Limited Liability Company (LLC)' },
      { value: 'Non-Profit Organization', label: 'Non-Profit Organization' },
    ],
    placeholder: 'Filter by business type...',
  },
  {
    key: 'businessName',
    label: 'Business Name',
    type: 'text',
    placeholder: 'Filter by business name...',
  },
  {
    key: 'vendorCode',
    label: 'Vendor Code',
    type: 'text',
    placeholder: 'Search by vendor code...',
  },
  {
    key: 'dateFrom',
    label: 'Date From',
    type: 'date',
  },
  {
    key: 'dateTo',
    label: 'Date To',
    type: 'date',
  },
];

const AllVendors = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Use the filtered list hook
  const {
    searchTerm,
    handleSearchChange,
    page,
    handlePageChange,
    filters,
    setFilter,
    clearFilters,
    hasActiveFilters,
    activeFilterCount,
    queryParams,
    filterConfigs,
  } = useFilteredList({
    filterConfigs: vendorFilterConfigs,
    defaultFilters: {},
  });
  
  const { isSuperAdmin } = useUserRoles();

  const { data, isLoading, isError } = useVendors(queryParams);
  const { deleteVendor } = useDeleteVendor();
  const { exportVendors, isExporting } = useExportVendorsToExcel();

  const vendors = useMemo(() => data?.data ?? [], [data]);
  const totalPages = useMemo(() => data?.pagination.pages ?? 1, [data]);

  const handleAction = useCallback(
    (vendor: IVendor) => {
      dispatch(setVendor(vendor));
      navigate(`/procurement/vendor-management/vendor/${vendor.id}`);
    },
    [dispatch, navigate]
  );

  const handleEdit = useCallback(
    (vendor: IVendor) => {
      dispatch(setVendor(vendor));
      navigate(`/procurement/vendor-management/edit-vendor/${vendor.id}`);
    },
    [dispatch, navigate]
  );

  const handleDelete = useDeleteRequest(deleteVendor, {
    entityName: 'Vendor',
  });

  const handleExport = useCallback(() => {
    exportVendors();
  }, [exportVendors]);

  const tableHeadData = getVendorTableHeaders();

  // Create the FilterToolbar as a component to pass to ListPage
  const filterToolbar = (
    <FilterToolbar
      searchValue={searchTerm}
      onSearchChange={handleSearchChange}
      filters={filters}
      onFilterChange={setFilter}
      filterConfigs={filterConfigs}
      activeFilterCount={activeFilterCount}
      onClearFilters={clearFilters}
      hasActiveFilters={hasActiveFilters}
      searchPlaceholder="Search vendors..."
    />
  );

  return (
    <ListPage
      title="Vendors"
      data={vendors}
      headers={tableHeadData}
      isLoading={isLoading}
      isError={isError}
      currentPage={page}
      totalPages={totalPages}
      onPageChange={handlePageChange}
      renderRow={vendor => (
        <VendorTableRow
          key={vendor.id}
          vendor={vendor}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
          handleAction={handleAction}
          tableHeadData={tableHeadData}
        />
      )}
      onAdd={() => navigate('/procurement/vendor-management/create-vendor')}
      emptyMessage={hasActiveFilters ? 'No vendors match your filters' : 'No vendors found'}
      emptySubMessage={
        hasActiveFilters ? 'Try adjusting your filters or search terms' : 'Create your first vendor'
      }
      searchComponent={filterToolbar}
      showExport={isSuperAdmin}
      onExport={handleExport}
      exportLabel="Export Excel"
      isExporting={isExporting}
    />
  );
};

export default AllVendors;
