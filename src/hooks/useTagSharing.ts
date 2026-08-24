// useTagSharing.ts - Updated with vendor pagination support
import { useState } from 'react';
import { useDebounce } from 'use-debounce';
import { useInfiniteQuery } from '@tanstack/react-query';
import { getUsers } from '../services/apiUser';
import { getAllVendors } from '../services/apiVendor';
import { IUser, IVendor } from '../interfaces';

export type ShareMode = 'users' | 'vendors' | 'purchase-order';
export type RFQStatus = 'draft' | 'preview' | 'sent' | 'cancelled';

const USERS_PAGE_SIZE = 20;
const VENDORS_PAGE_SIZE = 20;

interface UseTagSharingParams {
  mode: ShareMode;
  isOpen: boolean;
  canShareRequest?: boolean;
  rfqStatus?: RFQStatus;
}

interface UseTagSharingReturn {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  users: IUser[];
  vendors: IVendor[];
  isLoading: boolean;
  isError: boolean;
  isRFQShareable: boolean;
  isRFQDisabled: boolean;
  tooltip: string;
  hasMore: boolean;
  isLoadingMore: boolean;
  loadMore: () => void;
}

export function useTagSharing({
  mode,
  canShareRequest,
  rfqStatus,
}: UseTagSharingParams): UseTagSharingReturn {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm] = useDebounce(searchTerm, 600);

  const shouldFetchUsers = mode === 'users';
  const shouldFetchVendors = mode === 'vendors';

  // Users infinite query
  const {
    data: usersPages,
    isLoading: usersLoading,
    isError: usersError,
    fetchNextPage: fetchNextUsersPage,
    hasNextPage: hasNextUsersPage,
    isFetchingNextPage: isFetchingNextUsersPage,
  } = useInfiniteQuery({
    queryKey: ['users-tag-share', debouncedSearchTerm],
    queryFn: ({ pageParam }) =>
      getUsers({
        search: debouncedSearchTerm,
        page: pageParam,
        limit: USERS_PAGE_SIZE,
      }),
    initialPageParam: 1,
    getNextPageParam: lastPage => {
      const page = lastPage?.pagination?.page;
      const totalPages = lastPage?.pagination?.pages;
      if (!page || !totalPages || page >= totalPages) return undefined;
      return page + 1;
    },
    enabled: shouldFetchUsers,
    staleTime: 0,
  });

  // Vendors infinite query - FIXED: Use the same pattern as users
  const {
    data: vendorsPages,
    isLoading: vendorsLoading,
    isError: vendorsError,
    fetchNextPage: fetchNextVendorsPage,
    hasNextPage: hasNextVendorsPage,
    isFetchingNextPage: isFetchingNextVendorsPage,
  } = useInfiniteQuery({
    queryKey: ['vendors-tag-share', debouncedSearchTerm],
    queryFn: ({ pageParam }) =>
      getAllVendors({
        search: debouncedSearchTerm,
        page: pageParam,
        limit: VENDORS_PAGE_SIZE,
        // Only fetch approved vendors for sharing
        status: 'approved',
      }),
    initialPageParam: 1,
    getNextPageParam: lastPage => {
      const page = lastPage?.pagination?.page;
      const totalPages = lastPage?.pagination?.pages;
      if (!page || !totalPages || page >= totalPages) return undefined;
      return page + 1;
    },
    enabled: shouldFetchVendors,
    staleTime: 0,
  });

  const users =
    usersPages?.pages.flatMap(page => (Array.isArray(page?.data) ? page.data : [])) ?? [];

  const vendors =
    vendorsPages?.pages.flatMap(page => (Array.isArray(page?.data) ? page.data : [])) ?? [];

  const isRFQShareable =
    mode === 'vendors' &&
    !!canShareRequest &&
    !!rfqStatus &&
    rfqStatus !== 'sent' &&
    rfqStatus !== 'cancelled';

  const isRFQDisabled = mode === 'vendors' && !isRFQShareable && !!canShareRequest;

  const getTooltip = () => {
    if (mode === 'users') return 'Share with users';

    if (!canShareRequest) return "You don't have permission to share this RFQ";

    switch (rfqStatus) {
      case 'sent':
        return 'RFQ already sent';
      case 'cancelled':
        return 'Cancelled RFQ';
      default:
        return 'Share with vendors';
    }
  };

  const hasMore = mode === 'users' ? !!hasNextUsersPage : !!hasNextVendorsPage;
  const isLoadingMore = mode === 'users' ? isFetchingNextUsersPage : isFetchingNextVendorsPage;
  const loadMore = mode === 'users' ? fetchNextUsersPage : fetchNextVendorsPage;

  return {
    searchTerm,
    setSearchTerm,
    users,
    vendors,
    isLoading: mode === 'users' ? usersLoading : vendorsLoading,
    isError: mode === 'users' ? usersError : vendorsError,
    isRFQShareable,
    isRFQDisabled,
    tooltip: getTooltip(),
    hasMore,
    isLoadingMore,
    loadMore: () => {
      if (!isLoadingMore) loadMore();
    },
  };
}
