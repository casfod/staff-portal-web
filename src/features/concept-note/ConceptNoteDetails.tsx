import { moneyFormat } from "../../utils/moneyFormat";
import { ConceptNoteType } from "../../interfaces";
import { useParams } from "react-router-dom";
import { dateformat } from "../../utils/dateFormat";
import FileAttachmentContainer from "../../ui/FileAttachmentContainer";
import DetailContainer from "../../ui/DetailContainer";
import CopiedTo from "../../ui/CopiedTo";

interface RequestDetailsProps {
  request: ConceptNoteType;
}

export const ConceptNoteDetails = ({ request }: RequestDetailsProps) => {
  const { requestId } = useParams();

  // Create the data object with all fields
  const conceptNoteData = [
    { id: "accountCode", label: "Account Code", content: request.account_Code },
    {
      id: "chargedTo",
      label: "Charged To",
      content: request.expense_Charged_To,
    },
    {
      id: "activityTitle",
      label: "Activity Title",
      content: request.activity_title,
      isBlock: true,
    },
    {
      id: "objectives",
      label: "Objectives Purpose",
      content: request.objectives_purpose,
      isBlock: true,
    },
    {
      id: "background",
      label: "Background Context",
      content: request.background_context,
      isBlock: true,
    },
    {
      id: "benefits",
      label: "Benefits Of Project",
      content: request.benefits_of_project,
      isBlock: true,
    },
    {
      id: "strategicPlan",
      label: "Strategic Plan",
      content: request.strategic_plan,
      isBlock: true,
    },
    {
      id: "location",
      label: "Activity Location",
      content: request.activity_location,
      isBlock: true,
    },
    {
      id: "description",
      label: "Detailed Activity Description",
      content: request.detailed_activity_description,
      isBlock: true,
    },
    {
      id: "period",
      label: "Activity Period",
      content: `${dateformat(request.activity_period.from)} - ${dateformat(
        request.activity_period.to
      )}`,
    },
    {
      id: "verification",
      label: "Means of verification",
      content: request.means_of_verification,
      isBlock: true,
    },
    {
      id: "budget",
      label: "Budget",
      content: moneyFormat(Number(request.activity_budget), "NGN"),
    },
  ];

  return (
    <DetailContainer>
      {/* Concept Note Details Section */}
      <div
        className={`flex flex-col gap-3 w-full   ${
          !requestId ? "text-sm" : "text-sm md:text-base"
        } mb-3 break-words`}
      >
        {conceptNoteData.map((item) => (
          <div
            key={item.id}
            className={item.isBlock ? "whitespace-pre-line" : ""}
          >
            <h2 className="text-sm font-extrabold uppercase mb-1">
              {item.label}:
            </h2>
            <p>{item.content}</p>
          </div>
        ))}
      </div>

      {/* Prepared By Section */}
      <div className="w-fit mt-4 border-t border-gray-300 pt-4">
        <p className={`${!requestId ? "text-sm" : "text-sm md:text-base"}  `}>
          <span className="font-bold mr-1 uppercase">Prepared By:</span>
          {`${request?.preparedBy?.first_name} ${request?.preparedBy?.last_name}`}
        </p>

        <p className={`${!requestId ? "text-sm" : "text-sm md:text-base"}  `}>
          <span className="font-bold mr-1 uppercase">Role:</span>
          {request?.preparedBy?.role}
        </p>
      </div>

      {/* File Attachments Section */}
      {request.files && request.files.length > 0 && (
        <FileAttachmentContainer files={request.files} />
      )}

      {/* Copied To */}
      {request.copiedTo?.length! > 0 && <CopiedTo to={request.copiedTo!} />}
    </DetailContainer>
  );
};
