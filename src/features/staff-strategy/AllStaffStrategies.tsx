// src/features/staff-strategy/AllStaffStrategies.tsx
import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import { ListPage } from '../../components/custom/ListPage';
import { FilterToolbar } from '@/components/filters/FilterToolbar';
import { useFilteredList } from '@/hooks/useFilteredList';
import { useStaffStrategies, useDeleteStaffStrategy } from './Hooks/useStaffStrategy';
import StaffStrategyTableRow from './StaffStrategyTableRow';
import { setStaffStrategy } from '../../store/staffStrategySlice';
import { IStaffStrategy, IFilterConfig, STATUS_OPTIONS } from '../../interfaces';
import useDeleteRequest from '../../hooks/useDeleteRequest';
import { getStaffStrategyTableHeaders } from '@/config/tableConfigs';

// ✅ Define filter configurations for staff strategies
const staffStrategyFilterConfigs: IFilterConfig[] = [
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
    key: 'period',
    label: 'Period',
    type: 'text',
    placeholder: 'Filter by period...',
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

export default function AllStaffStrategies() {
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
    filterConfigs: staffStrategyFilterConfigs,
    defaultFilters: {},
  });

  const { data, isLoading, isError } = useStaffStrategies(queryParams);
  const { deleteStaffStrategy } = useDeleteStaffStrategy(queryParams);

  const staffStrategies = useMemo(() => data?.data ?? [], [data]);
  const totalPages = useMemo(() => data?.pagination.pages ?? 1, [data]);

  const handleAction = useCallback(
    (strategy: IStaffStrategy) => {
      dispatch(setStaffStrategy(strategy));
      navigate(`/human-resources/staff-strategy/${strategy.id}`);
    },
    [dispatch, navigate]
  );

  const handleEdit = useCallback(
    (strategy: IStaffStrategy) => {
      dispatch(setStaffStrategy(strategy));
      navigate(`/human-resources/staff-strategy/edit/${strategy.id}`);
    },
    [dispatch, navigate]
  );

  const handleDelete = useDeleteRequest(deleteStaffStrategy, {
    entityName: 'Staff Strategy',
  });

  const tableHeadData = getStaffStrategyTableHeaders();

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
      searchPlaceholder="Search staff strategies..."
    />
  );

  return (
    <ListPage
      title="Staff Strategies & Objectives"
      data={staffStrategies}
      headers={tableHeadData}
      isLoading={isLoading}
      isError={isError}
      currentPage={page}
      totalPages={totalPages}
      onPageChange={handlePageChange}
      renderRow={strategy => (
        <StaffStrategyTableRow
          key={strategy.id}
          request={strategy}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
          handleAction={handleAction}
          tableHeadData={tableHeadData}
        />
      )}
      onAdd={() => navigate('/human-resources/staff-strategy/create')}
      emptyMessage={hasActiveFilters ? 'No strategies match your filters' : 'No strategies found'}
      emptySubMessage={
        hasActiveFilters
          ? 'Try adjusting your filters or search terms'
          : 'Create your first staff strategy'
      }
      searchComponent={filterToolbar}
    />
  );
}