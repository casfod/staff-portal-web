// PurchaseOrder.tsx - Updated with file management logic
import { List, Loader2, Package, Plus, Edit, Send, CheckCircle, FileUp } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { usePdfDownload } from '../../hooks/usePdfDownload';
import { usePOPDF } from '../../hooks/usePOPDF';
import { useStatusUpdate } from '../../hooks/useStatusUpdate';
import { IGoodsReceived } from '../../interfaces';
import { RootState } from '../../store/store';
import ActionIcons from '../../components/custom/ActionIcons';
import { Button } from '../../components/ui/button';
import { DataStateContainer } from '../../components/custom/DataStateContainer';
import { Dialog, DialogContent, DialogClose, DialogTitle } from '../../components/ui/dialog';
import NetworkErrorUI from '../../components/custom/NetworkErrorUI';
import PDFPreviewModal from '../../components/custom/PDFPreviewModal';
import RequestDetailLayout, { TRequestEntity } from '../../components/custom/RequestDetailLayout';
import StatusBadge from '../../components/custom/StatusBadge';
import TextHeader from '../../components/custom/TextHeader';
import { formatToDDMMYYYY } from '../../utils/formatToDDMMYYYY';
import { localStorageUser } from '../../utils/localStorageUser';
import FormCreateGoodsReceived from '../goods-recieved/FormCreateGoodsReceived';
import GoodsReceivedList from '../goods-recieved/GoodsReceivedList';
import {
  useCheckGRNExists,
  useGoodsReceivedByPurchaseOrder,
} from '../goods-recieved/Hooks/useGoodsReceived';
import {
  usePurchaseOrder,
  useUpdatePurchaseOrderStatus,
  useSendPurchaseOrderToVendor,
  useAddPurchaseOrderComment,
  useUpdatePurchaseOrderComment,
  useDeletePurchaseOrderComment,
} from './Hooks/usePurchaseOrder';
import POPDFTemplate from './POPDFTemplate';
import { PurchaseOrderDetails } from './PurchaseOrderDetails';
import { capitalizeFirstLetter } from '../../utils/capitalizeFirstLetter';
import toast from 'react-hot-toast';
import { useFileUpload, useEntityFiles } from '../../hooks/useFile';
import PurchaseOrderCard from './PurchaseOrderCard';
import { infoConfig } from '@/config/config-info';

// Helper to generate consistent PDF filename
const getPDFFileName = (poCode: string): string => {
  return `ORDER-${poCode}.pdf`;
};

// Helper to check if a file matches our naming pattern
const isTargetPDFFile = (fileName: string, poCode: string): boolean => {
  return fileName === getPDFFileName(poCode);
};

const PurchaseOrder = () => {
  const currentUser = localStorageUser();
  const navigate = useNavigate();
  const { purchaseOrderId } = useParams();

  const { data: remoteData, isLoading, isError } = usePurchaseOrder(purchaseOrderId!);

  const purchaseOrder = useSelector((state: RootState) => state.purchaseOrder.purchaseOrder);

  const requestData = useMemo(() => remoteData?.data || purchaseOrder, [remoteData, purchaseOrder]);

  // ─── PDF upload state ─────────────────────────────────────────────
  const [uploadedFileIds, setUploadedFileIds] = useState<string[]>([]);
  const [isPdfReady, setIsPdfReady] = useState(false);
  const generatedPdfFileRef = useRef<File | null>(null);
  const isGeneratingOrUploadingRef = useRef(false);
  const [isDeletingOldFiles, setIsDeletingOldFiles] = useState(false);

  // ─── Get existing files for this Purchase Order ─────────────────
  const {
    files: existingFiles,
    isLoading: isLoadingFiles,
    deleteFile: deleteExistingFile,
    refetch: refetchFiles,
  } = useEntityFiles('PurchaseOrder', requestData?.id || '');

  // ─── Check if a PDF already exists ───────────────────────────────
  useEffect(() => {
    if (requestData?.id && existingFiles.length > 0 && requestData?.poCode) {
      // const pdfFileName = getPDFFileName(requestData.poCode);
      const existingPDF = existingFiles.find(file =>
        isTargetPDFFile(file.name, requestData.poCode)
      );

      if (existingPDF) {
        setUploadedFileIds([existingPDF.id]);
        setIsPdfReady(true);
      } else {
        setUploadedFileIds([]);
        setIsPdfReady(false);
      }
    }
  }, [existingFiles, requestData]);

  // Goods Received
  const { data: goodsReceivedData, refetch: refetchGoodsReceived } =
    useGoodsReceivedByPurchaseOrder(purchaseOrderId!);
  const { data: grnStatus, refetch: refetchGRNStatus } = useCheckGRNExists(purchaseOrderId!);

  const [showGoodsReceivedForm, setShowGoodsReceivedForm] = useState(false);
  const [showGoodsReceivedList, setShowGoodsReceivedList] = useState(false);
  const [editingGRN, setEditingGRN] = useState<IGoodsReceived | null>(null);

  useEffect(() => {
    if (!purchaseOrderId || (!isLoading && !requestData)) {
      navigate('/procurement/purchase-orders');
    }
  }, [requestData, purchaseOrderId, navigate, isLoading]);

  const [status, setStatus] = useState('');
  const [comment, setComment] = useState('');
  const [formData, setFormData] = useState<{ approvedBy?: string }>({ approvedBy: undefined });
  const [showTagDropdown, setShowTagDropdown] = useState(false);

  // Comment hooks
  const { addComment, isPending: isAddingComment } = useAddPurchaseOrderComment(purchaseOrderId!);
  const { updateComment, isPending: isUpdatingComment } = useUpdatePurchaseOrderComment(purchaseOrderId!);
  const { deleteComment, isPending: isDeletingComment } = useDeletePurchaseOrderComment(purchaseOrderId!);

  const { sendToVendor, isPending: isSendingToVendor } = useSendPurchaseOrderToVendor();

  const {
    pdfRef,
    isGenerating: isGeneratingPOPDF,
    showPreview,
    setShowPreview,
    generatePDF,
    previewPDF,
  } = usePOPDF(requestData);

  const { uploadFiles, isUploading: isUploadingPdf } = useFileUpload({
    associatedModel: 'PurchaseOrder',
    associatedId: requestData?.id,
  });

  // ─── Step 1: Generate & Upload (with cleanup) ───────────────────────────
  const handleGenerateAndUploadPDF = useCallback(async (): Promise<boolean> => {
    if (!requestData?.id || !requestData?.poCode) {
      toast.error('No purchase order found');
      return false;
    }

    // Already ready → do nothing
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
        toast.error('Failed to generate Purchase Order PDF');
        return false;
      }

      // 2. Rename the file with our naming convention
      const targetFileName = getPDFFileName(requestData.poCode);
      const renamedFile = new File([pdfFile], targetFileName, {
        type: pdfFile.type,
      });
      generatedPdfFileRef.current = renamedFile;

      // 3. Delete any existing PDF with the same name
      const existingPDF = existingFiles.find(file =>
        isTargetPDFFile(file.name, requestData.poCode)
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

      // 4. Upload the new PDF
      const uploaded = await uploadFiles([renamedFile]);
      if (!uploaded.length) {
        toast.error('Failed to upload Purchase Order PDF');
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
    requestData?.id,
    requestData?.poCode,
    generatePDF,
    uploadFiles,
    existingFiles,
    deleteExistingFile,
    refetchFiles,
    isPdfReady,
    uploadedFileIds,
  ]);

  // ─── Step 2: Send to vendor ──────────────────────────────────────────────
  const handleSendToVendor = useCallback(async () => {
    if (!requestData?.id) {
      toast.error('No purchase order ID available');
      return;
    }

    const vendor = requestData.selectedVendor;
    if (!vendor) {
      toast.error('No vendor selected for this purchase order');
      return;
    }

    const vendorId = typeof vendor === 'object' ? vendor.id : vendor;
    if (!vendorId) {
      toast.error('Invalid vendor information');
      return;
    }

    if (!isPdfReady || uploadedFileIds.length === 0) {
      toast.error('Please generate & upload the PDF first');
      return;
    }

    try {
      await sendToVendor({
        purchaseOrderId: requestData.id,
        vendorId,
        fileIds: uploadedFileIds,
      });
    } catch (error) {
      console.error('Failed to send PO to vendor:', error);
      toast.error('Failed to send Purchase Order to vendor');
    }
  }, [requestData, isPdfReady, uploadedFileIds, sendToVendor]);

  const { handleStatusChange } = useStatusUpdate();
  const { updatePurchaseOrderStatus, isPending: isUpdatingStatus } = useUpdatePurchaseOrderStatus();

  const onStatusChangeHandler = useCallback(async () => {
    await handleStatusChange(status, comment, async data => {
      if (data.status !== 'approved') {
        throw new Error('Status not approved');
      }

      updatePurchaseOrderStatus({
        purchaseOrderId: purchaseOrderId!,
        status: data.status,
        comment: data.comment,
      });
    });
  }, [status, comment, handleStatusChange, updatePurchaseOrderStatus, purchaseOrderId]);

  const pdfContentRef = useRef<HTMLDivElement>(null);
  const { downloadPdf, isGenerating: isDownloadingPDF } = usePdfDownload({
    filename: `${infoConfig.abbriviation}-PurchaseOrder-${requestData?.poCode || requestData?.id}`,
    multiPage: true,
    titleOptions: {
      text: `${infoConfig.abbriviation} Purchase Order : ${capitalizeFirstLetter(requestData?.status ?? '')}`,
    },
    footerCode: {
      label: `${infoConfig.abbriviation}Purchase Order`,
      value: requestData?.poCode ?? '',
    },
  });

  const handleDownloadPDF = useCallback(() => {
    downloadPdf(pdfContentRef);
  }, [downloadPdf]);

  const isCreator = requestData?.createdBy?.id === currentUser.id;
  const showStatusUpdate =
    requestData?.status === 'pending' && requestData?.approvedBy?.id === currentUser.id;

  const canSendToVendor = useMemo(() => {
    if (!isCreator) return false;
    if (!requestData) return false;
    if (requestData.status !== 'approved') return false;
    if (!requestData.selectedVendor) return false;
    const vendor = requestData.selectedVendor;
    if (typeof vendor === 'object' && !vendor.email) return false;
    return true;
  }, [requestData, isCreator]);

  const getVendorName = useCallback((): string => {
    if (!requestData?.selectedVendor) return 'No vendor selected';
    if (
      typeof requestData.selectedVendor === 'object' &&
      'businessName' in requestData.selectedVendor
    ) {
      return requestData.selectedVendor.businessName;
    }
    return 'No vendor selected';
  }, [requestData?.selectedVendor]);

  const getVendorEmail = useCallback((): string => {
    if (!requestData?.selectedVendor) return '';
    if (typeof requestData.selectedVendor === 'object' && 'email' in requestData.selectedVendor) {
      return requestData.selectedVendor.email;
    }
    return '';
  }, [requestData?.selectedVendor]);

  const canCreateGoodsReceived =
    (currentUser.role === 'SUPER-ADMIN' || currentUser.procurementRole?.canCreate) &&
    requestData?.status === 'approved';

  const comments = useMemo(() => requestData?.comments || [], [requestData]);
  const goodsReceivedNotes = useMemo(() => goodsReceivedData?.data || [], [goodsReceivedData]);

  const handleEditGRN = useCallback((grn: IGoodsReceived) => {
    setEditingGRN(grn);
    setShowGoodsReceivedForm(true);
  }, []);

  const handleGoodsReceivedSuccess = useCallback(() => {
    setShowGoodsReceivedForm(false);
    setEditingGRN(null);
    refetchGoodsReceived();
    refetchGRNStatus();
    setShowGoodsReceivedList(true);
  }, [refetchGoodsReceived, refetchGRNStatus]);

  const handleCreateGRN = useCallback(() => {
    setEditingGRN(null);
    setShowGoodsReceivedForm(true);
  }, []);

  const handleFormChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSend = useCallback((e: React.FormEvent) => {
    e.preventDefault();
  }, []);

  // const handleAddComment = async (text: string) => {
  //   await addComment({ text });
  // };
  const handleAddComment = useCallback(
    async (text: string) => {
      await addComment({ text });
    },
    [addComment]
  );

  const handleUpdateComment = useCallback(
    async (commentId: string, text: string) => {
      await updateComment({ commentId, text });
    },
    [updateComment]
  );

  const handleDeleteComment = useCallback(
    async (commentId: string) => {
      await deleteComment(commentId);
    },
    [deleteComment]
  );

  const tableHeadData = [
    { label: 'Vendor', showOnMobile: true, minWidth: '150px' },
    { label: 'Status', showOnMobile: true, minWidth: '100px' },
    { label: 'Amount', showOnMobile: true, minWidth: '120px' },
    { label: 'Date', showOnMobile: false, showOnTablet: true, minWidth: '120px' },
    { label: 'Actions', showOnMobile: true, minWidth: '100px' },
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

  if (!requestData) {
    return <div className="text-center py-8">No purchase order data available.</div>;
  }

  const isBusy = isSendingToVendor || isUploadingPdf || isGeneratingPOPDF || isDeletingOldFiles;

  return (
    <>
      <div className="flex flex-col space-y-3 pb-80">
        {/* Header */}
        <div className="sticky -top-8 z-10 bg-[#F8F8F8] pt-4 md:pt-6 pb-3 space-y-1.5 border-b">
          <div className="flex flex-wrap md:flex-row justify-between md:items-center gap-3 md:gap-0">
            <TextHeader>Purchase Order</TextHeader>
            <div className="flex flex-wrap md:flex-row md:items-center gap-3">
              {canSendToVendor && (
                <>
                  {/* 1. Generate & Upload */}
                  <Button
                    onClick={handleGenerateAndUploadPDF}
                    variant="outline"
                    size="sm"
                    disabled={isBusy || isPdfReady || isLoadingFiles}
                  >
                    {isUploadingPdf || isGeneratingPOPDF || isDeletingOldFiles ? (
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

                  {/* 2. Send to Vendor */}
                  <Button
                    onClick={handleSendToVendor}
                    variant="primary"
                    size="sm"
                    disabled={isBusy || !isPdfReady || uploadedFileIds.length === 0}
                  >
                    {isSendingToVendor ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Sending…
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send to Vendor
                      </>
                    )}
                  </Button>
                </>
              )}
              <Button
                variant="outline"
                onClick={() => navigate('/procurement/purchase-order')}
                size="sm"
              >
                <List className="h-4 w-4 mr-1 md:mr-2" />
                List
              </Button>
            </div>
          </div>

          {canSendToVendor && (
            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 mt-1">
              <span>Sending to: {getVendorName()}</span>
              <span>Email: {getVendorEmail()}</span>
              {isPdfReady && (
                <span className="inline-flex items-center text-green-600">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  PDF ready ({uploadedFileIds.length} file
                  {uploadedFileIds.length !== 1 ? 's' : ''})
                </span>
              )}
            </div>
          )}

          {isPdfReady && uploadedFileIds.length > 0 && requestData?.poCode && (
            <div className="text-xs text-gray-500 mt-0.5">
              Filename: {getPDFFileName(requestData.poCode)}
            </div>
          )}
        </div>

        {/* Main Content - rest of your component remains the same */}
        <DataStateContainer
          isLoading={isLoading}
          isError={isError}
          data={requestData}
          errorComponent={<NetworkErrorUI />}
          loadingComponent={
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
            </div>
          }
          emptyComponent={<div>No purchase order data available.</div>}
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
                  <tr className="hidden sm:table-row">
                    <td className="px-3 py-2.5 md:px-4 md:py-3 text-sm">{getVendorName()}</td>
                    <td className="px-3 py-2.5 md:px-4 md:py-3 text-sm">
                      <StatusBadge status={requestData?.status ?? 'unknown'} />
                    </td>
                    <td className="px-3 py-2.5 md:px-4 md:py-3 text-sm">
                      ₦{requestData?.totalAmount?.toLocaleString() || 0}
                    </td>
                    <td className="px-3 py-2.5 md:px-4 md:py-3 text-sm">
                      {formatToDDMMYYYY(requestData?.createdAt ?? new Date().toISOString())}
                    </td>
                    <td className="px-3 py-2.5 md:px-4 md:py-3 text-sm">
                      <ActionIcons
                        canShareRequest={isCreator}
                        requestId={requestData?.id}
                        isGeneratingPDF={isDownloadingPDF}
                        onDownloadPDF={handleDownloadPDF}
                        onPreviewPDF={previewPDF}
                        showTagDropdown={showTagDropdown}
                        setShowTagDropdown={setShowTagDropdown}
                        mode="purchase-order"
                        hideInspect={true}
                      />
                    </td>
                  </tr>
                  {/* Mobile Card View */}
                  <tr className="sm:hidden">
                    <td colSpan={tableHeadData.length} className="p-4 border-b border-gray-200">
                      {purchaseOrder && (
                        <PurchaseOrderCard
                          purchaseOrder={purchaseOrder}
                          actionIconsProps={{
                            canShareRequest: isCreator,
                            requestId: requestData?.id,
                            isGeneratingPDF: isDownloadingPDF,
                            onDownloadPDF: handleDownloadPDF,
                            onPreviewPDF: previewPDF,
                            showTagDropdown,
                            setShowTagDropdown,
                            mode: 'purchase-order',
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
                        request={requestData as unknown as TRequestEntity}
                        requestStatus={requestData?.status || ''}
                        canUploadFiles={false}
                        selectedFiles={[]}
                        setSelectedFiles={() => {}}
                        isUploading={false}
                        handleUpload={handleSend}
                        canUpdateStatus={showStatusUpdate}
                        status={status}
                        setStatus={setStatus}
                        comment={comment}
                        setComment={setComment}
                        isUpdatingStatus={isUpdatingStatus}
                        handleStatusChange={onStatusChangeHandler}
                        comments={comments}
                        canAddComments={isCreator || showStatusUpdate}
                        handleAddComment={handleAddComment}
                        handleUpdateComment={handleUpdateComment}
                        handleDeleteComment={handleDeleteComment}
                        isAddingComment={isAddingComment}
                        isUpdatingComment={isUpdatingComment}
                        isDeletingComment={isDeletingComment}
                        showAdminApproval={false}
                        formData={formData}
                        handleFormChange={handleFormChange}
                        admins={[]}
                        isLoadingAmins={false}
                      >
                        <div ref={pdfContentRef}>
                          <PurchaseOrderDetails purchaseOrder={requestData} />
                        </div>

                        {/* Goods Received Section */}
                        <div className="flex flex-col gap-4 p-4 mt-4">
                          {canCreateGoodsReceived && (
                            <div className="bg-white p-4 rounded-lg border shadow-sm">
                              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div>
                                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                                    <Package className="h-5 w-5" />
                                    Goods Received Management
                                  </h3>
                                  <p className="text-sm text-gray-600 mt-1">
                                    Track received items from this purchase order
                                  </p>
                                  {grnStatus?.data?.exists && (
                                    <div className="mt-2">
                                      <span
                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                          grnStatus.data.isCompleted
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-yellow-100 text-yellow-800'
                                        }`}
                                      >
                                        {grnStatus.data.isCompleted
                                          ? 'GRN Completed'
                                          : 'GRN In Progress'}
                                      </span>
                                    </div>
                                  )}
                                </div>
                                <div className="flex flex-col sm:flex-row gap-3">
                                  {goodsReceivedNotes.length > 0 && (
                                    <Button
                                      variant="primary"
                                      onClick={() =>
                                        setShowGoodsReceivedList(!showGoodsReceivedList)
                                      }
                                    >
                                      <Package className="h-4 w-4 mr-2" />
                                      {showGoodsReceivedList ? 'Hide' : 'View'} GRN (
                                      {goodsReceivedNotes.length})
                                    </Button>
                                  )}
                                  {grnStatus?.data?.isCompleted !== true && (
                                    <Button
                                      onClick={handleCreateGRN}
                                      variant={grnStatus?.data?.exists ? 'secondary' : 'primary'}
                                    >
                                      {grnStatus?.data?.exists ? (
                                        <>
                                          <Edit className="h-4 w-4 mr-2" />
                                          Edit GRN
                                        </>
                                      ) : (
                                        <>
                                          <Plus className="h-4 w-4 mr-2" />
                                          Create GRN
                                        </>
                                      )}
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}

                          {showGoodsReceivedList && goodsReceivedNotes.length > 0 && (
                            <GoodsReceivedList
                              goodsReceivedNotes={goodsReceivedNotes}
                              purchaseOrderId={purchaseOrderId!}
                              onEditGRN={handleEditGRN}
                            />
                          )}
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
        {requestData && <POPDFTemplate isGenerating={isGeneratingPOPDF} poData={requestData} />}
      </div>

      {/* PDF Preview Modal */}
      <PDFPreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        onDownload={handleDownloadPDF}
        isGenerating={isGeneratingPOPDF}
        title={`Purchase Order Preview - ${requestData?.poCode}`}
      >
        {requestData && <POPDFTemplate poData={requestData} />}
      </PDFPreviewModal>

      {/* Goods Received Form Modal */}
      {showGoodsReceivedForm && requestData && (
        <Dialog
          open={showGoodsReceivedForm}
          onOpenChange={open => {
            if (!open) {
              setShowGoodsReceivedForm(false);
              setEditingGRN(null);
            }
          }}
        >
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0" hideClose>
            <div className="sticky top-0 bg-white border-b p-4 z-10">
              <div className="flex justify-between items-center">
                <DialogTitle>{editingGRN ? 'Edit' : 'Create'} Goods Received Note</DialogTitle>
                <DialogClose asChild>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setShowGoodsReceivedForm(false);
                      setEditingGRN(null);
                    }}
                  >
                    Close
                  </Button>
                </DialogClose>
              </div>
            </div>
            <div className="p-6">
              <FormCreateGoodsReceived
                purchaseOrder={requestData}
                existingGoodsReceived={editingGRN || undefined}
                mode={editingGRN ? 'edit' : 'create'}
                onSuccess={handleGoodsReceivedSuccess}
                onCancel={() => {
                  setShowGoodsReceivedForm(false);
                  setEditingGRN(null);
                }}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default PurchaseOrder;
