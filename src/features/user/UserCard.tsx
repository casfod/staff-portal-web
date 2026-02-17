import { useState, useEffect, useCallback, useMemo } from "react";
import { UserType } from "../../interfaces";
import profilePlaceHolder from "../../assets/img/profile2.jpeg";
import Swal from "sweetalert2";
import Button from "../../ui/Button";
import SpinnerMini from "../../ui/SpinnerMini";
import Input from "../../ui/Input";
import { CustomSelect } from "../../ui/CustomSelect";
import { positions, role } from "./AddUserForm";
import { useUpdateUser } from "./Hooks/useUsers";
import {
  useGlobalSettings,
  useToggleUserUpdate,
} from "../employment-info/Hooks/useEmploymentInfo";
import { Info, Globe, Lock, Unlock } from "lucide-react";
import LoadingDots from "../../ui/LoadingDots";
import NetworkErrorUI from "../../ui/NetworkErrorUI";

interface UserCardProps {
  user: UserType;
}

// Constants moved outside component to prevent recreation
const PROCUREMENT_PERMISSIONS = [
  {
    key: "canView" as const,
    label: "View",
    description: "Can view procurement data",
  },
  {
    key: "canCreate" as const,
    label: "Create",
    description: "Can create new procurement",
  },
  {
    key: "canUpdate" as const,
    label: "Update",
    description: "Can update procurement",
  },
  {
    key: "canDelete" as const,
    label: "Delete",
    description: "Can delete procurement",
  },
] as const;

const FINANCE_PERMISSIONS = [
  {
    key: "canView" as const,
    label: "View",
    description: "Can view finance data",
  },
  {
    key: "canCreate" as const,
    label: "Create",
    description: "Can create new finance records",
  },
  {
    key: "canUpdate" as const,
    label: "Update",
    description: "Can update finance records",
  },
  {
    key: "canDelete" as const,
    label: "Delete",
    description: "Can delete finance records",
  },
] as const;

// Type for permission role
type PermissionRole = "procurementRole" | "financeRole";

const UserCard: React.FC<UserCardProps> = ({ user }) => {
  // All hooks called unconditionally at the top
  const [isEditing, setIsEditing] = useState(false);
  const { UpdateUser, isPending: isUpdatingUser } = useUpdateUser(user?.id!);
  const { toggleUserUpdate, isPending: isTogglingPermission } =
    useToggleUserUpdate();

  const {
    data: settingsData,
    isLoading: isLoadingSettings,
    isError: settingsError,
  } = useGlobalSettings();

  // Memoized values
  const isPending = useMemo(
    () => isUpdatingUser || isTogglingPermission,
    [isUpdatingUser, isTogglingPermission]
  );

  // Initial state
  const [editedUser, setEditedUser] = useState(() => ({
    firstName: user.first_name,
    lastName: user.last_name,
    email: user.email,
    role: user.role,
    position: user.position || "",
    procurementRole: {
      canCreate: user.procurementRole?.canCreate || false,
      canView: user.procurementRole?.canView || false,
      canUpdate: user.procurementRole?.canUpdate || false,
      canDelete: user.procurementRole?.canDelete || false,
    },
    financeRole: {
      canCreate: user.financeRole?.canCreate || false,
      canView: user.financeRole?.canView || false,
      canUpdate: user.financeRole?.canUpdate || false,
      canDelete: user.financeRole?.canDelete || false,
    },
    isDeleted: user.isDeleted || false,
    // CORRECTED: isEmploymentInfoLocked: true means user CANNOT update (locked)
    // isEmploymentInfoLocked: false means user CAN update (unlocked)
    isEmploymentInfoLocked:
      user.employmentInfo?.isEmploymentInfoLocked === true,
  }));

  // Update state when user prop changes
  useEffect(() => {
    setEditedUser({
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      role: user.role,
      position: user.position || "",
      procurementRole: {
        canCreate: user.procurementRole?.canCreate || false,
        canView: user.procurementRole?.canView || false,
        canUpdate: user.procurementRole?.canUpdate || false,
        canDelete: user.procurementRole?.canDelete || false,
      },
      financeRole: {
        canCreate: user.financeRole?.canCreate || false,
        canView: user.financeRole?.canView || false,
        canUpdate: user.financeRole?.canUpdate || false,
        canDelete: user.financeRole?.canDelete || false,
      },
      isDeleted: user.isDeleted || false,
      isEmploymentInfoLocked:
        user.employmentInfo?.isEmploymentInfoLocked === true,
    });
  }, [user]);

  // Memoized handlers
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value, type } = e.target;
      const checked =
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : undefined;

      setEditedUser((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    },
    []
  );

  const handleSelectChange = useCallback(
    (field: string) => (value: string) => {
      setEditedUser((prev) => ({
        ...prev,
        [field]: value,
      }));
    },
    []
  );

  const handlePermissionToggle = useCallback(
    (
      roleType: PermissionRole,
      key: keyof typeof editedUser.procurementRole
    ) => {
      if (!isEditing) return;

      setEditedUser((prev) => ({
        ...prev,
        [roleType]: {
          ...prev[roleType],
          [key]: !prev[roleType][key],
        },
      }));
    },
    [isEditing]
  );

  const resetForm = useCallback(() => {
    setEditedUser({
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      role: user.role,
      position: user.position || "",
      procurementRole: {
        canCreate: user.procurementRole?.canCreate || false,
        canView: user.procurementRole?.canView || false,
        canUpdate: user.procurementRole?.canUpdate || false,
        canDelete: user.procurementRole?.canDelete || false,
      },
      financeRole: {
        canCreate: user.financeRole?.canCreate || false,
        canView: user.financeRole?.canView || false,
        canUpdate: user.financeRole?.canUpdate || false,
        canDelete: user.financeRole?.canDelete || false,
      },
      isDeleted: user.isDeleted || false,
      isEmploymentInfoLocked:
        user.employmentInfo?.isEmploymentInfoLocked === true,
    });
  }, [user]);

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
    resetForm();
  }, [resetForm]);

  // CORRECTED: Toggle employment info permission
  const handleEmploymentInfoPermissionToggle = useCallback(() => {
    if (!isEditing) return;

    const willBeLocked = !editedUser.isEmploymentInfoLocked;
    const action = willBeLocked ? "BLOCK" : "ALLOW";
    const actionText = willBeLocked ? "BLOCK" : "ALLOW";
    const resultText = willBeLocked ? "disabled" : "enabled";

    Swal.fire({
      title: "Change Employment Info Permission",
      html: `
        <div class="text-left">
          <p class="mb-3">Are you sure you want to <strong class="${
            willBeLocked ? "text-red-600" : "text-green-600"
          }">${action}</strong> this user from updating their employment information?</p>
          <div class="bg-blue-50 p-3 rounded-lg text-sm">
            <p class="font-medium text-blue-800 mb-2">How this works:</p>
            <ul class="text-blue-700 space-y-1 text-xs">
              <li>• Individual user permissions ALWAYS take priority over global settings</li>
              <li>• ${
                willBeLocked
                  ? "This user will NOT be able to update even if global settings are unlocked"
                  : "This user will be able to update even if global settings are locked"
              }</li>
            </ul>
          </div>
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#1373B0",
      cancelButtonColor: "#DC3340",
      confirmButtonText: `Yes, ${actionText}`,
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        // Optimistically update UI
        setEditedUser((prev) => ({
          ...prev,
          isEmploymentInfoLocked: willBeLocked,
        }));

        // Call API to update permission
        toggleUserUpdate(
          { userId: user.id!, enabled: !willBeLocked }, // API expects enabled = !locked
          {
            onError: () => {
              // Revert on error
              setEditedUser((prev) => ({
                ...prev,
                isEmploymentInfoLocked: !willBeLocked,
              }));
              Swal.fire({
                title: "Error!",
                text: "Failed to update permission. Please try again.",
                icon: "error",
                timer: 3000,
                showConfirmButton: false,
              });
            },
            onSuccess: () => {
              Swal.fire({
                title: "Success!",
                text: `Employment info updates ${resultText} for this user`,
                icon: "success",
                timer: 2000,
                showConfirmButton: false,
              });
            },
          }
        );
      }
    });
  }, [isEditing, editedUser.isEmploymentInfoLocked, toggleUserUpdate, user.id]);

  const handleSaveChanges = useCallback(() => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to update this user's information?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#1373B0",
      cancelButtonColor: "#DC3340",
      confirmButtonText: "Yes, update it!",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        UpdateUser(
          {
            role: editedUser.role,
            position: editedUser.position,
            procurementRole: editedUser.procurementRole,
            financeRole: editedUser.financeRole,
            first_name: editedUser.firstName,
            last_name: editedUser.lastName,
            email: editedUser.email,
            isDeleted: editedUser.isDeleted,
          },
          {
            onSuccess: () => {
              setIsEditing(false);
              Swal.fire({
                title: "Success!",
                text: "User information updated successfully",
                icon: "success",
                timer: 2000,
                showConfirmButton: false,
              });
            },
            onError: (error) => {
              Swal.fire({
                title: "Error!",
                text: error.message || "Failed to update user",
                icon: "error",
              });
              resetForm();
            },
          }
        );
      }
    });
  }, [UpdateUser, editedUser, resetForm]);

  // Memoized render function for permission sections
  const renderPermissionSection = useCallback(
    (
      title: string,
      permissions: typeof PROCUREMENT_PERMISSIONS | typeof FINANCE_PERMISSIONS,
      roleType: PermissionRole
    ) => (
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">{title}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {permissions.map((permission) => (
            <div
              key={permission.key}
              className={`flex items-center justify-between p-3 border rounded-lg transition-all ${
                isEditing
                  ? "cursor-pointer hover:border-blue-300 hover:bg-blue-50"
                  : "cursor-default"
              } ${
                editedUser[roleType][permission.key]
                  ? "border-blue-300 bg-blue-50"
                  : "border-gray-200"
              }`}
              onClick={() => handlePermissionToggle(roleType, permission.key)}
              role={isEditing ? "button" : "presentation"}
              tabIndex={isEditing ? 0 : -1}
              onKeyDown={
                isEditing
                  ? (e) =>
                      e.key === "Enter" &&
                      handlePermissionToggle(roleType, permission.key)
                  : undefined
              }
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex items-center justify-center w-5 h-5 rounded-full border-2 transition-colors ${
                    editedUser[roleType][permission.key]
                      ? "bg-blue-500 border-blue-500"
                      : "border-gray-300 bg-white"
                  }`}
                  aria-hidden="true"
                >
                  {editedUser[roleType][permission.key] && (
                    <div className="w-2 h-2 bg-white rounded-full" />
                  )}
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {permission.label}
                  </div>
                  <div className="text-xs text-gray-500">
                    {permission.description}
                  </div>
                </div>
              </div>
              {isEditing && (
                <span className="text-xs text-gray-400">Click to toggle</span>
              )}
            </div>
          ))}
        </div>
      </div>
    ),
    [isEditing, editedUser, handlePermissionToggle]
  );

  // Loading and error states
  if (isLoadingSettings) {
    return <LoadingDots />;
  }

  if (settingsError) {
    return <NetworkErrorUI />;
  }

  // CORRECTED: Determine if user can update employment info
  // const canUpdateEmployment = !editedUser.isEmploymentInfoLocked;
  const globalLocked = settingsData?.data.globalEmploymentInfoLock;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 max-w-2xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start gap-4 mb-6">
        <img
          src={profilePlaceHolder}
          alt={`${user.first_name} ${user.last_name}`}
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-gray-200 flex-shrink-0"
          loading="lazy"
        />
        <div className="flex-1 min-w-0 w-full">
          {isEditing ? (
            <div className="space-y-3 w-full">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  name="firstName"
                  value={editedUser.firstName}
                  onChange={handleInputChange}
                  placeholder="First Name"
                  className="text-sm"
                  disabled={isPending}
                  aria-label="First Name"
                />
                <Input
                  name="lastName"
                  value={editedUser.lastName}
                  onChange={handleInputChange}
                  placeholder="Last Name"
                  className="text-sm"
                  disabled={isPending}
                  aria-label="Last Name"
                />
              </div>
              <Input
                name="email"
                type="email"
                value={editedUser.email}
                onChange={handleInputChange}
                placeholder="Email Address"
                className="text-sm"
                disabled={isPending}
                aria-label="Email Address"
              />
            </div>
          ) : (
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
                {`${user.first_name} ${user.last_name}`}
              </h2>
              <p className="text-sm sm:text-base text-gray-600 truncate">
                {user.email}
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.isDeleted
                      ? "bg-red-100 text-red-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {user.isDeleted ? "Inactive" : "Active"}
                </span>
                <span className="text-sm text-gray-500">•</span>
                <span className="text-sm text-gray-600 capitalize">
                  {user.role.toLowerCase().replace("-", " ")}
                </span>
              </div>
              {user.position && (
                <p className="text-sm text-gray-600 mt-1">{user.position}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Role, Position and Status Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            User Role
          </label>
          {isEditing ? (
            <CustomSelect
              value={editedUser.role}
              onChange={handleSelectChange("role")}
              options={role}
              placeholder="Select role"
              required
              disabled={isPending}
            />
          ) : (
            <p className="text-sm text-gray-900 p-2 bg-gray-50 rounded-md capitalize">
              {user.role.toLowerCase().replace("-", " ")}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Position
          </label>
          {isEditing ? (
            <CustomSelect
              value={editedUser.position}
              onChange={handleSelectChange("position")}
              options={positions}
              placeholder="Select position"
              required
              disabled={isPending}
            />
          ) : (
            <p className="text-sm text-gray-900 p-2 bg-gray-50 rounded-md">
              {user.position || "Not specified"}
            </p>
          )}
        </div>

        {user.isDeleted && isEditing && (
          <div className="flex items-center sm:col-span-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="reactivateAccount"
                checked={!editedUser.isDeleted}
                onChange={(e) => {
                  setEditedUser((prev) => ({
                    ...prev,
                    isDeleted: !e.target.checked,
                  }));
                }}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                disabled={isPending}
              />
              <span className="text-sm text-gray-700">
                Reactivate this account
              </span>
            </label>
          </div>
        )}
      </div>

      {/* Employment Info Permission Section - CORRECTED */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Employment Information Permission
        </label>

        {isEditing ? (
          <div className="space-y-3">
            {/* Main Toggle Card - CORRECTED */}
            <div
              className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border-2 transition-all cursor-pointer ${
                editedUser.isEmploymentInfoLocked
                  ? "border-red-300 bg-red-50" // Locked = Red
                  : "border-green-300 bg-green-50" // Unlocked = Green
              }`}
              onClick={handleEmploymentInfoPermissionToggle}
              role="button"
              tabIndex={0}
              onKeyDown={(e) =>
                e.key === "Enter" && handleEmploymentInfoPermissionToggle()
              }
            >
              <div className="flex items-start gap-3 mb-3 sm:mb-0">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors flex-shrink-0 ${
                    editedUser.isEmploymentInfoLocked
                      ? "bg-red-500" // Locked = Red
                      : "bg-green-500" // Unlocked = Green
                  }`}
                >
                  {editedUser.isEmploymentInfoLocked ? (
                    <Lock className="h-4 w-4 text-white" /> // Locked = Lock icon
                  ) : (
                    <Unlock className="h-4 w-4 text-white" /> // Unlocked = Unlock icon
                  )}
                </div>
                <div>
                  <span className="text-xs font-semibold text-gray-900 block">
                    {editedUser.isEmploymentInfoLocked
                      ? "User CANNOT update employment information" // Locked = Cannot update
                      : "User CAN update employment information"}{" "}
                    // Unlocked = Can update
                  </span>
                  <span className="text-xs text-gray-600 mt-1 block">
                    {editedUser.isEmploymentInfoLocked
                      ? "This user is individually LOCKED"
                      : "This user is individually UNLOCKED"}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-end sm:ml-4">
                <span className="text-xs bg-white px-3 py-1.5 rounded-full border border-gray-200 font-medium">
                  Click to toggle
                </span>
              </div>
            </div>

            {/* Priority Explanation Card */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-blue-800 mb-2">
                    Priority Rule: Individual Settings Override Global
                  </h4>
                  <div className="space-y-2 text-sm text-blue-700">
                    <p className="flex items-start gap-2">
                      <span className="font-medium min-w-[80px]">
                        Current Status:
                      </span>
                      <span>
                        {editedUser.isEmploymentInfoLocked
                          ? "🔒 This user is LOCKED. They CANNOT update their employment information, even if the global setting is unlocked."
                          : "🔓 This user is UNLOCKED. They can update their employment information regardless of the global setting."}
                      </span>
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 text-xs">
                      <div className="flex items-center gap-2 bg-white p-2 rounded border border-blue-100">
                        <Globe className="h-4 w-4 text-blue-500" />
                        <span>
                          <strong>Global Setting:</strong>{" "}
                          {globalLocked ? "Locked" : "Unlocked"}
                          <span className="block text-blue-600 mt-0.5">
                            (Only applies if user is unlocked)
                          </span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2 bg-white p-2 rounded border border-blue-100">
                        {editedUser.isEmploymentInfoLocked ? (
                          <Lock className="h-4 w-4 text-red-500" />
                        ) : (
                          <Unlock className="h-4 w-4 text-green-500" />
                        )}
                        <span>
                          <strong>User Setting:</strong>{" "}
                          {editedUser.isEmploymentInfoLocked
                            ? "Locked"
                            : "Unlocked"}
                          <span className="block text-blue-600 mt-0.5">
                            (Always takes priority)
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Matrix - CORRECTED */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div
                className={`p-2 rounded flex items-center gap-2 ${
                  !editedUser.isEmploymentInfoLocked && globalLocked
                    ? "bg-green-100 border border-green-200"
                    : "bg-gray-100 border border-gray-200"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    !editedUser.isEmploymentInfoLocked && globalLocked
                      ? "bg-green-500"
                      : "bg-gray-400"
                  }`}
                />
                <span>
                  <strong>If Global is LOCKED:</strong>{" "}
                  {!editedUser.isEmploymentInfoLocked
                    ? "✅ User CAN update (priority override)"
                    : "❌ User CANNOT update"}
                </span>
              </div>
              <div
                className={`p-2 rounded flex items-center gap-2 ${
                  !editedUser.isEmploymentInfoLocked && !globalLocked
                    ? "bg-green-100 border border-green-200"
                    : editedUser.isEmploymentInfoLocked && !globalLocked
                    ? "bg-red-100 border border-red-200"
                    : "bg-gray-100 border border-gray-200"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    !editedUser.isEmploymentInfoLocked && !globalLocked
                      ? "bg-green-500"
                      : editedUser.isEmploymentInfoLocked && !globalLocked
                      ? "bg-red-500"
                      : "bg-gray-400"
                  }`}
                />
                <span>
                  <strong>If Global is UNLOCKED:</strong>{" "}
                  {!editedUser.isEmploymentInfoLocked
                    ? "✅ User CAN update"
                    : "❌ User CANNOT update (priority override)"}
                </span>
              </div>
            </div>
          </div>
        ) : (
          // View Mode - CORRECTED
          <div className="space-y-3">
            <div
              className={`flex items-center gap-3 p-4 rounded-lg border ${
                user.employmentInfo?.isEmploymentInfoLocked === true
                  ? "bg-red-50 border-red-200" // Locked = Red
                  : "bg-green-50 border-green-200" // Unlocked = Green
              }`}
            >
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  user.employmentInfo?.isEmploymentInfoLocked === true
                    ? "bg-red-500" // Locked = Red
                    : "bg-green-500" // Unlocked = Green
                }`}
              >
                {user.employmentInfo?.isEmploymentInfoLocked === true ? (
                  <Lock className="h-5 w-5 text-white" /> // Locked = Lock icon
                ) : (
                  <Unlock className="h-5 w-5 text-white" /> // Unlocked = Unlock icon
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs font-semibold text-gray-900">
                    {user.employmentInfo?.isEmploymentInfoLocked === true
                      ? "Employment Info: DISABLED"
                      : "Employment Info: ENABLED"}
                  </span>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                      user.employmentInfo?.isEmploymentInfoLocked === true
                        ? "bg-red-100 text-red-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {user.employmentInfo?.isEmploymentInfoLocked === true
                      ? "Locked"
                      : "Unlocked"}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {user.employmentInfo?.isEmploymentInfoLocked === true
                    ? "This user is individually locked. They cannot update their employment information, even if global settings allow it."
                    : "This user is individually unlocked. They can update their employment information regardless of global settings."}
                </p>
              </div>
            </div>

            {/* Quick status badges */}
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 text-xs bg-gray-100 px-2 py-1 rounded">
                <Globe className="h-3 w-3" />
                Global: {globalLocked ? "Locked" : "Unlocked"}
              </span>
              <span className="inline-flex items-center gap-1 text-xs bg-gray-100 px-2 py-1 rounded">
                {user.employmentInfo?.isEmploymentInfoLocked === true ? (
                  <Lock className="h-3 w-3 text-red-600" />
                ) : (
                  <Unlock className="h-3 w-3 text-green-600" />
                )}
                Individual:{" "}
                {user.employmentInfo?.isEmploymentInfoLocked === true
                  ? "Locked"
                  : "Unlocked"}
              </span>
              <span className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                <Info className="h-3 w-3" />
                Individual takes priority
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Permissions Sections */}
      {renderPermissionSection(
        "Procurement Permissions",
        PROCUREMENT_PERMISSIONS,
        "procurementRole"
      )}
      {renderPermissionSection(
        "Finance Permissions",
        FINANCE_PERMISSIONS,
        "financeRole"
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
        {isEditing ? (
          <>
            <Button
              onClick={handleSaveChanges}
              disabled={isPending}
              className="flex-1 w-full sm:w-auto"
            >
              {isPending ? <SpinnerMini /> : "Save Changes"}
            </Button>
            <Button
              variant="secondary"
              onClick={handleCancelEdit}
              disabled={isPending}
              className="flex-1 w-full sm:w-auto"
            >
              Cancel
            </Button>
          </>
        ) : (
          <Button
            onClick={() => setIsEditing(true)}
            className="flex-1 w-full sm:w-auto"
          >
            Edit User
          </Button>
        )}
      </div>
    </div>
  );
};

export default UserCard;
