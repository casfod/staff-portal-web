// components/payment-vouchers/PaymentVoucher.tsx - Fully Integrated with PDF
import { List, Download } from "lucide-react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { RootState } from "../../store/store";
import { useEffect, useMemo, useRef, useState } from "react";
import { formatToDDMMYYYY } from "../../utils/formatToDDMMYYYY";
import { moneyFormat } from "../../utils/moneyFormat";
import { localStorageUser } from "../../utils/localStorageUser";
import { useAdmins } from "../user/Hooks/useAdmins";
import { PaymentVoucherDetails } from "./PaymentVoucherDetails";
import StatusBadge from "../../ui/StatusBadge";
import RequestCommentsAndActions from "../../ui/RequestCommentsAndActions";
import StatusUpdateForm from "../../ui/StatusUpdateForm";
import AdminApprovalSection from "../../ui/AdminApprovalSection";
import Button from "../../ui/Button";
import TextHeader from "../../ui/TextHeader";
import { FileUpload } from "../../ui/FileUpload";
import SpinnerMini from "../../ui/SpinnerMini";
import { useStatusUpdate } from "../../hooks/useStatusUpdate";
import NetworkErrorUI from "../../ui/NetworkErrorUI";
import Spinner from "../../ui/Spinner";
import { DataStateContainer } from "../../ui/DataStateContainer";
import { MaintenanceBanner } from "../../ui/MaintenanceBanner";
import ActionIcons from "../../ui/ActionIcons";
import { usePdfDownload } from "../../hooks/usePdfDownload";
import {
  usePaymentVoucherDetail,
  useUpdatePaymentVoucherLegacy as useUpdatePaymentVoucher,
  useUpdateStatus,
  useCopy,
  useAddFilesToPaymentVoucher,
} from "./Hooks/usePaymentVoucher";
import { usePVPDF } from "../../hooks/usePVPDF";
import PVPDFTemplate from "./PVPDFTemplate";
import PDFPreviewModal from "../../ui/PDFPreviewModal";
import toast from "react-hot-toast";

const PaymentVoucher = () => {
  const isUnderMaintenance = false;

  const currentUser = localStorageUser();
  const navigate = useNavigate();
  const { voucherId } = useParams();

  // Data fetching
  const {
    data: remoteData,
    isLoading,
    isError,
  } = usePaymentVoucherDetail(voucherId!);

  const paymentVoucher = useSelector(
    (state: RootState) => state.paymentVoucher.paymentVoucher
  );

  const voucherData = useMemo(
    () => remoteData?.data || paymentVoucher,
    [remoteData, paymentVoucher]
  );

  useEffect(() => {
    if (!voucherId || (!isLoading && !voucherData)) {
      navigate("/payment-vouchers");
    }
  }, [voucherData, voucherId, navigate, isLoading]);

  const [status, setStatus] = useState("");
  const [comment, setComment] = useState("");
  const [formData, setFormData] = useState({ approvedBy: null });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [showTagDropdown, setShowTagDropdown] = useState(false);

  const { handleStatusChange } = useStatusUpdate();

  // Mutations
  const { updateStatus, isPending: isUpdatingStatus } = useUpdateStatus(
    voucherId!
  );
  const { updatePaymentVoucher, isPending: isUpdating } =
    useUpdatePaymentVoucher(voucherId!);
  const { addFilesToPaymentVoucher, isPending: isUploadingFiles } =
    useAddFilesToPaymentVoucher();
  const { copyto, isPending: isCopying } = useCopy(voucherId!);

  const { data: adminsData, isLoading: isLoadingAmins } = useAdmins();
  const admins = useMemo(() => adminsData?.data ?? [], [adminsData]);

  const handleFormChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const onStatusChangeHandler = () => {
    handleStatusChange(
      status,
      comment,
      async (data: { status: string; comment: string }) => {
        try {
          await updateStatus(data);
        } catch (error) {
          throw error;
        }
      }
    );
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    updatePaymentVoucher({
      data: formData,
      files: selectedFiles,
    });
  };

  // PDF generation logic
  const {
    pdfRef,
    isGenerating: isGeneratingPVPDF,
    showPreview,
    setShowPreview,
    generatePDF,
    previewPDF,
    // downloadPDF,
  } = usePVPDF(voucherData);

  // PDF download logic
  const pdfContentRef = useRef<HTMLDivElement>(null);
  const { downloadPdf, isGenerating: isDownloadingPDF } = usePdfDownload({
    filename: `PaymentVoucher-${voucherData?.pvNumber || voucherData?.id}`,
    multiPage: true,
    titleOptions: {
      text: "Payment Voucher",
    },
  });

  const handleDownloadPDF = () => {
    downloadPdf(pdfContentRef);
  };

  const handleUploadPDF = async () => {
    if (!voucherData) return;

    try {
      const pdfFile = await generatePDF("landscape"); // Explicitly set landscape
      if (!pdfFile) {
        throw new Error("Failed to generate PDF");
      }

      // Upload PDF to Payment Voucher files
      await addFilesToPaymentVoucher({
        paymentVoucherId: voucherId!,
        files: [pdfFile],
      });
    } catch (error) {
      console.error("PDF upload failed:", error);
      toast.error("Failed to generate or upload PDF");
    }
  };

  // User role checks
  const currentUserId = currentUser.id;
  const userRole = currentUser.role;
  const voucherStatus = voucherData?.status;

  // Permission flags
  const isCreator = voucherData?.createdBy?.id === currentUserId;
  const isReviewer = voucherData?.reviewedBy?.id === currentUserId;
  const isApprover = voucherData?.approvedBy?.id === currentUserId;
  const isAdmin = ["SUPER-ADMIN", "ADMIN"].includes(userRole);

  // Conditional rendering flags
  const canUploadFiles = isCreator && voucherStatus === "approved";
  const canShareVoucher =
    isCreator ||
    ["SUPER-ADMIN", "ADMIN", "REVIEWER"].includes(currentUser.role);
  const canUpdateStatus =
    !isCreator &&
    ((userRole === "REVIEWER" && voucherStatus === "pending" && isReviewer) ||
      (isAdmin && voucherStatus === "reviewed" && isApprover));

  const showAdminApproval =
    !voucherData?.approvedBy &&
    voucherStatus === "reviewed" &&
    (isCreator ||
      (isReviewer && !voucherData?.reviewedBy) ||
      (isApprover && !voucherData?.approvedBy));

  const canGeneratePDF = isCreator && voucherStatus !== "draft";

  // Table data
  const tableHeadData = [
    "Voucher",
    "Status",
    "Pay To",
    "Amount",
    "Date",
    "Actions",
  ];
  const tableRowData = [
    { id: "pvNumber", content: voucherData?.pvNumber },
    { id: "status", content: <StatusBadge status={voucherData?.status!} /> },
    { id: "payTo", content: voucherData?.payTo },
    {
      id: "netAmount",
      content: moneyFormat(voucherData?.netAmount || 0, "NGN"),
    },
    { id: "createdAt", content: formatToDDMMYYYY(voucherData?.createdAt!) },
    {
      id: "action",
      content: (
        <ActionIcons
          copyTo={copyto}
          isCopying={isCopying}
          canShareRequest={canShareVoucher}
          requestId={voucherData?.id}
          isGeneratingPDF={isDownloadingPDF}
          onDownloadPDF={handleDownloadPDF}
          onPreviewPDF={() => previewPDF("landscape")} // Explicitly set landscape
          showTagDropdown={showTagDropdown}
          setShowTagDropdown={setShowTagDropdown}
        />
      ),
    },
  ];

  return (
    <>
      {isUnderMaintenance ? (
        <MaintenanceBanner
          title="Payment Vouchers Under Maintenance"
          message="We're addressing a payment voucher error."
          expectedCompletion="Will Be Back Very soon "
        />
      ) : (
        <div className="flex flex-col space-y-3 pb-80">
          <div className="sticky top-0 z-10 bg-[#F8F8F8] pt-4 md:pt-6 pb-3 space-y-1.5 border-b">
            <div className="flex justify-between items-center">
              <TextHeader>Payment Voucher - {voucherData?.pvNumber}</TextHeader>
              <Button onClick={() => navigate("/payment-vouchers")}>
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
                        <PaymentVoucherDetails voucher={voucherData!} />

                        {/* File Upload Section */}
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
                                <Button
                                  disabled={isUpdating}
                                  onClick={handleSend}
                                >
                                  {isUpdating ? (
                                    <SpinnerMini />
                                  ) : (
                                    "Upload Files"
                                  )}
                                </Button>
                              </div>
                            )}
                          </div>
                        )}

                        {/* PDF Generation Section */}
                        {canGeneratePDF && (
                          <div className="flex justify-center w-full p-4 mt-4 border-t pt-6">
                            <Button
                              variant="primary"
                              size="small"
                              onClick={handleUploadPDF}
                              disabled={isUploadingFiles || isGeneratingPVPDF}
                            >
                              <Download className="h-4 w-4 mr-1" />
                              {isUploadingFiles || isGeneratingPVPDF
                                ? "Generating..."
                                : "Generate & Upload PDF"}
                            </Button>
                          </div>
                        )}

                        {/* Comments and Status Update Section */}
                        {voucherData?.reviewedBy &&
                          voucherStatus !== "draft" && (
                            <div className="mt-4 tracking-wide">
                              <RequestCommentsAndActions
                                request={voucherData}
                              />

                              {canUpdateStatus && (
                                <StatusUpdateForm
                                  requestStatus={voucherStatus}
                                  status={status}
                                  setStatus={setStatus}
                                  comment={comment}
                                  setComment={setComment}
                                  isUpdatingStatus={isUpdatingStatus}
                                  handleStatusChange={onStatusChangeHandler}
                                />
                              )}
                            </div>
                          )}

                        {/* Admin Approval Section */}
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

          {/* Hidden PDF Template for generation */}
          <div
            ref={pdfRef}
            style={{ position: "absolute", left: "-9999px", top: "-9999px" }}
          >
            {voucherData && (
              <PVPDFTemplate
                isGenerating={isGeneratingPVPDF}
                pvData={voucherData}
                orientation="landscape" // Add orientation prop
              />
            )}
          </div>

          {/* PDF Preview Modal */}
          <PDFPreviewModal
            isOpen={showPreview}
            onClose={() => setShowPreview(false)}
            onDownload={handleDownloadPDF}
            isGenerating={isGeneratingPVPDF}
            title={`Payment Voucher Preview - ${voucherData?.pvNumber}`}
            orientation="landscape" // Add orientation prop
          >
            {voucherData && (
              <PVPDFTemplate
                pvData={voucherData}
                orientation="landscape" // Add orientation prop
              />
            )}
          </PDFPreviewModal>
        </div>
      )}
    </>
  );
};

export default PaymentVoucher;
