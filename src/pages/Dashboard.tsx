import { useMemo } from "react";
import { usePurchaseStats } from "../features/purchase-request/Hooks/usePurchaseStats";

import NetworkErrorUI from "../ui/NetworkErrorUI";
import {
  ConceptNoteStats,
  ProjectStats,
  PurchaseRequestStats,
} from "../interfaces";
import { useProjectStats } from "../features/project/Hooks/useProjectStats";
import SpinnerMini from "../ui/SpinnerMini";
import { useConceptNotesStats } from "../features/concept-note/Hooks/usePurchaseStats";

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
  // Fetch project stats
  const {
    data: conceptNotesStatsData,
    isLoading: isLoadingConceptNotesStats,
    isError: isErrorConceptNotesStats,
  } = useConceptNotesStats(); // Use the correct hook

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

  // Explicitly type concept note stats
  const conceptNotesStats = useMemo(
    () => (conceptNotesStatsData?.data as ConceptNoteStats) ?? {},
    [conceptNotesStatsData]
  );

  console.log(conceptNotesStats);

  // Define stats array
  const stats = [
    {
      name: "Total Projects",
      total: isLoadingProjectsStats ? (
        <SpinnerMini />
      ) : (
        projectsStats?.totalProjects ?? 0
      ),
    },
    {
      name: "Purchase Requests",
      total: isLoadingPurchaseRequestStats ? (
        <SpinnerMini />
      ) : (
        purchaseRequestStats?.totalRequests ?? 0
      ),
      approved: isLoadingPurchaseRequestStats ? (
        <SpinnerMini />
      ) : (
        purchaseRequestStats?.totalApprovedRequests ?? 0
      ),
    },
    {
      name: "Concept Notes",
      total: isLoadingConceptNotesStats ? (
        <SpinnerMini />
      ) : (
        conceptNotesStats.totalConceptNotes ?? 0
      ),
      approved: isLoadingConceptNotesStats ? (
        <SpinnerMini />
      ) : (
        conceptNotesStats.totalApprovedRequests ?? 0
      ),
    },
    { name: "Payment Requests", total: 45, approved: 10 },
    { name: "Travel Requests", total: 15, approved: 10 },
    { name: "Advance Requests", total: 20, approved: 15 },
  ];

  if (
    isErrorPurchaseRequestStats ||
    isErrorProjectsStats ||
    isErrorConceptNotesStats
  ) {
    return <NetworkErrorUI />;
  }

  return (
    <div className="flex flex-col gap-4 pb-16">
      <h1
        className="text-2xl font-semibold text-gray-700"
        style={{ fontFamily: "Lato", letterSpacing: "2px" }}
      >
        Dashboard
      </h1>

      <div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        style={{ letterSpacing: "1.2px" }}
      >
        {stats.map((stat) => (
          <div key={stat.name} className={`bg-white rounded-lg shadow p-6`}>
            <h3 className={`text-lg font-medium text-gray-700 mb-2`}>
              {stat.name}
            </h3>
            <div className="flex justify-between items-center">
              <div>
                <p className={`text-sm text-gray-500`}>Total</p>
                {
                  <p className={`text-2xl font-semibold text-gray-700  `}>
                    {stat.total}
                  </p>
                }
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
