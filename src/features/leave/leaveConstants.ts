// Leave Type Configuration (for reference)
export const LEAVE_TYPE_CONFIG = {
  'Annual leave': {
    maxDays: 24,
    description: '24 days',
    isCalendarDays: false,
  },
  'Compassionate leave': {
    maxDays: 10,
    description: '10 days Max',
    isCalendarDays: false,
  },
  'Sick leave': { maxDays: 12, description: '12 Days', isCalendarDays: false },
  'Maternity leave': {
    maxDays: 90,
    description: '90 Working days',
    isCalendarDays: false,
  },
  'Paternity leave': {
    maxDays: 14,
    description: '14 Calendar Days',
    isCalendarDays: true,
  },
  'Emergency leave': {
    maxDays: 5,
    description: '5 days',
    isCalendarDays: false,
  },
  'Study Leave': {
    maxDays: 10,
    description: '10 working day',
    isCalendarDays: false,
  },
  'Leave without pay': {
    maxDays: 365,
    description: 'Up to 1 year',
    isCalendarDays: true,
  },
} as const;
