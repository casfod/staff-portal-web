import { useMemo } from "react";
import { usePurchaseStats } from "../features/purchase-request/Hooks/usePurchaseStats";

import NetworkErrorUI from "../ui/NetworkErrorUI";
import { ProjectStats, PurchaseRequestStats } from "../interfaces";
import { useProjectStats } from "../features/project/Hooks/useProjectStats";

export function Dashboard() {
  // Fetch purchase request stats
  const {
    data: purchaseRequestStatsData,
    isLoading: isLoadingPurchaseRequestStats,
    isError: isErrorPurchaseRequestStats,
  } = usePurchaseStats();

  // Fetch project stats
  const {
    data: projectsStatsData,
    isLoading: isLoadingProjectsStats,
    isError: isErrorProjectsStats,
  } = useProjectStats(); // Use the correct hook

  // Explicitly type purchase request stats
  const purchaseRequestStats = useMemo(
    () => (purchaseRequestStatsData?.data as PurchaseRequestStats) ?? {},
    [purchaseRequestStatsData]
  );

  // Explicitly type project stats
  const projectsStats = useMemo(
    () => (projectsStatsData?.data as ProjectStats) ?? {},
    [projectsStatsData]
  );

  // Define stats array
  const stats = [
    {
      name: "Total Projects",
      total: isLoadingProjectsStats ? 0 : projectsStats?.totalProjects ?? 0,
    },
    {
      name: "Purchase Requests",
      total: isLoadingPurchaseRequestStats
        ? 0
        : purchaseRequestStats?.totalRequests ?? 0,
      approved: isLoadingPurchaseRequestStats
        ? 0
        : purchaseRequestStats?.totalApprovedRequests ?? 0,
    },
    { name: "Payment Requests", total: 45, approved: 10 },
    { name: "Travel Requests", total: 15, approved: 10 },
    { name: "Advance Requests", total: 20, approved: 15 },
  ];

  console.log(purchaseRequestStats);

  if (isErrorPurchaseRequestStats || isErrorProjectsStats) {
    return <NetworkErrorUI />;
  }

  return (
    <div className="space-y-6">
      <h1
        className="text-2xl font-semibold text-gray-700"
        style={{ fontFamily: "Lato", letterSpacing: "2px" }}
      >
        Dashboard
      </h1>

      <div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        style={{ letterSpacing: "1.2px" }}
      >
        {stats.map((stat) => (
          <div
            key={stat.name}
            className={`${
              stat.name === "Total Projects"
                ? "bg-buttonColor text-white"
                : "bg-white"
            } rounded-lg shadow p-6`}
          >
            <h3
              className={`text-lg font-medium ${
                stat.name === "Total Projects" ? "text-white" : "text-gray-700"
              } mb-2`}
            >
              {stat.name}
            </h3>
            <div className="flex justify-between items-center">
              <div>
                <p
                  className={`text-sm ${
                    stat.name === "Total Projects"
                      ? "text-gray-200"
                      : "text-gray-500"
                  }`}
                >
                  Total
                </p>
                <p
                  className={`text-2xl font-semibold ${
                    stat.name === "Total Projects"
                      ? "text-white"
                      : "text-gray-700"
                  } `}
                >
                  {stat.total}
                </p>
              </div>
              {stat.approved && (
                <div>
                  <p className="text-sm text-gray-500">Approved</p>
                  <p className="text-2xl font-semibold text-green-600">
                    {stat.approved}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
