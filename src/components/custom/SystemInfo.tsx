// SystemInfo.tsx - Separates dates from users
import { Calendar, Clock } from 'lucide-react';
import { formatToDDMMYYYY } from '../../utils/formatToDDMMYYYY';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GoPerson } from 'react-icons/go';
import { ReactNode } from 'react';

interface SystemInfoField {
  id: string;
  label: string;
  content: string | ReactNode;
  icon: ReactNode;
}

interface SystemInfoSection {
  title: string;
  icon: ReactNode;
  fields: SystemInfoField[];
}

interface SystemInfoProps {
  request?: any; // Backward compatible
  data?: any; // New prop
  customSections?: SystemInfoSection[]; // For custom sections
}

// Helper to check if value exists
const hasValue = (value: any): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim() !== '';
  if (typeof value === 'object') {
    if (Array.isArray(value)) return value.length > 0;
    return Object.keys(value).length > 0;
  }
  return true;
};

// Helper to get user display name
const getUserDisplayName = (user: any): string => {
  if (!user) return 'N/A';
  if (typeof user === 'string') return user;
  if (user.firstName && user.lastName) return `${user.firstName} ${user.lastName}`;
  if (user.fullName) return user.fullName;
  if (user.name) return user.name;
  if (user.email) return user.email;
  return 'N/A';
};

// Helper to format date
const formatDate = (date: any): string => {
  if (!date) return 'N/A';
  try {
    return formatToDDMMYYYY(date);
  } catch {
    return 'N/A';
  }
};

// Generate system info fields based on available data
const getSystemDateFields = (data: any): SystemInfoField[] => {
  const fields: SystemInfoField[] = [];

  // ============================================
  // DATES SECTION (Calendar icon)
  // ============================================

  // 1. Created Date
  if (hasValue(data?.createdAt)) {
    fields.push({
      id: 'createdAt',
      label: 'Created Date',
      content: formatDate(data.createdAt),
      icon: <Calendar className="w-4 h-4" />,
    });
  }

  // 2. Updated Date
  if (hasValue(data?.updatedAt) && data?.updatedAt !== data?.createdAt) {
    fields.push({
      id: 'updatedAt',
      label: 'Last Updated',
      content: formatDate(data.updatedAt),
      icon: <Clock className="w-4 h-4" />,
    });
  }

  return fields;
};
const getSystemFields = (data: any): SystemInfoField[] => {
  const fields: SystemInfoField[] = [];
  // ============================================
  // USERS SECTION (Person icon)
  // ============================================

  // 17. Created By
  if (hasValue(data?.createdBy)) {
    fields.push({
      id: 'createdBy',
      label: 'Created',
      content: getUserDisplayName(data.createdBy),
      icon: <GoPerson className="w-4 h-4" />,
    });
  }

  // 18. Reviewed By
  if (hasValue(data?.reviewedBy)) {
    fields.push({
      id: 'reviewedBy',
      label: 'Reviewed',
      content: getUserDisplayName(data.reviewedBy),
      icon: <GoPerson className="w-4 h-4" />,
    });
  }

  // 19. Approved By
  if (hasValue(data?.approvedBy)) {
    fields.push({
      id: 'approvedBy',
      label: 'Approved',
      content: getUserDisplayName(data.approvedBy),
      icon: <GoPerson className="w-4 h-4" />,
    });
  }

  // 20. Finance Review By (for Purchase Request)
  if (hasValue(data?.financeReviewBy)) {
    fields.push({
      id: 'financeReviewBy',
      label: 'Finance Review',
      content: getUserDisplayName(data.financeReviewBy),
      icon: <GoPerson className="w-4 h-4" />,
    });
  }

  // 21. Procurement Review By (for Purchase Request)
  if (hasValue(data?.procurementReviewBy)) {
    fields.push({
      id: 'procurementReviewBy',
      label: 'Procurement Review',
      content: getUserDisplayName(data.procurementReviewBy),
      icon: <GoPerson className="w-4 h-4" />,
    });
  }

  // 22. Rejected By
  if (hasValue(data?.rejectedBy)) {
    fields.push({
      id: 'rejectedBy',
      label: 'Rejected',
      content: getUserDisplayName(data.rejectedBy),
      icon: <GoPerson className="w-4 h-4" />,
    });
  }

  // 23. Submitted By
  if (hasValue(data?.submittedBy)) {
    fields.push({
      id: 'submittedBy',
      label: 'Submitted',
      content: getUserDisplayName(data.submittedBy),
      icon: <GoPerson className="w-4 h-4" />,
    });
  }

  // 24. Supervisor
  if (hasValue(data?.supervisor)) {
    fields.push({
      id: 'supervisor',
      label: 'Supervisor',
      content: getUserDisplayName(data.supervisor),
      icon: <GoPerson className="w-4 h-4" />,
    });
  }

  // 25. Contact Person
  // if (hasValue(data?.contactPerson)) {
  //   fields.push({
  //     id: "contactPerson",
  //     label: "Contact Person",
  //     content: getUserDisplayName(data.contactPerson),
  //     icon: <GoPerson className="w-4 h-4" />,
  //   });
  // }

  // ============================================
  // STATUS SECTION (with colored badges)
  // ============================================

  // 26. Finance Review Status (for Purchase Request)
  // if (hasValue(data?.financeReviewStatus)) {
  //   fields.push({
  //     id: "financeReviewStatus",
  //     label: "Finance Review Status",
  //     content: (
  //       <span className={`capitalize ${
  //         data.financeReviewStatus === "approved" ? "text-green-600" :
  //         data.financeReviewStatus === "rejected" ? "text-red-600" :
  //         "text-yellow-600"
  //       }`}>
  //         {data.financeReviewStatus}
  //       </span>
  //     ),
  //     icon: <Calendar className="w-4 h-4" />,
  //   });
  // }

  // // 27. Procurement Review Status (for Purchase Request)
  // if (hasValue(data?.procurementReviewStatus)) {
  //   fields.push({
  //     id: "procurementReviewStatus",
  //     label: "Procurement Review Status",
  //     content: (
  //       <span className={`capitalize ${
  //         data.procurementReviewStatus === "approved" ? "text-green-600" :
  //         data.procurementReviewStatus === "rejected" ? "text-red-600" :
  //         "text-yellow-600"
  //       }`}>
  //         {data.procurementReviewStatus}
  //       </span>
  //     ),
  //     icon: <Calendar className="w-4 h-4" />,
  //   });
  // }

  return fields;
};

const SystemInfo: React.FC<SystemInfoProps> = ({ request, data, customSections }) => {
  // Support both old and new props
  const requestData = data || request;

  if (!requestData) {
    return null;
  }

  // Get system fields
  const systemFields = getSystemFields(requestData);
  const systemDateFields = getSystemDateFields(requestData);

  // If no fields and no custom sections, return null
  if (systemFields.length === 0 && (!customSections || customSections.length === 0)) {
    return null;
  }

  // If custom sections are provided, render them
  if (customSections && customSections.length > 0) {
    return (
      <div className="space-y-4">
        {customSections.map((section, index) => {
          // Filter out fields with no content
          const validFields = section.fields.filter(field => {
            if (typeof field.content === 'string') {
              return field.content !== 'N/A' && field.content.trim() !== '';
            }
            return true;
          });

          if (validFields.length === 0) return null;

          return (
            <Card
              key={index}
              className="isInspect && bg-[#F8F8F8]`} border border-gray-300 shadow-sm"
            >
              <CardHeader className="flex flex-row items-center gap-2 pb-3">
                <div className="p-2 bg-blue-50 rounded-lg shrink-0">{section.icon}</div>
                <CardTitle className="text-xs font-semibold text-gray-800">
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {validFields.map(field => (
                    <div
                      key={field.id}
                      className="flex flex-wrap items-center justify-between gap-2 py-3 border-b border-gray-100 last:border-0 sm:border-0"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="text-gray-500 shrink-0">{field.icon}</div>
                        <span className="text-sm font-medium text-gray-600 truncate">
                          {field.label}
                        </span>
                      </div>
                      <div className="shrink-0">
                        <Badge
                          variant="secondary"
                          className="text-sm font-semibold px-3 py-1.5 whitespace-nowrap"
                        >
                          {field.content}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  }

  // Default render with separate sections
  if (systemFields.length === 0) {
    return null;
  }

  return (
    <Card className="bg-gray-100/50 border border-gray-300 shadow-sm">
      <CardHeader className="flex flex-row items-center gap-2 pb-3">
        <div className="p-2 bg-blue-50 rounded-lg shrink-0">
          <Calendar className="w-4 h-4" />
        </div>
        <CardTitle className="text-xs md:text-sm lg:text-base font-semibold text-gray-800">
          System Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 border-b-2 pb-3">
            {/* Render all fields together */}
            {systemDateFields.map(field => (
              <div
                key={field.id}
                className="flex flex-wrap items-center justify-between gap-2 border-l border-gray-300 p-2 rounded-lg"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="text-gray-500 shrink-0">{field.icon}</div>
                  <span className="text-sm font-medium text-gray-600 truncate">{field.label}</span>
                </div>
                <div className="shrink-0">
                  <Badge
                    variant="secondary"
                    className="text-sm font-semibold px-3 py-1.5 whitespace-nowrap"
                  >
                    {field.content}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
          <div className=" grid grid-cols-1 sm:grid-cols-2 :grid-cols-2 gap-2.5 pt-2">
            {/* Render all fields together */}
            {systemFields.map(field => (
              <div
                key={field.id}
                className="flex flex-wrap items-center justify-between gap-2 border-l border-gray-300 p-2 rounded-lg"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="text-gray-500 shrink-0">{field.icon}</div>
                  <span className="text-sm font-medium text-gray-600 truncate">{field.label}</span>
                </div>
                <div className="shrink-0">
                  <Badge
                    variant="secondary"
                    className="text-sm font-semibold px-3 py-1.5 whitespace-nowrap"
                  >
                    {field.content}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemInfo;
