import { formatRelative, subDays } from "date-fns";

export const dateformat = (date: string | Date | null) => {
  const reviewDate = new Date(date!);
  const daysToSubtract = 0; // Specify the number of days to subtract
  const relativeDate = formatRelative(
    subDays(reviewDate, daysToSubtract),
    new Date()
  );

  return relativeDate;
};
