// AllProjects.tsx
import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import { ListPage } from '../../components/custom/ListPage';
import { FilterToolbar } from '@/components/filters/FilterToolbar';
import { useFilteredList } from '@/hooks/useFilteredList';
import { useProjects } from './Hooks/useProjects';
import { setProject } from '../../store/projectSlice';
import { localStorageUser } from '../../utils/localStorageUser';
import { IProject, IFilterConfig } from '../../interfaces';

import ProjectTableRow from './ProjectTableRow';
import { getProjectTableHeaders } from '@/config/tableConfigs';

// project.service.ts's getAllProjects now applies status (exact),
// projectCode (regex), and dateFrom/dateTo (range on createdAt). Confirm
// the actual status values used on the Project model — "active" /
// "completed" / "on-hold" below are a placeholder guess.
const PROJECT_STATUS_OPTIONS = [
  { value: 'completed', label: 'Completed' },
  { value: 'ongoing', label: 'On-Going' },
  { value: 'cancelled', label: 'Cancelled' },
];

const projectFilterConfigs: IFilterConfig[] = [
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    options: PROJECT_STATUS_OPTIONS,
    placeholder: 'All',
  },
  { key: 'projectCode', label: 'Project code', type: 'text', placeholder: 'Any' },
  { key: 'dateFrom', label: 'Date from', type: 'date' },
  { key: 'dateTo', label: 'Date to', type: 'date' },
];

export default function AllProjects() {
  const currentUser = localStorageUser();
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
    filterConfigs: projectFilterConfigs,
    defaultFilters: {},
  });

  const { data, isLoading, isError } = useProjects(queryParams);

  const projects = useMemo(() => data?.data ?? [], [data?.data]);
  const totalPages = useMemo(() => data?.pagination?.pages ?? 1, [data]);

  const handleAction = useCallback(
    (project: IProject) => {
      dispatch(setProject(project));
      navigate(`/projects/project/${project.id}`);
    },
    [dispatch, navigate]
  );

  const handleEdit = useCallback(
    (project: IProject) => {
      dispatch(setProject(project));
      navigate(`/projects/edit-project/${project.id}`);
    },
    [dispatch, navigate]
  );

  const isSuperAdmin = currentUser?.role === 'SUPER-ADMIN';

  // const tableHeadData = [
  //   { label: "Project Code", showOnMobile: true, minWidth: "120px" },
  //   { label: "Status", showOnMobile: true, minWidth: "100px" },
  //   { label: "Budget", showOnMobile: true, minWidth: "100px" },
  //   {
  //     label: "Date",
  //     showOnMobile: false,
  //     showOnTablet: true,
  //     minWidth: "100px",
  //   },
  //   { label: "Actions", showOnMobile: true, minWidth: "100px" },
  // ];

  const tableHeadData = getProjectTableHeaders();

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
      searchPlaceholder="Search projects..."
    />
  );

  return (
    <ListPage
      title="Projects"
      data={projects}
      headers={tableHeadData}
      isLoading={isLoading}
      isError={isError}
      currentPage={page}
      totalPages={totalPages}
      onPageChange={handlePageChange}
      renderRow={project => (
        <ProjectTableRow
          key={project.id}
          project={project}
          handleEdit={handleEdit}
          handleAction={handleAction}
          tableHeadData={tableHeadData}
        />
      )}
      onAdd={isSuperAdmin ? () => navigate('/projects/create-project') : undefined}
      addButtonLabel="Add"
      emptyMessage={hasActiveFilters ? 'No projects match your filters' : 'No projects found'}
      emptySubMessage={
        hasActiveFilters
          ? 'Try adjusting your filters or search terms'
          : 'Start by creating a new project'
      }
      searchComponent={filterToolbar}
    />
  );
}
