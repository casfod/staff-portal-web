// src/ui/LeaveBalanceCard.tsx
import { LeaveBalanceType } from "../interfaces";
import SpinnerMini from "./SpinnerMini";

interface LeaveBalanceCardProps {
  leaveBalance: LeaveBalanceType | undefined;
  isLoading?: boolean;
  showAllTypes?: boolean;
  compact?: boolean;
  className?: string;
  onBalanceClick?: (leaveType: string) => void;
  warningThreshold?: number; // Show warning when balance is low (default 20%)
}

const LeaveBalanceCard = ({
  leaveBalance,
  isLoading = false,
  showAllTypes = false,
  compact = false,
  className = "",
  onBalanceClick,
  warningThreshold = 0.2, // 20% of max days remaining
}: LeaveBalanceCardProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <SpinnerMini />
      </div>
    );
  }

  if (!leaveBalance) return null;

  const getBalanceStatus = (balance: number, maxDays: number) => {
    const remainingPercentage = balance / maxDays;
    if (balance === 0) return "exhausted";
    if (remainingPercentage <= warningThreshold) return "low";
    return "available";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "exhausted":
        return "bg-red-100 text-red-800 border-red-200";
      case "low":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-green-100 text-green-800 border-green-200";
    }
  };

  const balanceItems = [
    {
      key: "annualLeave",
      label: "Annual Leave",
      data: leaveBalance.annualLeave,
      icon: "🌴",
    },
    {
      key: "sickLeave",
      label: "Sick Leave",
      data: leaveBalance.sickLeave,
      icon: "🤒",
    },
    {
      key: "compassionateLeave",
      label: "Compassionate Leave",
      data: leaveBalance.compassionateLeave,
      icon: "❤️",
    },
    {
      key: "emergencyLeave",
      label: "Emergency Leave",
      data: leaveBalance.emergencyLeave,
      icon: "🚨",
    },
    {
      key: "maternityLeave",
      label: "Maternity Leave",
      data: leaveBalance.maternityLeave,
      icon: "👶",
    },
    {
      key: "paternityLeave",
      label: "Paternity Leave",
      data: leaveBalance.paternityLeave,
      icon: "👨‍👧",
    },
    {
      key: "studyLeave",
      label: "Study Leave",
      data: leaveBalance.studyLeave,
      icon: "📚",
    },
    {
      key: "leaveWithoutPay",
      label: "Leave Without Pay",
      data: leaveBalance.leaveWithoutPay,
      icon: "💰",
    },
  ];

  const displayedItems = showAllTypes ? balanceItems : balanceItems.slice(0, 4);

  if (compact) {
    return (
      <div
        className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}
      >
        <div className="p-3 border-b border-gray-100">
          <h3 className="font-semibold text-gray-700 flex items-center gap-2">
            <span className="text-lg">📊</span>
            <span>Your Leave Balance</span>
          </h3>
        </div>
        <div className="p-3">
          <div className="grid grid-cols-2 gap-2">
            {displayedItems.map((item) => {
              const status = getBalanceStatus(
                item.data.balance,
                item.data.maxDays
              );
              return (
                <div
                  key={item.key}
                  onClick={() => onBalanceClick?.(item.label)}
                  className={`p-2 rounded-lg border cursor-pointer transition hover:shadow-md ${getStatusColor(
                    status
                  )}`}
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
              className="text-xs text-blue-600 mt-2 hover:text-blue-800 transition"
              onClick={() => {}} // Add expand functionality if needed
            >
              +{balanceItems.length - 4} more leave types
            </button>
          )}
        </div>
      </div>
    );
  }

  // Full detailed view
  return (
    <div
      className={`bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200 shadow-sm ${className}`}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-blue-800 flex items-center gap-2">
          {/* <span className="text-xl">📋</span> */}
          <span>Your Leave Balance Summary</span>
        </h3>
        <span className="text-xs text-blue-600 bg-blue-200 px-2 py-1 rounded-full">
          Year {leaveBalance.annualLeave.year}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {balanceItems.map((item) => {
          const status = getBalanceStatus(item.data.balance, item.data.maxDays);
          const used = item.data.accrued + item.data.totalApplied;
          const usagePercentage = (used / item.data.maxDays) * 100;

          return (
            <div
              key={item.key}
              className={`bg-white rounded-lg p-3 border-l-4 transition hover:shadow-md cursor-pointer
                ${
                  status === "exhausted"
                    ? "border-l-red-500"
                    : status === "low"
                    ? "border-l-yellow-500"
                    : "border-l-[#08527A]/80"
                }`}
              onClick={() => onBalanceClick?.(item.label)}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  {/* <span className="text-lg">{item.icon}</span> */}
                  <div>
                    <p className="text-xs font-medium text-gray-600">
                      {item.label}
                    </p>
                    <p className="text-lg font-bold">
                      {item.data.balance}
                      <span className="text-xs font-normal text-gray-500 ml-1">
                        /{item.data.maxDays}
                      </span>
                    </p>
                  </div>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium
                  ${
                    status === "exhausted"
                      ? "bg-red-100 text-red-700"
                      : status === "low"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {status === "exhausted"
                    ? "Exhausted"
                    : status === "low"
                    ? "Low"
                    : `${item.data.balance} left`}
                </span>
              </div>

              {/* Progress bar */}
              <div className="mt-2">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Used: {used} days</span>
                  <span>{usagePercentage.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full ${
                      usagePercentage >= 100
                        ? "bg-red-500"
                        : usagePercentage >= 80
                        ? "bg-yellow-500"
                        : "bg-green-500"
                    }`}
                    style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Breakdown */}
              <div className="mt-2 grid grid-cols-2 gap-1 text-xs">
                <div>
                  <span className="text-gray-500">Pending:</span>{" "}
                  <span className="font-medium">{item.data.totalApplied}</span>
                </div>
                <div>
                  <span className="text-gray-500">Approved:</span>{" "}
                  <span className="font-medium">{item.data.accrued}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Footer */}
      {/* <div className="mt-4 pt-3 border-t border-blue-200 flex justify-between text-sm text-blue-700">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span>Available</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
            <span>Low ({warningThreshold * 100}% remaining)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
            <span>Exhausted</span>
          </div>
        </div>
        <span className="font-medium">
          Total Balance:{" "}
          {Object.values(leaveBalance).reduce((acc, item) => {
            if (typeof item === "object" && item?.balance) {
              return acc + item.balance;
            }
            return acc;
          }, 0)}{" "}
          days
        </span>
      </div> */}
    </div>
  );
};

export default LeaveBalanceCard;
