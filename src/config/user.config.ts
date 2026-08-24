// Centralized user-related configuration
export const USER_ROLES = [
  { value: 'ADMIN', label: 'Admin' },
  { value: 'REVIEWER', label: 'Reviewer' },
  { value: 'STAFF', label: 'Staff' },
] as const;

export const USER_POSITIONS = [
  'Executive Director',
  'Head of Program and Grant',
  'Supply Chain Coordinator',
  'Partnership and Reporting Coordinator',
  'Project Coordinator',
  'Education Officer',
  'Protection Officer',
  'MEAL Senior Officer',
  'MHPSS Officer',
  'Protection Coordinator',
  'Education Coordinator',
  'Nutrition Coordinator',
  'Livelihood Lead',
  'Gender and Disability Inclusion Lead',
  'Finance Officer',
  'State Head of Operation',
  'Procurement Officer',
  'Logistic and Fleet Management Officer',
  'Human Resource Coordinator',
  'Education Assistant',
  'Nutrition Manager',
  'Nutrition Assistant',
  'CMAM Provider',
  'CMAM Screener',
  'MICYN Screener',
  'CFM Officer',
  'AAP/CFM Facilitator',
  'Data Clerk',
  'GBV Case Worker',
  'GVB Case Worker',
  'MHPSS Councillor',
  'Communication Officer',
  'Safety and Security Adviser',
  'Communication Intern',
  'IT Associate',
  'Store Keeper',
  'Supply Chain Intern',
  'Finance and Admin Associate',
  'Driver',
  'Cleaner',
  'Media Officer',
  'Protection Assistant',
  'Education Associate',
  'Media Associate',
  'Protection Intern',
  'Education Volunteer',
  'Program Intern',
  'Logistic Assistant',
  'WASH Associate',
  'Media Intern',
  'MHPSS Intern',
  'Health Intern',
  'Finance Assistant',
] as const;

export const PERMISSION_CONFIG = {
  procurement: [
    { key: 'canView', label: 'View', description: 'Can view procurement data' },
    { key: 'canCreate', label: 'Create', description: 'Can create new procurement' },
    { key: 'canUpdate', label: 'Update', description: 'Can update procurement' },
    { key: 'canDelete', label: 'Delete', description: 'Can delete procurement' },
  ],
  finance: [
    { key: 'canView', label: 'View', description: 'Can view finance data' },
    { key: 'canCreate', label: 'Create', description: 'Can create new finance records' },
    { key: 'canUpdate', label: 'Update', description: 'Can update finance records' },
    { key: 'canDelete', label: 'Delete', description: 'Can delete finance records' },
  ],
} as const;

export const USER_TABLE_HEADERS = [
  { label: 'Name', showOnMobile: true, minWidth: '120px' },
  { label: 'Email', showOnMobile: true, minWidth: '100px' },
  { label: 'Role', showOnMobile: true, minWidth: '100px' },
  { label: 'Status', showOnMobile: false, showOnTablet: true, minWidth: '100px' },
  { label: 'Actions', showOnMobile: true, minWidth: '100px' },
] as const;

export type UserRole = (typeof USER_ROLES)[number]['value'];
export type UserPosition = (typeof USER_POSITIONS)[number];
