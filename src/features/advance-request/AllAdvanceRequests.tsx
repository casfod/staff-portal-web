// features/advance-request/AllAdvanceRequests.tsx

import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import { ListPage } from '../../components/custom/ListPage';
import { FilterToolbar } from '@/components/filters/FilterToolbar';
import { useFilteredList } from '@/hooks/useFilteredList';
import { useAllAdvanceRequests, useDeleteAdvanceRequest } from './Hooks/useAdvanceRequest';
import AdvanceRequestTableRow from './AdvanceRequestTableRow';
import { setAdvanceRequest } from '../../store/advanceRequestSlice';
import { IAdvanceRequest, IFilterConfig, STATUS_OPTIONS } from '../../interfaces';
import useDeleteRequest from '../../hooks/useDeleteRequest';
import { getDefaultTableHeaders } from '@/config/tableConfigs';

// Define filter configurations for advance requests
const advanceRequestFilterConfigs: IFilterConfig[] = [
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    options: STATUS_OPTIONS,
    placeholder: 'Filter by status...',
  },
  {
    key: 'department',
    label: 'Department',
    type: 'text',
    placeholder: 'Filter by department...',
  },
  {
    key: 'createdBy',
    label: 'Created By',
    type: 'text',
    placeholder: 'Filter by creator name...',
  },
  {
    key: 'arNumber',
    label: 'Request Number',
    type: 'text',
    placeholder: 'Search by request number...',
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

const AllAdvanceRequests = () => {
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
    filterConfigs: advanceRequestFilterConfigs,
    defaultFilters: {},
  });

  const { data, isLoading, isError } = useAllAdvanceRequests(queryParams);
  const { deleteAdvanceRequest } = useDeleteAdvanceRequest(queryParams);

  const advanceRequests = useMemo(() => data?.data ?? [], [data]);
  const totalPages = useMemo(() => data?.pagination.pages ?? 1, [data]);

  const handleAction = useCallback(
    (request: IAdvanceRequest) => {
      dispatch(setAdvanceRequest(request));
      navigate(`/advance-requests/request/${request.id}`);
    },
    [dispatch, navigate]
  );

  const handleEdit = useCallback(
    (request: IAdvanceRequest) => {
      dispatch(setAdvanceRequest(request));
      navigate(`/advance-requests/edit-request/${request.id}`);
    },
    [dispatch, navigate]
  );

  const handleDelete = useDeleteRequest(deleteAdvanceRequest, {
    entityName: 'Advance Request',
  });

  const tableHeadData = getDefaultTableHeaders();

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
      searchPlaceholder="Search advance requests..."
    />
  );

  return (
    <ListPage
      title="Advance Requests"
      data={advanceRequests}
      headers={tableHeadData}
      isLoading={isLoading}
      isError={isError}
      currentPage={page}
      totalPages={totalPages}
      onPageChange={handlePageChange}
      renderRow={request => (
        <AdvanceRequestTableRow
          key={request.id}
          request={request}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
          handleAction={handleAction}
          tableHeadData={tableHeadData}
        />
      )}
      onAdd={() => navigate('/advance-requests/create-advance-request')}
      emptyMessage={hasActiveFilters ? 'No requests match your filters' : 'No requests found'}
      emptySubMessage={
        hasActiveFilters
          ? 'Try adjusting your filters or search terms'
          : 'Create your first advance request'
      }
      searchComponent={filterToolbar} // ← Pass the FilterToolbar as a component
    />
  );
};

export default AllAdvanceRequests;
