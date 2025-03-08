import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useDebounce } from "use-debounce";
import { useAllPurchaseRequests } from "./purchaseRequestHooks/useAllPurchaseRequests";
import NetworkErrorUI from "../../ui/NetworkErrorUI";
import { BiSearch } from "react-icons/bi";
import { GoXCircle } from "react-icons/go";
import { RiArrowUpDownLine } from "react-icons/ri";
import { Pagination } from "../../ui/Pagination";
import { dateformat } from "../../utils/dateFormat";
import { formatMoney } from "../../utils/formatMoney";
import Spinner from "../../ui/Spinner";

// // Mock data
// const requests = [
//   {
//     id: 1,
//     item: "Medical Supplies",
//     amount: "$12,000",
//     status: "Pending",
//     requestedBy: "John Smith",
//     date: "2024-03-01",
//   },
//   {
//     id: 2,
//     item: "Office Equipment",
//     amount: "$5,000",
//     status: "Approved",
//     requestedBy: "Emma Wilson",
//     date: "2024-02-28",
//   },
// ];

const AllRequests = () => {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sort, setSort] = useState<string>("email:asc"); // Default sort
  const [page, setPage] = useState<number>(1);
  const limit = 10;
  const [debouncedSearchTerm] = useDebounce(searchTerm, 600); // 500ms debounce

  const { data, isLoading, isError } = useAllPurchaseRequests(
    debouncedSearchTerm,
    sort,
    page,
    limit
  );

  // Add null checks for `data` and `data.data`
  const purchaseRequests = data?.data?.purchaseRequests ?? [];
  const totalPages = data?.data?.totalPages ?? 1;

  console.log(purchaseRequests);

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSort(e.target.value);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  if (isError) {
    return <NetworkErrorUI />;
  }

  return (
    <div className="flex flex-col space-y-3">
      <div className="flex justify-between items-center">
        <h1
          className="text-2xl font-semibold text-gray-700"
          style={{ fontFamily: "Lato", letterSpacing: "2px" }}
        >
          Purchase Requests
        </h1>
        <button
          onClick={() => navigate("/purchase-requests/request")} // Use relative path here
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-buttonColor hover:bg-buttonColorHover "
        >
          <Plus className="h-4 w-4 mr-2" />
          New Request
        </button>
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
            <option value="department:asc">Department (A-Z)</option>
            <option value="department:desc">Department (Z-A)</option>
            <option value="accountCode:asc">Account Code (A-Z)</option>
            <option value="Account Code:desc">Account Code (Z-A)</option>
            <option value="city:asc">City (A-Z)</option>
            <option value="city:desc">City (Z-A)</option>
          </select>

          {/* Icon */}
          <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-gray-400">
            <RiArrowUpDownLine className="h-5 w-5" />
          </div>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Item
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Requested By
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
            </tr>
          </thead>

          {isLoading ? (
            <tbody>
              <tr>
                <td>
                  <div className="flex justify-center items-center h-96">
                    <Spinner />
                  </div>
                </td>
              </tr>
            </tbody>
          ) : (
            <tbody className="bg-white divide-y divide-gray-200">
              {purchaseRequests.map((request) => (
                <tr key={request._id} className="hover:cursor-pointer">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">
                    {request.department}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {request?.itemGroups!.map((item, index) => (
                      <div key={index}>
                        {formatMoney(item.total)}
                        {/* Display the total for each item group */}
                      </div>
                    ))}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {request.status}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {request.requestedBy}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {dateformat(request.createdAt!)}
                  </td>
                </tr>
              ))}
            </tbody>
          )}
        </table>
      </div>

      {/* Pagination */}
      {(purchaseRequests.length >= limit || totalPages > 1) && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default AllRequests;
