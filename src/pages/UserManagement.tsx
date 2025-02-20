import { useState } from "react";
import { Plus, Trash2, UserCog } from "lucide-react";
import { useUsers } from "../features/user/useUsers";
import { localStorageUser } from "../utils/localStorageUser";
import { useDeleteUser } from "../features/user/useDeleteUser";
import AddUserForm from "../features/user/AddUserForm";
import Modal from "../ui/Modal";

export function UserManagement() {
  const [showModal, setShowModal] = useState(false);
  const localStorageUserX = localStorageUser();

  const { data } = useUsers();

  const { deleteUser } = useDeleteUser();

  console.log(data?.data);

  const handleDelete = (id: string) => {
    deleteUser(id);
  };

  const users = data?.data;
  // Mock data
  // const users = [
  //   {
  //     id: 1,
  //     name: "John Doe",
  //     email: "john@example.com",
  //     role: "Admin",
  //     status: "Active",
  //   },
  //   {
  //     id: 2,
  //     name: "Jane Smith",
  //     email: "jane@example.com",
  //     role: "Staff",
  //     status: "Active",
  //   },
  // ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">
          User Management
        </h1>
        {localStorageUserX.role == "SUPER-ADMIN" && (
          <Modal>
            <Modal.Open open="addUser">
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-buttonColor hover:bg-buttonColorHover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
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
                    <button className="text-primary hover:text-indigo-900">
                      <UserCog className="h-5 w-5" />
                    </button>
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
      {/* 
      {showModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <AddUserForm />
        </div>
      )} */}
    </div>
  );
}

{
  /* <div className="flex justify-end space-x-3">
<button
  type="button"
  onClick={() => setShowModal(false)}
  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
>
  Cancel
</button> */
}
