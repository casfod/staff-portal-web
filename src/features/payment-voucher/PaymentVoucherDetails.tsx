import { PaymentVoucherType } from "../../interfaces";
import { useParams } from "react-router-dom";
import DetailContainer from "../../ui/DetailContainer";
import {
  FileText,
  Calendar,
  Tag,
  DollarSign,
  Building,
  User,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { ReactElement } from "react";
import FileAttachmentContainer from "../../ui/FileAttachmentContainer";
import { GoPerson } from "react-icons/go";
import { formatToDDMMYYYY } from "../../utils/formatToDDMMYYYY";
import { moneyFormat } from "../../utils/moneyFormat";

interface PaymentVoucherDetailsProps {
  voucher: PaymentVoucherType;
}

interface PVField {
  id: string;
  label: string;
  content: string | number | any;
  icon?: ReactElement;
  isBlock?: boolean;
  isArray?: boolean;
  isAmount?: boolean;
}

interface PVSection {
  title: string;
  icon: ReactElement;
  fields: PVField[];
}

export const PaymentVoucherDetails = ({
  voucher,
}: PaymentVoucherDetailsProps) => {
  const { voucherId } = useParams();

  const getDisplayName = (user: any): string => {
    if (!user) return "N/A";
    if (typeof user === "string") return "N/A";
    return `${user.first_name || ""} ${user.last_name || ""}`.trim() || "N/A";
  };

  const getPosition = (user: any): string => {
    if (!user) return "N/A";
    if (typeof user === "string") return "N/A";
    return user.position || user.role || "N/A";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
      case "paid":
        return <CheckCircle className="w-4 h-4 text-gray-600" />;
      case "rejected":
        return <XCircle className="w-4 h-4 text-red-600" />;
      case "reviewed":
        return <CheckCircle className="w-4 h-4 text-gray-600" />;
      case "pending":
        return <XCircle className="w-4 h-4 text-yellow-600" />;
      default:
        return <Tag className="w-4 h-4 text-gray-600" />;
    }
  };

  // const getStatusColor = (status: string) => {
  //   switch (status) {
  //     case "approved":
  //     case "paid":
  //       return "text-gray-800 bg-gray-100";
  //     case "rejected":
  //       return "text-red-800 bg-red-100";
  //     case "reviewed":
  //       return "text-gray-800 bg-gray-100";
  //     case "pending":
  //       return "text-yellow-800 bg-yellow-100";
  //     default:
  //       return "text-gray-800 bg-gray-100";
  //   }
  // };

  const pvSections: PVSection[] = [
    {
      title: "Payment Information",
      icon: <DollarSign className="w-4 h-4" />,
      fields: [
        {
          id: "pvNumber",
          label: "PV Number",
          content: voucher.pvNumber,
          icon: <FileText className="w-4 h-4" />,
        },
        {
          id: "status",
          label: "Status",
          content: voucher.status ? voucher.status.toUpperCase() : "DRAFT",
          icon: getStatusIcon(voucher.status || "draft"),
        },
        {
          id: "payTo",
          label: "Pay To",
          content: voucher.payTo,
          icon: <User className="w-4 h-4" />,
        },
        {
          id: "being",
          label: "Being",
          content: voucher.being,
          isBlock: true,
        },
      ],
    },
    {
      title: "Financial Details",
      icon: <DollarSign className="w-4 h-4" />,
      fields: [
        {
          id: "grossAmount",
          label: "Gross Amount",
          content: moneyFormat(voucher.grossAmount, "NGN"),
          isAmount: true,
        },
        {
          id: "vat",
          label: "VAT",
          content: moneyFormat(voucher.vat || 0, "NGN"),
          isAmount: true,
        },
        {
          id: "wht",
          label: "Withholding Tax (WHT)",
          content: moneyFormat(voucher.wht || 0, "NGN"),
          isAmount: true,
        },
        {
          id: "devLevy",
          label: "Development Levy",
          content: moneyFormat(voucher.devLevy || 0, "NGN"),
          isAmount: true,
        },
        {
          id: "otherDeductions",
          label: "Other Deductions",
          content: moneyFormat(voucher.otherDeductions || 0, "NGN"),
          isAmount: true,
        },
        {
          id: "netAmount",
          label: "Net Amount",
          content: moneyFormat(voucher.netAmount, "NGN"),
          isAmount: true,
        },
        {
          id: "amountInWords",
          label: "Amount in Words",
          content: voucher.amountInWords,
          isBlock: true,
        },
      ],
    },
    {
      title: "Accounting Information",
      icon: <Building className="w-4 h-4" />,
      fields: [
        {
          id: "departmentalCode",
          label: "Departmental Code",
          content: voucher.departmentalCode,
        },
        {
          id: "grantCode",
          label: "Grant Code",
          content: voucher.grantCode,
        },
        {
          id: "chartOfAccountCategories",
          label: "Chart of Account Categories",
          content: voucher.chartOfAccountCategories,
        },
        {
          id: "chartOfAccount",
          label: "Chart of Account",
          content: voucher.chartOfAccount,
        },
        {
          id: "chartOfAccountCode",
          label: "Chart of Account Code",
          content: voucher.chartOfAccountCode,
        },
        {
          id: "projBudgetLine",
          label: "Project Budget Line",
          content: voucher.projBudgetLine,
        },
        {
          id: "mandateReference",
          label: "Mandate Reference",
          content: voucher.mandateReference,
        },
      ],
    },
    {
      title: "Approval Workflow",
      icon: <User className="w-4 h-4" />,
      fields: [
        {
          id: "createdBy",
          label: "Created By",
          content: (
            <div>
              <div className="font-medium">
                {getDisplayName(voucher.createdBy)}
              </div>
              <div className="text-sm text-gray-600">
                {getPosition(voucher.createdBy)}
              </div>
            </div>
          ),
          icon: <GoPerson className="w-4 h-4" />,
        },
        {
          id: "reviewedBy",
          label: "Reviewed By",
          content: (
            <div>
              <div className="font-medium">
                {getDisplayName(voucher.reviewedBy)}
              </div>
              <div className="text-sm text-gray-600">
                {getPosition(voucher.reviewedBy)}
              </div>
            </div>
          ),
          icon: <User className="w-4 h-4" />,
        },
        {
          id: "approvedBy",
          label: "Approved By",
          content: (
            <div>
              <div className="font-medium">
                {getDisplayName(voucher.approvedBy)}
              </div>
              <div className="text-sm text-gray-600">
                {getPosition(voucher.approvedBy)}
              </div>
            </div>
          ),
          icon: <CheckCircle className="w-4 h-4" />,
        },
        {
          id: "copiedTo",
          label: "Copied To",
          content:
            Array.isArray(voucher.copiedTo) && voucher.copiedTo.length > 0 ? (
              <div className="space-y-2">
                {voucher.copiedTo.map((user, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <div>
                      <div className="font-medium">{getDisplayName(user)}</div>
                      <div className="text-gray-600">{getPosition(user)}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              "N/A"
            ),
          isBlock: true,
        },
      ],
    },
    {
      title: "Additional Information",
      icon: <FileText className="w-4 h-4" />,
      fields: [
        {
          id: "payingStation",
          label: "Paying Station",
          content: voucher.payingStation,
        },
        {
          id: "note",
          label: "Notes",
          content: voucher.note || "No notes provided",
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
          content: formatToDDMMYYYY(voucher.createdAt!),
          icon: <Calendar className="w-4 h-4" />,
        },
        {
          id: "updatedAt",
          label: "Last Updated",
          content: formatToDDMMYYYY(voucher.updatedAt!),
          icon: <Calendar className="w-4 h-4" />,
        },
      ],
    },
  ];

  // Calculate totals for summary
  const totalDeductions =
    (voucher.vat || 0) +
    (voucher.wht || 0) +
    (voucher.devLevy || 0) +
    (voucher.otherDeductions || 0);

  return (
    <DetailContainer>
      <div
        className={`flex flex-col gap-6 w-full ${
          !voucherId ? "text-sm" : "text-sm md:text-base"
        } break-words`}
      >
        {/* Financial Summary Card */}
        <div className="rounded-lg p-4 bg-gray-50 border border-gray-200">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-300">
            <DollarSign className="w-4 h-4 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-800">
              Financial Summary
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-3 bg-white rounded border border-gray-100">
              <div className="text-sm font-semibold text-gray-600 mb-1">
                Gross Amount
              </div>
              <div className="text-lg font-bold text-gray-800">
                {moneyFormat(voucher.grossAmount, "NGN")}
              </div>
            </div>
            <div className="text-center p-3 bg-white rounded border border-gray-100">
              <div className="text-sm font-semibold text-red-600 mb-1">
                Total Deductions
              </div>
              <div className="text-lg font-bold text-red-800">
                {moneyFormat(totalDeductions, "NGN")}
              </div>
            </div>
            <div className="text-center p-3 bg-white rounded border border-gray-100">
              <div className="text-sm font-semibold text-gray-600 mb-1">
                Net Amount
              </div>
              <div className="text-lg font-bold text-gray-800">
                {moneyFormat(voucher.netAmount, "NGN")}
              </div>
            </div>
            {/* <div className="text-center p-3 bg-white rounded border border-gray-100">
              <div className="text-sm font-semibold text-gray-600 mb-1">
                Status
              </div>
              <div
                className={`text-lg font-bold px-3 py-1 rounded-full ${getStatusColor(
                  voucher.status || "draft"
                )}`}
              >
                {(voucher.status || "draft").toUpperCase()}
              </div>
            </div> */}
          </div>
        </div>

        {pvSections.map((section, sectionIndex) => (
          <div
            key={sectionIndex}
            className={`rounded-lg p-4 border ${
              section.title === "Financial Details"
                ? "bg-gray-50 border-gray-200"
                : section.title === "Approval Workflow"
                ? "bg-gray-50 border-gray-200"
                : "bg-gray-50 border-gray-200"
            }`}
          >
            {/* Section Header */}
            <div
              className={`flex items-center gap-2 mb-3 pb-2 border-b ${
                section.title === "Financial Details"
                  ? "border-gray-300"
                  : section.title === "Approval Workflow"
                  ? "border-gray-300"
                  : "border-gray-300"
              }`}
            >
              <div
                className={
                  section.title === "Financial Details"
                    ? "text-gray-600"
                    : section.title === "Approval Workflow"
                    ? "text-gray-600"
                    : "text-gray-600"
                }
              >
                {section.icon}
              </div>
              <h3
                className={`text-lg font-semibold ${
                  section.title === "Financial Details"
                    ? "text-gray-800"
                    : section.title === "Approval Workflow"
                    ? "text-gray-800"
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
                    section.title === "Financial Details" && field.isAmount
                      ? "bg-white p-3 rounded border border-gray-100"
                      : ""
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {field.icon && (
                      <div
                        className={`mt-0.5 ${
                          section.title === "Financial Details"
                            ? "text-gray-700"
                            : section.title === "Approval Workflow"
                            ? "text-gray-700"
                            : "text-gray-500"
                        }`}
                      >
                        {field.icon}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <label
                        className={`block text-sm font-extrabold mb-1 uppercase tracking-wide ${
                          section.title === "Financial Details"
                            ? "text-gray-600"
                            : section.title === "Approval Workflow"
                            ? "text-gray-600"
                            : "text-gray-600"
                        }`}
                      >
                        {field.label}
                      </label>

                      <div
                        className={`${
                          field.isBlock
                            ? "whitespace-pre-line bg-white p-3 rounded border"
                            : "break-words"
                        } ${
                          section.title === "Financial Details" &&
                          field.isAmount
                            ? "text-gray-800 font-bold text-lg"
                            : section.title === "Financial Details"
                            ? "text-gray-800 font-medium"
                            : section.title === "Approval Workflow"
                            ? "text-gray-800"
                            : "text-gray-800"
                        }`}
                      >
                        {field.content}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* File Attachments Section */}
      {voucher.files && voucher.files.length > 0 && (
        <FileAttachmentContainer files={voucher.files} />
      )}
    </DetailContainer>
  );
};
