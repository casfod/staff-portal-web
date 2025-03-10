import { List } from "lucide-react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { RootState } from "../../store/store";
import { useEffect } from "react";
import { dateformat } from "../../utils/dateFormat";
import { moneyFormat } from "../../utils/moneyFormat";

const Request = () => {
  const navigate = useNavigate();
  const param = useParams();

  const purchaseRequest = useSelector(
    (state: RootState) => state.purchaseRequest.purchaseRequest
  );

  useEffect(() => {
    if (!param || !purchaseRequest) {
      navigate("/purchase-requests");
    }
  }, [purchaseRequest, param]);

  // Handle the case where purchaseRequest is null
  if (!purchaseRequest) {
    return <div>No purchase request data available.</div>;
  }

  console.log("🔥", purchaseRequest);

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="w-full flex justify-between items-center">
        <h1
          className="text-2xl font-semibold text-gray-700"
          style={{ fontFamily: "Lato", letterSpacing: "2px" }}
        >
          Review Request
        </h1>
        <button
          onClick={() => navigate(-1)} // Use relative path here
          className="inline-flex items-center px-4 py-2 border border-transparent font-medium rounded-md shadow-sm text-white bg-buttonColor hover:bg-buttonColorHover "
        >
          <List className="h-4 w-4 mr-2" />
          All Requests
        </button>
      </div>

      <div className="w-full bg-white shadow-sm rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                Department
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
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <>
              <tr key={purchaseRequest._id} className="h-[40px] max-h-[40px]">
                <td className="px-6 py-2 whitespace-nowrap font-medium text-gray-700">
                  {purchaseRequest.department}
                </td>
                <td className="px-6 py-2 whitespace-nowrap text-gray-500">
                  {moneyFormat(
                    purchaseRequest?.itemGroups!.reduce(
                      (sum, item) => sum + item.total,
                      0
                    ),
                    "NGN"
                  )}
                </td>
                <td className="px-6 py-2 whitespace-nowrap text-gray-500 uppercase">
                  {purchaseRequest.status}
                </td>
                <td className="px-6 py-2 whitespace-nowrap text-gray-500">
                  {purchaseRequest.requestedBy}
                </td>
                <td className="px-6 py-2 whitespace-nowrap text-gray-500">
                  {dateformat(purchaseRequest.createdAt!)}
                </td>
                {/* <td className="px-6 py-2 whitespace-nowrap text-gray-500">
                  <div className="flex space-x-4">
                    <span
                      className="hover:cursor-pointer"
                      onClick={() => toggleViewItems(purchaseRequest._id!)}
                    >
                      {visibleItems[purchaseRequest._id!] ? (
                        <HiMiniEyeSlash className="w-5 h-5" />
                      ) : (
                        <HiMiniEye className="w-5 h-5" />
                      )}
                    </span>

                    {(purchaseRequest.status === "draft" ||
                      purchaseRequest.status === "rejected") && (
                      <div className="flex space-x-4">
                        <button
                          className="hover:cursor-pointer"
                          onClick={() => handleEdit(purchaseRequest)}
                        >
                          <Edit className="h-5 w-5" />
                        </button>

                        <button
                          className="text-red-600 hover:text-red-900 hover:cursor-pointer"
                          onClick={() => handleDelete(purchaseRequest._id!)}
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    )}
                  </div>
                </td> */}
              </tr>

              {/* ///////////////////////////// */}
              {/*ITEMS TABLE*/}
              {/* ///////////////////////////// */}

              <tr
                key={`${purchaseRequest._id}-items`}
                className="w-full h-10 scale-[98%] "
              >
                <td colSpan={6}>
                  <div className="border border-gray-400 px-6 py-4 rounded-md">
                    <div
                      className="w-full text-gray-700 mb-3"
                      style={{ letterSpacing: "1px" }}
                    >
                      <p>
                        <span className="font-bold mr-1 uppercase">
                          Account Code :{" "}
                        </span>{" "}
                        {purchaseRequest.accountCode}
                      </p>
                      <p>
                        <span className="font-bold mr-1 uppercase">
                          Charged To :{" "}
                        </span>
                        {purchaseRequest.expenseChargedTo}
                      </p>
                      <p>
                        <span className="font-bold mr-1 uppercase">
                          Address :{" "}
                        </span>{" "}
                        {purchaseRequest.address}
                      </p>
                      <p>
                        <span className="font-bold mr-1 uppercase">
                          City :{" "}
                        </span>{" "}
                        {purchaseRequest.city}
                      </p>
                      <p>
                        <span className="font-bold mr-1 uppercase">
                          Delivery Point :{" "}
                        </span>
                        {purchaseRequest.finalDeliveryPoint}
                      </p>

                      <p>
                        <span className="font-bold mr-1 uppercase">
                          Period Of Activity :
                        </span>
                        {purchaseRequest.periodOfActivity}
                      </p>
                      <p>
                        <span className="font-bold mr-1 uppercase">
                          Activity Description :{" "}
                        </span>
                        {purchaseRequest.activityDescription}
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
                          <th className="px-6 py-3 bg-gray-50 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                            Description
                          </th>
                          <th className="px-6 py-3 bg-gray-50 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                            Quantity
                          </th>
                          <th className="px-6 py-3 bg-gray-50 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                            Frequency
                          </th>
                          <th className="px-6 py-3 bg-gray-50 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                            Unit Cost
                          </th>
                          <th className="px-6 py-3 bg-gray-50 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200 ">
                        {purchaseRequest?.itemGroups!.map((item) => (
                          <tr key={item._id!}>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                              {item.description}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                              {item.quantity}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                              {item.frequency}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                              {moneyFormat(item.unitCost, "NGN")}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                              {moneyFormat(item.total, "NGN")}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {purchaseRequest?.reviewedBy &&
                      purchaseRequest.status !== "draft" && (
                        <div
                          className="flex justify-between items-center w-full text-gray-700 mb-2"
                          style={{ letterSpacing: "1px" }}
                        >
                          <div>
                            <p>
                              <span className="font-bold mr-1 uppercase">
                                Reviewed By :
                              </span>
                              {`${purchaseRequest?.reviewedBy?.first_name} ${purchaseRequest?.reviewedBy?.last_name}`}
                            </p>
                          </div>
                        </div>
                      )}
                  </div>
                </td>
              </tr>
            </>
          </tbody>
          t
        </table>
      </div>
    </div>
  );
};

export default Request;
