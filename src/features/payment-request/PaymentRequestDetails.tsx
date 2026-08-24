// PaymentRequestDetails.tsx - Refactored to match AdvanceRequestDetails
import { moneyFormat } from '../../utils/moneyFormat';
import { IPaymentRequest } from '../../interfaces';
import { useParams } from 'react-router-dom';
import { formatToDDMMYYYY } from '../../utils/formatToDDMMYYYY';
import FileAttachmentContainer from '../../components/custom/FileAttachmentContainer';
import DetailContainer from '../../components/custom/DetailContainer';
import CopiedTo from '../../components/custom/CopiedTo';
import { localStorageUser } from '../../utils/localStorageUser';

interface RequestDetailsProps {
  request: IPaymentRequest;
}

export const PaymentRequestDetails = ({ request }: RequestDetailsProps) => {
  const { requestId } = useParams();
  const currentUser = localStorageUser();

  // Determine if user can manage files (creator or admin)
  const canManageFiles =
    currentUser?.role === 'SUPER-ADMIN' || request.createdBy?.id === currentUser?.id;

  const rowData = [
    {
      id: 'grantCode',
      label: 'Grant Code :',
      content: request.grantCode,
    },
    {
      id: 'accountName',
      label: 'Account Name :',
      content: request.accountName,
    },
    {
      id: 'accountNumber',
      label: 'Account Number :',
      content: request.accountNumber,
    },
    {
      id: 'bankName',
      label: 'Bank Name :',
      content: request.bankName,
    },
    {
      id: 'amountInWords',
      label: 'Amount In Words :',
      content: request.amountInWords,
    },
    {
      id: 'amountInFigure',
      label: 'Amount :',
      content: moneyFormat(Number(request.amountInFigure), 'NGN'),
    },
    {
      id: 'dateOfExpense',
      label: 'Date Of Expense :',
      content: formatToDDMMYYYY(request?.dateOfExpense),
    },
    {
      id: 'purposeOfExpense',
      label: 'Purpose Of Expense :',
      content: request.purposeOfExpense,
    },
    {
      id: 'specialInstruction',
      label: 'Special Instruction :',
      content: request.specialInstruction,
    },
  ];

  return (
    <DetailContainer>
      {/* Payment Request Details Header */}
      {request?.pmrNumber && (
        <h1 className="text-center sm:text-lg font-extrabold pb-3 md:p-6">{request?.pmrNumber}</h1>
      )}

      {/* Details Grid */}
      <div
        className={`grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 ${
          !requestId ? 'text-sm' : 'text-sm md:text-base'
        } mb-6 border-b border-gray-300 pb-6`}
      >
        {/* Left Column */}
        <div className="flex flex-col items-start gap-3 md:gap-4 w-full">
          {rowData.slice(0, Math.ceil(rowData.length / 2)).map(data => (
            <div
              key={data.id}
              className="w-full md:w-fit border-b-2 md:border-b-0 text-xs sm:text-sm flex flex-col md:flex-row gap-1 pb-2 md:pb-0"
            >
              <span className="font-bold uppercase whitespace-nowrap text-gray-700 mb-1 md:mb-0">
                {data.label}
              </span>
              <span className="break-words">{data.content}</span>
            </div>
          ))}
        </div>

        {/* Right Column */}
        <div className="flex flex-col items-start gap-3 md:gap-4 w-full">
          {rowData.slice(Math.ceil(rowData.length / 2)).map(data => (
            <div
              key={data.id}
              className="w-full md:w-fit border-b-2 md:border-b-0 text-xs sm:text-sm flex flex-col md:flex-row gap-1 pb-2 md:pb-0"
            >
              <span className="font-bold uppercase whitespace-nowrap text-gray-700 mb-1 md:mb-0">
                {data.label}
              </span>
              <span className="break-words">{data.content}</span>
            </div>
          ))}
        </div>
      </div>

      {/* File Attachments Section */}
      <FileAttachmentContainer
        modelName="PaymentRequest"
        id={request.id}
        status={request.status}
        canManage={canManageFiles}
      />

      {/* Copied To */}
      {request.copiedTo?.length > 0 && <CopiedTo to={request.copiedTo!} />}
    </DetailContainer>
  );
};

export default PaymentRequestDetails;
