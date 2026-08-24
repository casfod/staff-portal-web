// src/features/appraisal/Appraisal.tsx
import { List } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useMemo, useRef, useState } from 'react';
import { formatToDDMMYYYY } from '../../utils/formatToDDMMYYYY';
import { localStorageUser } from '../../utils/localStorageUser';

// Components
import TextHeader from '../../components/custom/TextHeader';
import { Button } from '../../components/ui/button';
import StatusBadge from '../../components/custom/StatusBadge';
import ActionIcons from '../../components/custom/ActionIcons';
import StatusUpdateForm from '../../components/custom/StatusUpdateForm';
import Spinner from '../../components/custom/Spinner';
import NetworkErrorUI from '../../components/custom/NetworkErrorUI';
import { DataStateContainer } from '../../components/custom/DataStateContainer';
import AppraisalCard from './AppraisalCard';
import { AppraisalDetails } from './AppraisalDetails';

// Hooks
import {
  useAppraisal,
  // useCopy,
  useUpdateAppraisalStatus,
} from './Hooks/useAppraisal';
import { usePdfDownload } from '../../hooks/usePdfDownload';
import { useRequestPermissions } from '../../hooks/useRequestPermissions';
import { truncateText } from '../../utils/truncateText';
import { infoConfig } from '@/config/config-info';

const Appraisal = () => {
  const currentUser = localStorageUser();
  const navigate = useNavigate();
  const { appraisalId } = useParams();

  // State
  const [status, setStatus] = useState('');
  const [comment, setComment] = useState('');

  // Data fetching
  const { data: remoteData, isLoading, isError } = useAppraisal(appraisalId!);
  const appraisalFromStore = useSelector((state: RootState) => state.appraisal?.appraisal);

  const request = useMemo(() => remoteData?.data || appraisalFromStore, [remoteData, appraisalFromStore]);

  // Redirect logic
  useEffect(() => {
    if (!appraisalId || (!isLoading && !request)) {
      navigate('/human-resources/appraisals');
    }
  }, [request, appraisalId, navigate, isLoading]);

  // Status update hook
  const { updateStatus, isPending: isUpdatingStatus } = useUpdateAppraisalStatus(appraisalId!);
  // Permissions
  const permissions = useRequestPermissions({
    request,
    currentUser,
    isTwoStep: false,
  });

  // Additional permission flags specific to Appraisal
  const isStaff = request?.createdBy?.id === currentUser?.id;
  const isSupervisor =
    typeof request?.supervisorId === 'object' && (request.supervisorId as { id?: string })?.id === currentUser?.id;

  const canEditStaffSections =
    isStaff && (request?.status === 'draft' || request?.status === 'pending');
  const canEditSupervisorSections = isSupervisor && request?.status === 'pending';

  // Check if user can approve (must be the assigned approver and appraisal is pending)
  const canApprove = request?.status === 'pending' && request?.approvedBy?.id === currentUser?.id;

  // PDF
  const pdfContentRef = useRef<HTMLDivElement>(null);
  const { downloadPdf, isGenerating } = usePdfDownload({
    filename: `${infoConfig.abbriviation}-Appraisal-${request?.appraisalCode || request?.id}`,
    multiPage: true,
    titleOptions: {
      text: `${infoConfig.abbriviation} Appraisal : ${request?.appraisalCode || ''}`,
    },
    footerCode: {
      label: `${infoConfig.abbriviation} Appraisal`,
      value: request?.appraisalCode ?? '',
    },
  });

  const handleDownloadPDF = () => {
    downloadPdf(pdfContentRef);
  };


  const handleStatusChange = () => {
    if (!status) return;

    updateStatus(
      { status: status as 'approved' | 'rejected', comment },
      {
        onSuccess: () => {
          setStatus('');
          setComment('');
        },
      }
    );
  };

  const tableHeadData = ['Staff Name', 'Status', 'Appraisal Code', 'Date', 'Actions'];

  if (isError) return <NetworkErrorUI />;

  return (
    <div className="flex flex-col space-y-3 pb-80">
      {/* Header */}
      <div className="sticky -top-8 z-10 bg-[#F8F8F8] pt-4 md:pt-6 pb-3 space-y-1.5 border-b">
        <div className="flex justify-between items-center">
          <TextHeader>Appraisal</TextHeader>
          <Button variant="outline" size="sm" onClick={() => navigate('/human-resources/appraisals')}>
            <List className="h-4 w-4 mr-1 md:mr-2" />
            List
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <DataStateContainer
        isLoading={isLoading}
        isError={isError}
        data={request}
        errorComponent={<NetworkErrorUI />}
        loadingComponent={<Spinner />}
        emptyComponent={<div>No appraisal data available.</div>}
      >
        {/* Main Table Section */}
        <div ref={pdfContentRef}>
          <div className="w-full bg-inherit shadow-sm rounded-lg border pb-[200px] overflow-x-scroll">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr className="hidden sm:table-row">
                  {tableHeadData.map((title, index) => (
                    <th
                      key={index}
                      className="px-3 py-2.5 md:px-6 md:py-3 text-left font-medium uppercase text-xs 2xl:text-text-sm tracking-wider"
                    >
                      {title}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {/* Desktop Row */}
                <tr className="hidden sm:table-row" key={request?.id}>
                  <td className="min-w-[150px] px-3 py-2.5 md:px-6 md:py-3 text-left font-medium text-sm 2xl:text-text-base tracking-wider">
                    {truncateText(
                      `${request?.createdBy?.firstName || ''} ${request?.createdBy?.lastName || ''}`.trim() || 'N/A',
                      30
                    )}
                  </td>
                  <td className="min-w-[150px] px-3 py-2.5 md:px-6 md:py-3 text-left font-medium text-sm 2xl:text-text-base tracking-wider">
                    <StatusBadge status={request?.status ?? 'unknown'} />
                  </td>
                  <td className="min-w-[150px] px-3 py-2.5 md:px-6 md:py-3 text-left font-medium text-sm 2xl:text-text-base tracking-wider">
                    {request?.appraisalCode || 'N/A'}
                  </td>
                  <td className="min-w-[150px] px-3 py-2.5 md:px-6 md:py-3 text-left font-medium text-sm 2xl:text-text-base tracking-wider">
                    {formatToDDMMYYYY(request?.createdAt ?? new Date().toISOString())}
                  </td>
                  <td className="min-w-[150px] px-3 py-2.5 md:px-6 md:py-3 text-left font-medium text-sm 2xl:text-text-base tracking-wider">
                    <ActionIcons
                      requestId={request?.id}
                      isGeneratingPDF={isGenerating}
                      onDownloadPDF={handleDownloadPDF}
                      hideInspect={true}
                    />
                  </td>
                </tr>

                {/* Mobile Card View */}
                <tr className="sm:hidden">
                  <td colSpan={tableHeadData.length} className="p-4 border-b border-gray-200">
                    {request && (
                      <AppraisalCard
                        appraisal={request}
                        requestId={request.id}
                        actionIconsProps={{
                          isGeneratingPDF: isGenerating,
                          onDownloadPDF: handleDownloadPDF,
                          hideInspect: true,
                        }}
                        context="detail"
                      />
                    )}
                  </td>
                </tr>

                {/* Details Section */}
                <tr>
                  <td colSpan={tableHeadData.length}>
                    <div className="border border-gray-300 px-3 py-2.5 md:px-6 md:py-3 rounded-md h-auto relative">
                      {request && (
                        <AppraisalDetails
                          request={request}
                          canEditStaffSections={canEditStaffSections}
                          canEditSupervisorSections={canEditSupervisorSections}
                          isStaff={isStaff}
                          isSupervisor={isSupervisor}
                          isAdmin={permissions.isAdmin}
                        />
                      )}

                      {/* Comments Section */}
                      {request && permissions.canAddComments && (
                        <div className="mt-6 border-t border-gray-200 pt-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-3">Comments</h4>
                          {/* Add comment form and comment list would go here */}
                          {/* You can render the comment section from RequestDetailLayout or create a custom component */}
                        </div>
                      )}

                      {/* Status Update Form for Approver */}
                      {canApprove && (
                        <div className="mt-4">
                          <StatusUpdateForm
                            requestStatus={request?.status}
                            status={status}
                            setStatus={setStatus}
                            comment={comment}
                            setComment={setComment}
                            isUpdatingStatus={isUpdatingStatus}
                            handleStatusChange={handleStatusChange}
                            statusOptions={[
                              { value: 'approved', label: 'Approve Appraisal' },
                              { value: 'rejected', label: 'Reject Appraisal' },
                            ]}
                          />
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </DataStateContainer>
    </div>
  );
};

export default Appraisal;