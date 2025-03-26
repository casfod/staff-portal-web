import { List } from "lucide-react";

import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { moneyFormat } from "../../utils/moneyFormat";
import { dateformat } from "../../utils/dateFormat";
import { localStorageUser } from "../../utils/localStorageUser";
import SpinnerMini from "../../ui/SpinnerMini";
import Swal from "sweetalert2";
import Button from "../../ui/Button";
import { useUpdateStatus } from "./Hooks/useUpdateStatus";

const ConceptNote = () => {
  const localStorageUserX = localStorageUser();
  const navigate = useNavigate();
  const param = useParams();
  const [status, setStatus] = useState("");
  const [comment, setComment] = useState("");

  // Access the conceptNote state from Redux
  const conceptNote = useSelector(
    (state: RootState) => state.conceptNote.conceptNote
  );

  // Redirect if no project or params are available
  useEffect(() => {
    if (!param || !conceptNote) {
      navigate("/concept-notes");
    }
  }, [conceptNote, param]);

  const { updateStatus } = useUpdateStatus(param.requestId!);

  const handleStatusChange = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to change this request status?",
      showCancelButton: true,
      confirmButtonColor: "#1373B0",
      cancelButtonColor: "#DC3340",
      confirmButtonText: "Yes, update it!",
      customClass: { popup: "custom-style" },
      animation: false, // Disable animations
    }).then((result) => {
      if (result.isConfirmed) {
        updateStatus(
          { status: status, comment: comment },
          {
            onError: (error) => {
              Swal.fire({
                title: "Error!",
                text: error.message,
                icon: "error",
                animation: false, // Disable animations for error modal
              });
            },
          }
        );
      }
    });
  };

  // Handle the case where purchaseRequest is null
  if (!conceptNote) {
    return <div>No project data available.</div>;
  }

  return (
    <div className="flex flex-col items-center gap-6 pb-16">
      {/* Header Section */}
      <div className="w-full flex justify-between items-center">
        <h1
          className="text-2xl font-semibold text-gray-700"
          style={{ fontFamily: "Lato", letterSpacing: "2px" }}
        >
          Concept Note
        </h1>
        <button
          onClick={() => navigate(-1)} // Use relative path here
          className="inline-flex items-center px-4 py-2 border border-transparent font-medium rounded-md shadow-sm text-white bg-buttonColor hover:bg-buttonColorHover "
        >
          <List className="h-4 w-4 mr-2" />
          All Projects
        </button>
      </div>

      {/* Main Table Section */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                Project Code
              </th>
              <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                Prepared By
              </th>
              <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              {/* <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th> */}
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            <>
              <tr key={conceptNote?.id}>
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-700 uppercase">
                  {conceptNote.project_code}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                  <div
                    className={`w-fit h-fit px-2 whitespace-nowrap rounded-lg uppercase mb-1
                        ${
                          conceptNote.status === "draft" &&
                          "border border-gray-400"
                        } 
                        ${
                          conceptNote.status === "pending" &&
                          "bg-amber-500 text-white"
                        } ${
                      conceptNote.status === "approved" &&
                      "bg-teal-600 text-white"
                    } 
                      ${
                        conceptNote.status === "rejected" &&
                        "bg-red-500 text-white"
                      }  `}
                  >
                    {conceptNote.status}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500 uppercase">
                  {conceptNote.staff_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500 uppercase">
                  {dateformat(conceptNote?.createdAt!)}
                </td>

                {/* <td className="px-6 py-2 whitespace-nowrap  text-gray-500">
                  <div className="flex space-x-4">
                    <span
                      className="hover:cursor-pointer"
                      onClick={() => toggleViewItems(conceptNote.id!)}
                    >
                      {visibleItems[conceptNote.id!] ? (
                        <HiMiniEyeSlash className="w-5 h-5" />
                      ) : (
                        <HiMiniEye className="w-5 h-5" />
                      )}
                    </span>

                    {(conceptNote?.status === "draft" ||
                      conceptNote.status === "rejected") &&
                      conceptNote?.preparedBy?.id! === localStorageUserX.id && (
                        <div className="flex space-x-4">
                          <button
                            className="hover:cursor-pointer"
                            onClick={() => handleEdit(conceptNote)}
                          >
                            <Edit className="h-5 w-5" />
                          </button>

                          <button
                            className="text-red-600 hover:text-red-900 hover:cursor-pointer"
                            onClick={() => handleDelete(conceptNote.id!)}
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      )}
                  </div>
                </td> */}
              </tr>

              <tr
                key={`${conceptNote.id}-details`}
                className="w-full h-10 "
                style={{ letterSpacing: "1px" }}
              >
                {" "}
                <td colSpan={5}>
                  <div className="border border-gray-300 px-6 py-4 rounded-lg shadow-sm ">
                    {/* note Details Section */}

                    <div className="flex flex-col gap-3">
                      <p className=" text-gray-700">
                        <span className="font-extrabold uppercase">
                          Project Code:
                        </span>{" "}
                        {conceptNote.project_code}
                      </p>
                      <div className=" text-gray-700 whitespace-pre-line">
                        <h2 className="font-extrabold uppercase mb-1">
                          Activity Title:
                        </h2>{" "}
                        <p>{conceptNote.activity_title}</p>
                      </div>

                      <div className="text-gray-700 whitespace-pre-line">
                        <h2 className="font-extrabold uppercase mb-1">
                          Objectives Purpose:
                        </h2>{" "}
                        <p> {conceptNote.objectives_purpose}</p>
                      </div>
                      <div className="text-gray-700 whitespace-pre-line">
                        <h2 className="font-extrabold uppercase mb-1">
                          Background Context:
                        </h2>{" "}
                        <p>{conceptNote.background_context}</p>
                      </div>

                      <div className="text-gray-700 whitespace-pre-line">
                        <h2 className="font-extrabold uppercase mb-1">
                          Benefits Of Project:
                        </h2>{" "}
                        <p>{conceptNote.benefits_of_project}</p>
                      </div>

                      <div className="text-gray-700 whitespace-pre-line">
                        <h2 className="font-extrabold uppercase mb-1">
                          Strategic Plan:
                        </h2>{" "}
                        <p>{conceptNote.strategic_plan}</p>
                      </div>
                      <div className="text-gray-700 whitespace-pre-line">
                        <h2 className="font-extrabold uppercase mb-1">
                          Activity Location:
                        </h2>{" "}
                        <p>{conceptNote.activity_location}</p>
                      </div>

                      <div className="text-gray-700 whitespace-pre-line">
                        <h2 className="font-extrabold uppercase mb-1">
                          Detailed Activity Description:
                        </h2>{" "}
                        <p>{conceptNote.detailed_activity_description}</p>
                      </div>
                      <div className="text-gray-700 whitespace-pre-line">
                        <h2 className="font-extrabold uppercase mb-1">
                          Means of verification:
                        </h2>{" "}
                        <p>{conceptNote.means_of_verification}</p>
                      </div>

                      <p className=" text-gray-700">
                        <span className="font-extrabold uppercase">
                          Budget:
                        </span>{" "}
                        {moneyFormat(
                          Number(conceptNote.activity_budget),
                          "NGN"
                        )}
                      </p>

                      <div className="w-fit  mt-4">
                        <p className=" text-gray-700">
                          <span className="font-bold mr-1 uppercase">
                            Prepared By :
                          </span>
                          {`${conceptNote?.preparedBy?.first_name} ${conceptNote?.preparedBy?.last_name}`}
                        </p>

                        <p className=" text-gray-700">
                          <span className="font-bold mr-1 uppercase">
                            Role :
                          </span>
                          {conceptNote?.preparedBy.role}
                        </p>
                      </div>

                      {conceptNote?.approvedBy && (
                        <div className=" w-fit  mt-4">
                          <p className=" text-gray-700">
                            <span className="font-bold mr-1 uppercase">
                              Approved By :
                            </span>
                            {`${conceptNote?.approvedBy?.first_name} ${conceptNote?.approvedBy?.last_name}`}
                          </p>

                          <p className=" text-gray-700">
                            <span className="font-bold mr-1 uppercase">
                              Role :
                            </span>
                            {conceptNote?.approvedBy.role}
                          </p>

                          <div className="flex flex-col gap-2 text-gray-600 mt-3">
                            <span className="font-bold mr-1  uppercase">
                              Comments :
                            </span>

                            <div className="flex flex-col gap-2 ">
                              {conceptNote?.comments?.map((comment) => (
                                <div className="border-2 px-4 py-2 rounded-lg shadow-lg bg-white">
                                  <p className="text-base font-extrabold">
                                    {`${comment.user.role}: ${comment.user.first_name} ${comment.user.last_name}`}
                                  </p>
                                  <p className="">{`${comment.text}`}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            </>
          </tbody>
        </table>
      </div>

      {conceptNote.status === "pending" &&
        localStorageUserX.id === conceptNote.approvedBy.id && (
          <div className="w-full text-gray-500">
            <div className="flex flex-col w-full gap-2">
              <label htmlFor="content">
                <span className="font-bold uppercase">Comment</span>{" "}
                <em>(Optional)</em>
              </label>
              <textarea
                id="content"
                className="border-2 w-full p-2 min-h-40 text-base rounded-lg shadow-sm focus:outline-none"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                aria-label="Enter your comment"
              />
            </div>

            {/* Action Dropdown */}
            <div className="w-fit border border-gray-700   rounded-md">
              <label htmlFor={`status-${conceptNote?.id}`} className="sr-only">
                Select Action
              </label>
              <select
                className="text-xs md: bg-inherit px-3 py-2 rounded-md"
                id={`status-${conceptNote?.id}`}
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                // disabled={isUpdatingStatus}
              >
                <option value="">ACTIONS</option>
                {conceptNote.status === "pending" ? (
                  <option value="approved">APPROVE REQUEST</option>
                ) : (
                  <option value="reviewed">APPROVE REVIEW</option>
                )}
                <option value="rejected">REJECT</option>
              </select>
            </div>

            {status && (
              <div className="flex w-full justify-center p-4">
                <Button size="medium" onClick={handleStatusChange}>
                  {false ? <SpinnerMini /> : "Update Status"}
                </Button>
              </div>
            )}
          </div>
        )}
    </div>
  );
};

export default ConceptNote;
