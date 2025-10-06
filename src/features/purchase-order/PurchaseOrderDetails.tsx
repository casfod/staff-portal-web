import { PurchaseOrderType, ItemGroupType } from "../../interfaces";
import { useParams } from "react-router-dom";
import { dateformat } from "../../utils/dateFormat";
import DetailContainer from "../../ui/DetailContainer";
import {
  FileText,
  Calendar,
  Tag,
  Users,
  Clock,
  Shield,
  Package,
  UserCheck,
} from "lucide-react";
import { ReactElement } from "react";
import FileAttachmentContainer from "../../ui/FileAttachmentContainer";
import { GoPerson } from "react-icons/go";

interface PurchaseOrderDetailsProps {
  purchaseOrder: PurchaseOrderType;
}

interface PurchaseOrderField {
  id: string;
  label: string;
  content: string | number | ItemGroupType | any[];
  icon?: ReactElement;
  isBlock?: boolean;
  isArray?: boolean;
  isItemGroups?: boolean;
}

interface PurchaseOrderSection {
  title: string;
  icon: ReactElement;
  fields: PurchaseOrderField[];
}

export const PurchaseOrderDetails = ({
  purchaseOrder,
}: PurchaseOrderDetailsProps) => {
  const { purchaseOrderId } = useParams();

  // Updated vendor name logic to handle both copiedTo and selectedVendor
  const vendorName = purchaseOrder.selectedVendor
    ? purchaseOrder.selectedVendor.businessName
    : purchaseOrder.copiedTo &&
      Array.isArray(purchaseOrder.copiedTo) &&
      purchaseOrder.copiedTo.length > 0
    ? typeof purchaseOrder.copiedTo[0] === "object"
      ? (purchaseOrder.copiedTo[0] as any).businessName
      : "Vendor"
    : "No Vendor";

  // Use POCode if available, otherwise fall back to RFQCode
  const purchaseOrderCode = purchaseOrder.POCode;
  const RFQReferenceCode = purchaseOrder.RFQCode;

  const purchaseOrderSections: PurchaseOrderSection[] = [
    {
      title: "Purchase Order Information",
      icon: <FileText className="w-4 h-4" />,
      fields: [
        {
          id: "RFQTitle",
          label: "PO Title",
          content: purchaseOrder.RFQTitle,
        },
        {
          id: "status",
          label: "Status",
          content: purchaseOrder.status.toUpperCase(),
          icon: <Tag className="w-4 h-4" />,
        },

        {
          id: "purchaseOrderCode",
          label: "PO Code",
          content: purchaseOrderCode,
        },
        {
          id: "RFQReferenceCode",
          label: "RFQ Reference Code",
          content: RFQReferenceCode,
        },

        {
          id: "totalAmount",
          label: "Total Amount",
          content: `₦${purchaseOrder.totalAmount.toLocaleString()}`,
          // icon: <DollarSign className="w-4 h-4" />,
        },
      ],
    },
    {
      title: "Vendor & Approval",
      icon: <UserCheck className="w-4 h-4" />,
      fields: [
        {
          id: "vendor",
          label: "Vendor",
          content: vendorName,
          icon: <Users className="w-4 h-4" />,
        },
        {
          id: "approvedBy",
          label: "Approved By",
          content: purchaseOrder.approvedBy
            ? `${purchaseOrder.approvedBy.first_name} ${purchaseOrder.approvedBy.last_name}`
            : "Pending Approval",
          icon: <UserCheck className="w-4 h-4" />,
        },
      ],
    },
    {
      title: "Timeline & Validity",
      icon: <Clock className="w-4 h-4" />,
      fields: [
        {
          id: "deliveryPeriod",
          label: "Delivery Period",
          content: purchaseOrder.deliveryPeriod || "N/A",
        },
        {
          id: "bidValidityPeriod",
          label: "Bid Validity Period",
          content: purchaseOrder.bidValidityPeriod || "N/A",
        },
        {
          id: "guaranteePeriod",
          label: "Guarantee Period",
          content: purchaseOrder.guaranteePeriod || "N/A",
          icon: <Shield className="w-4 h-4" />,
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
          content: purchaseOrder.itemGroups,
          icon: <Package className="w-4 h-4" />,
          isItemGroups: true,
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
          content: dateformat(purchaseOrder.createdAt),
          icon: <Calendar className="w-4 h-4" />,
        },
        {
          id: "updatedAt",
          label: "Last Updated",
          content: dateformat(purchaseOrder.updatedAt),
          icon: <Calendar className="w-4 h-4" />,
        },

        {
          id: "createdBy",
          label: "Created By",
          content: `${purchaseOrder.createdBy.first_name} ${purchaseOrder.createdBy.last_name}`,
          icon: <GoPerson className="w-4 h-4" />,
        },
        {
          id: "createdBy",
          label: "Aprroved By",
          content: purchaseOrder?.approvedBy
            ? `${purchaseOrder?.approvedBy?.first_name} ${purchaseOrder?.approvedBy?.last_name}`
            : "N/A",
          icon: <GoPerson className="w-4 h-4" />,
        },
      ],
    },
  ];

  return (
    <DetailContainer>
      <div
        className={`flex flex-col gap-6 w-full ${
          !purchaseOrderId ? "text-sm" : "text-sm md:text-base"
        } break-words`}
      >
        {purchaseOrderSections.map((section, sectionIndex) => (
          <div
            key={sectionIndex}
            className={`rounded-lg p-4 border ${
              section.title === "Timeline & Validity" ||
              section.title === "Vendor & Approval"
                ? "bg-blue-50 border-slate-200"
                : "bg-gray-50 border-gray-200"
            }`}
          >
            {/* Section Header */}
            <div
              className={`flex items-center gap-2 mb-3 pb-2 border-b ${
                section.title === "Timeline & Validity" ||
                section.title === "Vendor & Approval"
                  ? "border-slate-300"
                  : "border-gray-300"
              }`}
            >
              <div
                className={
                  section.title === "Timeline & Validity" ||
                  section.title === "Vendor & Approval"
                    ? "text-slate-600"
                    : "text-gray-600"
                }
              >
                {section.icon}
              </div>
              <h3
                className={`text-lg font-semibold ${
                  section.title === "Timeline & Validity" ||
                  section.title === "Vendor & Approval"
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
                    section.title === "Vendor & Approval"
                      ? "flex items-center gap-3"
                      : ""
                  }`}
                >
                  <div
                    className={`flex items-start gap-2 ${
                      section.title === "Timeline & Validity" ||
                      section.title === "Vendor & Approval"
                        ? "w-full"
                        : ""
                    }`}
                  >
                    {field.icon && (
                      <div
                        className={`mt-0.5 ${
                          section.title === "Timeline & Validity" ||
                          section.title === "Vendor & Approval"
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
                          section.title === "Vendor & Approval"
                            ? "text-slate-600"
                            : "text-gray-600"
                        }`}
                      >
                        {field.label}
                      </label>

                      {/* Special handling for item groups */}
                      {field.isItemGroups ? (
                        <div className="space-y-3">
                          {(field.content as ItemGroupType[]).map(
                            (item, index) => (
                              <div
                                key={index}
                                className="border rounded-lg p-3 bg-white shadow-sm"
                              >
                                <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
                                  <div>
                                    <span className="font-semibold text-gray-600">
                                      Description:
                                    </span>
                                    <p className="mt-1">{item.description}</p>
                                  </div>
                                  <div>
                                    <span className="font-semibold text-gray-600">
                                      Frequency:
                                    </span>
                                    <p className="mt-1">
                                      {String(item.frequency)}
                                    </p>
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
                              </div>
                            )
                          )}
                          <div className="text-right pt-2 border-t">
                            <span className="text-lg font-bold">
                              Grand Total: ₦
                              {purchaseOrder.totalAmount.toLocaleString()}
                            </span>
                          </div>
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
                              : section.title === "Vendor & Approval"
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
      {purchaseOrder.files && purchaseOrder.files.length > 0 && (
        <FileAttachmentContainer files={purchaseOrder.files} />
      )}
    </DetailContainer>
  );
};
