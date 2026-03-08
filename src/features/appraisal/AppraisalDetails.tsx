// src/features/appraisal/AppraisalDetails.tsx
import { AppraisalType, UserType } from "../../interfaces";
import { useParams, useNavigate } from "react-router-dom";
import FileAttachmentContainer from "../../ui/FileAttachmentContainer";
import DetailContainer from "../../ui/DetailContainer";
import SystemInfo from "../../ui/SystemInfo";
import Button from "../../ui/Button";
// import { CheckCircle, PenTool, Edit } from "lucide-react";
import { Edit } from "lucide-react";

interface AppraisalDetailsProps {
  request: AppraisalType;
  canEditStaffSections?: boolean;
  canEditSupervisorSections?: boolean;
  isStaff?: boolean;
  isSupervisor?: boolean;
  isAdmin?: boolean;
}

export const AppraisalDetails = ({
  request,
  canEditStaffSections,
  canEditSupervisorSections,
  isStaff,
  isSupervisor,
  isAdmin,
}: AppraisalDetailsProps) => {
  const { appraisalId } = useParams();
  const navigate = useNavigate();

  const getRatingDisplay = (rating: string) => {
    const colors = {
      Achieved: "text-green-600 bg-green-100",
      "Partly Achieved": "text-yellow-600 bg-yellow-100",
      "Not Achieved": "text-red-600 bg-red-100",
      "": "text-gray-600 bg-gray-100",
    };
    return colors[rating as keyof typeof colors] || "text-gray-600 bg-gray-100";
  };

  const getPerformanceRatingDisplay = (rating: string) => {
    const colors = {
      "Exceeds Expectations": "text-green-600 bg-green-100",
      "Meets Expectations": "text-blue-600 bg-blue-100",
      "Needs Improvement": "text-orange-600 bg-orange-100",
    };
    return colors[rating as keyof typeof colors] || "text-gray-600 bg-gray-100";
  };

  const getSupervisorName = (supervisor: any) => {
    if (!supervisor) return "N/A";
    if (typeof supervisor === "object") {
      return (
        `${supervisor.first_name || ""} ${supervisor.last_name || ""}`.trim() ||
        "N/A"
      );
    }
    return supervisor || "N/A";
  };

  const createdBy: UserType | null = request.createdBy;

  // Check if user can edit the entire appraisal
  const canEditFull =
    isAdmin ||
    (isStaff && request.status === "draft") ||
    (isSupervisor && request.status === "pending");

  return (
    <DetailContainer>
      {/* Appraisal Header */}
      {request?.appraisalCode && (
        <h1 className="text-center text-lg font-extrabold p-6">
          {request.appraisalCode}
        </h1>
      )}

      {/* Edit Button */}
      {canEditFull && (
        <div className="flex justify-end mb-4">
          <Button
            type="button"
            size="small"
            onClick={() =>
              navigate(`/human-resources/appraisals/edit/${appraisalId}`)
            }
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Appraisal
          </Button>
        </div>
      )}

      <div
        className={`flex flex-col gap-6 w-full ${
          !appraisalId ? "text-sm" : "text-sm md:text-base"
        } mb-6 break-words`}
      >
        {/* Section 1: Staff Information */}
        <div className="rounded-lg p-4 border bg-gray-50 border-gray-200">
          <h3 className="text-lg capitalize font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-300">
            SECTION 1: STAFF INFORMATION
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-extrabold mb-1 uppercase tracking-wide text-gray-600">
                Staff Name
              </label>
              <p className="text-gray-800">
                {request.staffName ||
                  `${createdBy?.first_name || ""} ${
                    createdBy?.last_name || ""
                  }`.trim() ||
                  "N/A"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-extrabold mb-1 uppercase tracking-wide text-gray-600">
                Position
              </label>
              <p className="text-gray-800">
                {request.position ||
                  createdBy?.employmentInfo?.jobDetails?.title ||
                  "N/A"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-extrabold mb-1 uppercase tracking-wide text-gray-600">
                Department
              </label>
              <p className="text-gray-800">{request.department || "N/A"}</p>
            </div>
            <div>
              <label className="block text-sm font-extrabold mb-1 uppercase tracking-wide text-gray-600">
                Length of Time in Position
              </label>
              <p className="text-gray-800">
                {request.lengthOfTimeInPosition || "N/A"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-extrabold mb-1 uppercase tracking-wide text-gray-600">
                Appraisal Period
              </label>
              <p className="text-gray-800">
                {request.appraisalPeriod || "N/A"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-extrabold mb-1 uppercase tracking-wide text-gray-600">
                Date of Appraisal
              </label>
              <p className="text-gray-800">
                {request.dateOfAppraisal
                  ? new Date(request.dateOfAppraisal).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
          </div>

          <h4 className="text-md font-semibold text-gray-800 mt-4 mb-2">
            Supervisor Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-extrabold mb-1 uppercase tracking-wide text-gray-600">
                Name of Supervisor
              </label>
              <p className="text-gray-800">
                {request.supervisorName ||
                  getSupervisorName(
                    createdBy?.employmentInfo?.jobDetails?.supervisor
                  )}
              </p>
            </div>
            <div>
              <label className="block text-sm font-extrabold mb-1 uppercase tracking-wide text-gray-600">
                Length of Time Supervised
              </label>
              <p className="text-gray-800">
                {request.lengthOfTimeSupervised || "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Performance Objectives */}
        {request.objectives && request.objectives.length > 0 && (
          <div className="rounded-lg p-4 border bg-gray-50 border-gray-200">
            <h3 className="text-lg capitalize font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-300">
              SECTION 2: PERFORMANCE OBJECTIVES
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Objectives
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee Rating
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Supervisor Rating
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {request.objectives.map((obj, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {obj.objective || `Objective ${index + 1}`}
                      </td>
                      <td className="px-4 py-3">
                        {obj.employeeRating ? (
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getRatingDisplay(
                              obj.employeeRating
                            )}`}
                          >
                            {obj.employeeRating} ({obj.employeePoints} pts)
                          </span>
                        ) : (
                          <span className="text-gray-400">Not rated</span>
                        )}
                        {canEditStaffSections && (
                          <span className="ml-2 text-xs text-blue-500">
                            (You can edit)
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {obj.supervisorRating ? (
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getRatingDisplay(
                              obj.supervisorRating
                            )}`}
                          >
                            {obj.supervisorRating} ({obj.supervisorPoints} pts)
                          </span>
                        ) : (
                          <span className="text-gray-400">Not rated</span>
                        )}
                        {canEditSupervisorSections && (
                          <span className="ml-2 text-xs text-blue-500">
                            (You can edit)
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Safeguarding Section */}
            {request.safeguarding && (
              <div className="mt-4 p-3 bg-white rounded-lg">
                <h4 className="font-semibold text-gray-700 mb-2">
                  Safeguarding
                </h4>
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="block text-xs font-bold mb-1 uppercase tracking-wide text-gray-600">
                      Actions Taken
                    </label>
                    <p className="text-gray-800">
                      {request.safeguarding.actionsTaken || "N/A"}
                    </p>
                    {canEditStaffSections && (
                      <span className="text-xs text-blue-500">
                        (You can edit)
                      </span>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1 uppercase tracking-wide text-gray-600">
                      Achievements
                    </label>
                    <p className="text-gray-800">
                      {request.achievements || "N/A"}
                    </p>
                    {canEditStaffSections && (
                      <span className="text-xs text-blue-500">
                        (You can edit)
                      </span>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1 uppercase tracking-wide text-gray-600">
                      Training Completed
                    </label>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        request.safeguarding.trainingCompleted === "Yes"
                          ? "text-green-600 bg-green-100"
                          : request.safeguarding.trainingCompleted === "Partly"
                          ? "text-yellow-600 bg-yellow-100"
                          : "text-red-600 bg-red-100"
                      }`}
                    >
                      {request.safeguarding.trainingCompleted}
                    </span>
                  </div>
                  {request.safeguarding.areasNotUnderstood?.length > 0 && (
                    <div>
                      <label className="block text-xs font-bold mb-1 uppercase tracking-wide text-gray-600">
                        Areas Not Understood
                      </label>
                      <ul className="list-disc list-inside">
                        {request.safeguarding.areasNotUnderstood.map(
                          (area, i) => (
                            <li key={i} className="text-gray-800">
                              {area}
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Section 3: Supervisor's Assessment */}
        {request.performanceAreas && request.performanceAreas.length > 0 && (
          <div className="rounded-lg p-4 border bg-gray-50 border-gray-200">
            <h3 className="text-lg capitalize font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-300">
              SECTION 3: SUPERVISOR'S ASSESSMENT
            </h3>
            <div className="space-y-3">
              {request.performanceAreas.map((area, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-2 bg-white rounded-lg"
                >
                  <span className="font-medium text-gray-700">
                    {area.area}:
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getPerformanceRatingDisplay(
                      area.rating
                    )}`}
                  >
                    {area.rating}
                  </span>
                </div>
              ))}
            </div>

            {request.supervisorComments && (
              <div className="mt-4 p-3 bg-white rounded-lg">
                <label className="block text-xs font-bold mb-1 uppercase tracking-wide text-gray-600">
                  Supervisor's Comments
                </label>
                <p className="text-gray-800">{request.supervisorComments}</p>
                {canEditSupervisorSections && (
                  <span className="text-xs text-blue-500">(You can edit)</span>
                )}
              </div>
            )}

            {request.overallRating && (
              <div className="mt-4 p-3 bg-white rounded-lg">
                <label className="block text-xs font-bold mb-1 uppercase tracking-wide text-gray-600">
                  Overall Assessment
                </label>
                <p
                  className={`font-semibold ${
                    request.overallRating === "Meets Requirements"
                      ? "text-green-600"
                      : request.overallRating === "Partly Meets Requirements"
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}
                >
                  {request.overallRating}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Section 4: Future Goals */}
        {request.futureGoals && (
          <div className="rounded-lg p-4 border bg-gray-50 border-gray-200">
            <h3 className="text-lg capitalize font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-300">
              SECTION 4: FUTURE GOALS
            </h3>
            <p className="text-gray-800">{request.futureGoals}</p>
          </div>
        )}

        {/* Section 5: Signatures */}
        {/* <div className="rounded-lg p-4 border bg-gray-50 border-gray-200">
          <h3 className="text-lg capitalize font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-300">
            SECTION 5: SIGNATURES
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-white rounded-lg">
              <h4 className="font-semibold text-gray-700 mb-2">
                Staff Signature
              </h4>
              {request.signatures?.staffSignature ? (
                <div className="flex items-center text-green-600">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  <span>
                    Signed on{" "}
                    {request.signatures.staffSignatureDate
                      ? new Date(
                          request.signatures.staffSignatureDate
                        ).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
              ) : (
                <div className="flex items-center text-gray-400">
                  <PenTool className="h-5 w-5 mr-2" />
                  <span>Pending signature</span>
                </div>
              )}
              {request.signatures?.staffComments && (
                <p className="mt-2 text-sm text-gray-600">
                  {request.signatures.staffComments}
                </p>
              )}
            </div>

            <div className="p-3 bg-white rounded-lg">
              <h4 className="font-semibold text-gray-700 mb-2">
                Supervisor Signature
              </h4>
              {request.signatures?.supervisorSignature ? (
                <div className="flex items-center text-green-600">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  <span>
                    Signed on{" "}
                    {request.signatures.supervisorSignatureDate
                      ? new Date(
                          request.signatures.supervisorSignatureDate
                        ).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
              ) : (
                <div className="flex items-center text-gray-400">
                  <PenTool className="h-5 w-5 mr-2" />
                  <span>Pending signature</span>
                </div>
              )}
              {request.signatures?.hrComments && (
                <p className="mt-2 text-sm text-gray-600">
                  {request.signatures.hrComments}
                </p>
              )}
            </div>
          </div>
        </div> */}

        {/* Scores Summary */}
        {request.scores && (
          <div className="rounded-lg p-4 border bg-blue-50 border-blue-200">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">
              SCORES SUMMARY
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-3 rounded-lg text-center">
                <div className="text-sm text-gray-600">Employee Total</div>
                <div className="text-2xl font-bold text-blue-600">
                  {request.scores.employeeTotal}
                </div>
              </div>
              <div className="bg-white p-3 rounded-lg text-center">
                <div className="text-sm text-gray-600">Supervisor Total</div>
                <div className="text-2xl font-bold text-green-600">
                  {request.scores.supervisorTotal}
                </div>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">
                  Performance Areas
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-orange-600">
                    Needs Improvement:{" "}
                    {request.scores.performanceAreasCount.needsImprovement}
                  </span>
                  <span className="text-blue-600">
                    Meets:{" "}
                    {request.scores.performanceAreasCount.meetsExpectations}
                  </span>
                  <span className="text-green-600">
                    Exceeds:{" "}
                    {request.scores.performanceAreasCount.exceedsExpectations}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        <SystemInfo request={request} />

        {request.files && request.files.length > 0 && (
          <FileAttachmentContainer files={request.files} />
        )}
      </div>
    </DetailContainer>
  );
};
