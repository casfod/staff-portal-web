// LeaveBalanceCard.tsx - Rewritten with Radix UI
import { ILeaveBalance } from '../../interfaces';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader2 } from 'lucide-react';

interface LeaveBalanceCardProps {
  leaveBalance: ILeaveBalance | undefined;
  isLoading?: boolean;
  showAllTypes?: boolean;
  compact?: boolean;
  className?: string;
  onBalanceClick?: (ILeave: string) => void;
  warningThreshold?: number;
}

const LeaveBalanceCard = ({
  leaveBalance,
  isLoading = false,
  showAllTypes = false,
  compact = false,
  className = '',
  onBalanceClick,
  warningThreshold = 0.2,
}: LeaveBalanceCardProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }

  if (!leaveBalance) return null;

  const getBalanceStatus = (balance: number, maxDays: number) => {
    const remainingPercentage = balance / maxDays;
    if (balance === 0) return 'exhausted';
    if (remainingPercentage <= warningThreshold) return 'low';
    return 'available';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'exhausted':
        return 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200';
      case 'low':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200';
      default:
        return 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200';
    }
  };

  // const getProgressColor = (percentage: number) => {
  //   if (percentage >= 100) return "bg-red-500";
  //   if (percentage >= 80) return "bg-yellow-500";
  //   return "bg-green-500";
  // };

  const balanceItems = [
    { key: 'annualLeave', label: 'Annual Leave', data: leaveBalance.annualLeave, icon: '🌴' },
    { key: 'sickLeave', label: 'Sick Leave', data: leaveBalance.sickLeave, icon: '🤒' },
    {
      key: 'compassionateLeave',
      label: 'Compassionate Leave',
      data: leaveBalance.compassionateLeave,
      icon: '❤️',
    },
    {
      key: 'emergencyLeave',
      label: 'Emergency Leave',
      data: leaveBalance.emergencyLeave,
      icon: '🚨',
    },
    {
      key: 'maternityLeave',
      label: 'Maternity Leave',
      data: leaveBalance.maternityLeave,
      icon: '👶',
    },
    {
      key: 'paternityLeave',
      label: 'Paternity Leave',
      data: leaveBalance.paternityLeave,
      icon: '👨‍👧',
    },
    { key: 'studyLeave', label: 'Study Leave', data: leaveBalance.studyLeave, icon: '📚' },
    {
      key: 'leaveWithoutPay',
      label: 'Leave Without Pay',
      data: leaveBalance.leaveWithoutPay,
      icon: '💰',
    },
  ];

  const displayedItems = showAllTypes ? balanceItems : balanceItems.slice(0, 4);

  if (compact) {
    return (
      <Card className={className}>
        <CardHeader className="p-4 border-b">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <span className="text-lg">📊</span>
            <span>Your Leave Balance</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-2">
            {displayedItems.map(item => {
              const status = getBalanceStatus(item.data.balance, item.data.maxDays);
              return (
                <div
                  key={item.key}
                  onClick={() => onBalanceClick?.(item.label)}
                  className={`p-2 rounded-lg border cursor-pointer transition-all hover:shadow-md ${getStatusColor(status)}`}
                >
                  <div className="flex items-center gap-1 text-xs font-medium">
                    <span>{item.icon}</span>
                    <span className="truncate">{item.label}</span>
                  </div>
                  <div className="text-sm font-bold mt-1">
                    {item.data.balance}/{item.data.maxDays}
                    <span className="text-xs font-normal ml-1">days</span>
                  </div>
                </div>
              );
            })}
          </div>
          {!showAllTypes && balanceItems.length > 4 && (
            <button
              className="text-xs text-gray-600 mt-2 hover:text-gray-900 transition"
              onClick={() => {}}
            >
              +{balanceItems.length - 4} more leave types
            </button>
          )}
        </CardContent>
      </Card>
    );
  }

  // Full detailed view
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <span>Your Leave Balance Summary</span>
        </h3>
        <Badge variant="secondary" className="text-xs">
          Year {leaveBalance.annualLeave.year}
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {balanceItems.map(item => {
          const status = getBalanceStatus(item.data.balance, item.data.maxDays);
          const used = item.data.accrued + item.data.totalApplied;
          const usagePercentage = Math.min((used / item.data.maxDays) * 100, 100);

          return (
            <Card
              key={item.key}
              className={`cursor-pointer transition-all hover:shadow-md border-l-4 ${
                status === 'exhausted'
                  ? 'border-l-red-500'
                  : status === 'low'
                    ? 'border-l-yellow-500'
                    : 'border-l-brand-600'
              }`}
              onClick={() => onBalanceClick?.(item.label)}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <div>
                      <p className="text-xs font-medium text-gray-600">{item.label}</p>
                      <p className="text-lg font-bold">
                        {item.data.balance}
                        <span className="text-xs font-normal text-gray-500 ml-1">
                          /{item.data.maxDays}
                        </span>
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className={`text-xs ${getStatusColor(status)}`}>
                    {status === 'exhausted'
                      ? 'Exhausted'
                      : status === 'low'
                        ? 'Low'
                        : `${item.data.balance} left`}
                  </Badge>
                </div>

                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Used: {used} days</span>
                    <span>{usagePercentage.toFixed(0)}%</span>
                  </div>
                  <Progress value={usagePercentage} className="h-2" />
                </div>

                <div className="mt-3 grid grid-cols-2 gap-1 text-xs">
                  <div>
                    <span className="text-gray-500">Pending:</span>{' '}
                    <span className="font-medium">{item.data.totalApplied}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Approved:</span>{' '}
                    <span className="font-medium">{item.data.accrued}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default LeaveBalanceCard;
