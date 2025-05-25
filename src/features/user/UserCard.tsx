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
    isDeleted: user.isDeleted,
  });

  const { UpdateUser, isPending } = useUpdateUser(user?.id!);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined;

    setEditedUser((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? !checked : value,
    }));
  };

  const handleSaveChanges = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to update this user's information?",
      showCancelButton: true,
      confirmButtonColor: "#1373B0",
      cancelButtonColor: "#DC3340",
      confirmButtonText: "Yes, update it!",
      customClass: { popup: "custom-style" },
      animation: false,
    }).then((result) => {
      if (result.isConfirmed) {
        UpdateUser(
          {
            role: editedUser.role,
            first_name: editedUser.firstName,
            last_name: editedUser.lastName,
            email: editedUser.email,
            isDeleted: editedUser.isDeleted,
          },
          {
            onSuccess: () => {
              setIsEditing(false);
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
      isDeleted: user.isDeleted,
    });
  };

  return (
    <div className="flex flex-col items-center gap-2 px-3 md:px-4 py-8 md:py-4">
      <div className="min-w-[280px] md:min-w-[350px] rounded-lg">
        <div className="flex flex-col gap-2">
          <div className="flex items-center space-x-4">
            <img
              src={profilePlaceHolder}
              alt={`Photo of ${user?.first_name} ${user?.last_name}`}
              className="w-24 h-24 rounded-full object-cover border"
            />
            <div className="flex flex-col gap-1">
              {isEditing ? (
                <>
                  <Input
                    name="firstName"
                    value={editedUser.firstName}
                    onChange={handleInputChange}
                    className="text-sm border-2 px-1"
                  />
                  <Input
                    name="lastName"
                    value={editedUser.lastName}
                    onChange={handleInputChange}
                    className="text-sm border-2 px-1"
                  />
                </>
              ) : (
                <h2 className="text-lg font-semibold text-gray-600">
                  {`${user?.first_name} ${user?.last_name}`}
                </h2>
              )}
              {isEditing ? (
                <Input
                  name="email"
                  value={editedUser.email}
                  onChange={handleInputChange}
                  className="text-sm border-2 px-1"
                />
              ) : (
                <p className="text-sm text-gray-600">{user?.email}</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col mt-4 text-sm gap-2">
          <div className="flex items-center justify-between">
            <p>
              <span className="font-semibold">Status:</span>{" "}
              <span
                className={`inline-block text-center px-2 py-1 rounded-full text-xs ${
                  user.isDeleted
                    ? "bg-red-100 text-red-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {user?.isDeleted ? "Inactive" : "Active"}
              </span>
            </p>

            <div>
              <label
                htmlFor={`role-${user?.id}`}
                className="text-sm md:text-base mr-2"
              >
                Role:
              </label>
              {isEditing ? (
                <select
                  id={`role-${user?.id}`}
                  name="role"
                  value={editedUser.role}
                  onChange={handleInputChange}
                  className="text-xs md:text-sm border p-1 rounded"
                  disabled={isPending}
                >
                  <option value="ADMIN">ADMIN</option>
                  <option value="REVIEWER">REVIEWER</option>
                  <option value="STAFF">STAFF</option>
                </select>
              ) : (
                <span className="text-sm">{user.role}</span>
              )}
            </div>
          </div>

          {user.isDeleted && isEditing && (
            <div className="flex items-center gap-2 mt-2">
              <label className="flex items-center gap-1 text-sm">
                <input
                  type="checkbox"
                  name="isDeleted"
                  checked={!editedUser.isDeleted}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                Reactivate this account
              </label>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        {isEditing ? (
          <>
            <Button
              size="small"
              onClick={handleSaveChanges}
              disabled={isPending}
            >
              {isPending ? <SpinnerMini /> : "Save Changes"}
            </Button>
            <Button
              size="small"
              variant="secondary"
              onClick={handleCancelEdit}
              disabled={isPending}
            >
              Cancel
            </Button>
          </>
        ) : (
          <Button size="small" onClick={() => setIsEditing(true)}>
            Edit User
          </Button>
        )}
      </div>
    </div>
  );
};

export default UserCard;
