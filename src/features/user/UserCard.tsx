import { useState } from "react";
import { UserType } from "../../interfaces";
import { useUpdateUserRole } from "./userHooks/useUpdateUserRole";
import profilePlaceHolder from "../../assets/img/profile2.jpeg";

interface UserCardProps {
  user: UserType;
}

const UserCard: React.FC<UserCardProps> = ({ user }) => {
  const [role, setRole] = useState(user.role);

  const { UpdateUserRole, isPending } = useUpdateUserRole(user?.id!);

  const handleStatusChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newRole = e.target.value;
    setRole(newRole);

    UpdateUserRole({ role: newRole });

    setRole(user.role);
  };

  return (
    <div>
      <div className="min-w-[280px] p-4 bg-white  rounded-lg">
        <div className="flex flex-col gap-2">
          <div className="flex items-center space-x-4">
            <img
              src={profilePlaceHolder}
              alt={`Photo of ${user.first_name} ${user.last_name}`}
              className="w-24 h-24 rounded-full object-cover border"
            />
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                {`${user.first_name} ${user.last_name}`}
              </h2>
              <p className="text-sm text-gray-600">{user.role}</p>
            </div>
          </div>

          <p>
            <span className="font-semibold">Email:</span> {user.email}
          </p>
        </div>

        <div className="flex items-center justify-between mt-4 text-sm gap-2">
          <p>
            <span className="font-semibold">Status:</span>{" "}
            <span
              className={`text-center px-2 py-1 rounded-full text-xs ${
                user.isDeleted
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {user.isDeleted ? "Active" : "Inactive"}
            </span>
          </p>

          <div>
            <label
              htmlFor={`status-${user.id}`}
              className="text-sm md:text-base mr-2"
            >
              Role:
            </label>

            <select
              id={`status-${user.id}`}
              value={role}
              onChange={handleStatusChange}
              className="text-xs md:text-sm border p-1 rounded"
              disabled={isPending}
            >
              <option value="ADMIN">ADMIN</option>
              <option value="STAFF">STAFF</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserCard;
