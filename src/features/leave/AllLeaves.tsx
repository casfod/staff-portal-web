// src/features/leave/AllLeaves.tsx
import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import { ListPage } from '../../components/custom/ListPage';
import { FilterToolbar } from '@/components/filters/FilterToolbar';
import { useFilteredList } from '@/hooks/useFilteredList';
import { useAllLeaves, useDeleteLeave } from './Hooks/useLeave';
import LeaveTableRow from './LeaveTableRow';
import { setLeave } from '../../store/leaveSlice';
import { ILeave, IFilterConfig, STATUS_OPTIONS } from '../../interfaces';
import useDeleteRequest from '../../hooks/useDeleteRequest';
import { getLeaveTableHeaders } from '@/config/tableConfigs';

// ✅ Define filter configurations for leaves
const leaveFilterConfigs: IFilterConfig[] = [
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    options: STATUS_OPTIONS,
    placeholder: 'Filter by status...',
  },
  {
    key: 'leaveType',
    label: 'Leave Type',
    type: 'select',
    options: [
      { label: 'Annual leave', value: 'Annual leave' },
      { label: 'Compassionate leave', value: 'Compassionate leave' },
      { label: 'Sick leave', value: 'Sick leave' },
      { label: 'Maternity leave', value: 'Maternity leave' },
      { label: 'Paternity leave', value: 'Paternity leave' },
      { label: 'Emergency leave', value: 'Emergency leave' },
      { label: 'Study Leave', value: 'Study Leave' },
      { label: 'Leave without pay', value: 'Leave without pay' },
    ],
    placeholder: 'Filter by leave type...',
  },
  {
    key: 'staffName',
    label: 'Staff Name',
    type: 'text',
    placeholder: 'Search by staff name...',
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

const AllLeaves = () => {
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
    filterConfigs: leaveFilterConfigs,
    defaultFilters: {},
  });

  const { data, isLoading, isError } = useAllLeaves(queryParams);
  const { deleteLeave } = useDeleteLeave(queryParams);

  const leaves = useMemo(() => data?.data ?? [], [data]);
  const totalPages = useMemo(() => data?.pagination.pages ?? 1, [data]);

  const handleAction = useCallback(
    (leave: ILeave) => {
      dispatch(setLeave(leave));
      navigate(`/human-resources/leave/${leave.id}`);
    },
    [dispatch, navigate]
  );

  const handleEdit = useCallback(
    (leave: ILeave) => {
      dispatch(setLeave(leave));
      navigate(`/human-resources/leave/edit/${leave.id}`);
    },
    [dispatch, navigate]
  );

  const handleDelete = useDeleteRequest(deleteLeave, {
    entityName: 'Leave Application',
  });

  const tableHeadData = getLeaveTableHeaders();

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
      searchPlaceholder="Search leave applications..."
    />
  );

  return (
    <ListPage
      title="Leaves"
      data={leaves}
      headers={tableHeadData}
      isLoading={isLoading}
      isError={isError}
      currentPage={page}
      totalPages={totalPages}
      onPageChange={handlePageChange}
      renderRow={leave => (
        <LeaveTableRow
          key={leave.id}
          request={leave}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
          handleAction={handleAction}
          tableHeadData={tableHeadData}
        />
      )}
      onAdd={() => navigate('/human-resources/leave/create')}
      emptyMessage={hasActiveFilters ? 'No leaves match your filters' : 'No leaves found'}
      emptySubMessage={
        hasActiveFilters
          ? 'Try adjusting your filters or search terms'
          : 'Apply for leave'
      }
      searchComponent={filterToolbar}
    />
  );
};

export default AllLeaves;