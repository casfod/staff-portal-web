// features/purchase-order/AllPurchaseOrders.tsx
import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import { ListPage } from '../../components/custom/ListPage';
import { FilterToolbar } from '@/components/filters/FilterToolbar';
import { useFilteredList } from '@/hooks/useFilteredList';
import { usePurchaseOrders, useDeletePurchaseOrder } from './Hooks/usePurchaseOrder';
import PurchaseOrderTableRow from './PurchaseOrderTableRow';
import { setPurchaseOrder } from '../../store/purchaseOrderSlice';
import { IPurchaseOrder, IFilterConfig } from '../../interfaces';
import useDeleteRequest from '../../hooks/useDeleteRequest';
import { localStorageUser } from '../../utils/localStorageUser';

// Define filter configurations for Purchase Orders
const purchaseOrderFilterConfigs: IFilterConfig[] = [
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'pending', label: 'Pending' },
      { value: 'approved', label: 'Approved' },
      { value: 'rejected', label: 'Rejected' },
    ],
    placeholder: 'Filter by status...',
  },
  {
    key: 'rfqTitle',
    label: 'PO Title',
    type: 'text',
    placeholder: 'Filter by PO title...',
  },
  {
    key: 'poCode',
    label: 'PO Code',
    type: 'text',
    placeholder: 'Search by PO code...',
  },
  {
    key: 'vendor',
    label: 'Vendor',
    type: 'text',
    placeholder: 'Filter by vendor name...',
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

const AllPurchaseOrders = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentUser = localStorageUser();

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
    filterConfigs: purchaseOrderFilterConfigs,
    defaultFilters: {},
  });

  const { data, isLoading, isError } = usePurchaseOrders(queryParams);
  const { deletePurchaseOrder } = useDeletePurchaseOrder();

  const purchaseOrders = useMemo(() => data?.data ?? [], [data]);
  const totalPages = useMemo(() => data?.pagination.pages ?? 1, [data]);

  const handleAction = useCallback(
    (purchaseOrder: IPurchaseOrder) => {
      dispatch(setPurchaseOrder(purchaseOrder));
      navigate(`/procurement/purchase-order/${purchaseOrder.id}`);
    },
    [dispatch, navigate]
  );

  const handleEdit = useCallback(
    (purchaseOrder: IPurchaseOrder) => {
      dispatch(setPurchaseOrder(purchaseOrder));
      navigate(`/procurement/purchase-order/edit/${purchaseOrder.id}`);
    },
    [dispatch, navigate]
  );

  const handleDelete = useDeleteRequest(deletePurchaseOrder, {
    entityName: 'Purchase Order',
  });

  // Check if user can create PO
  const canCreate = currentUser.role === 'SUPER-ADMIN' || currentUser?.procurementRole?.canCreate;

  const tableHeadData = [
    { label: 'Vendor', showOnMobile: true, minWidth: '150px' },
    { label: 'Status', showOnMobile: true, minWidth: '100px' },
    { label: 'Amount', showOnMobile: true, minWidth: '120px' },
    { label: 'Date', showOnMobile: false, showOnTablet: true, minWidth: '120px' },
    { label: 'Actions', showOnMobile: true, minWidth: '100px' },
  ];

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
      searchPlaceholder="Search purchase orders..."
    />
  );

  return (
    <ListPage
      title="Purchase Orders"
      data={purchaseOrders}
      headers={tableHeadData}
      isLoading={isLoading}
      isError={isError}
      currentPage={page}
      totalPages={totalPages}
      onPageChange={handlePageChange}
      renderRow={purchaseOrder => (
        <PurchaseOrderTableRow
          key={purchaseOrder.id}
          purchaseOrder={purchaseOrder}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
          handleAction={handleAction}
          tableHeadData={tableHeadData}
        />
      )}
      onAdd={canCreate ? () => navigate('/procurement/purchase-order/create') : undefined}
      addButtonLabel="Create PO"
      emptyMessage={
        hasActiveFilters ? 'No purchase orders match your filters' : 'No purchase orders found'
      }
      emptySubMessage={
        hasActiveFilters
          ? 'Try adjusting your filters or search terms'
          : 'Create your first purchase order'
      }
      searchComponent={filterToolbar}
    />
  );
};

export default AllPurchaseOrders;
