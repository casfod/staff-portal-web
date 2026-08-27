// RFQ.tsx - Updated with file management logic
import { List, Loader2, FileUp, CheckCircle } from 'lucide-react';
import { useRef, useState, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import TextHeader from '../../components/custom/TextHeader';
import { Button } from '../../components/ui/button';
import { RFQDetails } from './RFQDetails';
import ActionIcons from '../../components/custom/ActionIcons';
import { useCopyRFQToVendors } from './Hooks/useRFQ';
import { useRFQPDF } from '../../hooks/useRFQPDF';
import { useFileUpload, useEntityFiles } from '../../hooks/useFile';
import PDFPreviewModal from '../../components/custom/PDFPreviewModal';
import RFQPDFTemplate from './RFQPDFTemplate';
import { localStorageUser } from '../../utils/localStorageUser';
import toast from 'react-hot-toast';
import { usePdfDownload } from '../../hooks/usePdfDownload';
import { useRFQ } from './Hooks/useRFQ';
import RequestDetailLayout, { TRequestEntity } from '../../components/custom/RequestDetailLayout';
import { DataStateContainer } from '../../components/custom/DataStateContainer';
import NetworkErrorUI from '../../components/custom/NetworkErrorUI';
import StatusBadge from '../../components/custom/StatusBadge';
import { IComment } from '../../interfaces';
import RFQCard from './RFQCard';
import { infoConfig } from '@/config/config-info';

// Helper to generate consistent PDF filename
const getPDFFileName = (rfqCode: string): string => {
  return `QUOTATION-${rfqCode}.pdf`;
};

// Helper to check if a file matches our naming pattern
const isTargetPDFFile = (fileName: string, rfqCode: string): boolean => {
  return fileName === getPDFFileName(rfqCode);
};

const RFQ = () => {
  const navigate = useNavigate();
  const { rfqId } = useParams();
  const currentUser = localStorageUser();

  const { data: rfqResponse, isLoading, isError } = useRFQ(rfqId!);
  const rfq = rfqResponse?.data;

  // ─── PDF upload state ─────────────────────────────────────────────
  const [uploadedFileIds, setUploadedFileIds] = useState<string[]>([]);
  const [isPdfReady, setIsPdfReady] = useState(false);
  const generatedPdfFileRef = useRef<File | null>(null);
  const isGeneratingOrUploadingRef = useRef(false);
  const [isDeletingOldFiles, setIsDeletingOldFiles] = useState(false);

  // ─── Get existing files for this RFQ ─────────────────────────────
  const {
    files: existingFiles,
    isLoading: isLoadingFiles,
    deleteFile: deleteExistingFile,
    refetch: refetchFiles,
  } = useEntityFiles('RFQ', rfq?.id || '');

  // ─── Check if a PDF already exists ───────────────────────────────
  useEffect(() => {
    if (rfq?.id && existingFiles.length > 0) {
      // const pdfFileName = getPDFFileName(rfq.rfqCode);
      const existingPDF = existingFiles.find(file => isTargetPDFFile(file.name, rfq.rfqCode));

      if (existingPDF) {
        setUploadedFileIds([existingPDF.id]);
        setIsPdfReady(true);
      } else {
        setUploadedFileIds([]);
        setIsPdfReady(false);
      }
    }
  }, [existingFiles, rfq]);

  const {
    pdfRef,
    isGenerating: isGeneratingRFQPDF,
    showPreview,
    setShowPreview,
    generatePDF,
    previewPDF,
  } = useRFQPDF(rfq ?? null);

  const { uploadFiles, isUploading: isUploadingPdf } = useFileUpload({
    associatedModel: 'RFQ',
    associatedId: rfq?.id,
  });

  const { copyRFQToVendors, isPending: isCopying } = useCopyRFQToVendors();
  const [showTagDropdown, setShowTagDropdown] = useState(false);

  // ─── Step 1: Generate & Upload (with cleanup) ───────────────────────────
  const handleGenerateAndUploadPDF = useCallback(async (): Promise<boolean> => {
    if (!rfq?.id || !rfq?.rfqCode) {
      toast.error('No RFQ found');
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
      // 1. Generate PDF
      const pdfFile = await generatePDF();
      if (!pdfFile) {
        toast.error('Failed to generate PDF for RFQ');
        return false;
      }

      // 2. Rename the file with our naming convention
      const targetFileName = getPDFFileName(rfq.rfqCode);
      const renamedFile = new File([pdfFile], targetFileName, {
        type: pdfFile.type,
      });
      generatedPdfFileRef.current = renamedFile;

      // 3. Delete any existing PDF with the same name
      const existingPDF = existingFiles.find(file => isTargetPDFFile(file.name, rfq.rfqCode));

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

      // 4. Upload the new PDF
      const uploaded = await uploadFiles([renamedFile]);
      if (!uploaded.length) {
        toast.error('Failed to upload RFQ PDF');
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
    rfq?.id,
    rfq?.rfqCode,
    generatePDF,
    uploadFiles,
    existingFiles,
    deleteExistingFile,
    refetchFiles,
    isPdfReady,
    uploadedFileIds,
  ]);

  // ─── Step 2: Send to vendors ──────────────────────────────────────────────
  const handleSendToVendors = useCallback(
    async ({ recipients }: { recipients: string[] }) => {
      if (!rfq?.id) {
        toast.error('No RFQ found');
        return;
      }

      if (!isPdfReady || uploadedFileIds.length === 0) {
        toast.error('Please generate & upload the PDF first');
        return;
      }

      try {
        await copyRFQToVendors({
          rfqId: rfq.id,
          recipients,
          fileIds: uploadedFileIds,
        });
      } catch (error) {
        console.error('Failed to send RFQ to vendors:', error);
        toast.error('Failed to send RFQ to vendors');
      }
    },
    [rfq?.id, isPdfReady, uploadedFileIds, copyRFQToVendors]
  );

  // Backward-compatible wrapper
  const handleCopyToVendors = useCallback(
    async ({ recipients }: { recipients: string[] }) => {
      await handleSendToVendors({ recipients });
    },
    [handleSendToVendors]
  );

  const pdfContentRef = useRef<HTMLDivElement>(null);

  const { downloadPdf, isGenerating: isDownloadingPDF } = usePdfDownload({
    filename: `QUOTATION-${rfq?.rfqCode ?? 'unknown'}`,
    multiPage: true,
    titleOptions: {
      text: `${infoConfig.abbriviation} - Request For Quotation`,
    },
    footerCode: {
      label: 'RFQ',
      value: rfq?.rfqCode ?? '',
    },
  });

  const handleDownloadPDF = useCallback(() => {
    downloadPdf(pdfContentRef);
  }, [downloadPdf]);

  const canShareRequest =
    rfq &&
    (rfq.status === 'preview' ||
      rfq.status === 'draft' ||
      rfq.createdBy?.id === currentUser.id ||
      ['SUPER-ADMIN', 'ADMIN'].includes(currentUser.role));

  const handleCreatePOFromRFQ = useCallback(() => {
    if (rfq) {
      navigate(`/procurement/purchase-order/create/${rfq.id}`);
    }
  }, [rfq, navigate]);

  const comments: IComment[] = [];

  const [status, setStatus] = useState('');
  const [comment, setComment] = useState('');
  const [formData, setFormData] = useState<{ approvedBy?: string }>({
    approvedBy: undefined,
  });

  const handleFormChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleStatusChange = useCallback(() => {
    // QUOTATION-specific status update logic would go here
  }, []);

  const handleAddComment = useCallback(async (text: string) => {
    console.log('Add comment:', text);
  }, []);

  const handleUpdateComment = useCallback(async (commentId: string, text: string) => {
    console.log('Update comment:', commentId, text);
  }, []);

  const handleDeleteComment = useCallback(async (commentId: string) => {
    console.log('Delete comment:', commentId);
  }, []);

  const handleSend = useCallback((e: React.FormEvent) => {
    e.preventDefault();
  }, []);

  const tableHeadData = [
    { label: 'RFQ Title', showOnMobile: true, minWidth: '150px' },
    { label: 'RFQ Code', showOnMobile: true, minWidth: '120px' },
    { label: 'Status', showOnMobile: true, minWidth: '100px' },
    { label: 'Actions', showOnMobile: true, minWidth: '120px' },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }

  if (isError) {
    return <NetworkErrorUI />;
  }

  if (!rfq) {
    return <div className="text-center py-8">No RFQ data available.</div>;
  }

  const isBusy = isCopying || isUploadingPdf || isGeneratingRFQPDF || isDeletingOldFiles;

  return (
    <>
      <div className="flex flex-col space-y-3 pb-80">
        {/* Header */}
        <div className="sticky -top-8 z-10 bg-[#F8F8F8] pt-4 md:pt-6 pb-3 space-y-1.5 border-b">
          <div className="flex flex-wrap md:flex-row justify-between md:items-center gap-3 md:gap-0">
            <TextHeader>RFQ Details</TextHeader>
            <div className="flex flex-wrap md:flex-row md:items-center gap-3">
              {/* 1. Generate & Upload */}
              {canShareRequest && (
                <Button
                  onClick={handleGenerateAndUploadPDF}
                  variant="outline"
                  size="sm"
                  disabled={isBusy || isPdfReady || isLoadingFiles}
                >
                  {isUploadingPdf || isGeneratingRFQPDF || isDeletingOldFiles ? (
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

              {rfq.status === 'sent' && (
                <Button onClick={handleCreatePOFromRFQ} variant="primary" size="sm">
                  Create Purchase Order
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={() => navigate('/procurement/rfq')}>
                <List className="h-4 w-4 mr-1 md:mr-2" />
                List
              </Button>
            </div>
          </div>

          {isPdfReady && (
            <div className="text-sm text-green-600 mt-1 flex items-center gap-1">
              <CheckCircle className="h-4 w-4" />
              PDF ready for sending ({uploadedFileIds.length} file
              {uploadedFileIds.length !== 1 ? 's' : ''})
            </div>
          )}

          {isPdfReady && uploadedFileIds.length > 0 && (
            <div className="text-xs text-gray-500 mt-0.5">
              Filename: {getPDFFileName(rfq.rfqCode)}
            </div>
          )}
        </div>

        {/* Main Content - rest of your component remains the same */}
        <DataStateContainer
          isLoading={isLoading}
          isError={isError}
          data={rfq}
          errorComponent={<NetworkErrorUI />}
          loadingComponent={
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
            </div>
          }
          emptyComponent={<div>No RFQ data available.</div>}
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
                  <tr className="hidden sm:table-row">
                    <td className="px-3 py-2.5 md:px-4 md:py-3 text-sm">{rfq.rfqTitle}</td>
                    <td className="px-3 py-2.5 md:px-4 md:py-3 text-sm">{rfq.rfqCode}</td>
                    <td className="px-3 py-2.5 md:px-4 md:py-3 text-sm">
                      <StatusBadge status={rfq.status} />
                    </td>
                    <td className="px-3 py-2.5 md:px-4 md:py-3 text-sm">
                      <ActionIcons
                        copyToVendors={handleCopyToVendors}
                        isCopying={isCopying || isUploadingPdf}
                        canShareRequest={!!canShareRequest && isPdfReady}
                        isGeneratingPDF={isDownloadingPDF}
                        onDownloadPDF={handleDownloadPDF}
                        onPreviewPDF={previewPDF}
                        showTagDropdown={showTagDropdown}
                        setShowTagDropdown={setShowTagDropdown}
                        requestId={rfq.id}
                        rfqStatus={rfq.status}
                        mode="vendors"
                        hideInspect={true}
                        // ActionIcons will still call copyToVendors;
                        // the handler above already enforces that PDF is ready
                      />
                    </td>
                  </tr>

                  {/* Mobile Card View */}
                  <tr className="sm:hidden">
                    <td colSpan={tableHeadData.length} className="p-4 border-b border-gray-200">
                      {rfq && (
                        <RFQCard
                          rfq={rfq}
                          actionIconsProps={{
                            canShareRequest: !!canShareRequest && isPdfReady,
                            requestId: rfq?.id,
                            isGeneratingPDF: isDownloadingPDF,
                            onDownloadPDF: handleDownloadPDF,
                            onPreviewPDF: previewPDF,
                            showTagDropdown,
                            setShowTagDropdown,
                            mode: 'vendors',
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
                      <RequestDetailLayout
                        request={rfq as unknown as TRequestEntity}
                        requestStatus={rfq?.status || ''}
                        canUploadFiles={false}
                        selectedFiles={[]}
                        setSelectedFiles={() => {}}
                        isUploading={false}
                        handleUpload={handleSend}
                        canUpdateStatus={false}
                        status={status}
                        setStatus={setStatus}
                        comment={comment}
                        setComment={setComment}
                        isUpdatingStatus={false}
                        handleStatusChange={handleStatusChange}
                        comments={comments}
                        canAddComments={!!canShareRequest}
                        handleAddComment={handleAddComment}
                        handleUpdateComment={handleUpdateComment}
                        handleDeleteComment={handleDeleteComment}
                        isAddingComment={false}
                        isUpdatingComment={false}
                        isDeletingComment={false}
                        showAdminApproval={false}
                        formData={formData}
                        handleFormChange={handleFormChange}
                        admins={[]}
                        isLoadingAmins={false}
                      >
                        <div ref={pdfContentRef}>
                          <RFQDetails rfq={rfq} />
                        </div>
                      </RequestDetailLayout>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </DataStateContainer>
      </div>
      {/* Hidden PDF Template */}
      <div
        ref={pdfRef as React.RefObject<HTMLDivElement>}
        style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}
      >
        <RFQPDFTemplate
          isGenerating={isGeneratingRFQPDF}
          rfqData={{
            rfqTitle: rfq.rfqTitle,
            rfqCode: rfq.rfqCode,
            itemGroups: rfq.itemGroups,
            rfqDate: rfq.rfqDate,
            deadlineDate: rfq.deadlineDate,
            casfodAddressId: rfq.casfodAddressId,
            createdBy: rfq.createdBy,
            createdAt: rfq.createdAt,
          }}
        />
      </div>

      {/* PDF Preview Modal */}
      <PDFPreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        onDownload={handleDownloadPDF}
        isGenerating={isGeneratingRFQPDF}
        title={`RFQ Preview - ${rfq.rfqCode}`}
      >
        <RFQPDFTemplate
          pdfRef={null}
          rfqData={{
            rfqTitle: rfq.rfqTitle,
            rfqCode: rfq.rfqCode,
            itemGroups: rfq.itemGroups,
            casfodAddressId: rfq.casfodAddressId,
            rfqDate: rfq.rfqDate,
            deadlineDate: rfq.deadlineDate,
            createdBy: rfq.createdBy,
            createdAt: rfq.createdAt,
          }}
        />
      </PDFPreviewModal>
    </>
  );
};

export default RFQ;
