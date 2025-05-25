import { useMemo } from "react";
// import { useNavigate } from "react-router-dom";
import NetworkErrorUI from "../ui/NetworkErrorUI";
import SpinnerMini from "../ui/SpinnerMini";
import TextHeader from "../ui/TextHeader";
// Import all your hooks
import { usePurchaseStats } from "../features/purchase-request/Hooks/usePurchaseStats";
import { useProjectStats } from "../features/project/Hooks/useProjectStats";
import { useConceptNotesStats } from "../features/concept-note/Hooks/useConceptNotesStats";
import { usePaymentRequestStats } from "../features/payment-request/Hooks/usePaymentRequestStats";
import { useAdvanceRequestStats } from "../features/advance-request/Hooks/useAdvanceRequestStats";
import { useTravelRequestStats } from "../features/travel-request/Hooks/useTravelRequestStats";
import type {
  AdvanceRequestStats,
  ConceptNoteStats,
  ExpenseClaimStats,
  PaymentRequestStats,
  ProjectStats,
  PurchaseRequestStats,
  TravelRequestStats,
} from "../interfaces";
import { useExpenseClaimStats } from "../features/expense-claim/Hooks/useExpenseClaimStats";

export function Dashboard() {
  // Combine all stats hooks into a single object for better organization
  const statsQueries = {
    purchaseRequest: usePurchaseStats(),
    project: useProjectStats(),
    conceptNote: useConceptNotesStats(),
    paymentRequest: usePaymentRequestStats(),
    advanceRequest: useAdvanceRequestStats(),
    travelRequest: useTravelRequestStats(),
    expenseClaim: useExpenseClaimStats(),
  };

  // Check for any errors
  const hasError = Object.values(statsQueries).some((query) => query.isError);

  // Memoize all stats data with proper typing
  const statsData = useMemo(
    () => ({
      purchaseRequest:
        (statsQueries.purchaseRequest.data?.data as PurchaseRequestStats) ??
        null,
      project: (statsQueries.project.data?.data as ProjectStats) ?? null,
      conceptNote:
        (statsQueries.conceptNote.data?.data as ConceptNoteStats) ?? null,
      paymentRequest:
        (statsQueries.paymentRequest.data?.data as PaymentRequestStats) ?? null,
      advanceRequest:
        (statsQueries.advanceRequest.data?.data as AdvanceRequestStats) ?? null,
      travelRequest:
        (statsQueries.travelRequest.data?.data as TravelRequestStats) ?? null,
      expenseClaim:
        (statsQueries.expenseClaim.data?.data as ExpenseClaimStats) ?? null,
    }),
    [
      statsQueries.purchaseRequest.data,
      statsQueries.project.data,
      statsQueries.conceptNote.data,
      statsQueries.paymentRequest.data,
      statsQueries.advanceRequest.data,
      statsQueries.travelRequest.data,
      statsQueries.expenseClaim.data,
    ]
  );

  console.log(statsData.conceptNote);

  // Helper component to render stats values
  const renderStatValue = (value: number | undefined, isLoading: boolean) => {
    if (isLoading) return <SpinnerMini />;
    if (value === undefined || value === null) return "-"; // Show dash when no data
    return value;
  };

  // Stats configuration
  const stats = useMemo(
    () => [
      {
        name: "Projects",
        total: renderStatValue(
          statsData.project?.totalProjects,
          statsQueries.project.isLoading
        ),
        approved: null, // Projects might not have approved count
        to: "/projects",
      },
      {
        name: "Purchase Requests",
        total: renderStatValue(
          statsData.purchaseRequest?.totalRequests,
          statsQueries.purchaseRequest.isLoading
        ),
        approved: renderStatValue(
          statsData.purchaseRequest?.totalApprovedRequests,
          statsQueries.purchaseRequest.isLoading
        ),
        to: "/purchase-requests",
      },
      {
        name: "Concept Notes",
        total: renderStatValue(
          statsData.conceptNote?.totalRequests,
          statsQueries.conceptNote.isLoading
        ),
        approved: renderStatValue(
          statsData.conceptNote?.totalApprovedRequests,
          statsQueries.conceptNote.isLoading
        ),
        to: "/concept-notes",
      },
      {
        name: "Payment Requests",
        total: renderStatValue(
          statsData.paymentRequest?.totalRequests,
          statsQueries.paymentRequest.isLoading
        ),
        approved: renderStatValue(
          statsData.paymentRequest?.totalApprovedRequests,
          statsQueries.paymentRequest.isLoading
        ),
        to: "/payment-requests",
      },
      {
        name: "Advance Requests",
        total: renderStatValue(
          statsData.advanceRequest?.totalRequests,
          statsQueries.advanceRequest.isLoading
        ),
        approved: renderStatValue(
          statsData.advanceRequest?.totalApprovedRequests,
          statsQueries.advanceRequest.isLoading
        ),
        to: "/advance-requests",
      },
      {
        name: "Travel Requests",
        total: renderStatValue(
          statsData.travelRequest?.totalRequests,
          statsQueries.travelRequest.isLoading
        ),
        approved: renderStatValue(
          statsData.travelRequest?.totalApprovedRequests,
          statsQueries.travelRequest.isLoading
        ),
        to: "/travel-requests",
      },
      {
        name: "Expense Claims",
        total: renderStatValue(
          statsData.expenseClaim?.totalRequests,
          statsQueries.expenseClaim.isLoading
        ),
        approved: renderStatValue(
          statsData.expenseClaim?.totalApprovedRequests,
          statsQueries.expenseClaim.isLoading
        ),
        to: "/expense-claims",
      },
    ],
    [statsData, statsQueries]
  );

  if (hasError) {
    return <NetworkErrorUI />;
  }

  return (
    <div className="flex flex-col space-y-3 pb-80">
      <div className="sticky top-0 z-10 bg-[#F8F8F8] pt-4 md:pt-6 pb-3 space-y-1.5 border-b">
        <div className="flex justify-between items-center">
          <TextHeader>Dashboard</TextHeader>
        </div>
      </div>

      <div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        style={{ fontFamily: "Sora", letterSpacing: "1px" }}
      >
        {stats.map((stat) => {
          // For debugging - remove in production
          // console.log(stat);

          return (
            <div
              key={stat.name}
              className="bg-white rounded-lg shadow-md p-6 hover:cursor-pointer hover:shadow-lg transition-shadow"
              // onClick={(e) => {
              //   // Check if mobile navigation is open
              //   const mobileNav = document.querySelector('.min-h-screen.w-fit.bg-white.absolute');
              //   if (!mobileNav) {
              //     navigate(stat.to);
              //   }
              // }}
              // onKeyDown={(e) => {
              //   // Add keyboard accessibility
              //   if (e.key === 'Enter' || e.key === ' ') {
              //     const mobileNav = document.querySelector('.min-h-screen.w-fit.bg-white.absolute');
              //     if (!mobileNav) {
              //       navigate(stat.to);
              //     }
              //   }
              // }}
              // role="button"
              tabIndex={0}
            >
              <h3 className="text-sm lg:text-base 2xl:text-lg font-medium   mb-2">
                {stat.name}
              </h3>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs 2xl:text-sm   font-semibold">Total</p>
                  <p className="text-xl 2xl:text-2xl font-semibold  ">
                    {stat.total}
                  </p>
                </div>
                {stat.approved !== null && (
                  <div>
                    <p className="text-xs 2xl:text-sm   font-semibold">
                      Approved
                    </p>
                    <p className="text-xl 2xl:text-2xl font-semibold text-green-600">
                      {stat.approved}
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
