import { VendorType } from "../../interfaces";
import { useParams } from "react-router-dom";
import { dateformat } from "../../utils/dateFormat";
import DetailContainer from "../../ui/DetailContainer";
import {
  MapPin,
  Phone,
  Mail,
  User,
  Building,
  FileText,
  Calendar,
} from "lucide-react";
import { ReactElement } from "react";

interface VendorDetailsProps {
  vendor: VendorType;
}

interface VendorField {
  id: string;
  label: string;
  content: string;
  icon?: ReactElement;
  isBlock?: boolean;
}

interface VendorSection {
  title: string;
  icon: ReactElement;
  fields: VendorField[];
}

export const VendorDetails = ({ vendor }: VendorDetailsProps) => {
  const { vendorId } = useParams();

  // Grouped vendor information with proper typing
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
          id: "supplierNumber",
          label: "Supplier Number",
          content: vendor.supplierNumber || "N/A",
        },
        {
          id: "category",
          label: "Category",
          content: vendor.category || "N/A",
        },
        {
          id: "tinNumber",
          label: "TIN Number",
          content: vendor.tinNumber,
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
        },
        {
          id: "position",
          label: "Position",
          content: vendor.position,
        },
        {
          id: "email",
          label: "Email",
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
    {
      title: "Address",
      icon: <MapPin className="w-4 h-4" />,
      fields: [
        {
          id: "address",
          label: "Full Address",
          content: vendor.address,
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
          content: dateformat(vendor.createdAt),
          icon: <FileText className="w-4 h-4" />,
        },
        {
          id: "updatedAt",
          label: "Last Updated",
          content: dateformat(vendor.updatedAt),
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
        {vendorSections.map((section, sectionIndex) => (
          <div
            key={sectionIndex}
            className="bg-gray-50 rounded-lg p-4 border border-gray-200"
          >
            {/* Section Header */}
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-300">
              <div className="text-gray-600">{section.icon}</div>
              <h3 className="text-lg font-semibold text-gray-800">
                {section.title}
              </h3>
            </div>

            {/* Section Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {section.fields.map((field) => (
                <div
                  key={field.id}
                  className={`${field.isBlock ? "md:col-span-2" : ""}`}
                >
                  <div className="flex items-start gap-2">
                    {field.icon && (
                      <div className="text-gray-500 mt-0.5">{field.icon}</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <label className="block text-sm font-medium text-gray-600 mb-1 uppercase tracking-wide">
                        {field.label}
                      </label>
                      <div
                        className={`text-gray-800 ${
                          field.isBlock
                            ? "whitespace-pre-line bg-white p-3 rounded border"
                            : "break-words"
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

        {/* Quick Contact Card */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <h4 className="text-md font-semibold text-blue-800 mb-3 flex items-center gap-2">
            <Phone className="w-4 h-4" />
            Quick Contact
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-600" />
              <a
                href={`mailto:${vendor.email}`}
                className="text-blue-600 hover:underline"
              >
                {vendor.email}
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-blue-600" />
              <a
                href={`tel:${vendor.businessPhoneNumber}`}
                className="text-blue-600 hover:underline"
              >
                {vendor.businessPhoneNumber}
              </a>
            </div>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" />
              <span className="text-gray-700">{vendor.contactPerson}</span>
            </div>
          </div>
        </div>
      </div>
    </DetailContainer>
  );
};
