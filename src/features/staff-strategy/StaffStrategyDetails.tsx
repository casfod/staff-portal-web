import { StaffStrategyType } from "../../interfaces";
import { useParams } from "react-router-dom";
import FileAttachmentContainer from "../../ui/FileAttachmentContainer";
import DetailContainer from "../../ui/DetailContainer";
import SystemInfo from "../../ui/SystemInfo";

interface StaffStrategyDetailsProps {
  request: StaffStrategyType;
}

export const StaffStrategyDetails = ({
  request,
}: StaffStrategyDetailsProps) => {
  const { requestId } = useParams();

  console.log(request);

  // Helper function to safely get user name
  const getUserName = (user: any) => {
    if (!user) return "N/A";
    if (typeof user === "object") {
      return `${user.first_name || ""} ${user.last_name || ""}`.trim() || "N/A";
    }
    return "N/A";
  };

  // Helper function to safely get user role
  const getUserRole = (user: any) => {
    if (!user) return "N/A";
    if (typeof user === "object") {
      return user.role || "N/A";
    }
    return "N/A";
  };

  // Helper to resolve supervisor — API may return a full user object or a plain string
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

  return (
    <DetailContainer>
      {/* Strategy Header */}
      {request?.strategyCode && (
        <h1 className="text-center text-lg font-extrabold p-6">
          {request.strategyCode}
        </h1>
      )}

      <div
        className={`flex flex-col gap-6 w-full ${
          !requestId ? "text-sm" : "text-sm md:text-base"
        } mb-6 break-words`}
      >
        {/* Staff Information Section */}
        <div className="rounded-lg p-4 border bg-gray-50 border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-300">
            Staff Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-extrabold mb-1 uppercase tracking-wide text-gray-600">
                Staff Name
              </label>
              <p className="text-gray-800">{request.staffName || "N/A"}</p>
            </div>
            <div>
              <label className="block text-sm font-extrabold mb-1 uppercase tracking-wide text-gray-600">
                Job Title
              </label>
              <p className="text-gray-800">{request.jobTitle || "N/A"}</p>
            </div>
            <div>
              <label className="block text-sm font-extrabold mb-1 uppercase tracking-wide text-gray-600">
                Department
              </label>
              <p className="text-gray-800">{request.department || "N/A"}</p>
            </div>
            <div>
              <label className="block text-sm font-extrabold mb-1 uppercase tracking-wide text-gray-600">
                Supervisor
              </label>
              <p className="text-gray-800">
                {getSupervisorName(request.supervisor)}
              </p>
            </div>
            <div>
              <label className="block text-sm font-extrabold mb-1 uppercase tracking-wide text-gray-600">
                Period
              </label>
              <p className="text-gray-800">{request.period || "N/A"}</p>
            </div>
          </div>
        </div>

        {/* Accountability Areas Section */}
        {request.accountabilityAreas &&
        request.accountabilityAreas.length > 0 ? (
          <div className="rounded-lg p-4 border bg-gray-50 border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-300">
              Accountability Areas & Objectives
            </h3>
            <div className="space-y-6">
              {request.accountabilityAreas.map((area, areaIndex) => (
                <div
                  key={areaIndex}
                  className="border-l-4 border-blue-500 pl-4"
                >
                  <h4 className="text-base font-bold text-blue-800 mb-3">
                    {area.areaName || "Unnamed Area"}
                  </h4>

                  {area.objectives && area.objectives.length > 0 ? (
                    <div className="space-y-4">
                      {area.objectives.map((objective, objIndex) => (
                        <div
                          key={objIndex}
                          className="bg-white p-4 rounded-lg shadow-sm"
                        >
                          {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> */}
                          <div className="flex flex-col gap-4">
                            <div className="md:col-span-2">
                              <label className="block text-xs font-bold mb-1 uppercase tracking-wide text-gray-600">
                                Objective
                              </label>
                              <p className="text-gray-800">
                                {objective.objective || "N/A"}
                              </p>
                            </div>
                            <div>
                              <label className="block text-xs font-bold mb-1 uppercase tracking-wide text-gray-600">
                                Timeline
                              </label>
                              <p className="text-gray-800">
                                {objective.timeline || "N/A"}
                              </p>
                            </div>
                            <div>
                              <label className="block text-xs font-bold mb-1 uppercase tracking-wide text-gray-600">
                                Expected Outcome
                              </label>
                              <p className="text-gray-800">
                                {objective.expectedOutcome || "N/A"}
                              </p>
                            </div>
                            <div>
                              <label className="block text-xs font-bold mb-1 uppercase tracking-wide text-gray-600">
                                KPI
                              </label>
                              <p className="text-gray-800">
                                {objective.kpi || "N/A"}
                              </p>
                            </div>
                            {objective.possibleChallenges && (
                              <div>
                                <label className="block text-xs font-bold mb-1 uppercase tracking-wide text-gray-600">
                                  Possible Challenges
                                </label>
                                <p className="text-gray-800">
                                  {objective.possibleChallenges}
                                </p>
                              </div>
                            )}
                            {objective.supportRequired && (
                              <div>
                                <label className="block text-xs font-bold mb-1 uppercase tracking-wide text-gray-600">
                                  Support Required
                                </label>
                                <p className="text-gray-800">
                                  {objective.supportRequired}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">
                      No objectives defined
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-lg p-4 border bg-gray-50 border-gray-200">
            <p className="text-gray-500 italic">
              No accountability areas defined
            </p>
          </div>
        )}

        {/* Approval Chain Section */}
        <div className="rounded-lg p-4 border bg-gray-50 border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-300">
            Approval Chain
          </h3>
          <div className="space-y-2">
            {/* Created By */}
            <p className="text-sm md:text-base">
              <span className="font-bold mr-1 uppercase">Prepared By:</span>
              {getUserName(request.createdBy)}
            </p>
            <p className="text-sm md:text-base">
              <span className="font-bold mr-1 uppercase">Role:</span>
              {getUserRole(request.createdBy)}
            </p>

            {/* Supervisor Information */}
            {request.supervisorId && (
              <p className="text-sm md:text-base">
                <span className="font-bold mr-1 uppercase">Supervisor:</span>
                {getSupervisorName(request.supervisor)}
              </p>
            )}

            {/* Approved By Information */}
            {request.approvedBy && (
              <>
                <p className="text-sm md:text-base">
                  <span className="font-bold mr-1 uppercase">Approved By:</span>
                  {getUserName(request.approvedBy)}
                </p>
                <p className="text-sm md:text-base">
                  <span className="font-bold mr-1 uppercase">
                    Approver Role:
                  </span>
                  {getUserRole(request.approvedBy)}
                </p>
              </>
            )}
          </div>
        </div>

        <SystemInfo request={request} />

        {/* File Attachments Section */}
        {request.files && request.files.length > 0 && (
          <FileAttachmentContainer files={request.files} />
        )}
      </div>
    </DetailContainer>
  );
};
