import { StaffStrategyType, UserType } from "../../interfaces";
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

  const createdBy: UserType | null = request.createdBy;

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

  // Staff info fields config
  const staffFields = [
    {
      label: "Staff Name",
      value:
        `${createdBy?.first_name ?? ""} ${createdBy?.last_name ?? ""}`.trim() ||
        "N/A",
    },
    {
      label: "Job Title",
      value: createdBy?.employmentInfo?.jobDetails?.title || "N/A",
    },
    {
      label: "Department",
      value: request.department || "N/A",
    },
    {
      label: "Supervisor",
      value: getSupervisorName(
        createdBy?.employmentInfo?.jobDetails?.supervisor
      ),
    },
    {
      label: "Period",
      value: request.period || "N/A",
    },
  ];

  // Objective fields config — defines which keys to show per objective
  const objectiveFields: {
    label: string;
    key: keyof (typeof request.accountabilityAreas)[0]["objectives"][0];
    always?: boolean;
  }[] = [
    { label: "Timeline", key: "timeline", always: true },
    { label: "Expected Outcome", key: "expectedOutcome", always: true },
    { label: "KPI", key: "kpi", always: true },
    { label: "Possible Challenges", key: "possibleChallenges" },
    { label: "Support Required", key: "supportRequired" },
  ];

  return (
    <DetailContainer>
      {/* Strategy Header */}
      {request?.strategyCode && (
        <h1 className="text-center text-lg font-extrabold p-3">
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
          <h3 className="text-lg capitalize font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-300">
            STAFF INFORMATION
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {staffFields.map(({ label, value }) => (
              <div key={label}>
                <label className="block text-sm font-extrabold mb-1 uppercase tracking-wide text-gray-600">
                  {label}
                </label>
                <p className="text-gray-800 whitespace-pre-wrap">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Accountability Areas Section */}
        {request.accountabilityAreas?.length > 0 ? (
          <div className="rounded-lg p-4 border bg-gray-50 border-gray-200">
            <h3 className="text-lg capitalize font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-300">
              ACCOUNTABILITY AREAS & OBJECTIVES
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

                  {area.objectives?.length > 0 ? (
                    <div className="space-y-4">
                      {area.objectives.map((objective, objIndex) => (
                        <div
                          key={objIndex}
                          className="bg-white p-4 rounded-lg shadow-sm flex flex-col gap-4"
                        >
                          {/* Objective title */}
                          <div>
                            <label className="block text-base font-bold mb-1 uppercase tracking-wide text-gray-600">
                              Objective {objIndex + 1}
                            </label>
                            <p className="text-gray-800 whitespace-pre-wrap">
                              {objective.objective || "N/A"}
                            </p>
                          </div>

                          {/* Remaining objective fields */}
                          {objectiveFields.map(({ label, key, always }) => {
                            const value = objective[key];
                            if (!always && !value) return null;
                            return (
                              <div key={key}>
                                <label className="block text-sm font-bold mb-1 uppercase tracking-wide text-gray-600">
                                  {label}
                                </label>
                                <p className="text-gray-800 whitespace-pre-wrap">
                                  {value || "N/A"}
                                </p>
                              </div>
                            );
                          })}
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

        <SystemInfo request={request} />

        {request.files && request.files.length > 0 && (
          <FileAttachmentContainer files={request.files} />
        )}
      </div>
    </DetailContainer>
  );
};
