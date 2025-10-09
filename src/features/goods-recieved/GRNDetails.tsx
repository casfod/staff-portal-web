import { GoodsReceivedType, PurchaseOrderType } from "../../interfaces";
import { useParams } from "react-router-dom";
import DetailContainer from "../../ui/DetailContainer";
import {
  FileText,
  Calendar,
  Tag,
  Package,
  User,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { ReactElement } from "react";
import FileAttachmentContainer from "../../ui/FileAttachmentContainer";
import { GoPerson } from "react-icons/go";
import { formatToDDMMYYYY } from "../../utils/formatToDDMMYYYY";

interface GRNDetailsProps {
  grn: GoodsReceivedType;
}

interface GRNField {
  id: string;
  label: string;
  content: string | number | any;
  icon?: ReactElement;
  isBlock?: boolean;
  isArray?: boolean;
  isGRNItems?: boolean;
}

interface GRNSection {
  title: string;
  icon: ReactElement;
  fields: GRNField[];
}

export const GRNDetails = ({ grn }: GRNDetailsProps) => {
  const { grnId } = useParams();

  const purchaseOrder =
    typeof grn.purchaseOrder === "object" ? grn.purchaseOrder : null;

  const grnSections: GRNSection[] = [
    {
      title: "GRN Information",
      icon: <FileText className="w-4 h-4" />,
      fields: [
        {
          id: "GRDCode",
          label: "GRN Code",
          content: grn.GRDCode,
        },
        {
          id: "status",
          label: "Status",
          content: grn.isCompleted ? "COMPLETED" : "IN PROGRESS",
          icon: <Tag className="w-4 h-4" />,
        },
        {
          id: "purchaseOrder",
          label: "Purchase Order",
          content: purchaseOrder?.POCode || "N/A",
        },
        {
          id: "vendor",
          label: "Vendor",
          content: purchaseOrder?.selectedVendor?.businessName || "N/A",
        },
      ],
    },
    {
      title: "Receipt Summary",
      icon: <Package className="w-4 h-4" />,
      fields: [
        {
          id: "totalItems",
          label: "Total Items",
          content: grn.GRNitems.length,
        },
        {
          id: "fullyReceived",
          label: "Fully Received",
          content: grn.GRNitems.filter((item) => item.isFullyReceived).length,
        },
        {
          id: "pendingItems",
          label: "Pending Items",
          content: grn.GRNitems.filter((item) => !item.isFullyReceived).length,
        },
        {
          id: "completionStatus",
          label: "Completion Status",
          content: grn.isCompleted ? "Complete" : "In Progress",
          icon: grn.isCompleted ? (
            <CheckCircle className="w-4 h-4 text-green-600" />
          ) : (
            <XCircle className="w-4 h-4 text-yellow-600" />
          ),
        },
      ],
    },
    {
      title: "Items Received",
      icon: <Package className="w-4 h-4" />,
      fields: [
        {
          id: "GRNitems",
          label: "Received Items",
          content: grn.GRNitems,
          icon: <Package className="w-4 h-4" />,
          isGRNItems: true,
          isBlock: true,
        },
      ],
    },
    {
      title: "System Information",
      icon: <Calendar className="w-4 h-4" />,
      fields: [
        {
          id: "createdAt",
          label: "Created Date",
          content: formatToDDMMYYYY(grn.createdAt),
          icon: <Calendar className="w-4 h-4" />,
        },
        {
          id: "updatedAt",
          label: "Last Updated",
          content: formatToDDMMYYYY(grn.updatedAt),
          icon: <Calendar className="w-4 h-4" />,
        },
        {
          id: "createdBy",
          label: "Created By",
          content:
            typeof grn.createdBy === "object"
              ? `${grn.createdBy.first_name} ${grn.createdBy.last_name}`
              : "N/A",
          icon: <GoPerson className="w-4 h-4" />,
        },
      ],
    },
  ];

  const getItemName = (itemid: string): string => {
    if (!purchaseOrder) return "Unknown Item";

    const item = purchaseOrder.itemGroups.find(
      (poItem) => poItem._id === itemid
    );
    return item?.itemName || "Unknown Item";
  };

  return (
    <DetailContainer>
      <div
        className={`flex flex-col gap-6 w-full ${
          !grnId ? "text-sm" : "text-sm md:text-base"
        } break-words`}
      >
        {grnSections.map((section, sectionIndex) => (
          <div
            key={sectionIndex}
            className={`rounded-lg p-4 border ${
              section.title === "Receipt Summary"
                ? "bg-blue-50 border-slate-200"
                : "bg-gray-50 border-gray-200"
            }`}
          >
            {/* Section Header */}
            <div
              className={`flex items-center gap-2 mb-3 pb-2 border-b ${
                section.title === "Receipt Summary"
                  ? "border-slate-300"
                  : "border-gray-300"
              }`}
            >
              <div
                className={
                  section.title === "Receipt Summary"
                    ? "text-slate-600"
                    : "text-gray-600"
                }
              >
                {section.icon}
              </div>
              <h3
                className={`text-lg font-semibold ${
                  section.title === "Receipt Summary"
                    ? "text-slate-800"
                    : "text-gray-800"
                }`}
              >
                {section.title}
              </h3>
            </div>

            {/* Section Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {section.fields.map((field) => (
                <div
                  key={field.id}
                  className={`${field.isBlock ? "md:col-span-2" : ""} ${
                    section.title === "Receipt Summary"
                      ? "flex items-center gap-3"
                      : ""
                  }`}
                >
                  <div
                    className={`flex items-start gap-2 ${
                      section.title === "Receipt Summary" ? "w-full" : ""
                    }`}
                  >
                    {field.icon && (
                      <div
                        className={`mt-0.5 ${
                          section.title === "Receipt Summary"
                            ? "text-slate-700"
                            : "text-gray-500"
                        }`}
                      >
                        {field.icon}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <label
                        className={`block fon text-sm font-extrabold mb-1 uppercase tracking-wide ${
                          section.title === "Receipt Summary"
                            ? "text-slate-600"
                            : "text-gray-600"
                        }`}
                      >
                        {field.label}
                      </label>

                      {/* Special handling for GRN items */}
                      {field.isGRNItems ? (
                        <div className="space-y-3">
                          {(field.content as any[]).map((item, index) => (
                            <div
                              key={index}
                              className={`border rounded-lg p-3 bg-white shadow-sm ${
                                item.isFullyReceived
                                  ? "bg-green-50 border-green-200"
                                  : ""
                              }`}
                            >
                              <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
                                <div>
                                  <span className="font-semibold text-gray-600">
                                    Item Name:
                                  </span>
                                  <p className="mt-1">
                                    {getItemName(item.itemid)}
                                  </p>
                                </div>
                                <div>
                                  <span className="font-semibold text-gray-600">
                                    Ordered:
                                  </span>
                                  <p className="mt-1">{item.numberOrdered}</p>
                                </div>
                                <div>
                                  <span className="font-semibold text-gray-600">
                                    Received:
                                  </span>
                                  <p
                                    className={`mt-1 ${
                                      item.isFullyReceived
                                        ? "text-green-600 font-bold"
                                        : ""
                                    }`}
                                  >
                                    {item.numberReceived}
                                  </p>
                                </div>
                                <div>
                                  <span className="font-semibold text-gray-600">
                                    Difference:
                                  </span>
                                  <p
                                    className={`mt-1 ${
                                      item.difference === 0
                                        ? "text-green-600"
                                        : "text-yellow-600"
                                    }`}
                                  >
                                    {item.difference}
                                  </p>
                                </div>
                                <div>
                                  <span className="font-semibold text-gray-600">
                                    Status:
                                  </span>
                                  <p className="mt-1">
                                    <span
                                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        item.isFullyReceived
                                          ? "bg-green-100 text-green-800"
                                          : "bg-yellow-100 text-yellow-800"
                                      }`}
                                    >
                                      {item.isFullyReceived
                                        ? "Fully Received"
                                        : "Partial"}
                                    </span>
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}

                          {/* Summary */}
                          <div className="text-right pt-2 border-t">
                            <div className="grid grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="font-semibold">
                                  Total Ordered:{" "}
                                </span>
                                <span>
                                  {grn.GRNitems.reduce(
                                    (sum, item) => sum + item.numberOrdered,
                                    0
                                  )}
                                </span>
                              </div>
                              <div>
                                <span className="font-semibold">
                                  Total Received:{" "}
                                </span>
                                <span className="text-green-600">
                                  {grn.GRNitems.reduce(
                                    (sum, item) => sum + item.numberReceived,
                                    0
                                  )}
                                </span>
                              </div>
                              <div>
                                <span className="font-semibold">
                                  Total Balance:{" "}
                                </span>
                                <span className="text-yellow-600">
                                  {grn.GRNitems.reduce(
                                    (sum, item) => sum + item.difference,
                                    0
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div
                          className={`${
                            field.isBlock
                              ? "whitespace-pre-line bg-white p-3 rounded border"
                              : "break-words"
                          } ${
                            section.title === "Receipt Summary"
                              ? "text-slate-800 font-medium"
                              : "text-gray-800"
                          }`}
                        >
                          {String(field.content)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* File Attachments Section */}
      {grn.files && grn.files.length > 0 && (
        <FileAttachmentContainer files={grn.files} />
      )}
    </DetailContainer>
  );
};
