import { Plus, Trash2, Edit } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useDebounce } from "use-debounce";
import { useAllPurchaseRequests } from "./pRHooks/useAllPurchaseRequests";
import NetworkErrorUI from "../../ui/NetworkErrorUI";
import { BiSearch, BiSolidPen } from "react-icons/bi";
import { GoXCircle } from "react-icons/go";
// import { RiArrowUpDownLine } from "react-icons/ri";
import { Pagination } from "../../ui/Pagination";
import { dateformat } from "../../utils/dateFormat";
import { moneyFormat } from "../../utils/moneyFormat";
import Spinner from "../../ui/Spinner";
import { HiMiniEye, HiMiniEyeSlash } from "react-icons/hi2";
import Swal from "sweetalert2";
import { useDeletePurchaseRequest } from "./pRHooks/useDeletePurchaseRequest";
import { PurChaseRequestType } from "../../interfaces";
import { useDispatch } from "react-redux";
import { setPurChaseRequest } from "../../store/purchaseRequestSlice";
import { localStorageUser } from "../../utils/localStorageUser";

const AllRequests = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [searchTerm, setSearchTerm] = useState<string>("");
  // const [sort, setSort] = useState<string>("department:asc");
  const [sort] = useState<string>("department:asc"); // Default sort
  const [page, setPage] = useState<number>(1);
  const limit = 10;
  const [debouncedSearchTerm] = useDebounce(searchTerm, 600); // 500ms debounce
  const [visibleItems, setVisibleItems] = useState<{ [key: string]: boolean }>(
    {}
  );

  const localStorageUserX = localStorageUser();

  const { data, isLoading, isError } = useAllPurchaseRequests(
    debouncedSearchTerm,
    sort,
    page,
    limit
  );

  const { deletePurchaseRequest } = useDeletePurchaseRequest(
    debouncedSearchTerm,
    sort,
    page,
    limit
  );

  // Add null checks for `data` and `data.data`
  const purchaseRequests = data?.data?.purchaseRequests ?? [];
  const totalPages = data?.data?.totalPages ?? 1;

  console.log(purchaseRequests);

  // const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  //   setSort(e.target.value);
  // };

  const toggleViewItems = (requestId: string) => {
    setVisibleItems((prev) => ({
      ...prev,
      [requestId]: !prev[requestId], // Toggle visibility for the specific request
    }));
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleAction = (request: PurChaseRequestType) => {
    dispatch(setPurChaseRequest(request));
    navigate(`/purchase-requests/request/${request._id}`);
  };

  const handleEdit = (request: PurChaseRequestType) => {
    dispatch(setPurChaseRequest(request));
    navigate(`/purchase-requests/edit-request/${request._id}`);
  };

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
          onClick={() => navigate("/purchase-requests/create-request")} // Use relative path here
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
        {/* <div className="relative inline-block"></div> */}
      </div>

      {/* ///////////////////////////// */}
      {/*PURCHASE REQUEST TABLE*/}
      {/* ///////////////////////////// */}

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
                <td colSpan={6}>
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
                  <tr key={request._id} className="h-[40px] max-h-[40px]">
                    <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-700">
                      {request.department}
                    </td>
                    <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500">
                      {moneyFormat(
                        request?.itemGroups!.reduce(
                          (sum, item) => sum + item.total,
                          0
                        ),
                        "NGN"
                      )}
                    </td>
                    <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500 uppercase">
                      {request.status}
                    </td>
                    <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500">
                      {request.requestedBy}
                    </td>
                    <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500">
                      {dateformat(request.createdAt!)}
                    </td>
                    <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-4">
                        <span
                          className="hover:cursor-pointer"
                          onClick={() => toggleViewItems(request._id!)}
                        >
                          {visibleItems[request._id!] ? (
                            <HiMiniEyeSlash className="w-5 h-5" />
                          ) : (
                            <HiMiniEye className="w-5 h-5" />
                          )}
                        </span>

                        {request.status === "draft" && (
                          <button
                            className=" hover:cursor-pointer"
                            onClick={() => handleEdit(request)}
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                        )}

                        {request.status === "draft" && (
                          <button
                            className="text-red-600 hover:text-red-900 hover:cursor-pointer"
                            onClick={() => handleDelete(request._id!)}
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>

                  {/* ///////////////////////////// */}
                  {/*ITEMS TABLE*/}
                  {/* ///////////////////////////// */}

                  {visibleItems[request._id!] && (
                    <tr
                      key={`${request._id}-items`}
                      className="w-full h-10 scale-[95%]"
                    >
                      <td colSpan={6}>
                        <div className="border border-gray-400 px-6 py-4 rounded-md">
                          <div
                            className="w-full text-gray-700 text-sm mb-3"
                            style={{ letterSpacing: "1px" }}
                          >
                            <p>
                              <span className="font-bold mr-1 uppercase">
                                Account Code :{" "}
                              </span>{" "}
                              {request.accountCode}
                            </p>
                            <p>
                              <span className="font-bold mr-1 uppercase">
                                Charged To :{" "}
                              </span>
                              {request.expenseChargedTo}
                            </p>
                            <p>
                              <span className="font-bold mr-1 uppercase">
                                Address :{" "}
                              </span>{" "}
                              {request.address}
                            </p>
                            <p>
                              <span className="font-bold mr-1 uppercase">
                                City :{" "}
                              </span>{" "}
                              {request.city}
                            </p>
                            <p>
                              <span className="font-bold mr-1 uppercase">
                                Delivery Point :{" "}
                              </span>
                              {request.finalDeliveryPoint}
                            </p>

                            <p>
                              <span className="font-bold mr-1 uppercase">
                                Period Of Activity :
                              </span>
                              {request.periodOfActivity}
                            </p>
                            <p>
                              <span className="font-bold mr-1 uppercase">
                                Activity Description :{" "}
                              </span>
                              {request.activityDescription}
                            </p>
                          </div>

                          <h2
                            className="text-center text-lg text-gray-700 font-semibold"
                            style={{ letterSpacing: "2px" }}
                          >
                            ITEMS
                          </h2>
                          <table className=" min-w-full divide-y divide-gray-200 rounded-md mb-4">
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

                          {request?.reviewedBy &&
                            request.status !== "draft" && (
                              <div
                                className="flex justify-between items-center w-full text-gray-700 text-sm mb-2"
                                style={{ letterSpacing: "1px" }}
                              >
                                <div>
                                  <p>
                                    <span className="font-bold mr-1 uppercase">
                                      Reviewed By :
                                    </span>
                                    {`${request?.reviewedBy?.first_name} ${request?.reviewedBy?.last_name}`}
                                  </p>
                                </div>

                                {localStorageUserX.role !== "STAFF" && (
                                  <button
                                    onClick={() => handleAction(request)} // Use relative path here
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-buttonColor hover:bg-buttonColorHover "
                                  >
                                    <BiSolidPen className="h-4 w-4 mr-2" />
                                    Action
                                  </button>
                                )}
                              </div>
                            )}
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
