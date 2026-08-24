// AdvanceRequest.tsx - Optimized Version
import { List, Loader2 } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { RootState } from '../../store/store';
import { useEffect, useMemo, useRef, useState } from 'react';
import { formatToDDMMYYYY } from '../../utils/formatToDDMMYYYY';
import { moneyFormat } from '../../utils/moneyFormat';
import { capitalizeFirstLetter } from '../../utils/capitalizeFirstLetter';
import { localStorageUser } from '../../utils/localStorageUser';
import { useAdmins } from '../user/Hooks/useUsers';
import { IComment, IItemGroup, IRequestDetailFormData } from '../../interfaces';
import { useRequestPermissions } from '../../hooks/useRequestPermissions';

// Radix UI Components
import { Button } from '../../components/ui/button';

// Custom Components
import TextHeader from '../../components/custom/TextHeader';
import StatusBadge from '../../components/custom/StatusBadge';
import ActionIcons from '../../components/custom/ActionIcons';
import AdvanceRequestCard from './AdvanceRequestCard';
import RequestDetailLayout, { TRequestEntity } from '../../components/custom/RequestDetailLayout';
import NetworkErrorUI from '../../components/custom/NetworkErrorUI';
import { DataStateContainer } from '../../components/custom/DataStateContainer';

// Feature Components
import { AdvanceRequestDetails } from './AdvanceRequestDetails';
import {
  useAdvanceRequest,
  useCopy,
  useUpdateAdvanceRequest,
  useUpdateStatus,
  useAddComment,
  useUpdateComment,
  useDeleteComment,
} from './Hooks/useAdvanceRequest';
import { useStatusUpdate } from '../../hooks/useStatusUpdate';
import { usePdfDownload } from '../../hooks/usePdfDownload';
import { getDefaultTableHeaders } from '@/config/tableConfigs';
import { infoConfig } from '@/config/config-info';

const AdvanceRequest = () => {
  const currentUser = localStorageUser();
  const navigate = useNavigate();
  const { requestId } = useParams();

  // Data fetching
  const { data: remoteData, isLoading, isError } = useAdvanceRequest(requestId!);
  const advanceRequest = useSelector((state: RootState) => state.advanceRequest.advanceRequest);

  const request = useMemo(() => remoteData?.data || advanceRequest, [remoteData, advanceRequest]);

  // Redirect logic
  useEffect(() => {
    if (!requestId || (!isLoading && !request)) {
      navigate('/advance-requests');
    }
  }, [request, requestId, navigate, isLoading]);

  // State
  const [status, setStatus] = useState('');
  const [comment, setComment] = useState('');
  const [formData, setFormData] = useState<IRequestDetailFormData>({
    approvedBy: undefined,
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [showTagDropdown, setShowTagDropdown] = useState(false);

  // Hooks
  const { handleStatusChange } = useStatusUpdate();
  const { updateStatus, isPending: isUpdatingStatus } = useUpdateStatus(requestId!);
  const { updateAdvanceRequest, isPending: isUpdating } = useUpdateAdvanceRequest(requestId!);
  const { copyto, isPending: isCopying } = useCopy(requestId!);

  // Comment hooks
  const { addComment, isPending: isAddingComment } = useAddComment(requestId!);
  const { updateComment, isPending: isUpdatingComment } = useUpdateComment(requestId!);
  const { deleteComment, isPending: isDeletingComment } = useDeleteComment(requestId!);

  // Admins
  const { data: adminsData, isLoading: isLoadingAmins } = useAdmins();
  const admins = useMemo(() => adminsData?.data ?? [], [adminsData]);

  // Permissions using shared hook
  const permissions = useRequestPermissions({
    request,
    currentUser,
    isTwoStep: false,
  });

  // PDF
  const pdfContentRef = useRef<HTMLDivElement>(null);
  const { downloadPdf, isGenerating } = usePdfDownload({
    filename: `${infoConfig.abbriviation}-AdvanceRequest-${request?.id}`,
    multiPage: true,
    titleOptions: {
      text: `${infoConfig.abbriviation} Advance Request : ${capitalizeFirstLetter(request?.status ?? '')}`,
    },
    footerCode: {
      label: `${infoConfig.abbriviation} Advance Request`,
      value: request?.arNumber ?? '',
    },
  });

  const handleDownloadPDF = () => {
    downloadPdf(pdfContentRef);
  };

  const totalAmount = useMemo(() => {
    return (
      request?.itemGroups?.reduce((sum: number, item: IItemGroup) => sum + (item.total || 0), 0) ||
      0
    );
  }, [request?.itemGroups]);

  // Handlers
  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const onStatusChangeHandler = () => {
    handleStatusChange(status, comment, async data => {
      await updateStatus(data);
    });
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    // Send as string - the backend expects just the ID
    const payload = {
      approvedBy: formData.approvedBy || undefined,
    };
    updateAdvanceRequest({ data: payload });
  };

  const handleAddComment = async (text: string) => {
    await addComment({ text });
  };

  const handleUpdateComment = async (commentId: string, text: string) => {
    await updateComment({ commentId, text });
  };

  const handleDeleteComment = async (commentId: string) => {
    await deleteComment(commentId);
  };

  const comments = (request?.comments || []) as IComment[];

  const tableHeadData = getDefaultTableHeaders();

  if (isError) return <NetworkErrorUI />;

  return (
    <div className="flex flex-col space-y-3 pb-80">
      {/* Header */}
      <div className="sticky -top-8 z-10 bg-[#F8F8F8] pt-4 md:pt-6 pb-3 space-y-1.5 border-b">
        <div className="flex justify-between items-center">
          <TextHeader>Advance Request</TextHeader>
          <Button variant="outline" size="sm" onClick={() => navigate('/advance-requests')}>
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
        loadingComponent={
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
          </div>
        }
        emptyComponent={<div>No data available</div>}
      >
        <div className="bg-white shadow-sm rounded-lg overflow-hidden border">
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 hidden sm:table-header-group">
                <tr>
                  {tableHeadData.map((header, index) => (
                    <th
                      key={index}
                      className={`
                        px-3 py-2.5 md:px-4 md:py-3 
                        text-left text-xs font-medium text-gray-500 uppercase tracking-wider
                        ${!header.showOnMobile ? 'hidden md:table-cell' : ''}
                        ${header.showOnTablet ? 'hidden sm:table-cell md:table-cell' : ''}
                        whitespace-nowrap
                      `}
                      style={{ minWidth: header.minWidth }}
                    >
                      {header.label}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {/* Main Row */}
                <tr className="hidden sm:table-row">
                  <td className="px-3 py-2.5 md:px-4 md:py-3 text-sm">
                    {request?.createdBy?.firstName} {request?.createdBy?.lastName}
                  </td>
                  <td className="px-3 py-2.5 md:px-4 md:py-3 text-sm">
                    <StatusBadge status={request?.status ?? 'unknown'} />
                  </td>
                  <td className="px-3 py-2.5 md:px-4 md:py-3 text-sm">
                    {moneyFormat(totalAmount, 'NGN')}
                  </td>
                  <td className="px-3 py-2.5 md:px-4 md:py-3 text-sm table-cell">
                    {formatToDDMMYYYY(request?.createdAt ?? new Date().toISOString())}
                  </td>
                  <td className="px-3 py-2.5 md:px-4 md:py-3 text-sm">
                    <ActionIcons
                      copyTo={copyto}
                      isCopying={isCopying}
                      canShareRequest={permissions.canShare}
                      requestId={request?.id}
                      isGeneratingPDF={isGenerating}
                      onDownloadPDF={handleDownloadPDF}
                      showTagDropdown={showTagDropdown}
                      setShowTagDropdown={setShowTagDropdown}
                      hideInspect={true}
                    />
                  </td>
                </tr>

                {/* Mobile Card View */}
                <tr className="sm:hidden">
                  <td colSpan={tableHeadData.length} className="p-4 border-b border-gray-200">
                    {request && (
                      <AdvanceRequestCard
                        advanceRequest={request}
                        actionIconsProps={{
                          copyTo: copyto,
                          isCopying,
                          canShareRequest: permissions.canShare,
                          isGeneratingPDF: isGenerating,
                          onDownloadPDF: handleDownloadPDF,
                          showTagDropdown,
                          setShowTagDropdown,
                          hideInspect: true,
                        }}
                        context="detail"
                      />
                    )}
                  </td>
                </tr>

                {/* Details Section */}
                <tr>
                  <td colSpan={tableHeadData.length} className="px-3 py-4 md:px-6">
                    {request && (
                      <RequestDetailLayout
                        request={request as unknown as TRequestEntity}
                        requestStatus={request?.status || ''}
                        canUploadFiles={permissions.canUploadFiles}
                        selectedFiles={selectedFiles}
                        setSelectedFiles={setSelectedFiles}
                        isUploading={isUpdating}
                        handleUpload={handleSend}
                        canUpdateStatus={permissions.canUpdateStatus}
                        status={status}
                        setStatus={setStatus}
                        comment={comment}
                        setComment={setComment}
                        isUpdatingStatus={isUpdatingStatus}
                        handleStatusChange={onStatusChangeHandler}
                        comments={comments}
                        canAddComments={permissions.canAddComments}
                        handleAddComment={handleAddComment}
                        handleUpdateComment={handleUpdateComment}
                        handleDeleteComment={handleDeleteComment}
                        isAddingComment={isAddingComment}
                        isUpdatingComment={isUpdatingComment}
                        isDeletingComment={isDeletingComment}
                        showAdminApproval={permissions.showAdminApproval}
                        formData={formData}
                        handleFormChange={handleFormChange}
                        admins={admins}
                        isLoadingAmins={isLoadingAmins}
                      >
                        <div ref={pdfContentRef}>
                          <AdvanceRequestDetails request={request} />
                        </div>
                      </RequestDetailLayout>
                    )}
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

export default AdvanceRequest;
