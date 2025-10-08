import { VendorType } from "../../interfaces";
import { useParams } from "react-router-dom";
import { formatToDDMMYYYY } from "../../utils/formatToDDMMYYYY";
import DetailContainer from "../../ui/DetailContainer";
import {
  MapPin,
  Phone,
  Mail,
  User,
  Building,
  FileText,
  Calendar,
  ArrowUpRightFromCircleIcon,
  Tag,
  CreditCard,
  Landmark,
  UserCircle,
} from "lucide-react";
import { ReactElement } from "react";
import FileAttachmentContainer from "../../ui/FileAttachmentContainer";

interface VendorDetailsProps {
  vendor: VendorType;
}

interface VendorField {
  id: string;
  label: string;
  content: string | string[]; // Updated to accept array
  icon?: ReactElement;
  isBlock?: boolean;
  isArray?: boolean; // New flag to indicate array content
}

interface VendorSection {
  title: string;
  icon: ReactElement;
  fields: VendorField[];
}

export const VendorDetails = ({ vendor }: VendorDetailsProps) => {
  const { vendorId } = useParams();

  // Grouped vendor information with proper typing - INCLUDING Bank Account Details
  const vendorSections: VendorSection[] = [
    {
      title: "Business Information",
      icon: <Building className="w-4 h-4" />,
      fields: [
        {
          id: "businessName",
          label: "Business Name",
          content: vendor.businessName,
        },
        {
          id: "businessType",
          label: "Business Type",
          content: vendor.businessType,
        },
        {
          id: "vendorCode",
          label: "Vendor Code",
          content: vendor.vendorCode,
        },

        {
          id: "tinNumber",
          label: "TIN Number",
          content: vendor.tinNumber,
        },
        {
          id: "businessRegNumber",
          label: "Business Registration Number",
          content: vendor.businessRegNumber || "N/A",
        },

        {
          id: "categories",
          label: "Categories",
          content: vendor.categories || [], // Keep as array for special handling
          icon: <Tag className="w-4 h-4" />,
          isArray: true, // Flag to indicate this is an array field
          isBlock: true,
        },
      ],
    },
    {
      title: "Contact Information",
      icon: <User className="w-4 h-4" />,
      fields: [
        {
          id: "contactPerson",
          label: "Contact Person",
          content: vendor.contactPerson,
          icon: <User className="w-4 h-4" />,
        },
        {
          id: "position",
          label: "Position",
          content: vendor.position,
          icon: <ArrowUpRightFromCircleIcon className="w-4 h-4" />,
        },
        {
          id: "email",
          label: "Business Email",
          content: vendor.email,
          icon: <Mail className="w-4 h-4" />,
        },
        {
          id: "businessPhone",
          label: "Business Phone",
          content: vendor.businessPhoneNumber,
          icon: <Phone className="w-4 h-4" />,
        },
        {
          id: "contactPhone",
          label: "Contact Phone",
          content: vendor.contactPhoneNumber,
          icon: <Phone className="w-4 h-4" />,
        },
      ],
    },
    // Bank Account Details as a proper section
    ...(vendor.bankName || vendor.accountName || vendor.accountNumber
      ? [
          {
            title: "Bank Account Details",
            icon: <CreditCard className="w-4 h-4" />,
            fields: [
              {
                id: "bankName",
                label: "Bank Name",
                content: vendor.bankName || "N/A",
                icon: <Landmark className="w-4 h-4" />,
              },
              {
                id: "accountName",
                label: "Account Name",
                content: vendor.accountName || "N/A",
                icon: <UserCircle className="w-4 h-4" />,
              },
              {
                id: "accountNumber",
                label: "Account Number",
                content: vendor.accountNumber || "N/A",
                icon: <CreditCard className="w-4 h-4" />,
                isBlock: true,
              },
            ],
          },
        ]
      : []),
    {
      title: "Address & Location",
      icon: <MapPin className="w-4 h-4" />,
      fields: [
        {
          id: "address",
          label: "Business Address",
          content: vendor.address,
          isBlock: true,
        },
        {
          id: "businessState",
          label: "Business State",
          content: vendor.businessState || "N/A",
        },
        {
          id: "operatingLGA",
          label: "Operating LGA",
          content: vendor.operatingLGA || "N/A",
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
          content: formatToDDMMYYYY(vendor.createdAt),
          icon: <FileText className="w-4 h-4" />,
        },
        {
          id: "updatedAt",
          label: "Last Updated",
          content: formatToDDMMYYYY(vendor.updatedAt),
          icon: <FileText className="w-4 h-4" />,
        },
      ],
    },
  ];

  return (
    <DetailContainer>
      <div
        className={`flex flex-col gap-6 w-full ${
          !vendorId ? "text-sm" : "text-sm md:text-base"
        } break-words`}
      >
        {/* All Vendor Sections including Bank Account Details */}
        {vendorSections.map((section, sectionIndex) => (
          <div
            key={sectionIndex}
            className={`rounded-lg p-4 border ${
              section.title === "Contact Information" ||
              section.title === "Bank Account Details"
                ? "bg-blue-50 border-slate-200"
                : "bg-gray-50 border-gray-200"
            }`}
          >
            {/* Section Header */}
            <div
              className={`flex items-center gap-2 mb-3 pb-2 border-b ${
                section.title === "Contact Information"
                  ? "border-slate-300"
                  : section.title === "Bank Account Details"
                  ? "border-slate-300"
                  : "border-gray-300"
              }`}
            >
              <div
                className={
                  section.title === "Contact Information"
                    ? "text-slate-600"
                    : section.title === "Bank Account Details"
                    ? "text-slate-600"
                    : "text-gray-600"
                }
              >
                {section.icon}
              </div>
              <h3
                className={`text-lg font-semibold ${
                  section.title === "Contact Information"
                    ? "text-slate-800"
                    : section.title === "Bank Account Details"
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
                    section.title === "Contact Information" ||
                    section.title === "Bank Account Details"
                      ? "flex items-center gap-3"
                      : ""
                  }`}
                >
                  <div
                    className={`flex items-start gap-2 ${
                      section.title === "Contact Information" ||
                      section.title === "Bank Account Details"
                        ? "w-full"
                        : ""
                    }`}
                  >
                    {field.icon && (
                      <div
                        className={`mt-0.5 ${
                          section.title === "Contact Information" ||
                          section.title === "Bank Account Details"
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
                          section.title === "Contact Information" ||
                          section.title === "Bank Account Details"
                            ? "text-slate-600"
                            : "text-gray-600"
                        }`}
                      >
                        {field.label}
                      </label>

                      {/* Special handling for array fields (categories) */}
                      {field.isArray ? (
                        <div className="flex flex-wrap gap-2">
                          {(field.content as string[]).length > 0 ? (
                            (field.content as string[]).map(
                              (category, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                >
                                  {category}
                                </span>
                              )
                            )
                          ) : (
                            <span className="text-gray-500">N/A</span>
                          )}
                        </div>
                      ) : (
                        <div
                          className={`${
                            field.isBlock
                              ? "whitespace-pre-line bg-white p-3 rounded border"
                              : "break-words"
                          } ${
                            section.title === "Contact Information"
                              ? field.id === "email" ||
                                field.id === "businessPhone" ||
                                field.id === "contactPhone"
                                ? "text-slate-600 hover:underline cursor-pointer"
                                : "text-slate-800"
                              : section.title === "Bank Account Details"
                              ? field.id === "accountNumber"
                                ? "text-slate-800 font-mono font-medium text-lg tracking-wider"
                                : "text-slate-800 font-medium"
                              : "text-gray-800"
                          }`}
                          onClick={() => {
                            if (section.title === "Contact Information") {
                              if (field.id === "email") {
                                window.location.href = `mailto:${field.content}`;
                              } else if (
                                field.id === "businessPhone" ||
                                field.id === "contactPhone"
                              ) {
                                window.location.href = `tel:${field.content}`;
                              }
                            }
                          }}
                        >
                          {field.content}
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
      {vendor.files && vendor.files.length > 0 && (
        <FileAttachmentContainer files={vendor.files} />
      )}
    </DetailContainer>
  );
};
