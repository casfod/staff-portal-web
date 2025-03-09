export const moneyFormat = (
  amount: number,
  currency: string = "USD"
): string => {
  if (currency === "NGN") {
    // Manually format for Naira
    return `₦${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
  }

  // Use Intl.NumberFormat for other currencies
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};
