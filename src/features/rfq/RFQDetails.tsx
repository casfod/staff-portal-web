import { RFQItemGroupType, RFQType, VendorType } from "../../interfaces";
import { useParams } from "react-router-dom";
import { dateformat } from "../../utils/dateFormat";
import DetailContainer from "../../ui/DetailContainer";
import { FileText, Calendar, Tag, Users, Clock, Package } from "lucide-react";
import { ReactElement } from "react";
import FileAttachmentContainer from "../../ui/FileAttachmentContainer";

interface RFQDetailsProps {
  rfq: RFQType;
}

interface RFQField {
  id: string;
  label: string;
  content: string | number | RFQItemGroupType | any[];
  icon?: ReactElement;
  isBlock?: boolean;
  isArray?: boolean;
  isItemGroups?: boolean;
}

interface RFQSection {
  title: string;
  icon: ReactElement;
  fields: RFQField[];
}

export const RFQDetails = ({ rfq }: RFQDetailsProps) => {
  const { rfqId } = useParams();

  // Calculate totals
  const totalAmount = rfq.itemGroups.reduce((sum, item) => sum + item.total, 0);
  // const totalItems = rfq.itemGroups.reduce(
  //   (sum, item) => sum + item.quantity,
  //   0
  // );

  const rfqSections: RFQSection[] = [
    {
      title: "RFQ Information",
      icon: <FileText className="w-4 h-4" />,
      fields: [
        {
          id: "RFQTitle",
          label: "RFQ Title",
          content: rfq.RFQTitle,
        },
        {
          id: "RFQCode",
          label: "RFQ Code",
          content: rfq.RFQCode,
        },
        {
          id: "status",
          label: "Status",
          content: rfq.status.toUpperCase(),
          icon: <Tag className="w-4 h-4" />,
        },
        {
          id: "totalAmount",
          label: "Total Amount",
          content: `₦${totalAmount.toLocaleString()}`,
          // icon: <DollarSign className="w-4 h-4" />,
        },
        {
          id: "casfodAddressId",
          label: "Casfod Address",
          content: rfq.casfodAddressId.toUpperCase(),
        },
      ],
    },
    {
      title: "Timeline & Validity",
      icon: <Clock className="w-4 h-4" />,
      fields: [
        {
          id: "rfqDate",
          label: "RFQ Date",
          content: dateformat(rfq.rfqDate) || "N/A",
        },
        {
          id: "deadlineDate",
          label: "Deadline Date",
          content: dateformat(rfq.deadlineDate) || "N/A",
        },
      ],
    },
    {
      title: "Items & Specifications",
      icon: <Package className="w-4 h-4" />,
      fields: [
        {
          id: "itemGroups",
          label: "Items",
          content: rfq.itemGroups,
          icon: <Package className="w-4 h-4" />,
          isItemGroups: true,
          isBlock: true,
        },
      ],
    },
    {
      title: "Vendor Distribution",
      icon: <Users className="w-4 h-4" />,
      fields: [
        {
          id: "copiedTo",
          label: "Vendors",
          content: Array.isArray(rfq.copiedTo) ? rfq.copiedTo : [],
          icon: <Users className="w-4 h-4" />,
          isArray: true,
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
          content: dateformat(rfq.createdAt),
          icon: <Calendar className="w-4 h-4" />,
        },
        {
          id: "updatedAt",
          label: "Last Updated",
          content: dateformat(rfq.updatedAt),
          icon: <Calendar className="w-4 h-4" />,
        },
      ],
    },
  ];

  return (
    <DetailContainer>
      <div
        className={`flex flex-col gap-6 w-full ${
          !rfqId ? "text-sm" : "text-sm md:text-base"
        } break-words`}
      >
        {rfqSections.map((section, sectionIndex) => (
          <div
            key={sectionIndex}
            className={`rounded-lg p-4 border ${
              section.title === "Timeline & Validity" ||
              section.title === "Vendor Distribution"
                ? "bg-blue-50 border-slate-200"
                : "bg-gray-50 border-gray-200"
            }`}
          >
            {/* Section Header */}
            <div
              className={`flex items-center gap-2 mb-3 pb-2 border-b ${
                section.title === "Timeline & Validity" ||
                section.title === "Vendor Distribution"
                  ? "border-slate-300"
                  : "border-gray-300"
              }`}
            >
              <div
                className={
                  section.title === "Timeline & Validity" ||
                  section.title === "Vendor Distribution"
                    ? "text-slate-600"
                    : "text-gray-600"
                }
              >
                {section.icon}
              </div>
              <h3
                className={`text-lg font-semibold ${
                  section.title === "Timeline & Validity" ||
                  section.title === "Vendor Distribution"
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
                    section.title === "Timeline & Validity" ||
                    section.title === "Vendor Distribution"
                      ? "flex items-center gap-3"
                      : ""
                  }`}
                >
                  <div
                    className={`flex items-start gap-2 ${
                      section.title === "Timeline & Validity" ||
                      section.title === "Vendor Distribution"
                        ? "w-full"
                        : ""
                    }`}
                  >
                    {field.icon && (
                      <div
                        className={`mt-0.5 ${
                          section.title === "Timeline & Validity" ||
                          section.title === "Vendor Distribution"
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
                          section.title === "Timeline & Validity" ||
                          section.title === "Vendor Distribution"
                            ? "text-slate-600"
                            : "text-gray-600"
                        }`}
                      >
                        {field.label}
                      </label>

                      {/* Special handling for item groups */}
                      {field.isItemGroups ? (
                        <div className="space-y-3">
                          {(field.content as RFQItemGroupType[]).map(
                            (item, index) => (
                              <div
                                key={index}
                                className="border rounded-lg p-3 bg-white shadow-sm"
                              >
                                <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
                                  <div>
                                    <span className="font-semibold text-gray-600">
                                      Item Name:
                                    </span>
                                    <p className="mt-1">{item.itemName}</p>
                                  </div>
                                  <div>
                                    <span className="font-semibold text-gray-600">
                                      Frequency:
                                    </span>
                                    <p className="mt-1">{item.frequency}</p>
                                  </div>
                                  <div>
                                    <span className="font-semibold text-gray-600">
                                      Quantity:
                                    </span>
                                    <p className="mt-1">{item.quantity}</p>
                                  </div>
                                  <div>
                                    <span className="font-semibold text-gray-600">
                                      Unit:
                                    </span>
                                    <p className="mt-1">{item.unit || "N/A"}</p>
                                  </div>
                                  <div>
                                    <span className="font-semibold text-gray-600">
                                      Unit Cost:
                                    </span>
                                    <p className="mt-1">
                                      ₦{item.unitCost.toLocaleString()}
                                    </p>
                                  </div>
                                  <div>
                                    <span className="font-semibold text-gray-600">
                                      Total:
                                    </span>
                                    <p className="mt-1 font-bold">
                                      ₦{item.total.toLocaleString()}
                                    </p>
                                  </div>
                                </div>

                                {item.description && (
                                  <div className="w-full">
                                    <span className="font-semibold text-gray-600">
                                      Description:
                                    </span>
                                    <p className="mt-1">{item.description}</p>
                                  </div>
                                )}
                              </div>
                            )
                          )}
                          <div className="text-right pt-2 border-t">
                            <span className="text-lg font-bold">
                              Grand Total: ₦{totalAmount.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ) : field.isArray ? (
                        <div className="flex flex-wrap gap-2">
                          {(field.content as any[]).length > 0 ? (
                            (field.content as any[]).map((item, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                              >
                                {typeof item === "object" &&
                                "businessName" in item
                                  ? (item as VendorType).businessName
                                  : String(item)}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-500">
                              No vendors selected
                            </span>
                          )}
                        </div>
                      ) : (
                        <div
                          className={`${
                            field.isBlock
                              ? "whitespace-pre-line bg-white p-3 rounded border"
                              : "break-words"
                          } ${
                            section.title === "Timeline & Validity"
                              ? "text-slate-800 font-medium"
                              : section.title === "Vendor Distribution"
                              ? "text-slate-800"
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
      {rfq.files && rfq.files.length > 0 && (
        <FileAttachmentContainer files={rfq.files} />
      )}
    </DetailContainer>
  );
};
