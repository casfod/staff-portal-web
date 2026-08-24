// features/report/AllReports.tsx
import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import { ListPage } from '../../components/custom/ListPage';
import { FilterToolbar } from '@/components/filters/FilterToolbar';
import { useFilteredList } from '@/hooks/useFilteredList';
import { useAllReports, useDeleteReport } from './Hooks/useReport';
import ReportTableRow from './ReportTableRow';
import { setReport } from '../../store/reportSlice';
import { IReport, IFilterConfig, STATUS_OPTIONS } from '../../interfaces';
import useDeleteRequest from '../../hooks/useDeleteRequest';
import { getReportTableHeaders } from '@/config/tableConfigs';

// ✅ Define filter configurations for reports
const reportFilterConfigs: IFilterConfig[] = [
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    options: STATUS_OPTIONS,
    placeholder: 'Filter by status...',
  },
  {
    key: 'activityType',
    label: 'Activity Type',
    type: 'select',
    options: [
      { label: 'Workshop', value: 'Workshop' },
      { label: 'Training', value: 'Training' },
      { label: 'Sector Meeting', value: 'Sector Meeting' },
      { label: 'Other', value: 'Other' },
    ],
    placeholder: 'Filter by activity type...',
  },
  {
    key: 'reportType',
    label: 'Report Type',
    type: 'select',
    options: [
      { label: 'Weekly Report', value: 'Weekly Report' },
      { label: 'Monthly Report', value: 'Monthly Report' },
      { label: 'Quarterly Report', value: 'Quarterly Report' },
      { label: 'Annual Report', value: 'Annual Report' },
      { label: 'Activity report', value: 'Activity report' },
    ],
    placeholder: 'Filter by report type...',
  },
  {
    key: 'reportNumber',
    label: 'Report Number',
    type: 'text',
    placeholder: 'Search by report number...',
  },
  {
    key: 'reportTitle',
    label: 'Report Title',
    type: 'text',
    placeholder: 'Search by report title...',
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

const AllReports = () => {
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
    filterConfigs: reportFilterConfigs,
    defaultFilters: {},
  });

  const { data, isLoading, isError } = useAllReports(queryParams);
  const { deleteReport } = useDeleteReport(queryParams);

  const reports = useMemo(() => data?.data ?? [], [data]);
  const totalPages = useMemo(() => data?.pagination.pages ?? 1, [data]);

  const handleAction = useCallback(
    (report: IReport) => {
      dispatch(setReport(report));
      navigate(`/reporting/report/${report.id}`);
    },
    [dispatch, navigate]
  );

  const handleEdit = useCallback(
    (report: IReport) => {
      dispatch(setReport(report));
      navigate(`/reporting/edit-report/${report.id}`);
    },
    [dispatch, navigate]
  );

  const handleDelete = useDeleteRequest(deleteReport, {
    entityName: 'Report',
  });

  const tableHeadData = getReportTableHeaders();

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
      searchPlaceholder="Search reports..."
    />
  );

  return (
    <ListPage
      title="Reports"
      data={reports}
      headers={tableHeadData}
      isLoading={isLoading}
      isError={isError}
      currentPage={page}
      totalPages={totalPages}
      onPageChange={handlePageChange}
      renderRow={report => (
        <ReportTableRow
          key={report.id}
          report={report}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
          handleAction={handleAction}
          tableHeadData={tableHeadData}
        />
      )}
      onAdd={() => navigate('/reporting/create-report')}
      emptyMessage={hasActiveFilters ? 'No reports match your filters' : 'No reports found'}
      emptySubMessage={
        hasActiveFilters
          ? 'Try adjusting your filters or search terms'
          : 'Create your first report'
      }
      searchComponent={filterToolbar}
    />
  );
};

export default AllReports;