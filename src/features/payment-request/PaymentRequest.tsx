import { Download, List } from "lucide-react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";

import { RootState } from "../../store/store";
import { localStorageUser } from "../../utils/localStorageUser";
import { useAdmins } from "../user/Hooks/useAdmins";
import { useUpdateStatus } from "./Hooks/useUpdateStatus";
import { useUpdatePaymentRequest } from "./Hooks/useUpdatePaymentRequest";

import { dateformat } from "../../utils/dateFormat";
import { moneyFormat } from "../../utils/moneyFormat";
// import { generatePdf } from "../../utils/generatePdf";
import PaymentRequestDetails from "./PaymentRequestDetails";
import StatusBadge from "../../ui/StatusBadge";
import AdminApprovalSection from "../../ui/AdminApprovalSection";
import StatusUpdateForm from "../../ui/StatusUpdateForm";
import RequestCommentsAndActions from "../../ui/RequestCommentsAndActions";
import Button from "../../ui/Button";
import TextHeader from "../../ui/TextHeader";
import { FileUpload } from "../../ui/FileUpload";
import SpinnerMini from "../../ui/SpinnerMini";
import { useStatusUpdate } from "../../hooks/useStatusUpdate";
import { usePdfDownload } from "../../hooks/usePdfDownload";

const PaymentRequest = () => {
  const currentUser = localStorageUser();
  const paymentRequest = useSelector(
    (state: RootState) => state.paymentRequest.paymentRequest
  );
  const navigate = useNavigate();
  const { requestId } = useParams();

  const [status, setStatus] = useState("");
  const [comment, setComment] = useState("");
  const [formData, setFormData] = useState({ approvedBy: null });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDownloadPDF, setIsDownloadPDF] = useState<boolean>(false);

  // Custom hooks
  const { updateStatus, isPending: isUpdatingStatus } = useUpdateStatus(
    requestId!
  );
  const { updatePaymentRequest, isPending: isUpdating } =
    useUpdatePaymentRequest(requestId!);
  const { data: adminsData, isLoading: isLoadingAmins } = useAdmins();
  const { handleStatusChange } = useStatusUpdate();

  const admins = useMemo(() => adminsData?.data ?? [], [adminsData]);

  useEffect(() => {
    if (!requestId || !paymentRequest) {
      navigate("/payment-requests");
    }
  }, [paymentRequest, requestId, navigate]);

  const handleFormChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const onStatusChangeHandler = () => {
    handleStatusChange(status, comment, async (data) => {
      try {
        await updateStatus(data, {
          onError: (error) => {
            throw error;
          },
        });
      } catch (error) {
        throw error;
      }
    });
  };

  //PDF Logic
  const pdfRef = useRef<HTMLDivElement>(null);
  const { downloadPdf } = usePdfDownload({
    filename: `payment-request-${requestId}.pdf`,
    format: "a4",
    orientation: "portrait",
  });

  const handleDownloadPdf = () => {
    setIsDownloadPDF(true);
    downloadPdf(pdfRef);
    setIsDownloadPDF(false);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    updatePaymentRequest({ data: formData, files: selectedFiles });
  };

  if (!paymentRequest) {
    return <div>No payment request data available.</div>;
  }

  // User references
  const currentUserId = currentUser.id;
  const userRole = currentUser.role;
  const requestStatus = paymentRequest.status;
  const requestedByName = `${paymentRequest.requestedBy?.first_name} ${paymentRequest.requestedBy?.last_name}`;

  // Permission flags with explicit null checks
  const isCreator = paymentRequest.requestedBy?.id === currentUserId;
  const isReviewer = paymentRequest.reviewedBy?.id === currentUserId;
  const isApprover = paymentRequest.approvedBy?.id === currentUserId;
  const isAdmin = ["SUPER-ADMIN", "ADMIN"].includes(userRole);

  // Conditional rendering flags
  const canUploadFiles = isCreator && requestStatus === "approved";
  const canUpdateStatus =
    !isCreator &&
    ((userRole === "REVIEWER" && requestStatus === "pending" && isReviewer) ||
      (isAdmin && requestStatus === "reviewed" && isApprover));

  const showAdminApproval =
    !paymentRequest.approvedBy &&
    requestStatus === "reviewed" &&
    (isCreator ||
      (isReviewer && !paymentRequest.reviewedBy) ||
      (isApprover && !paymentRequest.approvedBy));

  // Table data
  const tableHeadData = ["Request", "Status", "Budget", "Date", "Actions"];
  const tableRowData = [
    {
      id: "requestedByName",
      content: requestedByName,
    },
    {
      id: "requestStatus",
      content: isDownloadPDF ? (
        requestStatus
      ) : (
        <StatusBadge status={requestStatus!} key="status-badge" />
      ),
    },
    {
      id: "moneyFormat",
      content: moneyFormat(paymentRequest.amountInFigure, "NGN"),
    },
    {
      id: "dateformat",
      content: dateformat(paymentRequest.createdAt!),
    },
    {
      id: "dateformat",
      content: (
        <button onClick={handleDownloadPdf}>
          <Download className="w-6 h-6" />
        </button>
      ),
    },
  ];

  return (
    <div className="flex flex-col space-y-3 pb-80">
      <div className="sticky top-0 z-10 bg-[#F8F8F8] pt-4 md:pt-6 pb-3 space-y-1.5 border-b">
        <div className="flex justify-between items-center">
          <TextHeader>Payment Request</TextHeader>
          <Button onClick={() => navigate(-1)}>
            <List className="h-4 w-4 mr-1 md:mr-2" />
            List
          </Button>
        </div>
      </div>

      <div
        // ref={pdfRef}
        className="w-full bg-inherit shadow-sm rounded-lg border pb-[200px] overflow-x-scroll"
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
            <tr key={paymentRequest.id} className="h-[40px] max-h-[40px]">
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
              <td colSpan={5}>
                <div
                  ref={pdfRef}
                  className="border border-gray-300 px-3 py-2.5 md:px-6 md:py-3 rounded-md h-auto relative"
                >
                  <PaymentRequestDetails request={paymentRequest} />

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
                            {isUpdating ? <SpinnerMini /> : "Upload"}
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {paymentRequest.reviewedBy && requestStatus !== "draft" && (
                    <div className="mt-4 tracking-wide">
                      <RequestCommentsAndActions request={paymentRequest} />

                      {canUpdateStatus && (
                        <StatusUpdateForm
                          requestStatus={requestStatus}
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
      </div>
    </div>
  );
};

export default PaymentRequest;
