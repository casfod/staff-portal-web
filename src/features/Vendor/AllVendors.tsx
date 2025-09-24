import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";

import { useVendors } from "./Hooks/useVendor";
import { useDispatch, useSelector } from "react-redux";
import NetworkErrorUI from "../../ui/NetworkErrorUI";
import { RootState } from "../../store/store";
import { BiSearch } from "react-icons/bi";
import { setSearchTerm, setPage } from "../../store/genericQuerySlice";
import { GoXCircle } from "react-icons/go";
import { Pagination } from "../../ui/Pagination";
import { useDebounce } from "use-debounce";
import { VendorType } from "../../interfaces";
import { setVendor } from "../../store/vendorSlice";
import Spinner from "../../ui/Spinner";
import { localStorageUser } from "../../utils/localStorageUser";
import TextHeader from "../../ui/TextHeader";
import Button from "../../ui/Button";
import VendorTableRow from "./VendorTableRow";

export function AllVendors() {
  const currentUser = localStorageUser();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { searchTerm, sort, page, limit } = useSelector(
    (state: RootState) => state.genericQuerySlice
  );
  const [debouncedSearchTerm] = useDebounce(searchTerm, 600);

  const { data, isLoading, isError } = useVendors({
    search: debouncedSearchTerm,
    sort,
    page,
    limit,
  });

  // State for toggling nested tables
  const [visibleItems, setVisibleItems] = useState<Record<string, boolean>>({});

  const vendors = useMemo(() => data?.data?.vendors ?? [], [data]);
  const totalPages = useMemo(() => data?.data?.totalPages ?? 1, [data]);

  // Toggle nested table visibility
  const toggleViewItems = (id: string) => {
    setVisibleItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handlePageChange = (newPage: number) => {
    dispatch(setPage(newPage));
  };

  const handleAction = (vendor: VendorType) => {
    dispatch(setVendor(vendor));
    navigate(`/procurement/vendor-management/vendor/${vendor.id}`);
  };

  const handleEdit = (vendor: VendorType) => {
    dispatch(setVendor(vendor));
    navigate(`/procurement/vendor-management/edit-vendor/${vendor.id}`);
  };

  if (isError) {
    return <NetworkErrorUI />;
  }

  const tableHeadData = [
    "Business Name",
    "Vendor Code",
    "Category",
    "Contact Person",
    "Actions",
  ];

  return (
    <div className="flex flex-col space-y-3 pb-80">
      <div className="sticky top-0 z-10 bg-[#F8F8F8] pt-4 md:pt-6 pb-3 space-y-1.5 border-b">
        {/* Header with title and button */}
        <div className="flex justify-between items-center">
          <TextHeader>Vendors</TextHeader>

          {currentUser.role === "SUPER-ADMIN" && (
            <Button
              onClick={() =>
                navigate("/procurement/vendor-management/create-vendor")
              }
            >
              <Plus className="h-4 w-4 mr-1 md:mr-2" />
              Add Vendor
            </Button>
          )}
        </div>

        {/* Search Bar */}
        <div className="flex items-center space-x-4">
          <div className="relative flex items-center w-full max-w-[298px] h-9 bg-white border-2 border-gray-300 rounded-lg shadow-sm focus-within:border-gray-400 transition">
            <span className="p-2 text-gray-400">
              <BiSearch className="w-5 h-5" />
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => dispatch(setSearchTerm(e.target.value))}
              className="w-full h-full px-2 placeholder-gray-400 rounded-lg focus:outline-none focus:ring-0 mr-7"
              placeholder="Search vendors..."
            />
            <span
              className="text-gray-400 absolute right-2 top-1/2 transform -translate-y-1/2 cursor-pointer hover:scale-110"
              onClick={() => dispatch(setSearchTerm(""))}
            >
              <GoXCircle />
            </span>
          </div>
        </div>
      </div>

      {/* Vendors Table */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden border overflow-x-scroll">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {tableHeadData.map((title, index) => (
                <th
                  key={index}
                  className="px-3 py-2.5 md:px-6 md:py-3 text-left font-medium uppercase text-xs 2xl:text-text-sm tracking-wider overflow-x-scroll"
                >
                  {title}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="max-w-full bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={tableHeadData.length} className="py-8">
                  <div className="flex justify-center items-center">
                    <Spinner />
                  </div>
                </td>
              </tr>
            ) : (
              vendors.map((vendor) => (
                <VendorTableRow
                  key={vendor.id}
                  vendor={vendor}
                  visibleItems={visibleItems}
                  toggleViewItems={toggleViewItems}
                  handleEdit={handleEdit}
                  handleAction={handleAction}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {(vendors.length >= limit || totalPages > 1) && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
