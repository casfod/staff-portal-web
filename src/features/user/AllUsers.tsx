import Swal from "sweetalert2";

import { BiSearch } from "react-icons/bi";
import { GoXCircle } from "react-icons/go";
import { useDebounce } from "use-debounce";
import { RiArrowUpDownLine } from "react-icons/ri";
import { useUsers } from "./Hooks/useUsers";
import { localStorageUser } from "../../utils/localStorageUser";
import { useDeleteUser } from "./Hooks/useDeleteUser";
import Modal from "../../ui/Modal";
import { Plus, Trash2, UserCog } from "lucide-react";
import Spinner from "../../ui/Spinner";
import { Pagination } from "../../ui/Pagination";
import AddUserForm from "./AddUserForm";
import UserCard from "./UserCard";
import NetworkErrorUI from "../../ui/NetworkErrorUI";
import {
  setSearchTerm,
  setSort,
  setPage,
  resetQuery,
} from "../../store/genericQuerySlice";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { useEffect, useMemo } from "react";
import Button from "../../ui/Button";
import UserBadge from "../../ui/UserBadge";

export function AllUsers() {
  const currentUser = localStorageUser();
  const dispatch = useDispatch();
  const { searchTerm, sort, page, limit } = useSelector(
    (state: RootState) => state.genericQuerySlice
  );
  const [debouncedSearchTerm] = useDebounce(searchTerm, 600);

  useEffect(() => {
    return () => {
      dispatch(resetQuery());
    };
  }, [dispatch]);

  const { data, isLoading, isError } = useUsers(
    debouncedSearchTerm,
    sort,
    page,
    limit
  );

  const { deleteUser } = useDeleteUser();
  // Add null checks for `data` and `data.data`
  const users = useMemo(() => data?.data?.users ?? [], [data]);
  const totalPages = useMemo(() => data?.data?.totalPages ?? 1, [data]);

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(setSort(e.target.value));
  };

  const handlePageChange = (newPage: number) => {
    dispatch(setPage(newPage));
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
    return <NetworkErrorUI />;
  }

  const tableHeadData = ["Name", "Email", "Role", "Status"];

  return (
    <div className="flex flex-col space-y-3 pt-6">
      {/* Header and Add User Button */}
      <div className="flex justify-between items-center">
        <h1
          className=" md:text-lg lg:text-2xl font-semibold  "
          style={{ fontFamily: "Lato", letterSpacing: "2px" }}
        >
          User Management
        </h1>
        {currentUser.role === "SUPER-ADMIN" && (
          <Modal>
            <Modal.Open open="addUser">
              <Button>
                <Plus className="h-4 w-4 mr-1 md:mr-2" />
                Add User
              </Button>
            </Modal.Open>
          </Modal>
        )}
      </div>

      {/* Search Bar and Sort Dropdown */}
      <div className="flex flex-wrap gap-2 items-center space-x-4">
        <div className="relative flex items-center w-full max-w-[298px] h-9 bg-white border-2 border-gray-300 rounded-lg shadow-sm focus-within:border-gray-400 transition">
          <span className="p-2 text-gray-400">
            <BiSearch className="w-5 h-5" />
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => dispatch(setSearchTerm(e.target.value))}
            className="w-full h-full px-2   placeholder-gray-400 placeholder:tracking-widest rounded-lg focus:outline-none focus:ring-0 mr-7"
            placeholder="Search"
          />
          <span
            className="text-gray-400 absolute right-2 top-1/2 transform -translate-y-1/2 cursor-pointer hover:scale-110"
            onClick={() => dispatch(setSearchTerm(""))}
          >
            <GoXCircle />
          </span>
        </div>

        {/* Sort Dropdown */}
        <div className="relative inline-block">
          <select
            value={sort}
            onChange={handleSortChange}
            className="px-4 pr-8 h-9 border-2 border-gray-300 rounded-lg shadow-sm   appearance-none bg-white"
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
      <div className="bg-white shadow-sm rounded-lg overflow-hidden border overflow-x-scroll">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {tableHeadData.map((data, key) => (
                <th
                  key={key}
                  className="px-6 py-3 text-left  font-medium   uppercase text-xs 2xl:text-text-sm tracking-wider"
                >
                  {data}
                </th>
              ))}

              {currentUser.role === "SUPER-ADMIN" && (
                <th className="px-6 py-3 text-left  font-medium   uppercase text-xs 2xl:text-text-sm tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          {isLoading ? (
            <tbody>
              <tr>
                <td colSpan={currentUser.role === "SUPER-ADMIN" ? 5 : 4}>
                  <div className="flex justify-center items-center h-96">
                    <Spinner />
                  </div>
                </td>
              </tr>
            </tbody>
          ) : (
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => {
                const rowData = [
                  {
                    id: "Name",
                    content: `${user.first_name.toUpperCase()} ${user.last_name.toUpperCase()}`,
                  },
                  {
                    id: "email",
                    content: user.email,
                  },
                  {
                    id: "status",
                    content: user.role!,
                  },
                  {
                    id: "isDeleted",
                    content: (
                      <UserBadge
                        isDeleted={user.isDeleted!}
                        status={user.isDeleted ? "Inactive" : "Active"}
                      />
                    ),
                  },
                ];

                return (
                  <tr
                    key={user.id}
                    className="h-[40px] max-h-[40px] hover:cursor-pointer hover:bg-[#f2f2f2]" // Apply max height to each row
                  >
                    {rowData.map((data) => (
                      <td
                        key={data.id}
                        className="px-3 py-2.5 md:px-6 md:py-3 whitespace-nowrap  text-xs 2xl:text-sm  "
                      >
                        {data.content}
                      </td>
                    ))}

                    {currentUser.role === "SUPER-ADMIN" && (
                      <td className="px-3 py-1.5 md:px-6 md:py-2 whitespace-nowrap  text-xs 2xl:text-sm   uppercase">
                        <div className="flex space-x-4">
                          <Modal>
                            <Modal.Open open={`userCog-${user.id}`}>
                              <button className="text-primary hover:text-indigo-900">
                                <UserCog className="h-5 w-5" />
                              </button>
                            </Modal.Open>
                          </Modal>

                          {!user.isDeleted && (
                            <button
                              className="text-red-600 hover:text-red-900"
                              onClick={() => handleDelete(user.id!)}
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          )}
        </table>
        {/* No Results Message */}
        {users.length === 0 && !isLoading && (
          <div className="bg-gray-50 p-8">
            <p className="text-2xl text-center  ">No result</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {(users.length >= limit || totalPages > 1) && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
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
