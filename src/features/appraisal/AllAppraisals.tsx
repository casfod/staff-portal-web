// src/features/appraisal/AllAppraisals.tsx
import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import { ListPage } from '../../components/custom/ListPage';
import { FilterToolbar } from '@/components/filters/FilterToolbar';
import { useFilteredList } from '@/hooks/useFilteredList';
import { useAppraisals, useDeleteAppraisal } from './Hooks/useAppraisal';
import AppraisalTableRow from './AppraisalTableRow';
import { setAppraisal } from '../../store/appraisalSlice';
import { IAppraisal, IFilterConfig, STATUS_OPTIONS } from '../../interfaces';
import useDeleteRequest from '../../hooks/useDeleteRequest';
import { getAppraisalTableHeaders } from '@/config/tableConfigs';

// ✅ Define filter configurations for appraisals
const appraisalFilterConfigs: IFilterConfig[] = [
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
    key: 'appraisalPeriod',
    label: 'Appraisal Period',
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

export default function AllAppraisals() {
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
    filterConfigs: appraisalFilterConfigs,
    defaultFilters: {},
  });

  const { data, isLoading, isError } = useAppraisals(queryParams);
  const { deleteAppraisal } = useDeleteAppraisal(queryParams);

  const appraisals = useMemo(() => data?.data ?? [], [data]);
  const totalPages = useMemo(() => data?.pagination.pages ?? 1, [data]);

  const handleAction = useCallback(
    (appraisal: IAppraisal) => {
      dispatch(setAppraisal(appraisal));
      navigate(`/human-resources/appraisals/${appraisal.id}`);
    },
    [dispatch, navigate]
  );

  const handleEdit = useCallback(
    (appraisal: IAppraisal) => {
      dispatch(setAppraisal(appraisal));
      navigate(`/human-resources/appraisals/edit/${appraisal.id}`);
    },
    [dispatch, navigate]
  );

  const handleDelete = useDeleteRequest(deleteAppraisal, {
    entityName: 'Appraisal',
  });

  const tableHeadData = getAppraisalTableHeaders();

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
      searchPlaceholder="Search appraisals..."
    />
  );

  return (
    <ListPage
      title="Staff Appraisals"
      data={appraisals}
      headers={tableHeadData}
      isLoading={isLoading}
      isError={isError}
      currentPage={page}
      totalPages={totalPages}
      onPageChange={handlePageChange}
      renderRow={appraisal => (
        <AppraisalTableRow
          key={appraisal.id}
          request={appraisal}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
          handleAction={handleAction}
          tableHeadData={tableHeadData}
        />
      )}
      onAdd={() => navigate('/human-resources/appraisals/create')}
      emptyMessage={hasActiveFilters ? 'No appraisals match your filters' : 'No appraisals found'}
      emptySubMessage={
        hasActiveFilters
          ? 'Try adjusting your filters or search terms'
          : 'Create your first appraisal'
      }
      searchComponent={filterToolbar}
    />
  );
}