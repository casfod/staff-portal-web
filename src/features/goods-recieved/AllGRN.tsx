// features/goods-received/AllGRN.tsx
import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import { ListPage } from '../../components/custom/ListPage';
import { FilterToolbar } from '@/components/filters/FilterToolbar';
import { useFilteredList } from '@/hooks/useFilteredList';
import { useGoodsReceived, useDeleteGoodsReceived } from './Hooks/useGoodsReceived';
import GRNTableRow from './GRNTableRow';
import { setGoodsReceived } from '../../store/goodsReceivedSlice';
import { IGoodsReceived, IFilterConfig } from '../../interfaces';
import useDeleteRequest from '../../hooks/useDeleteRequest';
// import { localStorageUser } from '../../utils/localStorageUser';

// Define filter configurations for Goods Received
const grnFilterConfigs: IFilterConfig[] = [
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'completed', label: 'Completed' },
      { value: 'in-progress', label: 'In Progress' },
    ],
    placeholder: 'Filter by status...',
  },
  {
    key: 'grdCode',
    label: 'GRN Code',
    type: 'text',
    placeholder: 'Search by GRN code...',
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

const AllGRN = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  // const currentUser = localStorageUser();

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
    filterConfigs: grnFilterConfigs,
    defaultFilters: {},
  });

  const { data, isLoading, isError } = useGoodsReceived(queryParams);
  const { deleteGoodsReceived } = useDeleteGoodsReceived();

  const goodsReceived = useMemo(() => data?.data ?? [], [data]);
  const totalPages = useMemo(() => data?.pagination.pages ?? 1, [data]);

  const handleAction = useCallback(
    (grn: IGoodsReceived) => {
      dispatch(setGoodsReceived(grn));
      navigate(`/procurement/goods-received/${grn.id}`);
    },
    [dispatch, navigate]
  );

  const handleEdit = useCallback(
    (grn: IGoodsReceived) => {
      dispatch(setGoodsReceived(grn));
      navigate(`/procurement/goods-received/edit/${grn.id}`);
    },
    [dispatch, navigate]
  );

  const handleDelete = useDeleteRequest(deleteGoodsReceived, {
    entityName: 'Goods Received Note',
  });

  // Check if user can create GRN
  // const canCreate = currentUser.role === 'SUPER-ADMIN' || currentUser?.procurementRole?.canCreate;

  const tableHeadData = [
    { label: 'GRN Code', showOnMobile: true, minWidth: '150px' },
    { label: 'Status', showOnMobile: true, minWidth: '100px' },
    { label: 'Items', showOnMobile: true, minWidth: '120px' },
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
      searchPlaceholder="Search GRNs..."
    />
  );

  return (
    <ListPage
      title="Goods Received Notes"
      data={goodsReceived}
      headers={tableHeadData}
      isLoading={isLoading}
      isError={isError}
      currentPage={page}
      totalPages={totalPages}
      onPageChange={handlePageChange}
      renderRow={grn => (
        <GRNTableRow
          key={grn.id}
          grn={grn}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
          handleAction={handleAction}
          tableHeadData={tableHeadData}
        />
      )}
      // onAdd={canCreate ? () => navigate('/procurement/goods-received/create') : undefined}
      addButtonLabel="Create GRN"
      emptyMessage={
        hasActiveFilters ? 'No GRNs match your filters' : 'No goods received notes found'
      }
      emptySubMessage={
        hasActiveFilters
          ? 'Try adjusting your filters or search terms'
          : 'Create your first goods received note'
      }
      searchComponent={filterToolbar}
    />
  );
};

export default AllGRN;
