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
import { RiArrowUpDownLine } from "react-icons/ri";

export function UserManagement() {
  const localStorageUserX = localStorageUser();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sort, setSort] = useState<string>("email:asc"); // Default sort
  const [page, setPage] = useState<number>(1);
  const limit = 10;
  const [debouncedSearchTerm] = useDebounce(searchTerm, 600); // 500ms debounce

  const { data, isLoading, isError, error } = useUsers(
    debouncedSearchTerm,
    sort,
    page,
    limit
  );

  const { deleteUser } = useDeleteUser();

  const users = data?.data.users || [];
  const totalPages = data?.data.totalPages || 1;

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSort(e.target.value);
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

  if (isError) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="flex flex-col space-y-3">
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

      {/* Search Bar and Sort Dropdown */}
      <div className="flex items-center space-x-4">
        <div className="relative flex items-center w-full max-w-[298px] h-9 bg-white border-2 border-gray-300 rounded-lg shadow-sm focus-within:border-gray-400 transition">
          <span className="p-2 text-gray-400">
            <BiSearch className="w-5 h-5" />
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-full px-2 text-gray-700 placeholder-gray-400 rounded-lg focus:outline-none focus:ring-0 mr-7"
            placeholder="Search by Name, Email or Role"
          />
          <span
            className="text-gray-400 absolute right-2 top-1/2 transform -translate-y-1/2 cursor-pointer hover:scale-110"
            onClick={() => setSearchTerm("")}
          >
            <GoXCircle />
          </span>
        </div>

        {/* Sort Dropdown */}
        <div className="relative inline-block">
          <select
            value={sort}
            onChange={handleSortChange}
            className="px-4 pr-8 h-9 border-2 border-gray-300 rounded-lg shadow-sm text-gray-600 appearance-none bg-white"
          >
            {/* Placeholder Option */}
            <option value="" disabled selected className="text-gray-400">
              Sort
            </option>

            {/* Sort Options */}
            <option value="email:asc">Email (A-Z)</option>
            <option value="email:desc">Email (Z-A)</option>
            <option value="role:asc">Role (A-Z)</option>
            <option value="role:desc">Role (Z-A)</option>
            <option value="first_name:asc">Name (A-Z)</option>
            <option value="first_name:desc">Name (Z-A)</option>
          </select>

          {/* Icon */}
          <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-gray-400">
            <RiArrowUpDownLine className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* User Table */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
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
          {isLoading ? (
            <tbody>
              <tr>
                <td colSpan={localStorageUserX.role === "SUPER-ADMIN" ? 5 : 4}>
                  <div className="flex justify-center items-center h-64">
                    <Spinner />
                  </div>
                </td>
              </tr>
            </tbody>
          ) : (
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="h-[40px] max-h-[40px]" // Apply max height to each row
                >
                  <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-700">
                    {`${user.first_name} ${user.last_name}`}
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500">
                    {user.email}
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500">
                    {user.role}
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500">
                    {user.isDeleted ? "Inactive" : "Active"}
                  </td>
                  {localStorageUserX.role === "SUPER-ADMIN" && (
                    <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500">
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
          )}
        </table>
        {/* No Results Message */}
        {users.length === 0 && !isLoading && (
          <div className="bg-gray-50 p-8">
            <p className="text-2xl text-center text-gray-500">No result</p>
          </div>
        )}
      </div>

      {/*Pagination */}

      {(users.length >= limit || totalPages > 1) && (
        <div className="flex justify-start items-center space-x-2">
          {/* Previous Button */}
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className="px-3 py-1 bg-buttonColor hover:bg-buttonColorHover text-white rounded-lg disabled:opacity-50"
          >
            Previous
          </button>

          {/* Page Numbers */}
          {Array.from({ length: totalPages }, (_, i) => {
            const pageNumber = i + 1;

            // Show the first page, last page, current page, and pages around the current page
            if (
              pageNumber === 1 || // Always show the first page
              pageNumber === totalPages || // Always show the last page
              Math.abs(pageNumber - page) <= 1 || // Show pages around the current page
              (pageNumber === 2 && page > 3) || // Show ellipsis after the first page if needed
              (pageNumber === totalPages - 1 && page < totalPages - 2) // Show ellipsis before the last page if needed
            ) {
              return (
                <button
                  key={pageNumber}
                  onClick={() => handlePageChange(pageNumber)}
                  className={`px-3 py-1 ${
                    page === pageNumber
                      ? "bg-buttonColor hover:bg-buttonColorHover text-white"
                      : "bg-gray-200"
                  } rounded-lg`}
                >
                  {pageNumber}
                </button>
              );
            }

            // Show ellipsis for skipped pages
            if (
              (pageNumber === 2 && page > 4) || // Ellipsis after the first page
              (pageNumber === totalPages - 1 && page < totalPages - 3) // Ellipsis before the last page
            ) {
              return <span key={pageNumber}>...</span>;
            }

            return null;
          })}

          {/* Next Button */}
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
            className="px-3 py-1 bg-buttonColor hover:bg-buttonColorHover text-white rounded-lg disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

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
