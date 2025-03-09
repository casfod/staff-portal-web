import { Plus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useDebounce } from "use-debounce";
import { useAllPurchaseRequests } from "./pRHooks/useAllPurchaseRequests";
import NetworkErrorUI from "../../ui/NetworkErrorUI";
import { BiSearch } from "react-icons/bi";
import { GoXCircle } from "react-icons/go";
import { RiArrowUpDownLine } from "react-icons/ri";
import { Pagination } from "../../ui/Pagination";
import { dateformat } from "../../utils/dateFormat";
import { moneyFormat } from "../../utils/moneyFormat";
import Spinner from "../../ui/Spinner";
import { HiMiniEye, HiMiniEyeSlash } from "react-icons/hi2";
import Swal from "sweetalert2";
import { useDeletePurchaseRequest } from "./pRHooks/useDeletePurchaseRequest";

const AllRequests = () => {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sort, setSort] = useState<string>("department:asc"); // Default sort
  const [page, setPage] = useState<number>(1);
  const limit = 10;
  const [debouncedSearchTerm] = useDebounce(searchTerm, 600); // 500ms debounce
  const [visibleItems, setVisibleItems] = useState<{ [key: string]: boolean }>(
    {}
  );

  const toggleViewItems = (requestId: string) => {
    setVisibleItems((prev) => ({
      ...prev,
      [requestId]: !prev[requestId], // Toggle visibility for the specific request
    }));
  };

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

  const { deletePurchaseRequest } = useDeletePurchaseRequest(
    debouncedSearchTerm,
    sort,
    page,
    limit
  );

  const handleDelete = (id: string) => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to delete this Purchase Request?",
      showCancelButton: true,
      confirmButtonColor: "#1373B0",
      cancelButtonColor: "#DC3340",
      confirmButtonText: "Yes, delete it!",
      customClass: { popup: "custom-style" },
    }).then((result) => {
      if (result.isConfirmed) {
        deletePurchaseRequest(id, {
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
                Department
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
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
                <>
                  <tr key={request._id} className="hover:cursor-pointer">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">
                      {request.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {moneyFormat(
                        request?.itemGroups!.reduce(
                          (sum, item) => sum + item.total,
                          0
                        ),
                        "NGN"
                      )}
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-4">
                        <span onClick={() => toggleViewItems(request._id!)}>
                          {visibleItems[request._id!] ? (
                            <HiMiniEyeSlash className="w-5 h-5" />
                          ) : (
                            <HiMiniEye className="w-5 h-5" />
                          )}
                        </span>

                        {request.status === "draft" && (
                          <button
                            className="text-red-600 hover:text-red-900"
                            onClick={() => handleDelete(request._id!)}
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                  {visibleItems[request._id!] && (
                    <tr
                      key={`${request._id}-items`}
                      className="w-full h-10 scale-[90%]"
                    >
                      <td colSpan={6}>
                        <div className="border border-gray-400 px-6 py-4 rounded-md">
                          <div className="w-full text-gray-700 text-sm mb-2">
                            <p>
                              <span className="font-bold mr-2 uppercase">
                                Account Code :{" "}
                              </span>{" "}
                              {request.accountCode}
                            </p>
                            <p>
                              <span className="font-bold mr-2 uppercase">
                                Charged To :{" "}
                              </span>
                              {request.expenseChargedTo}
                            </p>
                            <p>
                              <span className="font-bold mr-2 uppercase">
                                Address :{" "}
                              </span>{" "}
                              {request.address}
                            </p>
                            <p>
                              <span className="font-bold mr-2 uppercase">
                                City :{" "}
                              </span>{" "}
                              {request.city}
                            </p>
                            <p>
                              <span className="font-bold mr-2 uppercase">
                                Delivery Point :{" "}
                              </span>
                              {request.finalDeliveryPoint}
                            </p>

                            <p>
                              <span className="font-bold mr-2 uppercase">
                                Period Of Activity :
                              </span>
                              {request.periodOfActivity}
                            </p>
                            <p>
                              <span className="font-bold mr-2 uppercase">
                                Activity Description :{" "}
                              </span>
                              {request.activityDescription}
                            </p>
                          </div>
                          <table className=" min-w-full divide-y divide-gray-200 rounded-md">
                            <thead>
                              <tr>
                                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Description
                                </th>
                                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Quantity
                                </th>
                                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Frequency
                                </th>
                                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Unit Cost
                                </th>
                                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Total
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200 ">
                              {request?.itemGroups!.map((item) => (
                                <tr key={item._id!}>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {item.description}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {item.quantity}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {item.frequency}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {moneyFormat(item.unitCost, "NGN")}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {moneyFormat(item.total, "NGN")}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
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
