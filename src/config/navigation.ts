import {
  LayoutDashboard,
  FolderOpen,
  Users,
  Settings,
  ListChecks,
  UserCog,
  Receipt,
  FileText,
  ShoppingCart,
  DollarSign,
  CreditCard,
  Plane,
  User,
  Shield,
  Package,
  Truck,
  FileBarChart,
  CalendarDays,
  Briefcase,
  Award,
  // TrendingUp,MMM
} from 'lucide-react';
import { IUser } from '../interfaces';

export interface NavItem {
  to: string;
  label: string;
  icon: React.ElementType;
  dropdown?: { to: string; label: string; icon?: React.ElementType }[];
  permission?: (user: IUser) => boolean;
}

export interface StatCardConfig {
  name: string;
  key: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
  to: string;
  hasApproved?: boolean;
  // Hex equivalent of `color` (Tailwind class), used by DashboardCharts so
  // chart colors always stay in sync with the StatCard icon colors.
  chartColor: string;
}

export const navigationItems: NavItem[] = [
  {
    to: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    to: '/projects/all-projects',
    label: 'Projects',
    icon: FolderOpen,
    // dropdown: [
    //   { to: "/projects/all-projects", label: "All Projects", icon: FolderOpen },
    //   { to: "/projects/create-project", label: "Create Project", icon: Building2 },
    // ],
  },
  {
    to: '/concept-notes',
    label: 'Requests',
    icon: ListChecks,
    dropdown: [
      { to: '/advance-requests', label: 'Advance Requests', icon: CreditCard },
      { to: '/concept-notes', label: 'Concept Notes', icon: FileText },
      { to: '/expense-claims', label: 'Expense Claims', icon: Receipt },
      { to: '/payment-requests', label: 'Payment Requests', icon: DollarSign },
      { to: '/purchase-requests', label: 'Purchase Requests', icon: ShoppingCart },
      { to: '/travel-requests', label: 'Travel Requests', icon: Plane },
    ],
  },
  {
    to: "/reporting/all-reports",
    label: "Reporting",
    icon: FileBarChart,
    // dropdown: [
    //   { to: "/reporting/all-reports", label: "All Reports", icon: FileBarChart },
    //   { to: "/reporting/create-report", label: "Create Report", icon: TrendingUp },
    // ],
  },
  {
    to: '/procurement',
    label: 'Procurement',
    icon: Package,
    dropdown: [
      { to: '/procurement/vendor-management', label: 'Vendors', icon: Truck },
      { to: '/procurement/rfq', label: 'RFQ', icon: FileText },
      { to: '/procurement/purchase-order', label: 'Purchase Orders', icon: ShoppingCart },
      { to: '/procurement/goods-received', label: 'Goods Received', icon: Package }
    ],
    permission: user => user?.procurementRole?.canView === true,
  },
  {
    to: '/finance',
    label: 'Finance',
    icon: DollarSign,
    dropdown: [
      { to: '/finance/payment-voucher', label: 'Payment Vouchers', icon: CreditCard },
    ]
  },
  {
    to: '/human-resources',
    label: 'HR',
    icon: UserCog,
    dropdown: [
      { to: '/human-resources/staff-information', label: 'Staff Information', icon: User },
      { to: "/human-resources/leave", label: "Leave Management", icon: CalendarDays },
      { to: "/human-resources/staff-strategy", label: "Staff Strategy", icon: Briefcase },
      { to: "/human-resources/appraisals", label: "Appraisals", icon: Award },
    ],
  },
  {
    to: '/user-management/users',
    label: 'User Management',
    icon: Users,
    permission: user => user?.role === 'ADMIN' || user?.role === 'SUPER-ADMIN',
  },
  {
    to: '/user-management/change-password',
    label: 'Security',
    icon: Shield,
  },
  {
    to: '/admin',
    label: 'Admin Settings',
    icon: Settings,
    permission: user => user?.role === 'SUPER-ADMIN',
  },
];

export const statCardConfigs: StatCardConfig[] = [
  {
    name: 'Projects',
    key: 'project',
    icon: FolderOpen,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    chartColor: '#2563EB',
    to: '/projects',
    hasApproved: false,
  },
  {
    name: 'Purchase Requests',
    key: 'purchaseRequest',
    icon: ShoppingCart,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    chartColor: '#4F46E5',
    to: '/purchase-requests',
    hasApproved: true,
  },
  {
    name: 'Concept Notes',
    key: 'conceptNote',
    icon: FileText,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    chartColor: '#9333EA',
    to: '/concept-notes',
    hasApproved: true,
  },
  {
    name: 'Payment Requests',
    key: 'paymentRequest',
    icon: DollarSign,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    chartColor: '#059669',
    to: '/payment-requests',
    hasApproved: true,
  },
  {
    name: 'Advance Requests',
    key: 'advanceRequest',
    icon: CreditCard,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    chartColor: '#D97706',
    to: '/advance-requests',
    hasApproved: true,
  },
  {
    name: 'Travel Requests',
    key: 'travelRequest',
    icon: Plane,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-200',
    chartColor: '#0891B2',
    to: '/travel-requests',
    hasApproved: true,
  },
  {
    name: 'Expense Claims',
    key: 'expenseClaim',
    icon: Receipt,
    color: 'text-rose-600',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-200',
    chartColor: '#E11D48',
    to: '/expense-claims',
    hasApproved: true,
  },
];
