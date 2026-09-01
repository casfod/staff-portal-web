// PurchaseRequest.tsx - Complete Fixed Version
import { List, Loader2 } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { RootState } from '../../store/store';
import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { formatToDDMMYYYY } from '../../utils/formatToDDMMYYYY';
import { moneyFormat } from '../../utils/moneyFormat';
import { localStorageUser } from '../../utils/localStorageUser';
import { useAdmins } from '../user/Hooks/useUsers';
import { useRequestPermissions } from '../../hooks/useRequestPermissions';

// Radix UI Components
import { Button } from '../../components/ui/button';

// Custom Components
import TextHeader from '../../components/custom/TextHeader';
import StatusBadge from '../../components/custom/StatusBadge';
import ActionIcons from '../../components/custom/ActionIcons';
import RequestDetailLayout, { TRequestEntity } from '../../components/custom/RequestDetailLayout';
import NetworkErrorUI from '../../components/custom/NetworkErrorUI';
import { DataStateContainer } from '../../components/custom/DataStateContainer';
import { MaintenanceBanner } from '../../components/custom/MaintenanceBanner';

// Feature Components
import { PurchaseRequestDetails } from './PurchaseRequestDetails';
import {
  useAddComment,
  useCopy,
  useDeleteComment,
  usePurchaseRequest,
  useUpdateComment,
  useUpdatePurchaseRequest,
  useUpdateStatus,
} from './Hooks/PRHook';
import { useStatusUpdate } from '../../hooks/useStatusUpdate';
import { usePdfDownload } from '../../hooks/usePdfDownload';
import {
  IComment,
  IItemGroup,
  IPurchaseRequest,
  IRequestDetailFormData,
  IUser,
} from '../../interfaces';
import PurchaseRequestCard from './PurchaseRequestCard';
import { getDefaultTableHeaders } from '@/config/tableConfigs';

// Type for status update data
interface StatusUpdateData {
  status: string;
  comment: string;
  financeReviewStatus?: 'pending' | 'approved' | 'rejected';
  procurementReviewStatus?: 'pending' | 'approved' | 'rejected';
}

const PurchaseRequest = () => {
  const isUnderMaintenance = false;

  const currentUser = localStorageUser();
  const navigate = useNavigate();
  const { requestId } = useParams();

  // Data fetching
  const { data: remoteData, isLoading, isError } = usePurchaseRequest(requestId!);

  const purchaseRequest = useSelector((state: RootState) => state.purchaseRequest.purchaseRequest);

  const request = useMemo(() => remoteData?.data || purchaseRequest, [remoteData, purchaseRequest]);

  // Redirect logic
  useEffect(() => {
    if (!requestId || (!isLoading && !request)) {
      navigate('/purchase-requests');
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
  const { updatePurchaseRequest, isPending: isUpdating } = useUpdatePurchaseRequest(requestId!);
  const { copyto, isPending: isCopying } = useCopy(requestId!);

  // Comment hooks
  const { addComment, isPending: isAddingComment } = useAddComment(requestId!);
  const { updateComment, isPending: isUpdatingComment } = useUpdateComment(requestId!);
  const { deleteComment, isPending: isDeletingComment } = useDeleteComment(requestId!);

  // Admins
  const { data: adminsData, isLoading: isLoadingAmins } = useAdmins();
  const admins = useMemo(() => adminsData?.data ?? [], [adminsData]);

  // Permissions using shared hook - isTwoStep = true for PurchaseRequest
  const permissions = useRequestPermissions({
    request,
    currentUser,
    isTwoStep: true,
  });

  // PDF
  const pdfContentRef = useRef<HTMLDivElement>(null);
  const { downloadPdf, isGenerating } = usePdfDownload({
    filename: `PurchaseRequest-${request?.id}`,
    multiPage: true,
    titleOptions: {
      text: 'Purchase Request',
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

  // ✅ FIXED: Status change handler using permissions from the hook
  const onStatusChangeHandler = useCallback(() => {
    if (!status) {
      console.warn('⚠️ No status selected');
      return;
    }
    handleStatusChange(status, comment, async (data: StatusUpdateData) => {
      // ✅ Use permissions from the hook as the source of truth
      const canReviewFinance = permissions.canReviewFinance;
      const canReviewProcurement = permissions.canReviewProcurement;
      const canApprove = permissions.canApprove;
      const isFinanceReviewer = permissions.isFinanceReviewer;
      const isProcurementReviewer = permissions.isProcurementReviewer;
      const isApprover = permissions.isApprover;

      const updateData: StatusUpdateData = {
        comment: data.comment || comment,
        status: request?.status || 'pending',
      };

      // Determine user's role and build appropriate payload
      if (canReviewFinance || isFinanceReviewer) {
        // ✅ Finance reviewer - send financeReviewStatus
        updateData.financeReviewStatus = data.status === 'approved' ? 'approved' : 'rejected';
        // ✅ Keep the current main status - DO NOT change it
        updateData.status = request?.status || 'pending';
      } else if (canReviewProcurement || isProcurementReviewer) {
        // ✅ Procurement reviewer - send procurementReviewStatus
        updateData.procurementReviewStatus = data.status === 'approved' ? 'approved' : 'rejected';
        // ✅ Keep the current main status - DO NOT change it
        updateData.status = request?.status || 'pending';
      } else if (canApprove || isApprover) {
        // ✅ Approver - update main status
        updateData.status = data.status;
      } else {
        // ✅ Default - just send the status
        updateData.status = data.status;
      }

      // ✅ Send the update to the backend
      updateStatus(updateData);
    });
  }, [permissions, request?.status, status, comment, handleStatusChange, updateStatus]);

  // formData.approvedBy holds the selected admin's id (string | null)
  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Partial<IPurchaseRequest> = {
      approvedBy: formData.approvedBy ? (formData.approvedBy as Partial<IUser>) : undefined,
    };
    updatePurchaseRequest({ data: payload });
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

  if (isUnderMaintenance) {
    return (
      <MaintenanceBanner
        title="Purchase Requests Under Maintenance"
        message="We're addressing a purchase request error."
        expectedCompletion="Will Be Back Very soon"
      />
    );
  }

  if (isError) return <NetworkErrorUI />;

  return (
    <div className="flex flex-col space-y-3 pb-20">
      {/* Header */}
      <div className="sticky -top-8 z-10 bg-[#F8F8F8] pt-4 md:pt-6 pb-3 space-y-1.5 border-b">
        <div className="flex justify-between items-center">
          <TextHeader>Purchase Request</TextHeader>
          <Button variant="outline" size="sm" onClick={() => navigate('/purchase-requests')}>
            <List className="h-4 w-4 mr-1 md:mr-2" />
            List
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div ref={pdfContentRef}>
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
                      {request?.createdBy?.firstName || request?.createdBy?.lastName || 'N/A'}
                    </td>
                    <td className="px-3 py-2.5 md:px-4 md:py-3 text-sm">
                      <StatusBadge status={request?.status ?? 'unknown'} />
                    </td>
                    <td className="px-3 py-2.5 md:px-4 md:py-3 text-sm">
                      {moneyFormat(totalAmount, 'NGN')}
                    </td>
                    <td className="px-3 py-2.5 md:px-4 md:py-3 text-sm hidden md:table-cell">
                      {formatToDDMMYYYY(request?.purchaseRequestDate ?? request?.createdAt)}
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
                      <PurchaseRequestCard
                        purchaseRequest={request!}
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
                    </td>
                  </tr>

                  {/* Details Section */}
                  <tr>
                    <td colSpan={tableHeadData.length} className="px-3 py-4 md:px-6">
                      <RequestDetailLayout
                        request={request as unknown as TRequestEntity}
                        requestStatus={request?.status || 'draft'}
                        // Two-step approval props
                        isFinanceReviewer={permissions.isFinanceReviewer}
                        isProcurementReviewer={permissions.isProcurementReviewer}
                        isApprover={permissions.isApprover}
                        financeReviewStatus={request?.financeReviewStatus}
                        procurementReviewStatus={request?.procurementReviewStatus}
                        canReviewFinance={permissions.canReviewFinance || false}
                        canReviewProcurement={permissions.canReviewProcurement || false}
                        canApprove={permissions.canApprove}
                        // File upload
                        canUploadFiles={permissions.canUploadFiles}
                        selectedFiles={selectedFiles}
                        setSelectedFiles={setSelectedFiles}
                        isUploading={isUpdating}
                        handleUpload={handleSend}
                        // Status update
                        canUpdateStatus={permissions.canUpdateStatus}
                        status={status}
                        setStatus={setStatus}
                        comment={comment}
                        setComment={setComment}
                        isUpdatingStatus={isUpdatingStatus}
                        handleStatusChange={onStatusChangeHandler}
                        // Comments
                        comments={comments}
                        canAddComments={permissions.canAddComments}
                        handleAddComment={handleAddComment}
                        handleUpdateComment={handleUpdateComment}
                        handleDeleteComment={handleDeleteComment}
                        isAddingComment={isAddingComment}
                        isUpdatingComment={isUpdatingComment}
                        isDeletingComment={isDeletingComment}
                        // Admin approval
                        showAdminApproval={permissions.showAdminApproval}
                        formData={formData}
                        handleFormChange={handleFormChange}
                        admins={admins}
                        isLoadingAmins={isLoadingAmins}
                      >
                        <PurchaseRequestDetails request={request!} />
                      </RequestDetailLayout>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </DataStateContainer>
      </div>
    </div>
  );
};

export default PurchaseRequest;
