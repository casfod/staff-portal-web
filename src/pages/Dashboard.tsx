import { useMemo } from "react";
import { usePurchaseStats } from "../features/purchase-request/Hooks/usePurchaseStats";

import NetworkErrorUI from "../ui/NetworkErrorUI";
import {
  AdvanceRequestStats,
  ConceptNoteStats,
  PaymentRequestStats,
  ProjectStats,
  PurchaseRequestStats,
  TravelRequestStats,
} from "../interfaces";
import { useProjectStats } from "../features/project/Hooks/useProjectStats";
import SpinnerMini from "../ui/SpinnerMini";
import { useConceptNotesStats } from "../features/concept-note/Hooks/usePurchaseStats";
import { usePaymentRequestStats } from "../features/payment-request/Hooks/usePaymentRequestStats";
import { useAdvanceRequestStats } from "../features/advance-request/Hooks/useAdvanceRequestStats";
import { useTravelRequestStats } from "../features/travel-request/Hooks/useTravelRequestStats";
import { useNavigate } from "react-router-dom";

export function Dashboard() {
  const navigate = useNavigate();
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
  const {
    data: paymentRequestStatsData,
    isLoading: isLoadingPaymentRequestStats,
    isError: isErrorPaymentRequestStats,
  } = usePaymentRequestStats(); // Use the correct hook
  const {
    data: advanceRequestStatsData,
    isLoading: isLoadingAdvanceRequestStats,
    isError: isErrorAdvanceRequestStats,
  } = useAdvanceRequestStats(); // Use the correct hook
  const {
    data: travelRequestStatsData,
    isLoading: isLoadingTravelRequestStats,
    isError: isErrorTravelRequestStats,
  } = useTravelRequestStats(); // Use the correct hook

  // Explicitly type purchase request stats
  const purchaseRequestStats = useMemo(
    () => (purchaseRequestStatsData?.data as PurchaseRequestStats) ?? {},
    [purchaseRequestStatsData]
  );
  // Explicitly type payment request stats
  const paymentRequestStats = useMemo(
    () => (paymentRequestStatsData?.data as PaymentRequestStats) ?? {},
    [paymentRequestStatsData]
  );

  // Explicitly type advance request stats
  const advanceRequestStats = useMemo(
    () => (advanceRequestStatsData?.data as AdvanceRequestStats) ?? {},
    [advanceRequestStatsData]
  );

  const travelRequestStats = useMemo(
    () => (travelRequestStatsData?.data as TravelRequestStats) ?? {},
    [travelRequestStatsData]
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

  // Define stats array

  const stats = [
    {
      name: "Total Projects",
      total: isLoadingProjectsStats ? (
        <SpinnerMini />
      ) : (
        projectsStats?.totalProjects ?? 0
      ),
      to: "/projects",
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
      to: "/purchase-requests",
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
        conceptNotesStats.totalApprovedConceptNotes ?? 0
      ),

      to: "/concept-notes",
    },
    {
      name: "Payment Requests",
      total: isLoadingPaymentRequestStats ? (
        <SpinnerMini />
      ) : (
        paymentRequestStats?.totalRequests ?? 0
      ),
      approved: isLoadingPaymentRequestStats ? (
        <SpinnerMini />
      ) : (
        paymentRequestStats?.totalApprovedRequests ?? 0
      ),
      to: "/payment-requests",
    },
    {
      name: "Advance Requests",
      total: isLoadingAdvanceRequestStats ? (
        <SpinnerMini />
      ) : (
        advanceRequestStats?.totalRequests ?? 0
      ),
      approved: isLoadingAdvanceRequestStats ? (
        <SpinnerMini />
      ) : (
        advanceRequestStats?.totalApprovedRequests ?? 0
      ),
      to: "/advance-requests",
    },
    {
      name: "Travel Requests",
      total: isLoadingTravelRequestStats ? (
        <SpinnerMini />
      ) : (
        travelRequestStats?.totalRequests ?? 0
      ),
      approved: isLoadingTravelRequestStats ? (
        <SpinnerMini />
      ) : (
        travelRequestStats?.totalApprovedRequests ?? 0
      ),
      to: "/travel-requests",
    },

    { name: "Expense Claims", total: 10, approved: 13, to: "/expense-claims" },
  ];

  if (
    isErrorPurchaseRequestStats ||
    isErrorProjectsStats ||
    isErrorConceptNotesStats ||
    isErrorPaymentRequestStats ||
    isErrorAdvanceRequestStats ||
    isErrorTravelRequestStats
  ) {
    return <NetworkErrorUI />;
  }

  return (
    <div className="flex flex-col gap-4 pt-6 pb-16">
      <h1
        className="text-2xl font-semibold text-gray-700"
        style={{ letterSpacing: "2px" }}
      >
        Dashboard
      </h1>

      <div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        style={{ fontFamily: "Sora", letterSpacing: "1px" }}
      >
        {stats.map((stat) => (
          <div
            key={stat.name}
            className={`bg-white rounded-lg shadow-md p-6`}
            onClick={() => navigate(stat.to)}
          >
            <h3
              className={`text-sm lg:text-base 2xl:text-lg font-medium text-gray-600 mb-2`}
            >
              {stat.name}
            </h3>
            <div className="flex justify-between items-center">
              <div>
                <p
                  className={`text-xs 2xl:text-sm text-gray-600 font-semibold`}
                >
                  Total
                </p>
                {
                  <p
                    className={`text-xl 2xl:text-2xl font-semibold text-gray-600  `}
                  >
                    {stat.total}
                  </p>
                }
              </div>
              {stat.approved && (
                <div>
                  <p className="text-xs 2xl:text-sm text-gray-600 font-semibold">
                    Approved
                  </p>
                  <p className="text-xl 2xl:text-2xl font-semibold text-green-600">
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
