import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { ListPage } from '../../components/custom/ListPage';
import { FilterToolbar } from '@/components/filters/FilterToolbar';
import { useFilteredList } from '@/hooks/useFilteredList';
import { IFilterConfig, IStoreRequest, STATUS_OPTIONS } from '../../interfaces';
import { getStoreTableHeaders } from '@/config/tableConfigs';
import { useAllStoreRequests } from './Hooks/useStoreRequest';
import StoreRequestTableRow from './StoreRequestTableRow';

const REQUEST_TYPE_OPTIONS = [
    { value: 'dispatch', label: 'Dispatch' },
    { value: 'return', label: 'Return' },
];

const storeRequestFilterConfigs: IFilterConfig[] = [
    {
        key: 'status',
        label: 'Status',
        type: 'select',
        options: STATUS_OPTIONS,
        placeholder: 'All statuses',
    },
    {
        key: 'requestType',
        label: 'Request Type',
        type: 'select',
        options: REQUEST_TYPE_OPTIONS,
        placeholder: 'All types',
    },
    { key: 'dateFrom', label: 'Date From', type: 'date' },
    { key: 'dateTo', label: 'Date To', type: 'date' },
];

const AllStoreRequests = () => {
    const navigate = useNavigate();

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
        filterConfigs: storeRequestFilterConfigs,
        defaultFilters: {},
    });

    const { data, isLoading, isError } = useAllStoreRequests(queryParams);
    const storeRequests = useMemo(() => data?.data ?? [], [data]);
    const totalPages = useMemo(() => data?.pagination.pages ?? 1, [data]);
    const tableHeadData = getStoreTableHeaders();

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
            searchPlaceholder="Search store requests..."
        />
    );

    return (
        <ListPage<IStoreRequest>
            title="Store Requests"
            data={storeRequests}
            headers={tableHeadData}
            isLoading={isLoading}
            isError={isError}
            currentPage={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            renderRow={request => <StoreRequestTableRow key={request.id} request={request} />}
            onAdd={() => navigate('/store-requests/create-store-request')}
            addButtonLabel="Add"
            emptyMessage={hasActiveFilters ? 'No requests match your filters' : 'No requests found'}
            emptySubMessage={
                hasActiveFilters
                    ? 'Try adjusting your filters or search terms'
                    : 'Store requests will appear here once created'
            }
            searchComponent={filterToolbar}
        />
    );
};

export default AllStoreRequests;
