// features/report/Report.tsx
import { List, Loader2 } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { RootState } from '../../store/store';
import { useEffect, useMemo, useRef, useState } from 'react';
import { formatToDDMMYYYY } from '../../utils/formatToDDMMYYYY';
import { localStorageUser } from '../../utils/localStorageUser';
import { useAdmins } from '../user/Hooks/useUsers';
import { IComment, IReport, IRequestDetailFormData, IUser } from '../../interfaces';
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
import ReportCard from './ReportCard';
import { ReportDetails } from './ReportDetails';

// Hooks
import {
  useReport,
  useCopyReport,
  useUpdateReport,
  useUpdateReportStatus,
  useAddReportComment,
  useUpdateReportComment,
  useDeleteReportComment,
} from './Hooks/useReport';
import { useStatusUpdate } from '../../hooks/useStatusUpdate';
import { usePdfDownload } from '../../hooks/usePdfDownload';
import { getDefaultTableHeaders } from '@/config/tableConfigs';
import { infoConfig } from '@/config/config-info';

const Report = () => {
  const currentUser = localStorageUser();
  const navigate = useNavigate();
  const { requestId } = useParams();

  // Data fetching
  const { data: remoteData, isLoading, isError } = useReport(requestId!);
  const reportFromStore = useSelector((state: RootState) => state.report.report);

  const report = useMemo(() => remoteData?.data || reportFromStore, [remoteData, reportFromStore]);

  // Redirect logic
  useEffect(() => {
    if (!requestId || (!isLoading && !report)) {
      navigate('/reporting');
    }
  }, [report, requestId, navigate, isLoading]);

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
  const { updateStatus, isPending: isUpdatingStatus } = useUpdateReportStatus(requestId!);
  const { updateReport, isPending: isUpdating } = useUpdateReport(requestId!);
  const { copyTo, isPending: isCopying } = useCopyReport(requestId!);

  // Comment hooks
  const { addComment, isPending: isAddingComment } = useAddReportComment(requestId!);
  const { updateComment, isPending: isUpdatingComment } = useUpdateReportComment(requestId!);
  const { deleteComment, isPending: isDeletingComment } = useDeleteReportComment(requestId!);

  // Admins
  const { data: adminsData, isLoading: isLoadingAmins } = useAdmins();
  const admins = useMemo(() => adminsData?.data ?? [], [adminsData]);

  // Permissions using shared hook
  const permissions = useRequestPermissions({
    request: report,
    currentUser,
    isTwoStep: false,
  });

  // PDF
  const pdfContentRef = useRef<HTMLDivElement>(null);
  const { downloadPdf, isGenerating } = usePdfDownload({
    filename: `${infoConfig.abbriviation}-Report-${report?.id}`,
    multiPage: true,
    titleOptions: {
      text: `${infoConfig.abbriviation} Report : ${report?.reportNumber || ''}`,
    },
    footerCode: {
      label: `${infoConfig.abbriviation} Report`,
      value: report?.reportNumber ?? '',
    },
  });

  const handleDownloadPDF = () => {
    downloadPdf(pdfContentRef);
  };

  // Handlers
  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const onStatusChangeHandler = () => {
    handleStatusChange(status, comment, async data => {
      await updateStatus(data);
    });
  };

  // ✅ FIXED: Properly structure the update payload
  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload: Partial<IReport> = {};
    
    // Only include approvedBy if it has a value
    if (formData.approvedBy) {
      payload.approvedBy = { id: formData.approvedBy } as Partial<IUser>;
    }
    
    updateReport(payload);
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

  const comments = (report?.comments || []) as IComment[];

  const tableHeadData = getDefaultTableHeaders();

  if (isError) return <NetworkErrorUI />;

  return (
    <div className="flex flex-col space-y-3 pb-80">
      {/* Header */}
      <div className="sticky -top-8 z-10 bg-[#F8F8F8] pt-4 md:pt-6 pb-3 space-y-1.5 border-b">
        <div className="flex justify-between items-center">
          <TextHeader>Report</TextHeader>
          <Button variant="outline" size="sm" onClick={() => navigate('/reporting')}>
            <List className="h-4 w-4 mr-1 md:mr-2" />
            List
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <DataStateContainer
        isLoading={isLoading}
        isError={isError}
        data={report}
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
                    {report?.createdBy?.firstName} {report?.createdBy?.lastName}
                  </td>
                  <td className="px-3 py-2.5 md:px-4 md:py-3 text-sm">
                    <StatusBadge status={report?.status ?? 'unknown'} />
                  </td>
                  <td className="px-3 py-2.5 md:px-4 md:py-3 text-sm table-cell">
                    {report?.reportType || 'N/A'}
                  </td>
                  <td className="px-3 py-2.5 md:px-4 md:py-3 text-sm">
                    {formatToDDMMYYYY(report?.createdAt ?? new Date().toISOString())}
                  </td>
                  <td className="px-3 py-2.5 md:px-4 md:py-3 text-sm">
                    <ActionIcons
                      copyTo={copyTo}
                      isCopying={isCopying}
                      canShareRequest={permissions.canShare}
                      requestId={report?.id}
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
                    {report && (
                      <ReportCard
                        report={report}
                        requestId={report.id}
                        actionIconsProps={{
                          copyTo,
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
                    {report && (
                      <RequestDetailLayout
                        request={report as unknown as TRequestEntity}
                        requestStatus={report?.status || ''}
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
                          <ReportDetails report={report} />
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

export default Report;