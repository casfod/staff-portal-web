import { Plus, Trash2, UserCog } from "lucide-react";
import { useUsers } from "../features/user/userHooks/useUsers";
import { localStorageUser } from "../utils/localStorageUser";
import { useDeleteUser } from "../features/user/userHooks/useDeleteUser";
import AddUserForm from "../features/user/AddUserForm";
import Modal from "../ui/Modal";

import Swal from "sweetalert2";
import UserCard from "../features/user/UserCard";

export function UserManagement() {
  const localStorageUserX = localStorageUser();

  const { data } = useUsers();

  const { deleteUser } = useDeleteUser();

  const users = data?.data || [];

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">
          User Management
        </h1>
        {localStorageUserX.role == "SUPER-ADMIN" && (
          <Modal>
            <Modal.Open open="addUser">
              <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-buttonColor hover:bg-buttonColorHover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                <Plus className="h-4 w-4 mr-2" />
                Add User
              </button>
            </Modal.Open>

            <Modal.Window name="addUser">
              <AddUserForm />
            </Modal.Window>
          </Modal>
        )}
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users?.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  <p className="inline-flex gap-1 text-gray-900 font-medium">
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
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex space-x-2">
                    <Modal>
                      <Modal.Open open="userCog">
                        <button className="text-primary hover:text-indigo-900">
                          <UserCog className="h-5 w-5" />
                        </button>
                      </Modal.Open>

                      <Modal.Window name="userCog">
                        <UserCard user={user} />
                      </Modal.Window>
                    </Modal>

                    <button
                      className="text-red-600 hover:text-red-900"
                      onClick={() => handleDelete(user?.id!)}
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
