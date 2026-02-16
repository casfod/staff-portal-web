import { useState, useEffect } from "react";
import { UserType } from "../../interfaces";
import profilePlaceHolder from "../../assets/img/profile2.jpeg";
import Swal from "sweetalert2";
import Button from "../../ui/Button";
import SpinnerMini from "../../ui/SpinnerMini";
import Input from "../../ui/Input";
import { CustomSelect } from "../../ui/CustomSelect";
import { positions, role } from "./AddUserForm";
import { useUpdateUser } from "./Hooks/useUsers";
import { useToggleUserUpdate } from "../employment-info/Hooks/useEmploymentInfo";

interface UserCardProps {
  user: UserType;
}

const procurementPermissions = [
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

const financePermissions = [
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

const UserCard: React.FC<UserCardProps> = ({ user }) => {
  const [isEditing, setIsEditing] = useState(false);
  const { UpdateUser, isPending: isUpdatingUser } = useUpdateUser(user?.id!);
  const { toggleUserUpdate, isPending: isTogglingPermission } =
    useToggleUserUpdate();

  const isPending = isUpdatingUser || isTogglingPermission;

  const [editedUser, setEditedUser] = useState({
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
      user.employmentInfo?.isEmploymentInfoLocked !== false,
  });

  // Update local state when user prop changes
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
        user.employmentInfo?.isEmploymentInfoLocked !== false,
    });
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setEditedUser((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      setEditedUser((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSelectChange = (field: string) => (value: string) => {
    setEditedUser((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePermissionToggle = (
    roleType: "procurementRole" | "financeRole",
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
  };

  const handleEmploymentInfoPermissionToggle = () => {
    if (!isEditing) return;

    const newValue = !editedUser.isEmploymentInfoLocked;

    // Optimistically update UI
    setEditedUser((prev) => ({
      ...prev,
      isEmploymentInfoLocked: newValue,
    }));

    // Call API to update permission
    toggleUserUpdate(
      { userId: user.id!, enabled: newValue },
      {
        onError: () => {
          // Revert on error
          setEditedUser((prev) => ({
            ...prev,
            isEmploymentInfoLocked: !newValue,
          }));
        },
      }
    );
  };

  const handleSaveChanges = () => {
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
  };

  const resetForm = () => {
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
        user.employmentInfo?.isEmploymentInfoLocked !== false,
    });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    resetForm();
  };

  const renderPermissionSection = (
    title: string,
    permissions: typeof procurementPermissions | typeof financePermissions,
    roleType: "procurementRole" | "financeRole"
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
          >
            <div className="flex items-center gap-3">
              <div
                className={`flex items-center justify-center w-5 h-5 rounded-full border-2 transition-colors ${
                  editedUser[roleType][permission.key]
                    ? "bg-blue-500 border-blue-500"
                    : "border-gray-300 bg-white"
                }`}
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
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 max-w-2xl mx-auto">
      {/* Header Section */}
      <div className="flex items-start gap-4 mb-6">
        <img
          src={profilePlaceHolder}
          alt={`${user.first_name} ${user.last_name}`}
          className="w-20 h-20 rounded-full object-cover border-2 border-gray-200 flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input
                  name="firstName"
                  value={editedUser.firstName}
                  onChange={handleInputChange}
                  placeholder="First Name"
                  className="text-sm"
                  disabled={isPending}
                />
                <Input
                  name="lastName"
                  value={editedUser.lastName}
                  onChange={handleInputChange}
                  placeholder="Last Name"
                  className="text-sm"
                  disabled={isPending}
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
              />
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 truncate">
                {`${user.first_name} ${user.last_name}`}
              </h2>
              <p className="text-gray-600 truncate">{user.email}</p>
              <div className="flex items-center gap-2 mt-1">
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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
          <div className="flex items-center md:col-span-2">
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

      {/* Update Permission Toggle */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Employment Info Update Permission
          </label>
          {isEditing ? (
            <div
              className={`flex items-center justify-between p-3 bg-gray-50 rounded-lg border transition-all cursor-pointer ${
                editedUser.isEmploymentInfoLocked
                  ? "border-blue-300 bg-blue-50"
                  : "border-gray-200"
              }`}
              onClick={handleEmploymentInfoPermissionToggle}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex items-center justify-center w-5 h-5 rounded-full border-2 transition-colors ${
                    editedUser.isEmploymentInfoLocked
                      ? "bg-blue-500 border-blue-500"
                      : "border-gray-300 bg-white"
                  }`}
                >
                  {editedUser.isEmploymentInfoLocked && (
                    <div className="w-2 h-2 bg-white rounded-full" />
                  )}
                </div>
                <span className="text-sm text-gray-700">
                  Allow user to update employment information
                </span>
              </div>
              <span className="text-xs text-gray-500">
                {editedUser.isEmploymentInfoLocked ? "Enabled" : "Disabled"}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
              <div
                className={`w-2 h-2 rounded-full ${
                  user.employmentInfo?.isEmploymentInfoLocked !== false
                    ? "bg-green-500"
                    : "bg-red-500"
                }`}
              />
              <span className="text-sm text-gray-900">
                Employment info updates:{" "}
                {user.employmentInfo?.isEmploymentInfoLocked !== false
                  ? "Enabled"
                  : "Disabled"}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Permissions Sections */}
      {renderPermissionSection(
        "Procurement Permissions",
        procurementPermissions,
        "procurementRole"
      )}
      {renderPermissionSection(
        "Finance Permissions",
        financePermissions,
        "financeRole"
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t border-gray-200">
        {isEditing ? (
          <>
            <Button
              onClick={handleSaveChanges}
              disabled={isPending}
              className="flex-1"
            >
              {isPending ? <SpinnerMini /> : "Save Changes"}
            </Button>
            <Button
              variant="secondary"
              onClick={handleCancelEdit}
              disabled={isPending}
              className="flex-1"
            >
              Cancel
            </Button>
          </>
        ) : (
          <Button onClick={() => setIsEditing(true)} className="flex-1">
            Edit User
          </Button>
        )}
      </div>
    </div>
  );
};

export default UserCard;
