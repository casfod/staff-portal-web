// ExpenseClaimDetails.tsx - Refactored to match AdvanceRequestDetails
import { IExpenseClaim, IItemGroup } from '../../interfaces';
import { useParams } from 'react-router-dom';
import { formatToDDMMYYYY } from '../../utils/formatToDDMMYYYY';
import { moneyFormat } from '../../utils/moneyFormat';
import DetailContainer from '../../components/custom/DetailContainer';
import FileAttachmentContainer from '../../components/custom/FileAttachmentContainer';
import CopiedTo from '../../components/custom/CopiedTo';
import RequestItemsTable from '../../components/custom/RequestItemsTable';
import { localStorageUser } from '../../utils/localStorageUser';

interface RequestDetailsProps {
  request: IExpenseClaim;
}

export const ExpenseClaimDetails = ({ request }: RequestDetailsProps) => {
  const { requestId } = useParams();
  const currentUser = localStorageUser();

  // Determine if user can manage files (creator or admin)
  const canManageFiles =
    currentUser?.role === 'SUPER-ADMIN' || request.createdBy?.id === currentUser?.id;

  // Calculate total amount
  const totalAmount = request.expenses?.reduce((sum, item) => sum + item.total, 0) || 0;

  // Row data for the details section
  const rowData = [
    {
      id: 'staffName',
      label: 'Staff Name :',
      content:
        request.staffName ||
        `${request.createdBy?.firstName || 'N/A'} ${request.createdBy?.lastName || ''}`,
    },
    {
      id: 'accountCode',
      label: 'Account Code :',
      content: request.accountCode,
    },
    {
      id: 'expenseChargedTo',
      label: 'Expense Charged To :',
      content: request.expenseChargedTo,
    },
    {
      id: 'expenseReason',
      label: 'Expense Reason :',
      content: request.expenseReason,
    },
    {
      id: 'expensePeriod',
      label: 'Expense Period :',
      content: `${request.expenseClaim?.from || ''} - ${request.expenseClaim?.to || ''}`,
    },
    {
      id: 'dayOfDeparture',
      label: 'Day Of Departure :',
      content: request.dayOfDeparture ? formatToDDMMYYYY(request.dayOfDeparture) : 'N/A',
    },
    {
      id: 'dayOfReturn',
      label: 'Day Of Return :',
      content: request.dayOfReturn ? formatToDDMMYYYY(request.dayOfReturn) : 'N/A',
    },
    {
      id: 'amountInWords',
      label: 'Amount In Words :',
      content: request.amountInWords,
    },
    {
      id: 'totalAmount',
      label: 'Total Amount :',
      content: moneyFormat(totalAmount, 'NGN'),
    },
  ];

  // Split row data into two columns
  const midPoint = Math.ceil(rowData.length / 2);
  const leftColumnData = rowData.slice(0, midPoint);
  const rightColumnData = rowData.slice(midPoint);

  return (
    <DetailContainer>
      {/* Expense Claim Details Header */}
      {request?.ecNumber && (
        <h1 className="text-center sm:text-lg font-extrabold pb-3 md:p-6">{request?.ecNumber}</h1>
      )}

      {/* Details Grid */}
      <div
        className={`grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 ${
          !requestId ? 'text-sm' : 'text-sm md:text-base'
        } mb-6 border-b border-gray-300 pb-6`}
      >
        {/* Left Column */}
        <div className="flex flex-col items-start gap-3 md:gap-4 w-full">
          {leftColumnData.map(data => (
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
          {rightColumnData.map(data => (
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

      {/* Items/Expenses Section */}
      <h2 className="text-center text-base md:text-lg font-semibold tracking-widest mb-4">
        EXPENSES
      </h2>

      <RequestItemsTable items={request.expenses as IItemGroup[]} type="expense" />

      {/* File Attachments Section */}
      <FileAttachmentContainer
        modelName="ExpenseClaims"
        id={request.id}
        status={request.status}
        canManage={canManageFiles}
      />

      {/* Copied To */}
      {request.copiedTo?.length > 0 && <CopiedTo to={request.copiedTo!} />}
    </DetailContainer>
  );
};

export default ExpenseClaimDetails;
