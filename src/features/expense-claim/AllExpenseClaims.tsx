// AllExpenseClaims.tsx
import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import { ListPage } from '../../components/custom/ListPage';
import { FilterToolbar } from '@/components/filters/FilterToolbar';
import { useFilteredList } from '@/hooks/useFilteredList';
import { useAllExpenseClaims, useDeleteExpenseClaim } from './Hooks/useExpenseClaims';
import ExpenseClaimTableRow from './ExpenseClaimTableRow';
import { setExpenseClaim } from '../../store/expenseClaimSlice';
import { IExpenseClaim, IFilterConfig, STATUS_OPTIONS } from '../../interfaces';
import useDeleteRequest from '../../hooks/useDeleteRequest';
import { getDefaultTableHeaders } from '@/config/tableConfigs';

// Matches expense-claims.service.ts's filterableFields.
const expenseClaimFilterConfigs: IFilterConfig[] = [
  { key: 'status', label: 'Status', type: 'select', options: STATUS_OPTIONS, placeholder: 'All' },
  { key: 'staffName', label: 'Staff name', type: 'text', placeholder: 'Any' },
  { key: 'ecNumber', label: 'EC number', type: 'text', placeholder: 'Any' },
  { key: 'dateFrom', label: 'Date from', type: 'date' },
  { key: 'dateTo', label: 'Date to', type: 'date' },
];

const AllExpenseClaims = () => {
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
    filterConfigs: expenseClaimFilterConfigs,
    defaultFilters: {},
  });

  const { data, isLoading, isError } = useAllExpenseClaims(queryParams);
  const { deleteExpenseClaim } = useDeleteExpenseClaim(queryParams);

  const expenseClaims = useMemo(() => data?.data ?? [], [data]);
  const totalPages = useMemo(() => data?.pagination.pages ?? 1, [data]);

  const handleAction = useCallback(
    (request: IExpenseClaim) => {
      dispatch(setExpenseClaim(request));
      navigate(`/expense-claims/request/${request.id}`);
    },
    [dispatch, navigate]
  );

  const handleEdit = useCallback(
    (request: IExpenseClaim) => {
      dispatch(setExpenseClaim(request));
      navigate(`/expense-claims/edit-request/${request.id}`);
    },
    [dispatch, navigate]
  );

  const handleDelete = useDeleteRequest(deleteExpenseClaim, {
    entityName: 'Expense Claim',
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
      searchPlaceholder="Search expense claims..."
    />
  );

  return (
    <ListPage
      title="Expense Claims"
      data={expenseClaims}
      headers={tableHeadData}
      isLoading={isLoading}
      isError={isError}
      currentPage={page}
      totalPages={totalPages}
      onPageChange={handlePageChange}
      renderRow={request => (
        <ExpenseClaimTableRow
          key={request.id}
          request={request}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
          handleAction={handleAction}
          tableHeadData={tableHeadData}
        />
      )}
      onAdd={() => navigate('/expense-claims/create-expense-claim')}
      emptyMessage={
        hasActiveFilters ? 'No expense claims match your filters' : 'No expense claims found'
      }
      emptySubMessage={
        hasActiveFilters
          ? 'Try adjusting your filters or search terms'
          : 'Create your first expense claim'
      }
      searchComponent={filterToolbar}
    />
  );
};

export default AllExpenseClaims;
