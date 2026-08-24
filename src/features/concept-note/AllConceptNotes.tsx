// AllConceptNotes.tsx
import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import { ListPage } from '../../components/custom/ListPage';
import { FilterToolbar } from '@/components/filters/FilterToolbar';
import { useFilteredList } from '@/hooks/useFilteredList';
import { useAllConceptNotes, useDeleteConceptNote } from './Hooks/useConceptNotes';
import ConceptNoteTableRow from './ConceptNoteTableRow';
import { setConceptNote } from '../../store/conceptNoteSlice';
import { IConceptNote, IFilterConfig, STATUS_OPTIONS } from '../../interfaces';
import useDeleteRequest from '../../hooks/useDeleteRequest';
import { getDefaultTableHeaders } from '@/config/tableConfigs';

// Matches concept-note.service.ts's filterableFields.
const conceptNoteFilterConfigs: IFilterConfig[] = [
  { key: 'status', label: 'Status', type: 'select', options: STATUS_OPTIONS, placeholder: 'All' },
  { key: 'activityTitle', label: 'Activity title', type: 'text', placeholder: 'Any' },
  { key: 'cnNumber', label: 'CN number', type: 'text', placeholder: 'Any' },
  { key: 'dateFrom', label: 'Date from', type: 'date' },
  { key: 'dateTo', label: 'Date to', type: 'date' },
];

const AllConceptNotes = () => {
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
    filterConfigs: conceptNoteFilterConfigs,
    defaultFilters: {},
  });

  const { data, isLoading, isError } = useAllConceptNotes(queryParams);
  const { deleteConceptNote } = useDeleteConceptNote(queryParams);

  const conceptNotes = useMemo(() => data?.data ?? [], [data]);
  const totalPages = useMemo(() => data?.pagination.pages ?? 1, [data]);

  const handleAction = useCallback(
    (request: IConceptNote) => {
      dispatch(setConceptNote(request));
      navigate(`/concept-notes/request/${request.id}`);
    },
    [dispatch, navigate]
  );

  const handleEdit = useCallback(
    (request: IConceptNote) => {
      dispatch(setConceptNote(request));
      navigate(`/concept-notes/edit-concept-note/${request.id}`);
    },
    [dispatch, navigate]
  );

  const handleDelete = useDeleteRequest(deleteConceptNote, {
    entityName: 'Concept Note',
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
      searchPlaceholder="Search concept notes..."
    />
  );

  return (
    <ListPage
      title="Concept Notes"
      data={conceptNotes}
      headers={tableHeadData}
      isLoading={isLoading}
      isError={isError}
      currentPage={page}
      totalPages={totalPages}
      onPageChange={handlePageChange}
      renderRow={request => (
        <ConceptNoteTableRow
          key={request.id}
          request={request}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
          handleAction={handleAction}
          tableHeadData={tableHeadData}
        />
      )}
      onAdd={() => navigate('/concept-notes/create-concept-note')}
      emptyMessage={
        hasActiveFilters ? 'No concept notes match your filters' : 'No concept notes found'
      }
      emptySubMessage={
        hasActiveFilters
          ? 'Try adjusting your filters or search terms'
          : 'Create your first concept note'
      }
      searchComponent={filterToolbar}
    />
  );
};

export default AllConceptNotes;
