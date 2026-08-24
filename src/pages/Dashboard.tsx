import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import NetworkErrorUI from '../components/custom/NetworkErrorUI';
import TextHeader from '../components/custom/TextHeader';
import StatCard from '../components/custom/StatCard';
import { DashboardCharts } from '../components/custom/DashboardCharts';
import { statCardConfigs } from '../config/navigation';

// Import all your hooks
import { usePurchaseRequestStats } from '../features/purchase-request/Hooks/PRHook';
import { useProjectStats } from '../features/project/Hooks/useProjects';
import { useConceptNotesStats } from '../features/concept-note/Hooks/useConceptNotes';
import { useAdvanceRequestStats } from '../features/advance-request/Hooks/useAdvanceRequest';
import { usePaymentRequestStats } from '../features/payment-request/Hooks/usePaymentRequests';
import { useTravelRequestStats } from '../features/travel-request/Hooks/useTravelRequests';
import { useExpenseClaimStats } from '../features/expense-claim/Hooks/useExpenseClaims';
import { motion } from 'framer-motion';

// Define proper types for each stat
interface ProjectStatData {
  totalProjects: number;
}

interface RequestStatData {
  totalRequests: number;
  totalApprovedRequests: number;
}

type StatsData = {
  project: ProjectStatData;
  purchaseRequest: RequestStatData;
  conceptNote: RequestStatData;
  paymentRequest: RequestStatData;
  advanceRequest: RequestStatData;
  travelRequest: RequestStatData;
  expenseClaim: RequestStatData;
};

export default function Dashboard() {
  const navigate = useNavigate();

  // Use individual hooks with proper types
  const projectStats = useProjectStats();
  const purchaseRequestStats = usePurchaseRequestStats();
  const conceptNoteStats = useConceptNotesStats();
  const paymentRequestStats = usePaymentRequestStats();
  const advanceRequestStats = useAdvanceRequestStats();
  const travelRequestStats = useTravelRequestStats();
  const expenseClaimStats = useExpenseClaimStats();

  // Create stats queries object
  const statsQueries = useMemo(
    () => ({
      project: projectStats,
      purchaseRequest: purchaseRequestStats,
      conceptNote: conceptNoteStats,
      paymentRequest: paymentRequestStats,
      advanceRequest: advanceRequestStats,
      travelRequest: travelRequestStats,
      expenseClaim: expenseClaimStats,
    }),
    [
      projectStats,
      purchaseRequestStats,
      conceptNoteStats,
      paymentRequestStats,
      advanceRequestStats,
      travelRequestStats,
      expenseClaimStats,
    ]
  );

  // Check for any errors
  const hasError = useMemo(
    () => Object.values(statsQueries).some(query => query.isError),
    [statsQueries]
  );

  // Memoize all stats data
  const statsData = useMemo<StatsData>(
    () => ({
      project: {
        totalProjects: projectStats?.data?.data.totalProjects || 0,
      },
      purchaseRequest: {
        totalRequests: purchaseRequestStats.data?.data.totalRequests || 0,
        totalApprovedRequests: purchaseRequestStats.data?.data.totalApprovedRequests || 0,
      },
      conceptNote: {
        totalRequests: conceptNoteStats.data?.data?.totalRequests || 0,
        totalApprovedRequests: conceptNoteStats.data?.data.totalApprovedRequests || 0,
      },
      paymentRequest: {
        totalRequests: paymentRequestStats.data?.data?.totalRequests || 0,
        totalApprovedRequests: paymentRequestStats.data?.data?.totalApprovedRequests || 0,
      },
      advanceRequest: {
        totalRequests: advanceRequestStats.data?.data?.totalRequests || 0,
        totalApprovedRequests: advanceRequestStats.data?.data?.totalApprovedRequests || 0,
      },
      travelRequest: {
        totalRequests: travelRequestStats.data?.data?.totalRequests || 0,
        totalApprovedRequests: travelRequestStats.data?.data?.totalApprovedRequests || 0,
      },
      expenseClaim: {
        totalRequests: expenseClaimStats.data?.data?.totalRequests || 0,
        totalApprovedRequests: expenseClaimStats.data?.data?.totalApprovedRequests || 0,
      },
    }),
    [
      projectStats.data,
      purchaseRequestStats.data,
      conceptNoteStats.data,
      paymentRequestStats.data,
      advanceRequestStats.data,
      travelRequestStats.data,
      expenseClaimStats.data,
    ]
  );

  // Prepare data for charts
  // Each item's `color` is pulled from statCardConfigs.chartColor, so chart
  // colors always stay in sync with the matching StatCard icon color.
  const chartData = useMemo(() => {
    const colorByKey = statCardConfigs.reduce<Record<string, string>>((acc, config) => {
      acc[config.key] = config.chartColor;
      return acc;
    }, {});

    const items = [
      {
        name: 'Projects',
        key: 'project',
        total: statsData.project.totalProjects,
        approved: 0,
        color: colorByKey.project,
      },
      {
        name: 'Purchase Req',
        key: 'purchaseRequest',
        total: statsData.purchaseRequest.totalRequests,
        approved: statsData.purchaseRequest.totalApprovedRequests,
        color: colorByKey.purchaseRequest,
      },
      {
        name: 'Concept Notes',
        key: 'conceptNote',
        total: statsData.conceptNote.totalRequests,
        approved: statsData.conceptNote.totalApprovedRequests,
        color: colorByKey.conceptNote,
      },
      {
        name: 'Payment Req',
        key: 'paymentRequest',
        total: statsData.paymentRequest.totalRequests,
        approved: statsData.paymentRequest.totalApprovedRequests,
        color: colorByKey.paymentRequest,
      },
      {
        name: 'Advance Req',
        key: 'advanceRequest',
        total: statsData.advanceRequest.totalRequests,
        approved: statsData.advanceRequest.totalApprovedRequests,
        color: colorByKey.advanceRequest,
      },
      {
        name: 'Travel Req',
        key: 'travelRequest',
        total: statsData.travelRequest.totalRequests,
        approved: statsData.travelRequest.totalApprovedRequests,
        color: colorByKey.travelRequest,
      },
      {
        name: 'Expense Claims',
        key: 'expenseClaim',
        total: statsData.expenseClaim.totalRequests,
        approved: statsData.expenseClaim.totalApprovedRequests,
        color: colorByKey.expenseClaim,
      },
    ];
    return items.filter(item => item.total > 0 || item.approved > 0);
  }, [statsData]);

  if (hasError) {
    return <NetworkErrorUI />;
  }

  return (
    <div className="flex flex-col space-y-3 sm:space-y-4 pb-80 px-1 sm:px-0">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky -top-8 z-10 bg-[#F8F8F8] pt-4 md:pt-6 pb-3 border-b border-gray-200/50"
      >
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-0.5">
          <TextHeader>Dashboard</TextHeader>
          <div className="text-xs sm:text-sm text-gray-500">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
        {statCardConfigs.map((config, index) => {
          const stats = statsData[config.key as keyof StatsData];
          const query = statsQueries[config.key as keyof typeof statsQueries];
          const isLoading = query?.isLoading || false;

          // Determine the correct values
          const total = 'totalProjects' in stats ? stats.totalProjects : stats.totalRequests;

          const approved =
            'totalApprovedRequests' in stats ? stats.totalApprovedRequests : undefined;

          return (
            <motion.div
              key={config.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <StatCard
                name={config.name}
                total={total || 0}
                approved={approved}
                icon={config.icon}
                color={config.color}
                bgColor={config.bgColor}
                borderColor={config.borderColor}
                to={config.to}
                hasApproved={config.hasApproved}
                isLoading={isLoading}
                onClick={() => navigate(config.to)}
              />
            </motion.div>
          );
        })}
      </div>

      {/* Charts Section */}
      {chartData.length > 0 && <DashboardCharts data={chartData} />}
    </div>
  );
}
