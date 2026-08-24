// StatCard.tsx - Rewritten with Radix UI
import React from 'react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';
import { ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface StatCardProps {
  name: string;
  total: number | string | React.ReactNode;
  approved?: number | string | React.ReactNode;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
  to: string;
  hasApproved?: boolean;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  isLoading?: boolean;
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({
  name,
  total,
  approved,
  icon: Icon,
  color,
  bgColor,
  hasApproved = true,
  trend,
  isLoading = false,
  onClick,
}) => {
  const progressPercentage =
    typeof total === 'number' && typeof approved === 'number' && total > 0
      ? Math.min((approved / total) * 100, 100)
      : 0;

  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="cursor-pointer h-full"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      <Card className="h-full hover:shadow-lg transition-all duration-300 border border-gray-100/50 overflow-hidden group">
        <CardHeader className="flex flex-row items-center justify-between p-4 pb-0">
          <div className={cn('p-2.5 rounded-xl', bgColor)}>
            <Icon className={cn('w-5 h-5', color)} />
          </div>
          <span className="text-xs font-medium text-gray-500 group-hover:text-gray-600 transition-colors">
            View All
            <ArrowRight className="inline-block w-3.5 h-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </CardHeader>

        <CardContent className="p-4 pt-3">
          <CardTitle className="text-sm font-medium text-gray-600 mb-1">{name}</CardTitle>

          <div className="flex items-end justify-between">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-gray-900">
                  {isLoading ? (
                    <div className="w-12 h-8 bg-gray-200 rounded animate-pulse" />
                  ) : (
                    total
                  )}
                </span>
                {trend && (
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-xs font-medium',
                      trend.isPositive
                        ? 'text-green-600 border-green-200'
                        : 'text-red-600 border-red-200'
                    )}
                  >
                    {trend.isPositive ? (
                      <TrendingUp className="w-3 h-3 mr-0.5" />
                    ) : (
                      <TrendingDown className="w-3 h-3 mr-0.5" />
                    )}
                    {trend.value}%
                  </Badge>
                )}
              </div>
              {hasApproved && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-600">Approved:</span>
                  <span className="text-sm font-semibold text-green-600">
                    {isLoading ? (
                      <div className="w-8 h-4 bg-gray-200 rounded animate-pulse" />
                    ) : (
                      approved || 0
                    )}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Progress bar */}
          {hasApproved &&
            typeof total === 'number' &&
            typeof approved === 'number' &&
            total > 0 && (
              <div className="mt-4">
                <Progress value={progressPercentage} className="bg-[#F59E0B] h-1.5" />
              </div>
            )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default StatCard;
