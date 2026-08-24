// features/RFQ/AllRFQs.tsx
import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import { ListPage } from '../../components/custom/ListPage';
import { FilterToolbar } from '@/components/filters/FilterToolbar';
import { useFilteredList } from '@/hooks/useFilteredList';
import { useRFQs, useDeleteRFQ } from './Hooks/useRFQ';
import RFQTableRow from './RFQTableRow';
import { setRFQ } from '../../store/rfqSlice';
import { IRFQ, IFilterConfig } from '../../interfaces';
import useDeleteRequest from '../../hooks/useDeleteRequest';
import { localStorageUser } from '../../utils/localStorageUser';

// Define filter configurations for RFQs
const rfqFilterConfigs: IFilterConfig[] = [
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'preview', label: 'Preview' },
      { value: 'draft', label: 'Draft' },
      { value: 'sent', label: 'Sent' },
      { value: 'cancelled', label: 'Cancelled' },
    ],
    placeholder: 'Filter by status...',
  },
  {
    key: 'rfqTitle',
    label: 'RFQ Title',
    type: 'text',
    placeholder: 'Filter by title...',
  },
  {
    key: 'rfqCode',
    label: 'RFQ Code',
    type: 'text',
    placeholder: 'Search by RFQ code...',
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

const AllRFQs = () => {
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
    filterConfigs: rfqFilterConfigs,
    defaultFilters: {},
  });

  const { data, isLoading, isError } = useRFQs(queryParams);
  const { deleteRFQ } = useDeleteRFQ();

  const rfqs = useMemo(() => data?.data ?? [], [data]);
  const totalPages = useMemo(() => data?.pagination.pages ?? 1, [data]);

  const handleAction = useCallback(
    (rfq: IRFQ) => {
      dispatch(setRFQ(rfq));
      navigate(`/procurement/rfq/${rfq.id}`);
    },
    [dispatch, navigate]
  );

  const handleEdit = useCallback(
    (rfq: IRFQ) => {
      dispatch(setRFQ(rfq));
      navigate(`/procurement/rfq/edit-rfq/${rfq.id}`);
    },
    [dispatch, navigate]
  );

  const handleDelete = useDeleteRequest(deleteRFQ, {
    entityName: 'RFQ',
  });

  // Check if user can create RFQ
  const canCreate = currentUser.role === 'SUPER-ADMIN' || currentUser.procurementRole?.canCreate;

  const tableHeadData = [
    { label: 'RFQ Title', showOnMobile: true, minWidth: '150px' },
    { label: 'RFQ Code', showOnMobile: true, minWidth: '120px' },
    { label: 'Status', showOnMobile: true, minWidth: '100px' },
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
      searchPlaceholder="Search RFQs..."
    />
  );

  return (
    <ListPage
      title="Request for Quotations"
      data={rfqs}
      headers={tableHeadData}
      isLoading={isLoading}
      isError={isError}
      currentPage={page}
      totalPages={totalPages}
      onPageChange={handlePageChange}
      renderRow={rfq => (
        <RFQTableRow
          key={rfq.id}
          rfq={rfq}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
          handleAction={handleAction}
          tableHeadData={tableHeadData}
        />
      )}
      onAdd={canCreate ? () => navigate('/procurement/rfq/create-rfq') : undefined}
      addButtonLabel="Create RFQ"
      emptyMessage={hasActiveFilters ? 'No RFQs match your filters' : 'No RFQs found'}
      emptySubMessage={
        hasActiveFilters ? 'Try adjusting your filters or search terms' : 'Create your first RFQ'
      }
      searchComponent={filterToolbar}
    />
  );
};

export default AllRFQs;
