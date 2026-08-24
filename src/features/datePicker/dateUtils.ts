// dateUtils.ts - Fixed for Cross-Platform Consistency
/**
 * Normalize a date to UTC midnight for consistent comparison
 */
export const normalizeToUTC = (date: Date | string): Date => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
};

/**
 * Format date in a readable format (cross-platform consistent)
 */
export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  // Use UTC to avoid timezone issues
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');

  // Format: DD/MM/YYYY
  return `${day}/${month}/${year}`;
};

/**
 * Get a formatted month and year string
 */
export const getMonthYearString = (date: Date): string => {
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  return `${monthNames[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
};

/**
 * Check if two dates are the same day (UTC-based)
 */
export const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getUTCFullYear() === date2.getUTCFullYear() &&
    date1.getUTCMonth() === date2.getUTCMonth() &&
    date1.getUTCDate() === date2.getUTCDate()
  );
};

/**
 * Check if a date is within the specified range
 */
export const isDateInRange = (date: Date, minDate?: Date, maxDate?: Date): boolean => {
  const d = normalizeToUTC(date);
  const min = minDate ? normalizeToUTC(minDate) : null;
  const max = maxDate ? normalizeToUTC(maxDate) : null;

  const isAfterMin = !min || d >= min;
  const isBeforeMax = !max || d <= max;
  return isAfterMin && isBeforeMax;
};

/**
 * Get an array of all dates to display in a month view
 */
export const getDaysInMonth = (month: Date): Date[] => {
  const year = month.getUTCFullYear();
  const monthIndex = month.getUTCMonth();

  // First day of the month (UTC)
  const firstDay = new Date(Date.UTC(year, monthIndex, 1));
  // Last day of the month (UTC)
  const lastDay = new Date(Date.UTC(year, monthIndex + 1, 0));

  const daysArray: Date[] = [];

  // Add days from previous month to fill the first week
  const firstWeekday = firstDay.getUTCDay(); // 0 = Sunday
  for (let i = firstWeekday; i > 0; i--) {
    const prevDate = new Date(Date.UTC(year, monthIndex, 1 - i));
    daysArray.push(prevDate);
  }

  // Add all days in the current month
  for (let i = 1; i <= lastDay.getUTCDate(); i++) {
    daysArray.push(new Date(Date.UTC(year, monthIndex, i)));
  }

  // Add days from next month to fill the last week
  const lastWeekday = lastDay.getUTCDay();
  const daysToAdd = 6 - lastWeekday;
  for (let i = 1; i <= daysToAdd; i++) {
    const nextDate = new Date(Date.UTC(year, monthIndex + 1, i));
    daysArray.push(nextDate);
  }

  // Ensure we have a full 6 weeks
  while (daysArray.length < 42) {
    const nextDate = new Date(daysArray[daysArray.length - 1]);
    nextDate.setUTCDate(nextDate.getUTCDate() + 1);
    daysArray.push(nextDate);
  }

  return daysArray;
};
