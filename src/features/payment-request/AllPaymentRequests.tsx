// AllPaymentRequests.tsx
import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import { ListPage } from '../../components/custom/ListPage';
import { FilterToolbar } from '@/components/filters/FilterToolbar';
import { useFilteredList } from '@/hooks/useFilteredList';
import { useAllPaymentRequests, useDeletePaymentRequest } from './Hooks/usePaymentRequests';
import PaymentRequestTableRow from './PaymentRequestTableRow';
import { setPaymentRequest } from '../../store/paymentRequestSlice';
import { IPaymentRequest, IFilterConfig, STATUS_OPTIONS } from '../../interfaces';
import useDeleteRequest from '../../hooks/useDeleteRequest';
import { getDefaultTableHeaders } from '@/config/tableConfigs';

// Matches payment-request.service.ts's filterableFields.
const paymentRequestFilterConfigs: IFilterConfig[] = [
  { key: 'status', label: 'Status', type: 'select', options: STATUS_OPTIONS, placeholder: 'All' },
  { key: 'requestBy', label: 'Requested by', type: 'text', placeholder: 'Any' },
  { key: 'pmrNumber', label: 'PMR number', type: 'text', placeholder: 'Any' },
  { key: 'dateFrom', label: 'Date from', type: 'date' },
  { key: 'dateTo', label: 'Date to', type: 'date' },
];

const AllPaymentRequests = () => {
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
    filterConfigs: paymentRequestFilterConfigs,
    defaultFilters: {},
  });

  const { data, isLoading, isError } = useAllPaymentRequests(queryParams);
  const { deletePaymentRequest } = useDeletePaymentRequest(queryParams);

  const paymentRequests = useMemo(() => data?.data ?? [], [data]);
  const totalPages = useMemo(() => data?.pagination.pages ?? 1, [data]);

  const handleAction = useCallback(
    (request: IPaymentRequest) => {
      dispatch(setPaymentRequest(request));
      navigate(`/payment-requests/request/${request.id}`);
    },
    [dispatch, navigate]
  );

  const handleEdit = useCallback(
    (request: IPaymentRequest) => {
      dispatch(setPaymentRequest(request));
      navigate(`/payment-requests/edit-request/${request.id}`);
    },
    [dispatch, navigate]
  );

  const handleDelete = useDeleteRequest(deletePaymentRequest, {
    entityName: 'Payment Request',
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
      searchPlaceholder="Search payment requests..."
    />
  );

  return (
    <ListPage
      title="Payment Requests"
      data={paymentRequests}
      headers={tableHeadData}
      isLoading={isLoading}
      isError={isError}
      currentPage={page}
      totalPages={totalPages}
      onPageChange={handlePageChange}
      renderRow={request => (
        <PaymentRequestTableRow
          key={request.id}
          request={request}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
          handleAction={handleAction}
          tableHeadData={tableHeadData}
        />
      )}
      onAdd={() => navigate('/payment-requests/create-payment-request')}
      emptyMessage={
        hasActiveFilters ? 'No payment requests match your filters' : 'No payment requests found'
      }
      emptySubMessage={
        hasActiveFilters
          ? 'Try adjusting your filters or search terms'
          : 'Create your first payment request'
      }
      searchComponent={filterToolbar}
    />
  );
};

export default AllPaymentRequests;
