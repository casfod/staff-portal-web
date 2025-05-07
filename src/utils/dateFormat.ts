// import { formatRelative, subDays } from "date-fns";
/**
 * Formats a date string or Date object into dd/mm/yyyy format
 * @param {string | Date | null} date - The date to be formatted
 * @returns {string} Formatted date in dd/mm/yyyy format, or empty string if input is null
 */
export const dateformat = (date: string | Date | null): string => {
  if (!date) return "";

  const inputDate = new Date(date);

  // Return empty string for invalid dates
  if (isNaN(inputDate.getTime())) return "";

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const inputDateStart = new Date(inputDate);
  inputDateStart.setHours(0, 0, 0, 0);

  // Format time as HH:MM (24-hour format)
  // const hours = String(inputDate.getHours()).padStart(2, "0");
  // const minutes = String(inputDate.getMinutes()).padStart(2, "0");
  // const timeString = `${hours}:${minutes}`;

  // Format time as HH:MM AM/PM (12-hour format)
  const hours = inputDate.getHours();
  const minutes = String(inputDate.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  const twelveHour = hours % 12 || 12; // Convert 0 to 12 for 12AM
  const timeString = `${twelveHour}:${minutes} ${ampm}`;

  if (inputDateStart.getTime() === today.getTime()) {
    return `TODAY, ${timeString}`;
  }

  if (inputDateStart.getTime() === yesterday.getTime()) {
    return `YESTERDAY, ${timeString}`;
  }

  if (inputDateStart.getTime() === today.getTime()) {
    return `TODAY, ${timeString}`;
  }

  if (inputDateStart.getTime() === yesterday.getTime()) {
    return `YESTERDAY, ${timeString}`;
  }

  // Format as dd/mm/yyyy for older dates (no timestamp)
  const day = String(inputDate.getDate()).padStart(2, "0");
  const month = String(inputDate.getMonth() + 1).padStart(2, "0");
  const year = inputDate.getFullYear();

  return `${day}/${month}/${year}`; // No time included for older dates
};
// export const dateformat = (date: string | Date | null): string => {
//   if (!date) return "";

//   const dateObj = new Date(date);

//   // Return empty string for invalid dates
//   if (isNaN(dateObj.getTime())) return "";

//   const day = String(dateObj.getDate()).padStart(2, "0");
//   const month = String(dateObj.getMonth() + 1).padStart(2, "0");
//   const year = dateObj.getFullYear();

//   return `${day}/${month}/${year}`;
// };
