import { List, Download } from "lucide-react"; // Removed unused imports
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { formatToDDMMYYYY } from "../../utils/formatToDDMMYYYY";
import { localStorageUser } from "../../utils/localStorageUser";
import Button from "../../ui/Button";
import StatusBadge from "../../ui/StatusBadge";
import RequestCommentsAndActions from "../../ui/RequestCommentsAndActions";
import TextHeader from "../../ui/TextHeader";
import { FileUpload } from "../../ui/FileUpload";
import { useGoodsReceivedDetail } from "./Hooks/useGoodsReceived";
import NetworkErrorUI from "../../ui/NetworkErrorUI";
import Spinner from "../../ui/Spinner";
import { DataStateContainer } from "../../ui/DataStateContainer";
import { usePdfDownload } from "../../hooks/usePdfDownload";
import ActionIcons from "../../ui/ActionIcons";
import { GRNDetails } from "./GRNDetails";
import GRNPDFTemplate from "./GRNPDFTemplate";
import PDFPreviewModal from "../../ui/PDFPreviewModal";
import { useGRNPDF } from "../../hooks/useGRNPDF";
import { useAddFilesToGoodsReceived } from "./Hooks/useGoodsReceived";
import toast from "react-hot-toast";

const GRN = () => {
  const currentUser = localStorageUser();
  const navigate = useNavigate();
  const { grnId } = useParams();

  // Data fetching and reconciliation
  const {
    data: remoteData,
    isLoading,
    isError,
  } = useGoodsReceivedDetail(grnId!);

  const goodsReceived = useSelector(
    (state: RootState) => state.goodsReceived.goodsReceived
  );

  const requestData = useMemo(
    () => remoteData?.data || goodsReceived,
    [remoteData, goodsReceived]
  );

  // Redirect logic
  useEffect(() => {
    if (!grnId || (!isLoading && !requestData)) {
      navigate("/procurement/goods-received");
    }
  }, [requestData, grnId, navigate, isLoading]);

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [showTagDropdown, setShowTagDropdown] = useState(false);

  // PDF generation logic
  const {
    pdfRef,
    isGenerating: isGeneratingGRNPDF,
    showPreview,
    setShowPreview,
    generatePDF,
    previewPDF,
  } = useGRNPDF(requestData);

  const { addFilesToGoodsReceived, isPending: isUploadingFiles } =
    useAddFilesToGoodsReceived();

  // PDF download logic
  const pdfContentRef = useRef<HTMLDivElement>(null);
  const { downloadPdf, isGenerating: isDownloadingPDF } = usePdfDownload({
    filename: `GRN-${requestData?.GRDCode || requestData?.id}`,
    multiPage: true,
    titleOptions: {
      text: "CASFOD Goods Received Note",
    },
  });

  const handleDownloadPDF = () => {
    downloadPdf(pdfContentRef);
  };

  const handleUploadPDF = async () => {
    if (!requestData) return;

    try {
      const pdfFile = await generatePDF();
      if (!pdfFile) {
        throw new Error("Failed to generate PDF");
      }

      // Upload PDF to GRN files
      await addFilesToGoodsReceived(
        {
          goodsReceivedId: grnId!,
          files: [pdfFile],
        },
        {
          onSuccess: () => {
            // toast.success("GRN PDF uploaded successfully");
          },
          onError: (error: any) => {
            console.error("Failed to upload PDF:", error);
            toast.error(error.message || "Failed to upload GRN PDF");
          },
        }
      );
    } catch (error) {
      console.error("PDF upload failed:", error);
      toast.error("Failed to generate or upload PDF");
    }
  };

  // Helper function to safely get creator ID
  const getCreatorId = (): string => {
    if (!requestData?.createdBy) return "";
    if (typeof requestData.createdBy === "string") {
      return requestData.createdBy;
    }
    return requestData.createdBy.id || "";
  };

  const isCreator = getCreatorId() === currentUser.id;
  const isCompleted = requestData?.isCompleted;
  const canUploadFiles = isCreator && isCompleted;

  const tableHeadData = [
    "GRN Code",
    "Purchase Order",
    "Status",
    "Date",
    "Actions",
  ];

  const tableRowData = [
    {
      id: "grnCode",
      content: requestData?.GRDCode || "N/A",
    },
    {
      id: "purchaseOrder",
      content:
        typeof requestData?.purchaseOrder === "object"
          ? requestData.purchaseOrder.POCode
          : "N/A",
    },
    {
      id: "status",
      content: (
        <StatusBadge
          status={requestData?.isCompleted ? "completed" : "in-progress"}
          key="status-badge"
        />
      ),
    },
    {
      id: "createdAt",
      content: formatToDDMMYYYY(requestData?.createdAt!),
    },
    {
      id: "action",
      content: (
        <ActionIcons
          canShareRequest={isCreator}
          requestId={requestData?.id}
          isGeneratingPDF={isDownloadingPDF}
          onDownloadPDF={handleDownloadPDF}
          onPreviewPDF={previewPDF}
          showTagDropdown={showTagDropdown}
          setShowTagDropdown={setShowTagDropdown}
          mode="purchase-order" // Changed from "grn" to "purchase-order" or whatever valid mode exists
        />
      ),
    },
  ];

  return (
    <>
      <div className="flex flex-col space-y-3 pb-80">
        <div className="sticky top-0 z-10 bg-[#F8F8F8] pt-4 md:pt-6 pb-3 space-y-1.5 border-b">
          <div className="flex justify-between items-center">
            <TextHeader>
              Goods Received Note - {requestData?.GRDCode}
            </TextHeader>
            <Button onClick={() => navigate("/procurement/goods-received")}>
              <List className="h-4 w-4 mr-1 md:mr-2" />
              List
            </Button>
          </div>
        </div>

        {/* Main Table Section */}
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
                  {tableRowData.map((data) => (
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

                      {/* {canUploadFiles && (
                        <div className="flex flex-col gap-3 mt-3">
                          <FileUpload
                            selectedFiles={selectedFiles}
                            setSelectedFiles={setSelectedFiles}
                            accept=".jpg,.png,.pdf,.xlsx,.docx"
                            multiple={true}
                          />
                          {selectedFiles.length > 0 && (
                            <Button
                              onClick={() => {
                                addFilesToGoodsReceived({
                                  goodsReceivedId: grnId!,
                                  files: selectedFiles,
                                });
                              }}
                              disabled={isUploadingFiles}
                            >
                              {isUploadingFiles
                                ? "Uploading..."
                                : "Upload Files"}
                            </Button>
                          )}
                        </div>
                      )} */}

                      <div className="flex justify-center w-full p-4">
                        {canUploadFiles && (
                          <Button
                            variant="primary"
                            size="small"
                            onClick={handleUploadPDF}
                            disabled={isUploadingFiles || isGeneratingGRNPDF}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            {isUploadingFiles
                              ? "Generating..."
                              : "Generate PDF"}
                          </Button>
                        )}
                      </div>

                      <div className="mt-4 tracking-wide">
                        <RequestCommentsAndActions request={requestData} />
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </DataStateContainer>
        </div>
      </div>

      {/* Hidden PDF Template for generation */}
      <div
        ref={pdfRef}
        style={{ position: "absolute", left: "-9999px", top: "-9999px" }}
      >
        {requestData && (
          <GRNPDFTemplate
            isGenerating={isGeneratingGRNPDF}
            grnData={requestData}
          />
        )}
      </div>

      {/* PDF Preview Modal */}
      <PDFPreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        onDownload={handleDownloadPDF}
        isGenerating={isGeneratingGRNPDF}
        title={`Goods Received Note Preview - ${requestData?.GRDCode}`}
      >
        {requestData && <GRNPDFTemplate grnData={requestData} />}
      </PDFPreviewModal>
    </>
  );
};

export default GRN;
