// ConceptNoteDetails.tsx
import { useParams } from 'react-router-dom';
import { IConceptNote } from '../../interfaces';
import { formatToDDMMYYYY } from '../../utils/formatToDDMMYYYY';
import { moneyFormat } from '../../utils/moneyFormat';
import FileAttachmentContainer from '../../components/custom/FileAttachmentContainer';
import CopiedTo from '../../components/custom/CopiedTo';
import DetailContainer from '../../components/custom/DetailContainer';
import { localStorageUser } from '../../utils/localStorageUser';

interface RequestDetailsProps {
  request: IConceptNote;
}

export const ConceptNoteDetails = ({ request }: RequestDetailsProps) => {
  const { requestId } = useParams();
  const currentUser = localStorageUser();

  // Determine if user can manage files (creator or admin)
  const canManageFiles =
    currentUser?.role === 'SUPER-ADMIN' || request.createdBy?.id === currentUser?.id;

  // Row data for the details section
  const rowData = [
    {
      id: 'accountCode',
      label: 'Account Code :',
      content: request.accountCode,
    },
    {
      id: 'expenseChargedTo',
      label: 'Charged To :',
      content: request.expenseChargedTo,
    },
    {
      id: 'activityTitle',
      label: 'Activity Title :',
      content: request.activityTitle,
    },
    {
      id: 'activityLocation',
      label: 'Activity Location :',
      content: request.activityLocation,
    },
    {
      id: 'activityPeriod',
      label: 'Activity Period :',
      content: `${formatToDDMMYYYY(
        request.activityPeriod.from
      )} - ${formatToDDMMYYYY(request.activityPeriod.to)}`,
    },
    {
      id: 'activityBudget',
      label: 'Activity Budget :',
      content: moneyFormat(Number(request.activityBudget), 'NGN'),
    },
    {
      id: 'backgroundContext',
      label: 'Background Context :',
      content: request.backgroundContext,
      isBlock: true,
    },
    {
      id: 'objectivesPurpose',
      label: 'Objectives/Purpose :',
      content: request.objectivesPurpose,
      isBlock: true,
    },
    {
      id: 'detailedActivityDescription',
      label: 'Detailed Activity Description :',
      content: request.detailedActivityDescription,
      isBlock: true,
    },
    {
      id: 'strategicPlan',
      label: 'Strategic Plan :',
      content: request.strategicPlan,
      isBlock: true,
    },
    {
      id: 'benefitsOfProject',
      label: 'Benefits of Project :',
      content: request.benefitsOfProject,
      isBlock: true,
    },
    {
      id: 'meansOfVerification',
      label: 'Means of Verification :',
      content: request.meansOfVerification,
    },
  ];

  return (
    <DetailContainer>
      {/* Request Details Section */}
      {request?.cnNumber && (
        <h1 className="text-center sm:text-lg font-extrabold pb-3 md:p-6">{request?.cnNumber}</h1>
      )}

      <div
        className={`${
          !requestId ? 'text-sm' : 'text-sm md:text-base'
        } mb-6 border-b border-gray-300 pb-6`}
      >
        {/* Left Column - Main Details */}
        <div className="flex flex-col items-start gap-3 md:gap-4 w-full">
          {rowData.map(data => (
            <div
              key={data.id}
              className={`w-full md:w-fit border-b-2 md:border-b-0 text-xs sm:text-sm flex flex-col gap-1 pb-2 md:pb-0 ${
                data.isBlock ? 'md:flex-col' : 'md:flex-row'
              }`}
            >
              <span className="font-bold uppercase whitespace-nowrap text-gray-700 mb-1 md:mb-0">
                {data.label}
              </span>
              <span className={`break-words ${data.isBlock ? 'whitespace-pre-line' : ''}`}>
                {data.content}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* File Attachments Section */}
      <FileAttachmentContainer
        modelName="ConceptNote"
        id={request.id}
        status={request.status}
        canManage={canManageFiles}
      />

      {/* Copied To */}
      {request.copiedTo?.length > 0 && <CopiedTo to={request.copiedTo!} />}
    </DetailContainer>
  );
};
