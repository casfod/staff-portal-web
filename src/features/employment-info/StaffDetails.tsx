// src/features/employment-info/StaffDetails.tsx
import {
  AlertCircle,
  Banknote,
  Briefcase,
  Edit,
  Phone,
  User,
} from "lucide-react";
import { useGlobalSettings } from "./Hooks/useEmploymentInfo";
import SpinnerMini from "../../ui/SpinnerMini";
import Button from "../../ui/Button";
import { useNavigate, useParams } from "react-router-dom";
import { UserType } from "../../interfaces";
import { SlMagnifier } from "react-icons/sl";
import { localStorageUser } from "../../utils/localStorageUser";

interface StaffDetailsProps {
  staffInfo: UserType;
}

const StaffDetails = ({ staffInfo }: StaffDetailsProps) => {
  const currentUser = localStorageUser();
  const navigate = useNavigate();
  const { userId: userParamId } = useParams();

  // Determine if we're viewing the current user or another user
  const isViewingSelf = !userParamId || userParamId === currentUser?.id;
  const isSuperAdmin = currentUser?.role === "SUPER-ADMIN";

  // Get global settings for lock status
  const { data: settingsData, isLoading: isLoadingSettings } =
    useGlobalSettings();

  if (isLoadingSettings) {
    return (
      <div className="flex justify-center items-center h-64">
        <SpinnerMini />
      </div>
    );
  }

  const handleEdit = () => {
    navigate(`/human-resources/staff-information/${staffInfo?.id}/edit`);
  };

  const handleInspect = () => {
    navigate(`/human-resources/staff-information/${staffInfo?.id}/view`);
  };

  // Get employment info directly from the staffInfo prop
  const employmentInfo = staffInfo.employmentInfo || {};
  const isProfileComplete = employmentInfo.isProfileComplete || false;

  // Permission logic based on backend
  const isUserLocked = employmentInfo.isEmploymentInfoLocked === true;
  const isGloballyLocked =
    settingsData?.data?.globalEmploymentInfoLock === true;

  // Super-admin can always update
  // Regular users can only update their own info if not locked
  const canUpdate = isSuperAdmin
    ? true // Super-admin can update anyone
    : isViewingSelf && !isUserLocked && !isGloballyLocked;

  const canDisplayInspectButton =
    !userParamId && currentUser?.id !== staffInfo.id;

  const formatDate = (date: string | Date | undefined) => {
    if (!date) return "Not specified";
    return new Date(date).toLocaleDateString("en-GB");
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-300 overflow-hidden">
      {/* Header */}
      <div className="bg-gray-100 px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">
            Employment Information
          </h2>
          <div className="flex items-center gap-3">
            {!isProfileComplete && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                <AlertCircle className="h-3 w-3" />
                Profile Incomplete
              </span>
            )}
            {canUpdate && (
              <Button
                onClick={handleEdit}
                className="inline-flex items-center gap-2"
                size="small"
              >
                <Edit className="h-4 w-4" />
                Edit
              </Button>
            )}
          </div>
        </div>
        {/* Show permission status if updates are disabled */}
        {!canUpdate && !isSuperAdmin && (
          <div className="mt-2 text-xs text-gray-500">
            {isGloballyLocked ? (
              <span className="text-amber-600">
                ⚠️ Updates are currently disabled globally
              </span>
            ) : isUserLocked ? (
              <span className="text-amber-600">
                ⚠️ This user's permission to update is currently disabled
              </span>
            ) : !isViewingSelf ? (
              <span className="text-amber-600">
                ⚠️ You can only edit your own information
              </span>
            ) : null}
          </div>
        )}
        {isSuperAdmin && !isViewingSelf && (
          <div className="mt-2 text-xs text-blue-600">
            ⚡ Viewing as Super Administrator
          </div>
        )}
      </div>

      {/* Personal Details Section */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <User className="h-5 w-5 text-gray-600" />
          <h3 className="text-md font-medium text-gray-900">
            Personal Details
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-gray-600">Full Name</p>
            <p className="text-sm font-medium">
              {employmentInfo.personalDetails?.fullName ||
                `${staffInfo.first_name} ${staffInfo.last_name}` ||
                "Not specified"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Date of Birth</p>
            <p className="text-sm">
              {formatDate(employmentInfo.personalDetails?.birthDate)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Marital Status</p>
            <p className="text-sm">
              {employmentInfo.personalDetails?.maritalStatus || "Not specified"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600">State of Origin</p>
            <p className="text-sm">
              {employmentInfo.personalDetails?.stateOfOrigin || "Not specified"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600">LGA</p>
            <p className="text-sm">
              {employmentInfo.personalDetails?.lga || "Not specified"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Religion</p>
            <p className="text-sm">
              {employmentInfo.personalDetails?.religion || "Not specified"}
            </p>
          </div>
          <div className="md:col-span-3">
            <p className="text-xs text-gray-600">Address</p>
            <p className="text-sm">
              {employmentInfo.personalDetails?.address || "Not specified"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Home Phone</p>
            <p className="text-sm">
              {employmentInfo.personalDetails?.homePhone || "Not specified"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Cell Phone</p>
            <p className="text-sm">
              {employmentInfo.personalDetails?.cellPhone || "Not specified"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600">NIN Number</p>
            <p className="text-sm font-mono">
              {employmentInfo.personalDetails?.ninNumber
                ? `••••${employmentInfo.personalDetails.ninNumber.slice(-4)}`
                : "Not specified"}
            </p>
          </div>
        </div>

        {/* Spouse Information - Conditional */}
        {employmentInfo.personalDetails?.maritalStatus === "Married" && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              Spouse Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-600">Spouse Name</p>
                <p className="text-sm">
                  {employmentInfo.personalDetails?.spouseName ||
                    "Not specified"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Spouse Phone</p>
                <p className="text-sm">
                  {employmentInfo.personalDetails?.spousePhone ||
                    "Not specified"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Number of Children</p>
                <p className="text-sm">
                  {employmentInfo.personalDetails?.numberOfChildren || 0}
                </p>
              </div>
              <div className="md:col-span-3">
                <p className="text-xs text-gray-600">Spouse Address</p>
                <p className="text-sm">
                  {employmentInfo.personalDetails?.spouseAddress ||
                    "Not specified"}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Job Details Section */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <Briefcase className="h-5 w-5 text-gray-600" />
          <h3 className="text-md font-medium text-gray-900">Job Information</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-gray-600">Job Title</p>
            <p className="text-sm font-medium">
              {employmentInfo.jobDetails?.title ||
                staffInfo.position ||
                staffInfo.role ||
                "Not specified"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Staff ID</p>
            <p className="text-sm">
              {employmentInfo.jobDetails?.idNo || "Not specified"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Work Location</p>
            <p className="text-sm">
              {employmentInfo.jobDetails?.workLocation || "Not specified"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Work Email</p>
            <p className="text-sm">
              {employmentInfo.jobDetails?.workEmail ||
                staffInfo.email ||
                "Not specified"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Work Phone</p>
            <p className="text-sm">
              {employmentInfo.jobDetails?.workPhone || "Not specified"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Work Cell Phone</p>
            <p className="text-sm">
              {employmentInfo.jobDetails?.workCellPhone || "Not specified"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Start Date</p>
            <p className="text-sm">
              {formatDate(employmentInfo.jobDetails?.startDate)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600">End Date</p>
            <p className="text-sm">
              {employmentInfo.jobDetails?.endDate
                ? formatDate(employmentInfo.jobDetails.endDate)
                : "Current"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Supervisor</p>
            <p className="text-sm">
              {employmentInfo.jobDetails?.supervisor || "Not specified"}
            </p>
          </div>
        </div>
      </div>

      {/* Emergency Contact Section */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <Phone className="h-5 w-5 text-gray-600" />
          <h3 className="text-md font-medium text-gray-900">
            Emergency Contact
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-3">
            <p className="text-xs text-gray-600">Full Name</p>
            <p className="text-sm font-medium">
              {employmentInfo.emergencyContact?.fullName || "Not specified"}
            </p>
          </div>
          <div className="md:col-span-3">
            <p className="text-xs text-gray-600">Address</p>
            <p className="text-sm">
              {employmentInfo.emergencyContact?.address || "Not specified"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Primary Phone</p>
            <p className="text-sm">
              {employmentInfo.emergencyContact?.primaryPhone || "Not specified"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Alternate Phone</p>
            <p className="text-sm">
              {employmentInfo.emergencyContact?.cellPhone || "Not specified"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Relationship</p>
            <p className="text-sm">
              {employmentInfo.emergencyContact?.relationship || "Not specified"}
            </p>
          </div>
        </div>
      </div>

      {/* Bank Details Section */}
      <div className="px-6 py-4">
        <div className="flex items-center gap-2 mb-4">
          <Banknote className="h-5 w-5 text-gray-600" />
          <h3 className="text-md font-medium text-gray-900">Bank Details</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-gray-600">Bank Name</p>
            <p className="text-sm">
              {employmentInfo.bankDetails?.bankName || "Not specified"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Account Name</p>
            <p className="text-sm">
              {employmentInfo.bankDetails?.accountName || "Not specified"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Account Number</p>
            <p className="text-sm font-mono">
              {employmentInfo.bankDetails?.accountNumber
                ? `••••${employmentInfo.bankDetails.accountNumber.slice(-4)}`
                : "Not specified"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Sort Code</p>
            <p className="text-sm">
              {employmentInfo.bankDetails?.bankSortCode || "Not specified"}
            </p>
          </div>
        </div>
      </div>

      {/* Inspect Button - Only show in list view when viewing own list */}
      {canDisplayInspectButton && (
        <div className="w-full flex items-center justify-center p-6 border-t border-gray-200">
          <button
            onClick={handleInspect}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-buttonColor hover:bg-buttonColorHover"
          >
            <SlMagnifier className="mr-2" />
            <span>View Full Details</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default StaffDetails;
