// RequestItemsTable.tsx
import ItemsTable from "./ItemsTable";
import MobileItemsTable from "./MobileItemsTable";
import {
  // PurchaseRequesItemGroupType,
  // AdvanceRequesItemGroupType,
  // TravelRequestItemGroup,
  // ExpenseClaimItemGroup,
  ItemGroupType,
} from "../interfaces";

interface RequestItemsTableProps {
  items: ItemGroupType[];
  type?: "purchase" | "advance" | "travel" | "expense";
}

const RequestItemsTable = ({ items }: RequestItemsTableProps) => {
  if (!items || items.length === 0) {
    return <div className="text-center py-8 text-gray-500">No items found</div>;
  }

  return (
    <>
      {/* Desktop Table - hidden on mobile */}
      <div className="hidden md:block">
        <ItemsTable itemGroups={items} />
      </div>

      {/* Mobile Cards - shown only on mobile */}
      <div className="md:hidden">
        <MobileItemsTable itemGroups={items} />
      </div>
    </>
  );
};

export default RequestItemsTable;
