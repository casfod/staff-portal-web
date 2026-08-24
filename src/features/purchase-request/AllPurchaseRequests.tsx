// AllPurchaseRequests.tsx
import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import { ListPage } from '../../components/custom/ListPage';
import { FilterToolbar } from '@/components/filters/FilterToolbar';
import { useFilteredList } from '@/hooks/useFilteredList';
import { useAllPurchaseRequests, useDeletePurchaseRequest } from './Hooks/PRHook';
import { setPurchaseRequest } from '../../store/purchaseRequestSlice';
import { IPurchaseRequest, IFilterConfig, STATUS_OPTIONS } from '../../interfaces';
import useDeleteRequest from '../../hooks/useDeleteRequest';

import PurchaseRequestTableRow from './PurchaseRequestTableRow';
import { getDefaultTableHeaders } from '@/config/tableConfigs';

const REVIEW_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

// Purchase requests run the dual-reviewer workflow (financeReviewStatus /
// procurementReviewStatus alongside the overall status), so those get their
// own filters here. Add matching filterableFields on getPurchaseRequests'
// workflow service config (not uploaded here) — financeReviewStatus and
// procurementReviewStatus are exact-match fields on the document already.
const purchaseRequestFilterConfigs: IFilterConfig[] = [
  { key: 'status', label: 'Status', type: 'select', options: STATUS_OPTIONS, placeholder: 'All' },
  { key: 'department', label: 'Department', type: 'text', placeholder: 'Any' },
  { key: 'pcrNumber', label: 'PCR number', type: 'text', placeholder: 'Any' },
  {
    key: 'financeReviewStatus',
    label: 'Finance review',
    type: 'select',
    options: REVIEW_STATUS_OPTIONS,
    placeholder: 'All',
  },
  {
    key: 'procurementReviewStatus',
    label: 'Procurement review',
    type: 'select',
    options: REVIEW_STATUS_OPTIONS,
    placeholder: 'All',
  },
  { key: 'dateFrom', label: 'Date from', type: 'date' },
  { key: 'dateTo', label: 'Date to', type: 'date' },
];

const AllPurchaseRequests = () => {
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
    filterConfigs: purchaseRequestFilterConfigs,
    defaultFilters: {},
  });

  const { data, isLoading, isError } = useAllPurchaseRequests(queryParams);
  const { deletePurchaseRequest } = useDeletePurchaseRequest(queryParams);

  const purchaseRequests = useMemo(() => data?.data ?? [], [data]);
  const totalPages = useMemo(() => data?.pagination.pages ?? 1, [data]);

  const handleAction = useCallback(
    (request: IPurchaseRequest) => {
      dispatch(setPurchaseRequest(request));
      navigate(`/purchase-requests/request/${request.id}`);
    },
    [dispatch, navigate]
  );

  const handleEdit = useCallback(
    (request: IPurchaseRequest) => {
      dispatch(setPurchaseRequest(request));
      navigate(`/purchase-requests/edit-request/${request.id}`);
    },
    [dispatch, navigate]
  );

  const handleDelete = useDeleteRequest(deletePurchaseRequest, {
    entityName: 'Purchase Request',
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
      searchPlaceholder="Search purchase requests..."
    />
  );

  return (
    <ListPage
      title="Purchase Requests"
      data={purchaseRequests}
      headers={tableHeadData}
      isLoading={isLoading}
      isError={isError}
      currentPage={page}
      totalPages={totalPages}
      onPageChange={handlePageChange}
      renderRow={request => (
        <PurchaseRequestTableRow
          key={request.id}
          request={request}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
          handleAction={handleAction}
          tableHeadData={tableHeadData}
        />
      )}
      onAdd={() => navigate('/purchase-requests/create-purchase-request')}
      addButtonLabel="Add"
      emptyMessage={hasActiveFilters ? 'No requests match your filters' : 'No requests found'}
      emptySubMessage={
        hasActiveFilters
          ? 'Try adjusting your filters or search terms'
          : 'Create your first purchase request'
      }
      searchComponent={filterToolbar}
    />
  );
};

export default AllPurchaseRequests;
