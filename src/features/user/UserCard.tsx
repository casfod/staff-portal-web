import { useState } from "react";
import { UserType } from "../../interfaces";
import { useUpdateUser } from "./Hooks/useUpdateUser";
import profilePlaceHolder from "../../assets/img/profile2.jpeg";
import Swal from "sweetalert2";
import Button from "../../ui/Button";
import SpinnerMini from "../../ui/SpinnerMini";
import Input from "../../ui/Input";

interface UserCardProps {
  user: UserType;
}

const UserCard: React.FC<UserCardProps> = ({ user }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({
    firstName: user.first_name,
    lastName: user.last_name,
    email: user.email,
    role: user.role,
    procurementRole: {
      canCreate: user.procurementRole?.canCreate || false,
      canView: user.procurementRole?.canView || false,
      canUpdate: user.procurementRole?.canUpdate || false,
      canDelete: user.procurementRole?.canDelete || false,
    },
    isDeleted: user.isDeleted,
  });

  const { UpdateUser, isPending } = useUpdateUser(user?.id!);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      // Handle nested procurementRole properties
      if (name.startsWith("procurementRole.")) {
        const roleKey = name.split(
          "."
        )[1] as keyof typeof editedUser.procurementRole;
        setEditedUser((prev) => ({
          ...prev,
          procurementRole: {
            ...prev.procurementRole,
            [roleKey]: checked,
          },
        }));
      } else {
        setEditedUser((prev) => ({
          ...prev,
          [name]: checked,
        }));
      }
    } else {
      setEditedUser((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleProcurementRoleToggle = (
    key: keyof typeof editedUser.procurementRole
  ) => {
    setEditedUser((prev) => ({
      ...prev,
      procurementRole: {
        ...prev.procurementRole,
        [key]: !prev.procurementRole[key],
      },
    }));
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
      customClass: { popup: "custom-style" },
      animation: false,
    }).then((result) => {
      if (result.isConfirmed) {
        UpdateUser(
          {
            role: editedUser.role,
            procurementRole: editedUser.procurementRole,
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
                animation: false,
              });
            },
            onError: (error) => {
              Swal.fire({
                title: "Error!",
                text: error.message,
                icon: "error",
                animation: false,
              });
              // Reset to original values on error
              setEditedUser({
                firstName: user.first_name,
                lastName: user.last_name,
                email: user.email,
                role: user.role,
                procurementRole: {
                  canCreate: user.procurementRole?.canCreate || false,
                  canView: user.procurementRole?.canView || false,
                  canUpdate: user.procurementRole?.canUpdate || false,
                  canDelete: user.procurementRole?.canDelete || false,
                },
                isDeleted: user.isDeleted,
              });
            },
          }
        );
      }
    });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedUser({
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      role: user.role,
      procurementRole: {
        canCreate: user.procurementRole?.canCreate || false,
        canView: user.procurementRole?.canView || false,
        canUpdate: user.procurementRole?.canUpdate || false,
        canDelete: user.procurementRole?.canDelete || false,
      },
      isDeleted: user.isDeleted,
    });
  };

  const procurementPermissions = [
    { key: "canView", label: "View", description: "Can view procurement data" },
    {
      key: "canCreate",
      label: "Create",
      description: "Can create new procurement",
    },
    {
      key: "canUpdate",
      label: "Update",
      description: "Can update procurement",
    },
    {
      key: "canDelete",
      label: "Delete",
      description: "Can delete procurement",
    },
  ] as const;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 max-w-2xl mx-auto">
      {/* Header Section */}
      <div className="flex items-start space-x-4 mb-6">
        <img
          src={profilePlaceHolder}
          alt={`Photo of ${user?.first_name} ${user?.last_name}`}
          className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
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
                {`${user?.first_name} ${user?.last_name}`}
              </h2>
              <p className="text-gray-600 truncate">{user?.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.isDeleted
                      ? "bg-red-100 text-red-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {user?.isDeleted ? "Inactive" : "Active"}
                </span>
                <span className="text-sm text-gray-500">•</span>
                <span className="text-sm text-gray-600 capitalize">
                  {user.role.toLowerCase().replace("-", " ")}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Role and Status Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            User Role
          </label>
          {isEditing ? (
            <select
              name="role"
              value={editedUser.role}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isPending}
            >
              <option value="STAFF">Staff</option>
              <option value="REVIEWER">Reviewer</option>
              <option value="ADMIN">Admin</option>
              <option value="SUPER-ADMIN">Super Admin</option>
            </select>
          ) : (
            <p className="text-sm text-gray-900 p-2 bg-gray-50 rounded-md">
              {user.role}
            </p>
          )}
        </div>

        {user.isDeleted && isEditing && (
          <div className="flex items-center">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="isDeleted"
                checked={!editedUser.isDeleted}
                onChange={handleInputChange}
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

      {/* Procurement Permissions Section */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          Procurement Permissions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {procurementPermissions.map((permission) => (
            <div
              key={permission.key}
              className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-all ${
                isEditing
                  ? "hover:border-blue-300 hover:bg-blue-50"
                  : "cursor-default"
              } ${
                editedUser.procurementRole[permission.key]
                  ? "border-blue-300 bg-blue-50"
                  : "border-gray-200"
              }`}
              onClick={() =>
                isEditing && handleProcurementRoleToggle(permission.key)
              }
            >
              <div className="flex items-center space-x-3">
                {isEditing ? (
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      editedUser.procurementRole[permission.key]
                        ? "bg-blue-500 border-blue-500"
                        : "border-gray-300"
                    }`}
                  >
                    {editedUser.procurementRole[permission.key] && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                ) : (
                  <div
                    className={`w-3 h-3 rounded-full ${
                      editedUser.procurementRole[permission.key]
                        ? "bg-green-500"
                        : "bg-gray-300"
                    }`}
                  />
                )}
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
