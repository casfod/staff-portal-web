// config/tableConfigs.ts
import { TableHeaderConfig } from '../interfaces';

export const getDefaultTableHeaders = (): TableHeaderConfig[] => [
  { label: 'Request', showOnMobile: true, minWidth: '120px' },
  { label: 'Status', showOnMobile: true, minWidth: '100px' },
  { label: 'Amount', showOnMobile: true, minWidth: '100px' },
  { label: 'Date', showOnMobile: false, showOnTablet: true, minWidth: '100px' },
  { label: 'Actions', showOnMobile: true, minWidth: '100px' },
];

export const getProjectTableHeaders = (): TableHeaderConfig[] => [
  { label: 'Project Code', showOnMobile: true, minWidth: '120px' },
  { label: 'Status', showOnMobile: true, minWidth: '100px' },
  { label: 'Budget', showOnMobile: true, minWidth: '100px' },
  { label: 'Date', showOnMobile: false, showOnTablet: true, minWidth: '100px' },
  { label: 'Actions', showOnMobile: true, minWidth: '100px' },
];

export const getVendorTableHeaders = (): TableHeaderConfig[] => [
  { label: 'Business Name', showOnMobile: true, minWidth: '150px' },
  { label: 'Category', showOnMobile: true, minWidth: '100px' },
  { label: 'Status', showOnMobile: true, minWidth: '100px' },
  { label: 'Date', showOnMobile: false, showOnTablet: true, minWidth: '100px' },
  { label: 'Actions', showOnMobile: true, minWidth: '100px' },
];

export const getUserTableHeaders = (): TableHeaderConfig[] => [
  { label: 'Name', showOnMobile: true, minWidth: '150px' },
  { label: 'Role', showOnMobile: true, minWidth: '100px' },
  { label: 'Status', showOnMobile: true, minWidth: '100px' },
  { label: 'Date', showOnMobile: false, showOnTablet: true, minWidth: '100px' },
  { label: 'Actions', showOnMobile: true, minWidth: '100px' },
];

export const getReportTableHeaders = (): TableHeaderConfig[] => [
  { label: 'Report By', showOnMobile: true, minWidth: '160px' },
  { label: 'Type', showOnMobile: false, showOnTablet: true, minWidth: '140px' },
  { label: 'Status', showOnMobile: true, minWidth: '100px' },
  { label: 'Date', showOnMobile: false, showOnTablet: true, minWidth: '100px' },
  { label: 'Actions', showOnMobile: true, minWidth: '100px' },
];

// ✅ HR Table Headers
export const getAppraisalTableHeaders = (): TableHeaderConfig[] => [
  { label: 'Staff Name', showOnMobile: true, minWidth: '120px' },
  { label: 'Code', showOnMobile: false, showOnTablet: true, minWidth: '120px' },
  { label: 'Status', showOnMobile: true, minWidth: '100px' },
  { label: 'Date', showOnMobile: false, showOnTablet: true, minWidth: '100px' },
  { label: 'Actions', showOnMobile: true, minWidth: '100px' },
];

export const getLeaveTableHeaders = (): TableHeaderConfig[] => [
  { label: 'Staff Name', showOnMobile: true, minWidth: '120px' },
  { label: 'Leave Type', showOnMobile: true, minWidth: '150px' },
  { label: 'Status', showOnMobile: true, minWidth: '100px' },
  { label: 'Date', showOnMobile: false, showOnTablet: true, minWidth: '100px' },
  { label: 'Actions', showOnMobile: true, minWidth: '100px' },
];

export const getStaffStrategyTableHeaders = (): TableHeaderConfig[] => [
  { label: 'Staff Name', showOnMobile: true, minWidth: '120px' },
  { label: 'Code', showOnMobile: false, showOnTablet: true, minWidth: '120px' },
  { label: 'Status', showOnMobile: true, minWidth: '100px' },
  { label: 'Date', showOnMobile: false, showOnTablet: true, minWidth: '100px' },
  { label: 'Actions', showOnMobile: true, minWidth: '100px' },
];