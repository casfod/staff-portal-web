import { List, Package, Plus, Edit } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { formatToDDMMYYYY } from "../../utils/formatToDDMMYYYY";
import { localStorageUser } from "../../utils/localStorageUser";
import Button from "../../ui/Button";
import StatusBadge from "../../ui/StatusBadge";
import RequestCommentsAndActions from "../../ui/RequestCommentsAndActions";
import StatusUpdateForm from "../../ui/StatusUpdateForm";
import TextHeader from "../../ui/TextHeader";
// import { FileUpload } from "../../ui/FileUpload";
import { useStatusUpdate } from "../../hooks/useStatusUpdate";
import { usePurchaseOrder } from "./Hooks/usePurchaseOrder";
import NetworkErrorUI from "../../ui/NetworkErrorUI";
import Spinner from "../../ui/Spinner";
import { DataStateContainer } from "../../ui/DataStateContainer";
import { usePdfDownload } from "../../hooks/usePdfDownload";
import ActionIcons from "../../ui/ActionIcons";
import { useUpdatePurchaseOrderStatus } from "./Hooks/usePurchaseOrder";
import { PurchaseOrderDetails } from "./PurchaseOrderDetails";
import POPDFTemplate from "./POPDFTemplate";
import PDFPreviewModal from "../../ui/PDFPreviewModal";
import { usePOPDF } from "../../hooks/usePOPDF";
import {
  useGoodsReceivedByPurchaseOrder,
  useCheckGRNExists,
} from "../goods-recieved/Hooks/useGoodsReceived";
import GoodsReceivedList from "../goods-recieved/GoodsReceivedList";
import FormCreateGoodsReceived from "../goods-recieved/FormCreateGoodsReceived";
import { GoodsReceivedType } from "../../interfaces";

const PurchaseOrder = () => {
  const currentUser = localStorageUser();
  const navigate = useNavigate();
  const { purchaseOrderId } = useParams();

  // Data fetching and reconciliation
  const {
    data: remoteData,
    isLoading,
    isError,
  } = usePurchaseOrder(purchaseOrderId!);

  const purchaseOrder = useSelector(
    (state: RootState) => state.purchaseOrder.purchaseOrder
  );

  const requestData = useMemo(
    () => remoteData?.data || purchaseOrder,
    [remoteData, purchaseOrder]
  );

  // Goods Received data
  const { data: goodsReceivedData, refetch: refetchGoodsReceived } =
    useGoodsReceivedByPurchaseOrder(purchaseOrderId!);

  const { data: grnStatus, refetch: refetchGRNStatus } = useCheckGRNExists(
    purchaseOrderId!
  );

  const [showGoodsReceivedForm, setShowGoodsReceivedForm] = useState(false);
  const [showGoodsReceivedList, setShowGoodsReceivedList] = useState(false);
  const [editingGRN, setEditingGRN] = useState<GoodsReceivedType | null>(null);

  // Redirect logic
  useEffect(() => {
    if (!purchaseOrderId || (!isLoading && !requestData)) {
      navigate("/procurement/purchase-orders");
    }
  }, [requestData, purchaseOrderId, navigate, isLoading]);

  const [status, setStatus] = useState("");
  const [comment, setComment] = useState("");
  // const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [showTagDropdown, setShowTagDropdown] = useState(false);

  // PDF generation logic
  const {
    pdfRef,
    isGenerating: isGeneratingPOPDF,
    showPreview,
    setShowPreview,
    generatePDF,
    previewPDF,
  } = usePOPDF(requestData);

  console.log("grnStatus?.exists::", grnStatus?.data);

  // Custom hooks
  const { handleStatusChange } = useStatusUpdate();
  const { updatePurchaseOrderStatus, isPending: isUpdatingStatus } =
    useUpdatePurchaseOrderStatus();

  const onStatusChangeHandler = async () => {
    handleStatusChange(status, comment, async (data) => {
      try {
        let pdfFile: File | null = null;

        // Generate PDF if status is being approved
        if (data.status === "approved") {
          pdfFile = await generatePDF();
          if (!pdfFile) {
            throw new Error("Failed to generate PDF");
          }
        }

        await updatePurchaseOrderStatus(
          {
            purchaseOrderId: purchaseOrderId!,
            status: data.status,
            comment: data.comment,
            pdfFile: pdfFile || undefined, // Include PDF file for approved status
          },
          {
            onError: (error) => {
              throw error;
            },
          }
        );
      } catch (error) {
        throw error;
      }
    });
  };

  // PDF download logic
  const pdfContentRef = useRef<HTMLDivElement>(null);
  const { downloadPdf, isGenerating: isDownloadingPDF } = usePdfDownload({
    filename: `PurchaseOrder-${requestData?.POCode || requestData?.id}`,
    multiPage: true,
    titleOptions: {
      text: "CASFOD Purchase Order",
    },
  });

  const handleDownloadPDF = () => {
    downloadPdf(pdfContentRef);
  };

  const isCreator = requestData?.createdBy?.id === currentUser.id;
  // const requestStatus = requestData?.status;
  // const canUploadFiles = isCreator && requestStatus === "approved";

  const showStatusUpdate =
    requestData?.status === "pending" &&
    requestData?.approvedBy?.id === currentUser.id;

  // Goods Received permissions
  const canCreateGoodsReceived =
    (currentUser.role === "SUPER-ADMIN" ||
      currentUser.procurementRole?.canCreate) &&
    requestData?.status === "approved";

  const goodsReceivedNotes = useMemo(
    () => goodsReceivedData?.data?.goodsReceived || [],
    [goodsReceivedData]
  );

  // GRN action handlers
  const handleEditGRN = (grn: GoodsReceivedType) => {
    setEditingGRN(grn);
    setShowGoodsReceivedForm(true);
  };

  const handleGoodsReceivedSuccess = () => {
    setShowGoodsReceivedForm(false);
    setEditingGRN(null);
    refetchGoodsReceived();
    refetchGRNStatus();
    setShowGoodsReceivedList(true);
  };

  const handleCreateGRN = () => {
    setEditingGRN(null);
    setShowGoodsReceivedForm(true);
  };

  const tableHeadData = ["Vendor", "Status", "Date", "Actions"];

  const tableRowData = [
    {
      id: "vendor",
      content:
        requestData?.selectedVendor?.businessName || "No vendor selected",
    },
    {
      id: "status",
      content: <StatusBadge status={requestData?.status!} key="status-badge" />,
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
          mode="purchase-order"
        />
      ),
    },
  ];

  return (
    <>
      <div className="flex flex-col space-y-3 pb-80">
        <div className="sticky top-0 z-10 bg-[#F8F8F8] pt-4 md:pt-6 pb-3 space-y-1.5 border-b">
          <div className="flex justify-between items-center">
            <TextHeader>Purchase Order - {requestData?.POCode}</TextHeader>
            <Button
              onClick={() =>
                navigate("/procurement/purchase-order/purchase-orders")
              }
            >
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
            emptyComponent={<div>Purchase Order not found</div>}
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
                      <PurchaseOrderDetails purchaseOrder={requestData!} />

                      {/* {canUploadFiles && (
                        <div className="flex flex-col gap-3 mt-3">
                          <FileUpload
                            selectedFiles={selectedFiles}
                            setSelectedFiles={setSelectedFiles}
                            accept=".jpg,.png,.pdf,.xlsx,.docx"
                            multiple={true}
                          />
                        </div>
                      )} */}

                      {/* Goods Received Actions Section */}
                      <div className="flex flex-col gap-4 p-4">
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
                                {grnStatus?.data.exists && (
                                  <div className="mt-2">
                                    <span
                                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        grnStatus.data.isCompleted
                                          ? "bg-green-100 text-green-800"
                                          : "bg-yellow-100 text-yellow-800"
                                      }`}
                                    >
                                      {grnStatus.data.isCompleted
                                        ? "GRN Completed"
                                        : "GRN In Progress"}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div className="flex flex-col sm:flex-row gap-3">
                                {goodsReceivedNotes.length > 0 && (
                                  <Button
                                    variant="primary"
                                    onClick={() =>
                                      setShowGoodsReceivedList(
                                        !showGoodsReceivedList
                                      )
                                    }
                                  >
                                    <Package className="h-4 w-4 mr-2" />
                                    {showGoodsReceivedList
                                      ? "Hide"
                                      : "View"}{" "}
                                    GRN ({goodsReceivedNotes.length})
                                  </Button>
                                )}
                                {grnStatus?.data.isCompleted !== true && (
                                  <Button
                                    onClick={handleCreateGRN}
                                    variant={
                                      grnStatus?.data.exists
                                        ? "secondary"
                                        : "primary"
                                    }
                                  >
                                    {grnStatus?.data.exists ? (
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

                        {/* Goods Received List */}
                        {showGoodsReceivedList &&
                          goodsReceivedNotes.length > 0 && (
                            <GoodsReceivedList
                              goodsReceivedNotes={goodsReceivedNotes}
                              purchaseOrderId={purchaseOrderId!}
                              onEditGRN={handleEditGRN}
                            />
                          )}
                      </div>

                      {requestData?.status === "pending" && (
                        <div className="mt-4 tracking-wide">
                          <RequestCommentsAndActions request={requestData} />

                          {showStatusUpdate && (
                            <StatusUpdateForm
                              requestStatus={requestData?.status!}
                              status={status}
                              setStatus={setStatus}
                              comment={comment}
                              setComment={setComment}
                              isUpdatingStatus={isUpdatingStatus}
                              handleStatusChange={onStatusChangeHandler}
                              directApproval={true}
                            />
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </DataStateContainer>
        </div>
      </div>

      {/* Goods Received Form Modal */}
      {showGoodsReceivedForm && requestData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4">
              <div className="flex justify-between items-center">
                <TextHeader>
                  {editingGRN ? "Edit" : "Create"} Goods Received Note
                </TextHeader>
                <Button
                  variant="secondary"
                  size="small"
                  onClick={() => {
                    setShowGoodsReceivedForm(false);
                    setEditingGRN(null);
                  }}
                >
                  Close
                </Button>
              </div>
            </div>
            <div className="p-6">
              <FormCreateGoodsReceived
                purchaseOrder={requestData}
                existingGoodsReceived={editingGRN || undefined}
                mode={editingGRN ? "edit" : "create"}
                onSuccess={handleGoodsReceivedSuccess}
                onCancel={() => {
                  setShowGoodsReceivedForm(false);
                  setEditingGRN(null);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Hidden PDF Template for generation */}
      <div
        ref={pdfRef}
        style={{ position: "absolute", left: "-9999px", top: "-9999px" }}
      >
        {requestData && (
          <POPDFTemplate
            isGenerating={isGeneratingPOPDF}
            poData={requestData}
          />
        )}
      </div>

      {/* PDF Preview Modal */}
      <PDFPreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        onDownload={handleDownloadPDF}
        isGenerating={isGeneratingPOPDF}
        title={`Purchase Order Preview - ${requestData?.POCode}`}
      >
        {requestData && <POPDFTemplate poData={requestData} />}
      </PDFPreviewModal>
    </>
  );
};

export default PurchaseOrder;
