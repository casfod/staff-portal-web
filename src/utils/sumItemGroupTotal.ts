// sumItemGroupTotal.ts - Centralized helper for summing itemGroup/expense line totals.
// Falls back to frequency * quantity * unitCost when a line's `total` wasn't
// pre-computed by the API.

interface ILineItem {
  total?: number;
  frequency?: number;
  quantity?: number;
  unitCost?: number;
}

export const sumItemGroupTotal = (items?: ILineItem[]): number => {
  if (!items || items.length === 0) return 0;

  return items.reduce((sum, item) => {
    const lineTotal =
      item.total ?? (item.frequency ?? 1) * (item.quantity ?? 0) * (item.unitCost ?? 0);
    return sum + lineTotal;
  }, 0);
};
