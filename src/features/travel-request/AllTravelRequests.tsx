// AllTravelRequests.tsx
import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import { ListPage } from '../../components/custom/ListPage';
import { FilterToolbar } from '@/components/filters/FilterToolbar';
import { useFilteredList } from '@/hooks/useFilteredList';
import { useAllTravelRequests, useDeleteTravelRequest } from './Hooks/useTravelRequests';
import TravelRequestTableRow from './TravelRequestTableRow';
import { setTravelRequest } from '../../store/travelRequestSlice';
import { ITravelRequest, IFilterConfig, STATUS_OPTIONS } from '../../interfaces';
import useDeleteRequest from '../../hooks/useDeleteRequest';
import { getDefaultTableHeaders } from '@/config/tableConfigs';

// Matches travel-request.service.ts's filterableFields.
const travelRequestFilterConfigs: IFilterConfig[] = [
  { key: 'status', label: 'Status', type: 'select', options: STATUS_OPTIONS, placeholder: 'All' },
  { key: 'staffName', label: 'Staff name', type: 'text', placeholder: 'Any' },
  { key: 'trNumber', label: 'TR number', type: 'text', placeholder: 'Any' },
  { key: 'dateFrom', label: 'Date from', type: 'date' },
  { key: 'dateTo', label: 'Date to', type: 'date' },
];

const AllTravelRequests = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

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
    filterConfigs: travelRequestFilterConfigs,
    defaultFilters: {},
  });

  const { data, isLoading, isError } = useAllTravelRequests(queryParams);
  const { deleteTravelRequest } = useDeleteTravelRequest(queryParams);

  const travelRequests = useMemo(() => data?.data ?? [], [data]);
  const totalPages = useMemo(() => data?.pagination.pages ?? 1, [data]);

  const handleAction = useCallback(
    (request: ITravelRequest) => {
      dispatch(setTravelRequest(request));
      navigate(`/travel-requests/request/${request.id}`);
    },
    [dispatch, navigate]
  );

  const handleEdit = useCallback(
    (request: ITravelRequest) => {
      dispatch(setTravelRequest(request));
      navigate(`/travel-requests/edit-request/${request.id}`);
    },
    [dispatch, navigate]
  );

  const handleDelete = useDeleteRequest(deleteTravelRequest, {
    entityName: 'Travel Request',
  });

  const tableHeadData = getDefaultTableHeaders();

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
      searchPlaceholder="Search travel requests..."
    />
  );

  return (
    <ListPage
      title="Travel Requests"
      data={travelRequests}
      headers={tableHeadData}
      isLoading={isLoading}
      isError={isError}
      currentPage={page}
      totalPages={totalPages}
      onPageChange={handlePageChange}
      renderRow={request => (
        <TravelRequestTableRow
          key={request.id}
          request={request}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
          handleAction={handleAction}
          tableHeadData={tableHeadData}
        />
      )}
      onAdd={() => navigate('/travel-requests/create-travel-request')}
      emptyMessage={
        hasActiveFilters ? 'No travel requests match your filters' : 'No travel requests found'
      }
      emptySubMessage={
        hasActiveFilters
          ? 'Try adjusting your filters or search terms'
          : 'Create your first travel request'
      }
      searchComponent={filterToolbar}
    />
  );
};

export default AllTravelRequests;
