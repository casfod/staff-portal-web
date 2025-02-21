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
import { useState } from "react";
import { GoXCircle } from "react-icons/go";

import { useDebounce } from "use-debounce";

export function UserManagement() {
  const localStorageUserX = localStorageUser();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [sort, setSort] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const limit = 4;
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500); // 500ms debounce

  const { data, isLoading, isError, error } = useUsers(
    debouncedSearchTerm,
    roleFilter,
    sort,
    page,
    limit
  );

  const { deleteUser } = useDeleteUser();

  const users = data?.data.users || [];
  const totalPages = data?.totalPages || 1;

  const handleSort = (field: string) => {
    const order = sort.includes("asc") ? "desc" : "asc";
    setSort(`${field}:${order}`);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

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
        deleteUser(id, {
          onError: (error) => {
            Swal.fire("Error!", error.message, "error");
          },
        });
      }
    });
  };

  if (isLoading) {
    return <Spinner />;
  }

  if (isError) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="flex flex-col space-y-6">
      {/* Header and Add User Button */}
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

      {/* Search Bar */}
      <div className="relative flex items-center w-full max-w-[298px] h-9 bg-white border-2 border-gray-300 rounded-lg shadow-sm focus-within:border-gray-400 transition">
        <span className="p-2 text-gray-400">
          <BiSearch className="w-5 h-5" />
        </span>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full h-full px-2 text-gray-700 placeholder-gray-400 rounded-lg focus:outline-none focus:ring-0 mr-7"
          placeholder="Search by Name, Email, or Role"
        />
        <span
          className="text-gray-400 absolute right-2 top-1/2 transform -translate-y-1/2 cursor-pointer hover:scale-110"
          onClick={() => setSearchTerm("")}
        >
          <GoXCircle />
        </span>
      </div>

      {/* Role Filter Dropdown */}
      <select
        value={roleFilter}
        onChange={(e) => setRoleFilter(e.target.value)}
        className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">All Roles</option>
        <option value="ADMIN">Admin</option>
        <option value="USER">User</option>
      </select>

      {/* User Table */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("first_name")}
              >
                Name
              </th>
              <th
                className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("email")}
              >
                Email
              </th>
              <th
                className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("role")}
              >
                Role
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              {localStorageUserX.role === "SUPER-ADMIN" && (
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">
                  {`${user.first_name} ${user.last_name}`}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.role}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.isDeleted ? "Inactive" : "Active"}
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
                        onClick={() => handleDelete(user.id!)}
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

        {/* Loading Spinner */}
        {isLoading && (
          <div className="bg-gray-50 flex items-center justify-center w-full h-64">
            <Spinner />
          </div>
        )}

        {/* No Results Message */}
        {users.length === 0 && !isLoading && (
          <div className="bg-gray-50 p-8">
            <p className="text-2xl text-center text-gray-500">No result</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex justify-center space-x-2">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i + 1}
            onClick={() => handlePageChange(i + 1)}
            className={`px-4 py-2 ${
              page === i + 1 ? "bg-blue-500 text-white" : "bg-gray-200"
            } rounded-lg`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* Modals */}
      <Modal>
        <Modal.Window name="addUser">
          <AddUserForm />
        </Modal.Window>
        {users.map((user) => (
          <Modal.Window key={user.id} name={`userCog-${user.id}`}>
            <UserCard user={user} />
          </Modal.Window>
        ))}
      </Modal>
    </div>
  );
}
