/**
 * Format date in a readable format
 */
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

/**
 * Get a formatted month and year string
 */
export const getMonthYearString = (date: Date): string => {
  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
};

/**
 * Check if two dates are the same day
 */
export const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
};

/**
 * Check if a date is within the specified range
 */
export const isDateInRange = (
  date: Date,
  minDate?: Date,
  maxDate?: Date
): boolean => {
  const isAfterMinDate =
    !minDate || date >= new Date(minDate.setHours(0, 0, 0, 0));
  const isBeforeMaxDate =
    !maxDate || date <= new Date(maxDate.setHours(23, 59, 59, 999));
  return isAfterMinDate && isBeforeMaxDate;
};

/**
 * Get an array of all dates to display in a month view
 */
export const getDaysInMonth = (month: Date): Date[] => {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();

  // First day of the month
  const firstDay = new Date(year, monthIndex, 1);
  // Last day of the month
  const lastDay = new Date(year, monthIndex + 1, 0);

  const daysArray: Date[] = [];

  // Add days from previous month to fill the first week
  const firstWeekday = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.
  for (let i = firstWeekday; i > 0; i--) {
    const prevDate = new Date(year, monthIndex, 1 - i);
    daysArray.push(prevDate);
  }

  // Add all days in the current month
  for (let i = 1; i <= lastDay.getDate(); i++) {
    daysArray.push(new Date(year, monthIndex, i));
  }

  // Add days from next month to fill the last week
  const lastWeekday = lastDay.getDay();
  const daysToAdd = 6 - lastWeekday;
  for (let i = 1; i <= daysToAdd; i++) {
    const nextDate = new Date(year, monthIndex + 1, i);
    daysArray.push(nextDate);
  }

  // Ensure we have a full 6 weeks of dates for consistent calendar size
  while (daysArray.length < 42) {
    const nextDate = new Date(daysArray[daysArray.length - 1]);
    nextDate.setDate(nextDate.getDate() + 1);
    daysArray.push(nextDate);
  }

  return daysArray;
};
