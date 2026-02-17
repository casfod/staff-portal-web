import Swal from "sweetalert2";

import { BiSearch } from "react-icons/bi";
import { GoXCircle } from "react-icons/go";
import { useDebounce } from "use-debounce";
import { RiArrowUpDownLine } from "react-icons/ri";
import { useDeleteUser, useUsers } from "./Hooks/useUsers";
import { localStorageUser } from "../../utils/localStorageUser";
import Modal from "../../ui/Modal";
import { Plus } from "lucide-react";
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
import { useCallback, useEffect, useMemo, useState } from "react";
import Button from "../../ui/Button";
import TextHeader from "../../ui/TextHeader";
import UsersTableRow from "./UsersTableRow";
import { useNavigate } from "react-router-dom";
import { UserType } from "../../interfaces";
import { setUser } from "../../store/userSlice";

export function AllUsers() {
  const currentUser = localStorageUser();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { searchTerm, sort, page, limit } = useSelector(
    (state: RootState) => state.genericQuerySlice
  );
  const [debouncedSearchTerm] = useDebounce(searchTerm, 600);

  const [visibleItems, setVisibleItems] = useState<{ [key: string]: boolean }>(
    {}
  );

  useEffect(() => {
    return () => {
      dispatch(resetQuery());
    };
  }, [dispatch]);

  const { data, isLoading, isError } = useUsers({
    search: debouncedSearchTerm,
    sort,
    page,
    limit,
  });

  const { deleteUser } = useDeleteUser();
  // Add null checks for `data` and `data.data`
  const users = useMemo(() => data?.data?.users ?? [], [data]);
  const totalPages = useMemo(() => data?.data?.totalPages ?? 1, [data]);

  const toggleViewItems = useCallback((requestId: string) => {
    setVisibleItems((prev) => ({
      ...prev,
      [requestId]: !prev[requestId],
    }));
  }, []);

  const handleEdit = (staffInfo: UserType) => {
    // Navigate to the edit route with the user's ID
    navigate(`/human-resources/staff-information/${staffInfo?.id}/edit`);
  };

  const handleAction = useCallback(
    (staffInfo: UserType) => {
      dispatch(setUser(staffInfo));
      navigate(`/advance-requests/request/${staffInfo.id}`);
    },
    [dispatch, navigate]
  );

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

  // const tableHeadData = ["Name", "Email", "Role", "Status"];

  const tableHeadData = [
    { label: "Name", showOnMobile: true, minWidth: "120px" },
    { label: "Email", showOnMobile: true, minWidth: "100px" },
    { label: "Role", showOnMobile: true, minWidth: "100px" },
    {
      label: "Status",
      showOnMobile: false,
      showOnTablet: true,
      minWidth: "100px",
    }, // Hidden on mobile, shown on tablet+
    { label: "Actions", showOnMobile: true, minWidth: "100px" },
  ];

  return (
    <div className="flex flex-col space-y-3 pt-6">
      {/* Header and Add User Button */}
      <div className="flex justify-between items-center">
        <TextHeader> User Management</TextHeader>

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
      <div className="bg-white shadow-sm rounded-lg overflow-hidden border overflow-x-auto">
        <div className=" md:min-w-full">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 hidden sm:table-header-group">
              <tr>
                {tableHeadData.map((header, index) => (
                  <th
                    key={index}
                    className={`
                      px-3 py-2.5 md:px-4 md:py-3 
                      text-left font-medium uppercase 
                      tracking-wider
                      ${!header.showOnMobile ? "hidden md:table-cell" : ""}
                      ${
                        header.showOnTablet
                          ? "hidden sm:table-cell md:table-cell"
                          : ""
                      }
                      text-xs md:text-sm
                      whitespace-nowrap
                    `}
                    style={{ minWidth: header.minWidth }}
                  >
                    {header.label}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={tableHeadData.length} className="py-8">
                    <div className="flex justify-center items-center">
                      <Spinner />
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={tableHeadData.length} className="py-8">
                    <div className="flex flex-col justify-center items-center text-gray-500">
                      <div className="text-lg font-semibold mb-2">
                        No requests found
                      </div>
                      <div className="text-sm">
                        {searchTerm
                          ? "Try a different search term"
                          : "Create your first advance request"}
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((staffInfo) => (
                  <UsersTableRow
                    key={staffInfo.id}
                    staffInfo={staffInfo}
                    visibleItems={visibleItems}
                    toggleViewItems={toggleViewItems}
                    handleEdit={handleEdit}
                    handleDelete={handleDelete}
                    handleAction={handleAction}
                    tableHeadData={tableHeadData}
                    currentUserRole={currentUser.role} // Pass headers for responsive rendering
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
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
