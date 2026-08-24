import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from 'recharts';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ChartData {
  name: string;
  total: number;
  approved: number;
  // Hex color matching this category's StatCard icon (from statCardConfigs.chartColor)
  color: string;
}

interface DashboardChartsProps {
  data: ChartData[];
}

// Fallback only — used if a legacy caller doesn't pass per-item colors yet.
const FALLBACK_COLOR = '#9CA3AF'; // gray-400

// Used only by the "Approval Trends" area chart below. That chart draws a
// single continuous shape spanning all categories, so — unlike the pie and
// bar charts — it can't carry a distinct color per category. It stays on a
// status color scheme (approved/pending) instead of the icon-matched colors.
const TREND_COLORS = {
  approved: '#22C55E', // green-500
  pending: '#F59E0B', // amber-500
};

// Approved bars are shown at full opacity in their category color; Pending
// bars use the *same* category color at reduced opacity. This keeps hue
// dedicated to "which request type" (matching the StatCard icons) while
// opacity still communicates "approved vs pending" status.
const APPROVED_OPACITY = 1;
const PENDING_OPACITY = 0.35;

export const DashboardCharts: React.FC<DashboardChartsProps> = ({ data }) => {
  const hasData = data && data.length > 0;

  // Prepare data for pie chart — each slice uses the same color as its
  // matching StatCard icon (item.color), so a user can visually link a
  // slice back to its stat card / icon at a glance.
  const pieData = hasData
    ? data.filter(item => item.name != 'Projects').map(item => ({
        name: item.name,
        value: item.total || 0,
        color: item.color || FALLBACK_COLOR,
      }))
    : [{ name: 'No Data', value: 1, color: '#e5e7eb' }];

  // Prepare data for approval rate chart — color carried through per row so
  // each category's bars/area can be tinted with its icon color.
  const approvalData = hasData
    ? data.filter(item => item.name != 'Projects').map(item => ({
        name: item.name,
        Approved: item.approved || 0,
        Pending: (item.total || 0) - (item.approved || 0),
        Total: item.total || 0,
        color: item.color || FALLBACK_COLOR,
      }))
    : [{ name: 'No Data', Approved: 0, Pending: 0, Total: 0, color: '#e5e7eb' }];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 mt-3 sm:mt-4">
      {/* Bar Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Request Distribution</CardTitle>
            <p className="text-xs text-gray-400 mt-0.5">
              Color = request type (matches icons above) · solid = approved, faded = pending
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-[240px] sm:h-[280px] overflow-x-auto overflow-y-hidden -mx-1 px-1">
              <div className="h-full min-w-[560px] sm:min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={approvalData} margin={{ left: -12 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 10 }}
                      tickLine={false}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                      interval={0}
                    />
                    <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={30} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      }}
                    />
                    <Bar dataKey="Approved" name="Approved" radius={[4, 4, 0, 0]} maxBarSize={40}>
                      {approvalData.map((entry, index) => (
                        <Cell
                          key={`approved-cell-${index}`}
                          fill={entry.color}
                          fillOpacity={APPROVED_OPACITY}
                        />
                      ))}
                    </Bar>
                    <Bar dataKey="Pending" name="Pending" radius={[4, 4, 0, 0]} maxBarSize={40}>
                      {approvalData.map((entry, index) => (
                        <Cell
                          key={`pending-cell-${index}`}
                          fill={entry.color}
                          fillOpacity={PENDING_OPACITY}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            {/* Category color key — ties bar colors back to each StatCard icon */}
            {hasData && (
              <div className="flex flex-wrap gap-x-3 sm:gap-x-4 gap-y-1.5 mt-3 pt-3 border-t border-gray-100">
                {data.map(item => (
                  <div key={item.name} className="flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: item.color || FALLBACK_COLOR }}
                    />
                    <span className="text-xs text-gray-500">{item.name}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Pie Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Request Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[240px] sm:h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ percent }) => `${(percent! * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Category color key — same colors/order as the bar chart above */}
            {hasData && (
              <div className="flex flex-wrap gap-x-3 sm:gap-x-4 gap-y-1.5 mt-3 pt-3 border-t border-gray-100">
                {data.map(item => (
                  <div key={item.name} className="flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: item.color || FALLBACK_COLOR }}
                    />
                    <span className="text-xs text-gray-500">{item.name}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Approval Rate Chart (Line Chart) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="lg:col-span-2"
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Approval Trends</CardTitle>
            <p className="text-xs text-gray-400 mt-0.5">
              Color = status (approved/pending), not request type
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-[180px] sm:h-[200px] overflow-x-auto overflow-y-hidden -mx-1 px-1">
              <div className="h-full min-w-[560px] sm:min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={approvalData} margin={{ left: -12 }}>
                    <defs>
                      <linearGradient id="colorApproved" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={TREND_COLORS.approved} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={TREND_COLORS.approved} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={TREND_COLORS.pending} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={TREND_COLORS.pending} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 10 }}
                      tickLine={false}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                      interval={0}
                    />
                    <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={30} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Area
                      type="monotone"
                      dataKey="Approved"
                      stroke={TREND_COLORS.approved}
                      fillOpacity={1}
                      fill="url(#colorApproved)"
                    />
                    <Area
                      type="monotone"
                      dataKey="Pending"
                      stroke={TREND_COLORS.pending}
                      fillOpacity={1}
                      fill="url(#colorPending)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
