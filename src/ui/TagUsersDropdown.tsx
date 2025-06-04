import { useState } from "react";
import { Check, Search, X } from "lucide-react";
import { UserType } from "../interfaces";

interface TagUsersDropdownProps {
  users: UserType[];
  isLoading: boolean;
  isError: boolean;
  onSelectUsers: (userIds: string[]) => Promise<void>;
  onClose: () => void;
}

const TagUsersDropdown = ({
  users,
  isLoading,
  isError,
  onSelectUsers,
  onClose,
}: TagUsersDropdownProps) => {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = users.filter((user) =>
    `${user.first_name} ${user.last_name}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSubmit = async () => {
    await onSelectUsers(selectedUsers);
    onClose();
  };

  if (isError)
    return <div className="p-2 text-red-500">Error loading users</div>;
  if (isLoading) return <div className="p-2">Loading users...</div>;

  return (
    <div className="absolute right-0 mt-2 w-64 rounded-md bg-white shadow-lg z-50 border border-gray-200">
      <div className="p-2 border-b">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            className="w-full pl-8 pr-8 py-1 text-sm rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <X
              className="absolute right-2 top-2.5 h-4 w-4 text-gray-400 cursor-pointer"
              onClick={() => setSearchTerm("")}
            />
          )}
        </div>
      </div>
      <div className="max-h-60 overflow-y-auto">
        {filteredUsers.length === 0 ? (
          <div className="p-2 text-sm text-gray-500">No users found</div>
        ) : (
          filteredUsers.map((user) => (
            <div
              key={user?.id}
              className="flex items-center p-2 hover:bg-gray-50 cursor-pointer"
              onClick={() => toggleUserSelection(user?.id!)}
            >
              <div
                className={`w-4 h-4 rounded border mr-2 flex items-center justify-center ${
                  selectedUsers.includes(user?.id!)
                    ? "bg-blue-500 border-blue-500"
                    : "border-gray-300"
                }`}
              >
                {selectedUsers.includes(user?.id!) && (
                  <Check className="h-3 w-3 text-white" />
                )}
              </div>
              <span className="text-sm">
                {user.first_name} {user.last_name}
              </span>
            </div>
          ))
        )}
      </div>
      <div className="p-2 border-t flex justify-between">
        <button
          className="text-sm text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 disabled:opacity-50"
          onClick={handleSubmit}
          disabled={selectedUsers.length === 0}
        >
          Add {selectedUsers.length} user(s)
        </button>
      </div>
    </div>
  );
};

export default TagUsersDropdown;
