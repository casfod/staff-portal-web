// src/utils/requestConfig.ts
export const requestTypes = {
  advance: {
    name: "Advance Request",
    prefix: "AR",
    path: "/advance-requests",
    mobileLabel: "Request",
  },
  purchase: {
    name: "Purchase Request",
    prefix: "PR",
    path: "/purchase-requests",
    mobileLabel: "Request",
  },
  travel: {
    name: "Travel Request",
    prefix: "TR",
    path: "/travel-requests",
    mobileLabel: "Travel",
  },
  concept: {
    name: "Concept Note",
    prefix: "CN",
    path: "/concept-notes",
    mobileLabel: "Concept",
  },
  payment: {
    name: "Payment Request",
    prefix: "PAY",
    path: "/payment-requests",
    mobileLabel: "Payment",
  },
  expense: {
    name: "Expense Claim",
    prefix: "EC",
    path: "/expense-claims",
    mobileLabel: "Expense",
  },
};

export const getRequestConfig = (type: keyof typeof requestTypes) => {
  return requestTypes[type] || requestTypes.advance;
};
