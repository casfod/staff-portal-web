import { Plus, Trash2, Edit } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useDebounce } from "use-debounce";

import NetworkErrorUI from "../../ui/NetworkErrorUI";
import { BiSearch } from "react-icons/bi";
import { GoXCircle } from "react-icons/go";
import { Pagination } from "../../ui/Pagination";
import { dateformat } from "../../utils/dateFormat";
import { moneyFormat } from "../../utils/moneyFormat";
import Spinner from "../../ui/Spinner";
import { HiMiniEye, HiMiniEyeSlash } from "react-icons/hi2";
import Swal from "sweetalert2";

import { TravelRequestType } from "../../interfaces";
import { useDispatch, useSelector } from "react-redux";
import { localStorageUser } from "../../utils/localStorageUser";
import { SlMagnifier } from "react-icons/sl";
import {
  setSearchTerm,
  setPage,
  resetQuery,
} from "../../store/genericQuerySlice";

import { RootState } from "../../store/store";
import { useAllTravelRequests } from "./Hooks/useAllTravelRequests";
import { useDeleteTravelRequest } from "./Hooks/useDeleteTravelRequest";
import { TravelRequestDetails } from "./TravelRequestDetails";
import { setTravelRequest } from "../../store/travelRequestSlice";

const AllTravelRequests = () => {
  const localStorageUserX = localStorageUser();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { searchTerm, sort, page, limit } = useSelector(
    (state: RootState) => state.genericQuerySlice
  );

  const [debouncedSearchTerm] = useDebounce(searchTerm, 600); // 500ms debounce
  const [visibleItems, setVisibleItems] = useState<{ [key: string]: boolean }>(
    {}
  );

  useEffect(() => {
    return () => {
      dispatch(resetQuery());
    };
  }, [dispatch]);

  const { data, isLoading, isError } = useAllTravelRequests(
    debouncedSearchTerm,
    sort,
    page,
    limit
  );

  const { deleteTravelRequest } = useDeleteTravelRequest(
    debouncedSearchTerm,
    sort,
    page,
    limit
  );

  // Add null checks for `data` and `data.data`
  const travelRequests = useMemo(
    () => data?.data?.travelRequests ?? [],
    [data]
  );
  const totalPages = useMemo(() => data?.data?.totalPages ?? 1, [data]);

  const toggleViewItems = (requestId: string) => {
    setVisibleItems((prev) => ({
      ...prev,
      [requestId]: !prev[requestId], // Toggle visibility for the specific request
    }));
  };

  const handlePageChange = (newPage: number) => {
    dispatch(setPage(newPage));
  };

  const handleAction = (request: TravelRequestType) => {
    dispatch(setTravelRequest(request));
    navigate(`/travel-requests/request/${request.id}`);
  };

  const handleEdit = (request: TravelRequestType) => {
    dispatch(setTravelRequest(request));
    navigate(`/travel-requests/edit-request/${request.id}`);
  };

  const handleDelete = (id: string) => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to delete this Advance Request?",
      showCancelButton: true,
      confirmButtonColor: "#1373B0",
      cancelButtonColor: "#DC3340",
      confirmButtonText: "Yes, delete it!",
      customClass: { popup: "custom-style" },
    }).then((result) => {
      if (result.isConfirmed) {
        deleteTravelRequest(id, {
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
    <div className="flex flex-col space-y-3 pb-16">
      <div className="flex justify-between items-center">
        <h1
          className="text-2xl font-semibold text-gray-700"
          style={{ letterSpacing: "2px" }}
        >
          Advance Requests
        </h1>
        <button
          onClick={() => navigate("/travel-requests/create-request")} // Use relative path here
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
            onChange={(e) => dispatch(setSearchTerm(e.target.value))}
            className="w-full h-full px-2 text-gray-700 placeholder-gray-400 rounded-lg focus:outline-none focus:ring-0 mr-7"
            placeholder="Search"
          />
          <span
            className="text-gray-400 absolute right-2 top-1/2 transform -translate-y-1/2 cursor-pointer hover:scale-110"
            onClick={() => dispatch(setSearchTerm(""))}
          >
            <GoXCircle />
          </span>
        </div>
      </div>

      {/* ///////////////////////////// */}
      {/*Advance REQUEST TABLE*/}
      {/* ///////////////////////////// */}

      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                Requested By
              </th>
              <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
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
              {travelRequests.map((request) => (
                <>
                  <tr key={request.id} className="h-[40px] max-h-[40px]">
                    <td className="px-6 py-2 whitespace-nowrap font-medium text-gray-700 uppercase">
                      {request.staffName}
                    </td>
                    <td className="px-6 py-2 whitespace-nowrap text-gray-500">
                      {moneyFormat(
                        request?.expenses!.reduce(
                          (sum, item) => sum + item.total,
                          0
                        ),
                        "NGN"
                      )}
                    </td>
                    <td className="px-6 py-2 whitespace-nowrap text-gray-500 uppercase">
                      <div
                        className={`w-fit h-fit border text-white px-2  whitespace-nowrap  rounded-lg uppercase mb-1
                      ${request.status === "pending" && "bg-secondary"} ${
                          request.status === "approved" && "bg-teal-600"
                        } ${request.status === "rejected" && "bg-red-500"} ${
                          request.status === "reviewed" && "bg-buttonColor"
                        }
                      `}
                      >
                        <p
                          className={``}
                          style={{ letterSpacing: "1px" }}
                        >{`${request.status}`}</p>
                      </div>
                    </td>
                    <td className="px-6 py-2 whitespace-nowrap text-gray-500 uppercase">
                      {request.staffName}
                    </td>
                    <td className="px-6 py-2 whitespace-nowrap text-gray-500 uppercase">
                      {dateformat(request.createdAt!)}
                    </td>

                    <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-4">
                        <span
                          className="hover:cursor-pointer"
                          onClick={() => toggleViewItems(request.id!)}
                        >
                          {visibleItems[request.id!] ? (
                            <HiMiniEyeSlash className="w-5 h-5" />
                          ) : (
                            <HiMiniEye className="w-5 h-5" />
                          )}
                        </span>

                        {(request.status === "draft" ||
                          request.status === "rejected") &&
                          request?.createdBy?.id! === localStorageUserX.id && (
                            <div className="flex space-x-4">
                              <button
                                className="hover:cursor-pointer"
                                onClick={() => handleEdit(request)}
                              >
                                <Edit className="h-5 w-5" />
                              </button>

                              <button
                                className="text-red-600 hover:text-red-900 hover:cursor-pointer"
                                onClick={() => handleDelete(request.id!)}
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
                            </div>
                          )}
                      </div>
                    </td>
                  </tr>

                  {/* ///////////////////////////// */}
                  {/*ITEMS TABLE*/}
                  {/* ///////////////////////////// */}

                  {visibleItems[request.id!] && (
                    <tr
                      key={`${request.id}-items`}
                      className="w-full h-10 scale-[95%]"
                    >
                      <td colSpan={6}>
                        <TravelRequestDetails request={request} />

                        {request?.reviewedBy && request.status !== "draft" && (
                          <div
                            className=" flex flex-col justify-between  w-full text-gray-700 text-sm mb-2 mt-4"
                            style={{ letterSpacing: "1px" }}
                          >
                            <div className="w-fit flex flex-col gap-2">
                              <p>
                                <span className="font-bold mr-1 uppercase">
                                  Reviewed By :
                                </span>
                                {`${request?.reviewedBy?.first_name} ${request?.reviewedBy?.last_name}`}
                              </p>
                              {request.approvedBy && (
                                <p>
                                  <span className="font-bold mr-1 uppercase">
                                    Approval :
                                  </span>
                                  {`${request?.approvedBy?.first_name} ${request?.approvedBy?.last_name}`}
                                </p>
                              )}

                              <div className="flex flex-col gap-2">
                                <span className="font-bold mr-1  uppercase">
                                  Comments :
                                </span>

                                <div className="flex flex-col gap-2">
                                  {request?.comments?.map((comment) => (
                                    <div className="border-2 px-4 py-2 rounded-lg shadow-lg bg-white">
                                      <p className="text-base font-extrabold">
                                        {`${comment.user.role}: ${comment.user.first_name} ${comment.user.last_name}`}
                                      </p>
                                      <p className="text-sm">{`${comment.text}`}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                            {handleAction && (
                              <button
                                onClick={() => handleAction(request)} // Use relative path here
                                className="self-center inline-flex items-center w-fit px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-buttonColor hover:bg-buttonColorHover mt-3"
                              >
                                {request.status !== "draft" && (
                                  <span className="inline-flex items-center gap-1">
                                    <SlMagnifier />
                                    <span>Inspect</span>
                                  </span>
                                )}
                              </button>
                            )}
                          </div>
                        )}
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
      {(travelRequests.length >= limit || totalPages > 1) && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default AllTravelRequests;
