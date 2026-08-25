// components/payment-vouchers/PaymentVoucher.tsx
import { List, Loader2, CheckCircle, FileUp } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { RootState } from '../../store/store';
import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { formatToDDMMYYYY } from '../../utils/formatToDDMMYYYY';
import { moneyFormat } from '../../utils/moneyFormat';
import { localStorageUser } from '../../utils/localStorageUser';
import { useAdmins } from '../user/Hooks/useUsers';
import { PaymentVoucherDetails } from './PaymentVoucherDetails';
import StatusBadge from '../../components/custom/StatusBadge';
import RequestActions from '../../components/custom/RequestActions';
import StatusUpdateForm from '../../components/custom/StatusUpdateForm';
import AdminApprovalSection from '../../components/custom/AdminApprovalSection';
import { Button } from '../../components/ui/button';
import TextHeader from '../../components/custom/TextHeader';
import { FileUpload } from '../../components/custom/FileUpload';
import SpinnerMini from '../../components/custom/SpinnerMini';
import { useStatusUpdate } from '../../hooks/useStatusUpdate';
import NetworkErrorUI from '../../components/custom/NetworkErrorUI';
import Spinner from '../../components/custom/Spinner';
import { DataStateContainer } from '../../components/custom/DataStateContainer';
import { MaintenanceBanner } from '../../components/custom/MaintenanceBanner';
import ActionIcons from '../../components/custom/ActionIcons';
import { usePdfDownload } from '../../hooks/usePdfDownload';
import {
  usePaymentVoucherDetail,
  useUpdatePaymentVoucher,
  useUpdateStatus,
  useCopy,
} from './Hooks/usePaymentVoucher';
import PVPDFTemplate from './PVPDFTemplate';
import PDFPreviewModal from '../../components/custom/PDFPreviewModal';
import toast from 'react-hot-toast';
import { useEntityFiles, useFileUpload } from '../../hooks/useFile';
import { useUserRoles } from '@/hooks/useUserRoles';
import { infoConfig } from '@/config/config-info';

// Helper to generate consistent PDF filename
const getPDFFileName = (pvNumber: string): string => {
  // Remove slashes and replace with hyphens for safe filename
  const sanitizedPvNumber = pvNumber.replace(/\//g, '-');
  return `Payment-voucher-${sanitizedPvNumber}.pdf`;
};

// Helper to check if a file matches our naming pattern
const isTargetPDFFile = (fileName: string, pvNumber: string): boolean => {
  const sanitizedPvNumber = pvNumber.replace(/\//g, '-');
  return fileName === `Payment-voucher-${sanitizedPvNumber}.pdf`;
};

const PaymentVoucher = () => {
  const isUnderMaintenance = false;

  const currentUser = localStorageUser();
  const navigate = useNavigate();
  const { voucherId } = useParams();

  // ── Data fetching ──────────────────────────────────────────────────────────
  const { data: remoteData, isLoading, isError } = usePaymentVoucherDetail(voucherId!);

  const paymentVoucher = useSelector((state: RootState) => state.paymentVoucher.paymentVoucher);

  const voucherData = useMemo(
    () => remoteData?.data || paymentVoucher,
    [remoteData, paymentVoucher]
  );

  useEffect(() => {
    if (!voucherId || (!isLoading && !voucherData)) {
      navigate('/payment-vouchers');
    }
  }, [voucherData, voucherId, navigate, isLoading]);

  // ─── PDF upload state ─────────────────────────────────────────────
  const [uploadedFileIds, setUploadedFileIds] = useState<string[]>([]);
  const [isPdfReady, setIsPdfReady] = useState(false);
  const generatedPdfFileRef = useRef<File | null>(null);
  const isGeneratingOrUploadingRef = useRef(false);
  const [isDeletingOldFiles, setIsDeletingOldFiles] = useState(false);

  // ─── Get existing files for this Payment Voucher ─────────────────
  const {
    files: existingFiles,
    isLoading: isLoadingFiles,
    deleteFile: deleteExistingFile,
    refetch: refetchFiles,
  } = useEntityFiles('PaymentVoucher', voucherData?.id || '');

  // ─── Check if a PDF already exists ───────────────────────────────
  useEffect(() => {
    if (voucherData?.id && existingFiles.length > 0 && voucherData?.pvNumber) {
      // const pdfFileName = getPDFFileName(voucherData.pvNumber);
      const existingPDF = existingFiles.find(file =>
        isTargetPDFFile(file.name, voucherData.pvNumber)
      );

      if (existingPDF) {
        setUploadedFileIds([existingPDF.id]);
        setIsPdfReady(true);
      } else {
        setUploadedFileIds([]);
        setIsPdfReady(false);
      }
    }
  }, [existingFiles, voucherData]);

  const [status, setStatus] = useState('');
  const [comment, setComment] = useState('');
  console.log(setComment, 'setComment');
  const [formData, setFormData] = useState({ approvedBy: undefined });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const { handleStatusChange } = useStatusUpdate();

  // ── Mutations ──────────────────────────────────────────────────────────────
  const { updateStatus, isPending: isUpdatingStatus } = useUpdateStatus(voucherId!);
  const { updatePaymentVoucher, isPending: isUpdating } = useUpdatePaymentVoucher(voucherId!);
  const { copyto, isPending: isCopying } = useCopy(voucherId!);

  // ── File Upload Hook ──────────────────────────────────────────────────────
  const { uploadFiles, isUploading: isUploadingPdf } = useFileUpload({
    associatedModel: 'PaymentVoucher',
    associatedId: voucherData?.id,
  });

  const { data: adminsData, isLoading: isLoadingAmins } = useAdmins();
  const admins = useMemo(() => adminsData?.data ?? [], [adminsData]);

  // ── Refs ───────────────────────────────────────────────────────────────────
  /** Visible page content — used by the "download visible page" action */
  const pdfContentRef = useRef<HTMLDivElement>(null);
  /** Off-screen dedicated PV template — used for generate-and-upload */
  const pvTemplateRef = useRef<HTMLDivElement>(null);

  // ── Unified PDF hook ───────────────────────────────────────────────────────
  const {
    downloadPdf,
    generateFile,
    previewPdf,
    isGenerating: isGeneratingPDF,
  } = usePdfDownload({
    filename: `${infoConfig.abbriviation}-PAYMENT-VOUCHER-${(voucherData?.pvNumber ?? '').replace(/\//g, '-')}.pdf`,
    format: 'a4',
    orientation: 'landscape',
    scale: 2,
    margin: 10,
    multiPage: true,
    quality: 1,
    backgroundColor: '#FFFFFF',
    footerCode: {
      label: `${infoConfig.abbriviation} PV Number`,
      value: voucherData?.pvNumber ?? '',
    },
    templateRef: pvTemplateRef,
  });

  const handleDownloadPDF = () => downloadPdf(pdfContentRef);

  // ─── Step 1: Generate & Upload (with cleanup) ───────────────────────────
  const handleGenerateAndUploadPDF = useCallback(async (): Promise<boolean> => {
    if (!voucherData?.id || !voucherData?.pvNumber) {
      toast.error('No payment voucher found');
      return false;
    }

    // Already ready → skip re-upload
    if (isPdfReady && uploadedFileIds.length > 0) {
      toast.success('PDF is already generated and uploaded');
      return true;
    }

    if (isGeneratingOrUploadingRef.current) {
      return false;
    }
    isGeneratingOrUploadingRef.current = true;

    try {
      // 1. Generate PDF using the existing generateFile function
      const pdfFile = await generateFile();
      if (!pdfFile) {
        toast.error('Failed to generate Payment Voucher PDF');
        return false;
      }

      // 2. Rename the file with our naming convention
      const targetFileName = getPDFFileName(voucherData.pvNumber);
      const renamedFile = new File([pdfFile], targetFileName, {
        type: pdfFile.type,
      });
      generatedPdfFileRef.current = renamedFile;

      // 3. Delete any existing PDF with the same name
      const existingPDF = existingFiles.find(file =>
        isTargetPDFFile(file.name, voucherData.pvNumber)
      );

      if (existingPDF) {
        setIsDeletingOldFiles(true);
        try {
          await deleteExistingFile(existingPDF.id);
          toast.success(`Removed old PDF: ${existingPDF.name}`);
        } catch (deleteError) {
          console.error('Failed to delete existing PDF:', deleteError);
          // Continue with upload even if delete fails
        } finally {
          setIsDeletingOldFiles(false);
        }
      }

      // 4. Upload the new PDF using our upload hook
      const uploaded = await uploadFiles([renamedFile]);
      if (!uploaded.length) {
        toast.error('Failed to upload Payment Voucher PDF');
        return false;
      }

      const fileIds = uploaded.map(f => f.id);
      setUploadedFileIds(fileIds);
      setIsPdfReady(true);

      // 5. Refresh the file list
      await refetchFiles();

      toast.success(`PDF generated and uploaded: ${targetFileName}`);
      return true;
    } catch (error) {
      console.error('Failed to generate/upload PDF:', error);
      toast.error('Failed to prepare PDF');
      return false;
    } finally {
      isGeneratingOrUploadingRef.current = false;
    }
  }, [
    voucherData?.id,
    voucherData?.pvNumber,
    generateFile,
    uploadFiles,
    existingFiles,
    deleteExistingFile,
    refetchFiles,
    isPdfReady,
    uploadedFileIds,
  ]);

  // ─── Form handlers ──────────────────────────────────────────────────────────
  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const onStatusChangeHandler = () => {
    handleStatusChange(status, comment, async (data: { status: string; comment: string }) => {
      await updateStatus(data);
    });
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    updatePaymentVoucher({ data: formData });
  };

  // ── Permission flags ───────────────────────────────────────────────────────
    const { currentUserId } = useUserRoles();
  const userRole = currentUser.role;
  const voucherStatus = voucherData?.status;

  const isCreator = voucherData?.createdBy?.id === currentUserId;
  const isReviewer = voucherData?.reviewedBy?.id === currentUserId;
  const isApprover = voucherData?.approvedBy?.id === currentUserId;
  const isAdmin = ['SUPER-ADMIN', 'ADMIN'].includes(userRole);

  const canUploadFiles = isCreator && voucherStatus === 'approved';
  const canShareVoucher =
    isCreator || ['SUPER-ADMIN', 'ADMIN', 'REVIEWER'].includes(currentUser.role);
  const canUpdateStatus =
    !isCreator &&
    ((userRole === 'REVIEWER' && voucherStatus === 'pending' && isReviewer) ||
      (isAdmin && voucherStatus === 'reviewed' && isApprover));

  const showAdminApproval =
    !voucherData?.approvedBy &&
    voucherStatus === 'reviewed' &&
    (isCreator ||
      (isReviewer && !voucherData?.reviewedBy) ||
      (isApprover && !voucherData?.approvedBy));

  // Update canGeneratePDF to use our new logic
  const canGeneratePDF = isCreator && voucherStatus !== 'draft';

  // ── Table data ─────────────────────────────────────────────────────────────
  const tableHeadData = ['Voucher', 'Status', 'Pay To', 'Amount', 'Date', 'Actions'];
  const tableRowData = [
    { id: 'pvNumber', content: voucherData?.pvNumber },
    { id: 'status', content: <StatusBadge status={voucherData?.status ?? ''} /> },
    { id: 'payTo', content: voucherData?.payTo },
    {
      id: 'netAmount',
      content: moneyFormat(voucherData?.netAmount || 0, 'NGN'),
    },
    { id: 'createdAt', content: formatToDDMMYYYY(voucherData?.createdAt ?? '') },
    {
      id: 'action',
      content: (
        <ActionIcons
          copyTo={copyto}
          isCopying={isCopying}
          canShareRequest={canShareVoucher}
          requestId={voucherData?.id}
          isGeneratingPDF={isGeneratingPDF}
          onDownloadPDF={handleDownloadPDF}
          onPreviewPDF={() => previewPdf(setShowPreview, voucherData)}
          showTagDropdown={showTagDropdown}
          setShowTagDropdown={setShowTagDropdown}
        />
      ),
    },
  ];

  const isBusy = isUploadingPdf || isGeneratingPDF || isDeletingOldFiles || isCopying;

  return (
    <>
      {isUnderMaintenance ? (
        <MaintenanceBanner
          title="Payment Vouchers Under Maintenance"
          message="We're addressing a payment voucher error."
          expectedCompletion="Will Be Back Very soon"
        />
      ) : (
        <div className="flex flex-col space-y-3 pb-80">
          <div className="sticky -top-8 z-10 bg-[#F8F8F8] pt-4 md:pt-6 pb-3 space-y-1.5 border-b">
            <div className="flex flex-wrap md:flex-row justify-between md:items-center gap-3 md:gap-0">
              <TextHeader>Payment Voucher</TextHeader>
              <div className="flex flex-wrap md:flex-row md:items-center gap-3">
                {/* Generate & Upload PDF */}
                {canGeneratePDF && (
                  <Button
                    onClick={handleGenerateAndUploadPDF}
                    variant="outline"
                    size="sm"
                    disabled={isBusy || isPdfReady || isLoadingFiles}
                  >
                    {isUploadingPdf || isGeneratingPDF || isDeletingOldFiles ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {isDeletingOldFiles ? 'Removing old PDF…' : 'Preparing…'}
                      </>
                    ) : isPdfReady ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                        PDF Ready ({uploadedFileIds.length} file)
                      </>
                    ) : (
                      <>
                        <FileUp className="h-4 w-4 mr-2" />
                        Generate & Upload
                      </>
                    )}
                  </Button>
                )}
                <Button onClick={() => navigate('/payment-vouchers')} variant="outline" size="sm">
                  <List className="h-4 w-4 mr-1 md:mr-2" />
                  List
                </Button>
              </div>
            </div>

            {isPdfReady && (
              <div className="text-sm text-green-600 mt-1 flex items-center gap-1">
                <CheckCircle className="h-4 w-4" />
                PDF ready for sharing ({uploadedFileIds.length} file
                {uploadedFileIds.length !== 1 ? 's' : ''})
              </div>
            )}

            {isPdfReady && uploadedFileIds.length > 0 && voucherData?.pvNumber && (
              <div className="text-xs text-gray-500 mt-0.5">
                Filename: {getPDFFileName(voucherData.pvNumber)}
              </div>
            )}
          </div>

          {/* ── Main Content ──────────────────────────────────────────────── */}
          <div ref={pdfContentRef}>
            <DataStateContainer
              isLoading={isLoading}
              isError={isError}
              data={voucherData}
              errorComponent={<NetworkErrorUI />}
              loadingComponent={<Spinner />}
              emptyComponent={<div>No data available</div>}
            >
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
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
                  <tr key={voucherData?.id} className="h-[40px] max-h-[40px]">
                    {tableRowData.map(data => (
                      <td
                        key={data.id}
                        className="min-w-[150px] px-3 py-2.5 md:px-6 md:py-3 text-left font-medium uppercase text-sm 2xl:text-text-base tracking-wider"
                      >
                        {data.content}
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <td colSpan={6}>
                      <div className="border border-gray-300 px-3 py-2.5 md:px-6 md:py-3 rounded-md h-auto relative">
                        <PaymentVoucherDetails voucher={voucherData!} />

                        {/* File Upload */}
                        {canUploadFiles && (
                          <div className="flex flex-col gap-3 mt-3">
                            <FileUpload
                              selectedFiles={selectedFiles}
                              setSelectedFiles={setSelectedFiles}
                              accept=".jpg,.png,.pdf,.xlsx,.docx"
                              multiple={true}
                            />
                            {selectedFiles.length > 0 && (
                              <div className="self-center">
                                <Button disabled={isUpdating} onClick={handleSend}>
                                  {isUpdating ? <SpinnerMini /> : 'Upload Files'}
                                </Button>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Status */}
                        {voucherData?.reviewedBy && voucherStatus !== 'draft' && (
                          <div className="mt-4 tracking-wide">
                            <RequestActions request={voucherData} />
                            {canUpdateStatus && (
                              <StatusUpdateForm
                                requestStatus={voucherStatus}
                                status={status}
                                setStatus={setStatus}
                                isUpdatingStatus={isUpdatingStatus}
                                handleStatusChange={onStatusChangeHandler}
                              />
                            )}
                          </div>
                        )}

                        {/* Admin Approval */}
                        {showAdminApproval && (
                          <div className="relative z-10 pb-64">
                            <AdminApprovalSection
                              formData={formData}
                              handleFormChange={handleFormChange}
                              admins={admins}
                              isLoadingAmins={isLoadingAmins}
                              isUpdating={isUpdating}
                              handleSend={handleSend}
                            />
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </DataStateContainer>
          </div>

          {/* ── Off-screen PDF template (for generate & upload) ───────────── */}
          <div
            ref={pvTemplateRef}
            style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}
          >
            {voucherData && (
              <PVPDFTemplate
                isGenerating={isGeneratingPDF}
                pvData={voucherData}
                orientation="landscape"
              />
            )}
          </div>

          {/* ── Preview Modal ─────────────────────────────────────────────── */}
          <PDFPreviewModal
            isOpen={showPreview}
            onClose={() => setShowPreview(false)}
            onDownload={handleDownloadPDF}
            isGenerating={isGeneratingPDF}
            title={`Payment Voucher Preview - ${voucherData?.pvNumber}`}
            orientation="landscape"
          >
            {voucherData && <PVPDFTemplate pvData={voucherData} orientation="landscape" />}
          </PDFPreviewModal>
        </div>
      )}
    </>
  );
};

export default PaymentVoucher;
