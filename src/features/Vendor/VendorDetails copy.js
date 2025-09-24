import { VendorType } from "../../interfaces";
import { useParams, useState } from "react-router-dom";
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

interface VendorDetailsProps {
  vendor: VendorType;
}

const TabButton = ({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-colors ${
      active
        ? "bg-white border-t border-l border-r border-gray-300 text-blue-600"
        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
    }`}
  >
    {children}
  </button>
);

export const VendorDetails = ({ vendor }: VendorDetailsProps) => {
  const { vendorId } = useParams();
  const [activeTab, setActiveTab] = useState("business");

  const tabs = [
    {
      id: "business",
      label: "Business Info",
      icon: <Building className="w-4 h-4" />,
    },
    {
      id: "contact",
      label: "Contact Info",
      icon: <User className="w-4 h-4" />,
    },
    {
      id: "system",
      label: "System Info",
      icon: <FileText className="w-4 h-4" />,
    },
  ];

  const tabContent = {
    business: (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
        <InfoField label="Business Name" value={vendor.businessName} />
        <InfoField label="Business Type" value={vendor.businessType} />
        <InfoField label="Vendor Code" value={vendor.vendorCode} />
        <InfoField
          label="Supplier Number"
          value={vendor.supplierNumber || "N/A"}
        />
        <InfoField label="Category" value={vendor.category || "N/A"} />
        <InfoField label="TIN Number" value={vendor.tinNumber} />
      </div>
    ),
    contact: (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
        <InfoField
          label="Contact Person"
          value={vendor.contactPerson}
          icon={<User className="w-4 h-4" />}
        />
        <InfoField label="Position" value={vendor.position} />
        <InfoField
          label="Email"
          value={vendor.email}
          icon={<Mail className="w-4 h-4" />}
          isLink={`mailto:${vendor.email}`}
        />
        <InfoField
          label="Business Phone"
          value={vendor.businessPhoneNumber}
          icon={<Phone className="w-4 h-4" />}
          isLink={`tel:${vendor.businessPhoneNumber}`}
        />
        <InfoField
          label="Contact Phone"
          value={vendor.contactPhoneNumber}
          icon={<Phone className="w-4 h-4" />}
          isLink={`tel:${vendor.contactPhoneNumber}`}
        />
        <div className="md:col-span-2">
          <InfoField
            label="Address"
            value={vendor.address}
            icon={<MapPin className="w-4 h-4" />}
            isBlock
          />
        </div>
      </div>
    ),
    system: (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
        <InfoField
          label="Created Date"
          value={dateformat(vendor.createdAt)}
          icon={<Calendar className="w-4 h-4" />}
        />
        <InfoField
          label="Last Updated"
          value={dateformat(vendor.updatedAt)}
          icon={<Calendar className="w-4 h-4" />}
        />
      </div>
    ),
  };

  return (
    <DetailContainer>
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-300">
        {tabs.map((tab) => (
          <TabButton
            key={tab.id}
            active={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
          >
            <div className="flex items-center gap-2">
              {tab.icon}
              {tab.label}
            </div>
          </TabButton>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-b-lg">{tabContent[activeTab]}</div>
    </DetailContainer>
  );
};

// Reusable InfoField component
const InfoField = ({
  label,
  value,
  icon,
  isBlock = false,
  isLink,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  isBlock?: boolean;
  isLink?: string;
}) => (
  <div className={`${isBlock ? "md:col-span-2" : ""}`}>
    <div className="flex items-start gap-2">
      {icon && <div className="text-gray-500 mt-0.5">{icon}</div>}
      <div className="flex-1 min-w-0">
        <label className="block text-sm font-medium text-gray-600 mb-1 uppercase tracking-wide">
          {label}
        </label>
        {isLink ? (
          <a
            href={isLink}
            className="text-blue-600 hover:underline break-words"
          >
            {value}
          </a>
        ) : (
          <div
            className={`text-gray-800 ${
              isBlock
                ? "whitespace-pre-line bg-gray-50 p-3 rounded border"
                : "break-words"
            }`}
          >
            {value}
          </div>
        )}
      </div>
    </div>
  </div>
);
