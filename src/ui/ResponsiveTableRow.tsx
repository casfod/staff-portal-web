// src/ui/ResponsiveTableRow.tsx
import TableRowMain from "./TableRowMain";
import TableData from "./TableData";
import MobileCardView from "./MobileCardView";
import { ReactNode } from "react";

interface TableHeaderConfig {
  label: string;
  showOnMobile: boolean;
  showOnTablet?: boolean;
  minWidth: string;
}

interface ResponsiveTableRowProps {
  request: {
    id?: string;
    status?: string;
    requestedBy?: string;
    [key: string]: any;
  };
  requestId: string;
  toggleViewItems?: (id: string) => void;
  rowData: Array<{
    id: string;
    content: ReactNode;
    showOnMobile?: boolean;
    showOnTablet?: boolean;
  }>;
  mobileCardProps: {
    totalAmount: number;
    identifier?: string;
    dateField?: string;
    dateValue?: string | Date;
    showDate?: boolean;
    additionalInfo?: ReactNode;
    actionIconsProps: any;
    variant?:
      | "advance"
      | "purchase"
      | "travel"
      | "concept"
      | "payment"
      | "expense";
  };
  children?: ReactNode;
}

const ResponsiveTableRow = ({
  request,
  requestId,
  toggleViewItems,
  rowData,
  mobileCardProps,
  children,
}: ResponsiveTableRowProps) => {
  const handleToggle = toggleViewItems || (() => {});

  return (
    <>
      {/* Desktop/Tablet View */}
      <TableRowMain
        key={requestId}
        requestId={requestId}
        toggleViewItems={handleToggle}
        className="hidden sm:table-row"
      >
        {rowData.map(({ id, content, showOnMobile = true, showOnTablet }) => (
          <TableData
            key={`${requestId}-${id}`}
            className={`
              ${!showOnMobile ? "hidden md:table-cell" : ""}
              ${showOnTablet ? "hidden sm:table-cell md:table-cell" : ""}
              px-3 py-2.5 md:px-4 md:py-3
            `}
          >
            {content}
          </TableData>
        ))}
      </TableRowMain>

      {/* Mobile View */}
      <MobileCardView
        request={request}
        requestId={requestId}
        {...mobileCardProps}
      />

      {children}
    </>
  );
};

export default ResponsiveTableRow;
