// src/features/appraisal/AppraisalTableRow.tsx
import { IAppraisal, TableHeaderConfig } from '../../interfaces';
import { localStorageUser } from '../../utils/localStorageUser';
import { formatToDDMMYYYY } from '../../utils/formatToDDMMYYYY';

// Custom Components
import { BaseTableRow } from '../../components/custom/BaseTableRow';
import ActionIcons from '../../components/custom/ActionIcons';
import RequestCommentsAndActions from '../../components/custom/RequestActions';
import AppraisalCard from './AppraisalCard';
import { AppraisalDetails } from './AppraisalDetails';
import StatusBadge from '@/components/custom/StatusBadge';

interface AppraisalTableRowProps {
  request: IAppraisal;
  handleEdit: (request: IAppraisal) => void;
  handleDelete: (id: string) => void;
  handleAction: (request: IAppraisal) => void;
  tableHeadData?: TableHeaderConfig[];
}

const AppraisalTableRow = ({
  request,
  handleEdit,
  handleDelete,
  handleAction,
}: AppraisalTableRowProps) => {
  const currentUser = localStorageUser();

  const requestId = request.id ?? '';
  const requestStatus = request.status ?? '';
  const requestCreatedAt = request.createdAt ?? '';
  const createdById = request.createdBy?.id;

  const isEditable =
    (requestStatus === 'draft' || requestStatus === 'rejected') && createdById === currentUser?.id;

  const fullDate = formatToDDMMYYYY(requestCreatedAt);
  const createdBy = request.createdBy;

  // Define row data for the table
  const rowData = [
    {
      id: 'staffName',
      content:
        `${createdBy?.firstName || 'N/A'} ${createdBy?.lastName || 'N/A'}`.trim(),
      showOnMobile: true,
    },
    {
      id: 'code',
      content: request.appraisalCode || 'N/A',
      showOnMobile: false,
      showOnTablet: true,
    },
    {
      id: 'status',
      content: <StatusBadge status={request.status} />,
      showOnMobile: true,
    },
    {
      id: 'date',
      content: fullDate,
      showOnMobile: false,
      showOnTablet: true,
    },
    {
      id: 'actions',
      content: (
        <ActionIcons
          isEditable={isEditable}
          requestId={requestId}
          onEdit={() => handleEdit(request)}
          onDelete={handleDelete}
          request={request}
          variant="list"
        />
      ),
      showOnMobile: true,
    },
  ];

  // Expanded content when row is expanded
  const expandedContent = (
    <>
      <AppraisalDetails request={request} />
      <div className="mt-4 pt-4 border-t border-gray-200">
        <RequestCommentsAndActions request={request} handleAction={handleAction} />
      </div>
    </>
  );

  // Mobile card for small screens
  const mobileCard = (
    <AppraisalCard
      appraisal={request}
      requestId={requestId}
      actionIconsProps={{
        isEditable,
        requestId,
        onEdit: handleEdit,
        onDelete: handleDelete,
        request,
        variant: 'list',
        hideInspect: false,
      }}
      context="list"
      className="sm:hidden"
    />
  );

  return (
    <BaseTableRow
      id={requestId}
      rowData={rowData}
      expandedContent={expandedContent}
      mobileCard={mobileCard}
      isExpandable={true}
    />
  );
};

export default AppraisalTableRow;