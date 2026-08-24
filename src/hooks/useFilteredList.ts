// src/hooks/useFilteredList.ts
//
// Replaces useListPage + useFilters + useFilteredList. Those three hooks
// previously kept filter state in up to four places at once (FilterPanel's
// local staging copy, Redux, localStorage, and the derived queryParams
// object) which could drift out of sync. This version has exactly one
// source of truth — the genericQuerySlice in Redux — and derives everything
// else from it.
//
// Presets (save/load a named filter combo) were dropped: they added a
// second persisted store (localStorage) for a feature none of the current
// list pages surface prominently. Easy to bring back later as its own
// small hook if a page actually needs it.

import { useMemo, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useDebounce } from 'use-debounce';
import { RootState } from '../store/store';
import {
  setSearchTerm,
  setPage,
  setSort,
  setFilters,
  setFilter as setFilterAction,
  clearFilters as clearFiltersAction,
  resetQuery,
} from '../store/genericQuerySlice';
import { IFilterConfig, IFilterState } from '@/interfaces';

interface UseFilteredListOptions {
  filterConfigs: IFilterConfig[];
  defaultFilters?: IFilterState;
  resetOnUnmount?: boolean;
  debounceDelay?: number;
}

interface QueryParams {
  search: string;
  sort: string;
  page: number;
  limit: number;
  [key: string]: string | number | undefined;
}

export function useFilteredList(options: UseFilteredListOptions) {
  const {
    filterConfigs,
    defaultFilters = {},
    resetOnUnmount = true,
    debounceDelay = 600,
  } = options;

  const dispatch = useDispatch();

  const { searchTerm, sort, page, limit, filters } = useSelector(
    (state: RootState) => state.genericQuerySlice
  );

  const [debouncedSearchTerm] = useDebounce(searchTerm, debounceDelay);

  // Seed default filters once on mount if the slice is empty (e.g. first
  // visit to this list page in the session).
  useEffect(() => {
    if (Object.keys(defaultFilters).length > 0 && Object.keys(filters).length === 0) {
      dispatch(setFilters(defaultFilters));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (resetOnUnmount) {
      return () => {
        dispatch(resetQuery());
      };
    }
  }, [dispatch, resetOnUnmount]);

  const handleSearchChange = useCallback(
    (value: string) => {
      dispatch(setSearchTerm(value));
      dispatch(setPage(1));
    },
    [dispatch]
  );

  const handlePageChange = useCallback(
    (newPage: number) => {
      dispatch(setPage(newPage));
    },
    [dispatch]
  );

  const handleSortChange = useCallback(
    (newSort: string) => {
      dispatch(setSort(newSort));
      dispatch(setPage(1));
    },
    [dispatch]
  );

  const setFilter = useCallback(
    (key: string, value: string | string[] | Date | null) => {
      dispatch(setFilterAction({ key, value }));
      dispatch(setPage(1));
    },
    [dispatch]
  );

  const setAllFilters = useCallback(
    (newFilters: IFilterState) => {
      dispatch(setFilters(newFilters));
      dispatch(setPage(1));
    },
    [dispatch]
  );

  const clearFilters = useCallback(() => {
    dispatch(clearFiltersAction());
    dispatch(setPage(1));
  }, [dispatch]);

  const resetAll = useCallback(() => {
    clearFilters();
    handleSearchChange('');
  }, [clearFilters, handleSearchChange]);

  const hasActiveFilters = useMemo(
    () => Object.values(filters).some(v => v !== undefined && v !== null && v !== ''),
    [filters]
  );

  const activeFilterCount = useMemo(
    () => Object.values(filters).filter(v => v !== undefined && v !== null && v !== '').length,
    [filters]
  );

  // Query params for the API — this is the one place status/department/
  // dateFrom/dateTo etc. get attached, and it now lines up with the
  // backend's filterableFields config for each workflow type.
  const queryParams = useMemo<QueryParams>(() => {
    const params: QueryParams = { search: debouncedSearchTerm, sort, page, limit };

    Object.entries(filters).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') return;
      if (Array.isArray(value)) {
        params[key] = value.join(',');
      } else if (value instanceof Date) {
        params[key] = value.toISOString();
      } else {
        params[key] = String(value);
      }
    });

    return params;
  }, [debouncedSearchTerm, sort, page, limit, filters]);

  return {
    searchTerm,
    debouncedSearchTerm,
    handleSearchChange,

    page,
    limit,
    handlePageChange,

    sort,
    handleSortChange,

    filters,
    setFilter,
    setFilters: setAllFilters,
    clearFilters,
    hasActiveFilters,
    activeFilterCount,

    queryParams,
    resetAll,
    filterConfigs,
  };
}
