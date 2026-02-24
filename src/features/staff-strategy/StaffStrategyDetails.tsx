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

  return (
    <DetailContainer>
      {/* Strategy Header */}
      {request?.strategyCode && (
        <h1 className="text-center text-lg font-extrabold p-6">
          {request?.strategyCode}
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
              <p className="text-gray-800">{request.staffName}</p>
            </div>
            <div>
              <label className="block text-sm font-extrabold mb-1 uppercase tracking-wide text-gray-600">
                Job Title
              </label>
              <p className="text-gray-800">{request.jobTitle}</p>
            </div>
            <div>
              <label className="block text-sm font-extrabold mb-1 uppercase tracking-wide text-gray-600">
                Department
              </label>
              <p className="text-gray-800">{request.department}</p>
            </div>
            <div>
              <label className="block text-sm font-extrabold mb-1 uppercase tracking-wide text-gray-600">
                Supervisor
              </label>
              <p className="text-gray-800">{request.supervisor}</p>
            </div>
            <div>
              <label className="block text-sm font-extrabold mb-1 uppercase tracking-wide text-gray-600">
                Period
              </label>
              <p className="text-gray-800">{request.period}</p>
            </div>
          </div>
        </div>

        {/* Accountability Areas Section */}
        {request.accountabilityAreas &&
          request.accountabilityAreas.length > 0 && (
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
                      {area.areaName}
                    </h4>

                    {area.objectives && area.objectives.length > 0 ? (
                      <div className="space-y-4">
                        {area.objectives.map((objective, objIndex) => (
                          <div
                            key={objIndex}
                            className="bg-white p-4 rounded-lg shadow-sm"
                          >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="md:col-span-2">
                                <label className="block text-xs font-bold mb-1 uppercase tracking-wide text-gray-600">
                                  Objective
                                </label>
                                <p className="text-gray-800">
                                  {objective.objective}
                                </p>
                              </div>
                              <div>
                                <label className="block text-xs font-bold mb-1 uppercase tracking-wide text-gray-600">
                                  Timeline
                                </label>
                                <p className="text-gray-800">
                                  {objective.timeline}
                                </p>
                              </div>
                              <div>
                                <label className="block text-xs font-bold mb-1 uppercase tracking-wide text-gray-600">
                                  Expected Outcome
                                </label>
                                <p className="text-gray-800">
                                  {objective.expectedOutcome}
                                </p>
                              </div>
                              <div>
                                <label className="block text-xs font-bold mb-1 uppercase tracking-wide text-gray-600">
                                  KPI
                                </label>
                                <p className="text-gray-800">{objective.kpi}</p>
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
          )}

        {/* Approval Chain Section */}
        <div className="rounded-lg p-4 border bg-gray-50 border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-300">
            Approval Chain
          </h3>
          <div className="space-y-2">
            <p className="text-sm md:text-base">
              <span className="font-bold mr-1 uppercase">Prepared By:</span>
              {request?.createdBy?.first_name} {request?.createdBy?.last_name}
            </p>
            <p className="text-sm md:text-base">
              <span className="font-bold mr-1 uppercase">Role:</span>
              {request?.createdBy?.role}
            </p>

            {/* Supervisor Information */}
            {request.supervisorId && (
              <>
                <p className="text-sm md:text-base">
                  <span className="font-bold mr-1 uppercase">Supervisor:</span>
                  {request.supervisor}
                </p>
              </>
            )}

            {/* Approver Information */}
            {request.approvedBy && (
              <>
                <p className="text-sm md:text-base">
                  <span className="font-bold mr-1 uppercase">Approved By:</span>
                  {request?.approvedBy?.first_name}{" "}
                  {request?.approvedBy?.last_name}
                </p>
                <p className="text-sm md:text-base">
                  <span className="font-bold mr-1 uppercase">
                    Approver Role:
                  </span>
                  {request?.approvedBy?.role}
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
