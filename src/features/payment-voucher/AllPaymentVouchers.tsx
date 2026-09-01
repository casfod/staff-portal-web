// features/payment-voucher/AllPaymentVouchers.tsx
import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import { ListPage } from '../../components/custom/ListPage';
import { FilterToolbar } from '@/components/filters/FilterToolbar';
import { useFilteredList } from '@/hooks/useFilteredList';
import { useAllPaymentVouchers, useDeletePaymentVoucher } from './Hooks/usePaymentVoucher';
import PaymentVoucherTableRow from './PaymentVoucherTableRow';
import { setPaymentVoucher } from '../../store/paymentVoucherSlice';
import { IPaymentVoucher, IFilterConfig } from '../../interfaces';
import useDeleteRequest from '../../hooks/useDeleteRequest';
import { localStorageUser } from '../../utils/localStorageUser';

// Define filter configurations for Payment Vouchers
const paymentVoucherFilterConfigs: IFilterConfig[] = [
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'pending', label: 'Pending' },
      { value: 'reviewed', label: 'Reviewed' },
      { value: 'approved', label: 'Approved' },
      { value: 'rejected', label: 'Rejected' },
      { value: 'paid', label: 'Paid' },
    ],
    placeholder: 'Filter by status...',
  },
  {
    key: 'pvNumber',
    label: 'Voucher Number',
    type: 'text',
    placeholder: 'Search by voucher number...',
  },
  {
    key: 'payTo',
    label: 'Pay To',
    type: 'text',
    placeholder: 'Filter by recipient...',
  },
  {
    key: 'accountCode',
    label: 'Account Code',
    type: 'text',
    placeholder: 'Filter by account code...',
  },
  {
    key: 'createdBy',
    label: 'Created By',
    type: 'text',
    placeholder: 'Filter by creator name...',
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

const AllPaymentVouchers = () => {
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
    filterConfigs: paymentVoucherFilterConfigs,
    defaultFilters: {},
  });

  const { data, isLoading, isError } = useAllPaymentVouchers(queryParams);
  const { deletePaymentVoucher } = useDeletePaymentVoucher();

  const paymentVouchers = useMemo(() => data?.data ?? [], [data]);
  const totalPages = useMemo(() => data?.pagination.pages ?? 1, [data]);

  const handleAction = useCallback(
    (voucher: IPaymentVoucher) => {
      dispatch(setPaymentVoucher(voucher));
      navigate(`/finance/payment-voucher/${voucher.id}`);
    },
    [dispatch, navigate]
  );

  const handleEdit = useCallback(
    (voucher: IPaymentVoucher) => {
      dispatch(setPaymentVoucher(voucher));
      navigate(`/finance/payment-voucher/edit-voucher/${voucher.id}`);
    },
    [dispatch, navigate]
  );

  const handleDelete = useDeleteRequest(deletePaymentVoucher, {
    entityName: 'Payment Voucher',
  });

  // Check if user can create PV
  const canCreate = currentUser.role === 'SUPER-ADMIN' || currentUser?.financeRole?.canCreate;

  const tableHeadData = [
    { label: 'Voucher', showOnMobile: true, minWidth: '150px' },
    { label: 'Status', showOnMobile: true, minWidth: '100px' },
    { label: 'Pay To', showOnMobile: true, minWidth: '150px' },
    { label: 'Amount', showOnMobile: true, minWidth: '120px' },
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
      searchPlaceholder="Search payment vouchers..."
    />
  );

  return (
    <ListPage
      title="Payment Vouchers"
      data={paymentVouchers}
      headers={tableHeadData}
      isLoading={isLoading}
      isError={isError}
      currentPage={page}
      totalPages={totalPages}
      onPageChange={handlePageChange}
      renderRow={voucher => (
        <PaymentVoucherTableRow
          key={voucher.id}
          voucher={voucher}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
          handleAction={handleAction}
          tableHeadData={tableHeadData}
        />
      )}
      onAdd={
        canCreate
          ? () => navigate('/finance/payment-voucher/create')
          : undefined
      }
      addButtonLabel="Create Voucher"
      emptyMessage={
        hasActiveFilters ? 'No payment vouchers match your filters' : 'No payment vouchers found'
      }
      emptySubMessage={
        hasActiveFilters
          ? 'Try adjusting your filters or search terms'
          : 'Create your first payment voucher'
      }
      searchComponent={filterToolbar}
    />
  );
};

export default AllPaymentVouchers;
