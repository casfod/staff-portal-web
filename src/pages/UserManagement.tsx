import { Plus, Trash2, UserCog } from "lucide-react";
import { useUsers } from "../features/user/userHooks/useUsers";
import { localStorageUser } from "../utils/localStorageUser";
import { useDeleteUser } from "../features/user/userHooks/useDeleteUser";
import AddUserForm from "../features/user/AddUserForm";
import Modal from "../ui/Modal";
import Swal from "sweetalert2";
import UserCard from "../features/user/UserCard";
import Spinner from "../ui/Spinner";
import { BiSearch } from "react-icons/bi";
import { useEffect, useState } from "react";
import { UserType } from "../interfaces";

export function UserManagement() {
  const localStorageUserX = localStorageUser();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filteredUsers, setFilteredUsers] = useState<UserType[]>([]);

  const { data, isLoading } = useUsers();
  const { deleteUser } = useDeleteUser();
  const users = data?.data;

  const handleDelete = (id: string) => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to delete this User?",
      showCancelButton: true,
      confirmButtonColor: "#1373B0",
      cancelButtonColor: "#DC3340",
      confirmButtonText: "Yes, delete it!",
      customClass: { popup: "custom-style" },
    }).then((result) => {
      if (result.isConfirmed) {
        deleteUser(id!, {
          onError: (error) => {
            Swal.fire("Error!", error.message, "error");
          },
        });
      }
    });
  };

  useEffect(() => {
    if (users) {
      const term = searchTerm.toLowerCase();
      const filtered = users.filter(
        (user: UserType) =>
          user.first_name.toLowerCase().includes(term) ||
          user.last_name.toLowerCase().includes(term) ||
          user.email.toLowerCase().includes(term) ||
          user.role.toLowerCase().includes(term)
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex justify-between items-center">
        <h1
          className="text-2xl font-semibold text-gray-700"
          style={{ fontFamily: "Lato", letterSpacing: "2px" }}
        >
          User Management
        </h1>
        {localStorageUserX.role === "SUPER-ADMIN" && (
          <Modal>
            <Modal.Open open="addUser">
              <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-buttonColor hover:bg-buttonColorHover">
                <Plus className="h-4 w-4 mr-2" />
                Add User
              </button>
            </Modal.Open>
          </Modal>
        )}
      </div>

      <div className="flex items-center w-full max-w-[275px] h-9 bg-white border-2 border-gray-300 rounded-lg shadow-sm focus-within:border-gray-400 transition">
        <span className="p-2 text-gray-400">
          <BiSearch className="w-5 h-5" />
        </span>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full h-full px-2 text-gray-700 placeholder-gray-400 rounded-lg focus:outline-none focus:ring-0"
          placeholder="Search by Name, Email, or Role"
        />
      </div>
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              {localStorageUserX.role === "SUPER-ADMIN" && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers?.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">
                  <p className="inline-flex gap-1 text-gray-700 font-medium">
                    <span>{user?.first_name.toUpperCase()}</span>
                    <span>{user?.last_name.toUpperCase()}</span>
                  </p>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.role}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.isDeleted === true ? "Inactive" : "Active"}
                </td>
                {localStorageUserX.role === "SUPER-ADMIN" && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-4">
                      <Modal>
                        <Modal.Open open={`userCog-${user.id}`}>
                          <button className="text-primary hover:text-indigo-900">
                            <UserCog className="h-5 w-5" />
                          </button>
                        </Modal.Open>
                      </Modal>

                      <button
                        className="text-red-600 hover:text-red-900"
                        onClick={() => handleDelete(user?.id!)}
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {isLoading && (
          <div className="bg-gray-50 flex items-center justify-center w-full h-64">
            <Spinner />
          </div>
        )}
        {filteredUsers.length === 0 && !isLoading && (
          <div className="bg-gray-50 p-8">
            <p className="text-2xl text-center text-gray-500">No result</p>
          </div>
        )}
      </div>

      {/* Modal Windows */}
      <Modal>
        <Modal.Window name="addUser">
          <AddUserForm />
        </Modal.Window>
        {filteredUsers.map((user) => (
          <Modal.Window key={user.id} name={`userCog-${user.id}`}>
            <UserCard user={user} />
          </Modal.Window>
        ))}
      </Modal>
    </div>
  );
}
