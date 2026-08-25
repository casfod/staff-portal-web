import { List, Loader2, CheckCircle, FileUp } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { formatToDDMMYYYY } from '../../utils/formatToDDMMYYYY';
import { localStorageUser } from '../../utils/localStorageUser';
import { Button } from '../../components/ui/button';
import StatusBadge from '../../components/custom/StatusBadge';
import TextHeader from '../../components/custom/TextHeader';
import { useGoodsReceivedDetail } from './Hooks/useGoodsReceived';
import NetworkErrorUI from '../../components/custom/NetworkErrorUI';
import Spinner from '../../components/custom/Spinner';
import { DataStateContainer } from '../../components/custom/DataStateContainer';
import { usePdfDownload } from '../../hooks/usePdfDownload';
import ActionIcons from '../../components/custom/ActionIcons';
import { GRNDetails } from './GRNDetails';
import GRNPDFTemplate from './GRNPDFTemplate';
import PDFPreviewModal from '../../components/custom/PDFPreviewModal';
import RequestCommentsAndActions, { TRequestEntityComments } from '@/components/custom/RequestActions';
import { useEntityFiles, useFileUpload } from '../../hooks/useFile';
import toast from 'react-hot-toast';
import { infoConfig } from '@/config/config-info';
// Helper to generate consistent PDF filename
const getPDFFileName = (grnCode: string): string => {
  // Remove slashes and replace with hyphens for safe filename
  const sanitizedGrnCode = grnCode.replace(/\//g, '-');
  return `GRN-${sanitizedGrnCode}.pdf`;
};

// Helper to check if a file matches our naming pattern
const isTargetPDFFile = (fileName: string, grnCode: string): boolean => {
  const sanitizedGrnCode = grnCode.replace(/\//g, '-');
  return fileName === `GRN-${sanitizedGrnCode}.pdf`;
};

const GRN = () => {
  const currentUser = localStorageUser();
  const navigate = useNavigate();
  const { grnId } = useParams();

  // ── Data fetching ──────────────────────────────────────────────────────────
  const { data: remoteData, isLoading, isError } = useGoodsReceivedDetail(grnId!);

  const goodsReceived = useSelector((state: RootState) => state.goodsReceived.goodsReceived);

  const requestData = useMemo(() => remoteData?.data || goodsReceived, [remoteData, goodsReceived]);

  // Redirect logic
  useEffect(() => {
    if (!grnId || (!isLoading && !requestData)) {
      navigate('/procurement/goods-received');
    }
  }, [requestData, grnId, navigate, isLoading]);

  // ─── PDF upload state ─────────────────────────────────────────────
  const [uploadedFileIds, setUploadedFileIds] = useState<string[]>([]);
  const [isPdfReady, setIsPdfReady] = useState(false);
  const generatedPdfFileRef = useRef<File | null>(null);
  const isGeneratingOrUploadingRef = useRef(false);
  const [isDeletingOldFiles, setIsDeletingOldFiles] = useState(false);

  // ─── Get existing files for this GRN ─────────────────────────────
  const {
    files: existingFiles,
    isLoading: isLoadingFiles,
    deleteFile: deleteExistingFile,
    refetch: refetchFiles,
  } = useEntityFiles('GoodsReceived', requestData?.id || '');

  // ─── Check if a PDF already exists ───────────────────────────────
  useEffect(() => {
    if (requestData?.id && existingFiles.length > 0 && requestData?.grdCode) {
      const existingPDF = existingFiles.find(file =>
        isTargetPDFFile(file.name, requestData.grdCode)
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

  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // ── File Upload Hook ──────────────────────────────────────────────────────
  const { uploadFiles, isUploading: isUploadingPdf } = useFileUpload({
    associatedModel: 'GoodsReceived',
    associatedId: requestData?.id,
  });


  // ── Refs ───────────────────────────────────────────────────────────────────
  /** Visible page content — used by the "download visible page" action */
  const pdfContentRef = useRef<HTMLDivElement>(null);
  /** Off-screen dedicated GRN template — used for generate-and-upload */
  const grnTemplateRef = useRef<HTMLDivElement>(null);

  // ── Unified PDF hook ───────────────────────────────────────────────────────
  const {
    downloadPdf,
    generateFile,
    previewPdf,
    isGenerating: isGeneratingPDF,
  } = usePdfDownload({
    filename: `GRN-${(requestData?.grdCode ?? '').replace(/\//g, '-')}.pdf`,
    format: 'a4',
    orientation: 'portrait',
    scale: 2,
    margin: 10,
    multiPage: true,
    quality: 1,
    backgroundColor: '#FFFFFF',
    footerCode: {
      label: `${infoConfig.abbriviation} GRN Number`,
      value: requestData?.grdCode ?? '',
    },
    templateRef: grnTemplateRef,
  });

  const handleDownloadPDF = () => downloadPdf(pdfContentRef);

  // ─── Step 1: Generate & Upload (with cleanup) ───────────────────────────
  const handleGenerateAndUploadPDF = useCallback(async (): Promise<boolean> => {
    if (!requestData?.id || !requestData?.grdCode) {
      toast.error('No GRN found');
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
        toast.error('Failed to generate GRN PDF');
        return false;
      }

      // 2. Rename the file with our naming convention
      const targetFileName = getPDFFileName(requestData.grdCode);
      const renamedFile = new File([pdfFile], targetFileName, {
        type: pdfFile.type,
      });
      generatedPdfFileRef.current = renamedFile;

      // 3. Delete any existing PDF with the same name
      const existingPDF = existingFiles.find(file =>
        isTargetPDFFile(file.name, requestData.grdCode)
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
        toast.error('Failed to upload GRN PDF');
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
    requestData?.grdCode,
    generateFile,
    uploadFiles,
    existingFiles,
    deleteExistingFile,
    refetchFiles,
    isPdfReady,
    uploadedFileIds,
  ]);

  // Helper function to safely get creator ID
  const getCreatorId = (): string => {
    if (!requestData?.createdBy) return '';
    if (typeof requestData.createdBy === 'string') {
      return requestData.createdBy;
    }
    return requestData.createdBy.id || '';
  };

  const isCreator = getCreatorId() === currentUser.id;
  const isCompleted = requestData?.isCompleted;
  const canGeneratePDF = isCreator && isCompleted;

  const isBusy = isUploadingPdf || isGeneratingPDF || isDeletingOldFiles;

  const tableHeadData = ['GRN Code', 'Purchase Order', 'Status', 'Date', 'Actions'];

  const tableRowData = [
    {
      id: 'grnCode',
      content: requestData?.grdCode || 'N/A',
    },
    {
      id: 'purchaseOrder',
      content:
        typeof requestData?.purchaseOrder === 'object' ? requestData.purchaseOrder.poCode : 'N/A',
    },
    {
      id: 'status',
      content: (
        <StatusBadge
          status={requestData?.isCompleted ? 'completed' : 'in-progress'}
          key="status-badge"
        />
      ),
    },
    {
      id: 'createdAt',
      content: formatToDDMMYYYY(requestData?.createdAt ?? "N/A"),
    },
    {
      id: 'action',
      content: (
        <ActionIcons
          canShareRequest={isCreator}
          requestId={requestData?.id}
          isGeneratingPDF={isGeneratingPDF}
          onDownloadPDF={handleDownloadPDF}
          onPreviewPDF={() => previewPdf(setShowPreview, requestData)}
          showTagDropdown={showTagDropdown}
          setShowTagDropdown={setShowTagDropdown}
          mode="purchase-order"
        />
      ),
    },
  ];

  return (
    <>
      <div className="flex flex-col space-y-3 pb-80">
        <div className="sticky -top-8 z-10 bg-[#F8F8F8] pt-4 md:pt-6 pb-3 space-y-1.5 border-b">
          <div className="flex flex-wrap md:flex-row justify-between md:items-center gap-3 md:gap-0">
            <TextHeader>Goods Received Note - {requestData?.grdCode}</TextHeader>
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
              <Button onClick={() => navigate('/procurement/goods-received')} variant="outline" size="sm">
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

          {isPdfReady && uploadedFileIds.length > 0 && requestData?.grdCode && (
            <div className="text-xs text-gray-500 mt-0.5">
              Filename: {getPDFFileName(requestData.grdCode)}
            </div>
          )}
        </div>

        {/* ── Main Content ──────────────────────────────────────────────── */}
        <div ref={pdfContentRef}>
          <DataStateContainer
            isLoading={isLoading}
            isError={isError}
            data={requestData}
            errorComponent={<NetworkErrorUI />}
            loadingComponent={<Spinner />}
            emptyComponent={<div>Goods Received Note not found</div>}
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
                <tr
                  key={requestData?.id}
                  className="h-[40px] max-h-[40px] hover:cursor-pointer hover:bg-[#f2f2f2]"
                >
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
                      <GRNDetails grn={requestData!} />

                      <div className="mt-4 tracking-wide">
                        <RequestCommentsAndActions request={requestData as TRequestEntityComments} />
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </DataStateContainer>
        </div>

        {/* ── Off-screen PDF template (for generate & upload) ───────────── */}
        <div
          ref={grnTemplateRef}
          style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}
        >
          {requestData && (
            <GRNPDFTemplate isGenerating={isGeneratingPDF} grnData={requestData} />
          )}
        </div>

        {/* ── Preview Modal ─────────────────────────────────────────────── */}
        <PDFPreviewModal
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          onDownload={handleDownloadPDF}
          isGenerating={isGeneratingPDF}
          title={`GRN Preview - ${requestData?.grdCode}`}
        >
          {requestData && <GRNPDFTemplate grnData={requestData} />}
        </PDFPreviewModal>
      </div>
    </>
  );
};

export default GRN;