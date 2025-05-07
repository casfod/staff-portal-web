// import { formatRelative, subDays } from "date-fns";
/**
 * Formats a date string or Date object into dd/mm/yyyy format
 * @param {string | Date | null} date - The date to be formatted
 * @returns {string} Formatted date in dd/mm/yyyy format, or empty string if input is null
 */
export const dateformat = (date: string | Date | null): string => {
  if (!date) return "";

  const dateObj = new Date(date);

  // Return empty string for invalid dates
  if (isNaN(dateObj.getTime())) return "";

  const day = String(dateObj.getDate()).padStart(2, "0");
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const year = dateObj.getFullYear();

  return `${day}/${month}/${year}`;
};
