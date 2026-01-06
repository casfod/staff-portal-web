// lib/query-client.ts
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchOnReconnect: true,
    },
  },
});

// Query key factory functions
export const queryKeys = {
  // Auth
  currentUser: ["auth", "current-user"] as const,

  // User
  userProfile: ["user", "profile"] as const,
  userStats: ["user", "stats"] as const,
  userPreferences: ["user", "preferences"] as const,
  userById: (id: string) => ["users", id] as const,
  allUsers: (params?: any) => ["users", "all", params] as const,

  // FundMe
  campaigns: (filters?: any) => ["fundme", "campaigns", filters] as const,
  campaign: (id: string) => ["fundme", "campaign", id] as const,
  campaignByShareCode: (shareCode: string) =>
    ["fundme", "campaign", "share", shareCode] as const,
  featuredCampaigns: (limit?: number) =>
    ["fundme", "campaigns", "featured", limit] as const,
  trendingCampaigns: (options?: any) =>
    ["fundme", "campaigns", "trending", options] as const,
  userCampaigns: (filters?: any) =>
    ["fundme", "user", "campaigns", filters] as const,
  userDonations: (filters?: any) =>
    ["fundme", "user", "donations", filters] as const,
  campaignDonations: (campaignId: string, page?: number) =>
    ["fundme", "campaign", campaignId, "donations", page] as const,
  campaignAnalytics: (campaignId: string, period?: string) =>
    ["fundme", "campaign", campaignId, "analytics", period] as const,
  fundMeCategories: ["fundme", "categories"] as const,
  fundMeWithdrawals: (campaignId: string) =>
    ["fundme", "campaign", campaignId, "withdrawals"] as const,
  campaignVotes: (campaignId: string) =>
    ["fundme", "campaign", campaignId, "votes"] as const,

  // Groups
  userGroups: (params?: any) => ["groups", "user", params] as const,
  group: (id: string) => ["groups", id] as const,
  groupMembers: (groupId: string) => ["groups", groupId, "members"] as const,
  groupStats: (groupId: string) => ["groups", groupId, "stats"] as const,
  groupCycleData: (groupId: string) =>
    ["groups", groupId, "cycle-data"] as const,
  featuredGroups: ["groups", "featured"] as const,
  groupCategories: ["groups", "categories"] as const,

  // Wallet
  userWallets: ["wallets"] as const,
  userWallet: (walletType: string, currency?: string) =>
    ["wallets", walletType, currency] as const,
  totalBalance: (currency?: string) =>
    ["wallets", "total-balance", currency] as const,
  walletStats: (walletType: string, currency?: string) =>
    ["wallets", walletType, "stats", currency] as const,
  walletTransactions: (walletType: string, page?: number) =>
    ["wallets", walletType, "transactions", page] as const,

  // Voting
  pendingVotes: (params?: any) => ["voting", "pending", params] as const,
  userVotes: (params?: any) => ["voting", "user", params] as const,
  userVoteStats: ["voting", "user", "stats"] as const,
  vote: (id: string) => ["voting", id] as const,
  voteRecords: (voteId: string, params?: any) =>
    ["voting", voteId, "records", params] as const,
  entityVotes: (entityType: string, entityId: string, filters?: any) =>
    ["voting", "entities", entityType, entityId, "votes", filters] as const,

  // Admin
  adminDashboard: (currency?: string) =>
    ["admin", "dashboard", currency] as const,
  adminUsers: (params?: any) => ["admin", "users", params] as const,
  adminGroups: (params?: any) => ["admin", "groups", params] as const,
  adminCampaigns: (params?: any) => ["admin", "campaigns", params] as const,
  adminWithdrawals: (params?: any) => ["admin", "withdrawals", params] as const,
  systemStats: (currency?: string) =>
    ["admin", "system-stats", currency] as const,

  // Notifications
  notifications: (page?: number) => ["notifications", page] as const,
  unreadCount: ["notifications", "unread-count"] as const,
};

// Helper function for optimized query options
export const getOptimizedQueryOptions = (_queryKey: readonly unknown[]) => ({
  retry: 1,
  refetchOnWindowFocus: false,
  staleTime: 1000 * 60 * 5, // 5 minutes default
});
