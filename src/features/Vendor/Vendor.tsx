import { List } from "lucide-react";
import { useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TextHeader from "../../ui/TextHeader";
import Button from "../../ui/Button";
import { VendorDetails } from "./VendorDetails";
import { truncateText } from "../../utils/truncateText";
import { usePdfDownload } from "../../hooks/usePdfDownload";
import ActionIcons from "../../ui/ActionIcons";
import { useVendor } from "./Hooks/useVendor";
import { useUpdateVendorStatus } from "./Hooks/useVendor";
import { localStorageUser } from "../../utils/localStorageUser";
import StatusBadge from "../../ui/StatusBadge";
import RequestCommentsAndActions from "../../ui/RequestCommentsAndActions";
import StatusUpdateForm from "../../ui/StatusUpdateForm";
import Spinner from "../../ui/Spinner";
import NetworkErrorUI from "../../ui/NetworkErrorUI";
import { DataStateContainer } from "../../ui/DataStateContainer";

const Vendor = () => {
  const navigate = useNavigate();
  const { vendorId } = useParams();
  const currentUser = localStorageUser();

  const [status, setStatus] = useState("");
  const [comment, setComment] = useState("");

  // Fetch vendor data - FIXED: Access vendor from data.vendor
  const { data: vendorResponse, isLoading, isError } = useVendor(vendorId!);
  const vendor = vendorResponse?.data;

  const { updateVendorStatus, isPending: isUpdatingStatus } =
    useUpdateVendorStatus();

  // PDF logic
  const pdfContentRef = useRef<HTMLDivElement>(null);
  const { downloadPdf, isGenerating } = usePdfDownload({
    filename: `CASFOD-Vendor-${vendor?.vendorCode}`,
    multiPage: true,
    titleOptions: {
      text: `CASFOD Vendor Registration Details`,
    },
    footerCode: {
      label: "CASFOD Vendor",
      value: vendor?.vendorCode ?? "",
    },
  });

  const handleDownloadPDF = () => {
    downloadPdf(pdfContentRef);
  };

  const handleStatusChange = () => {
    if (!status) return;

    updateVendorStatus(
      { vendorId: vendorId!, data: { status, comment } },
      {
        onSuccess: () => {
          setStatus("");
          setComment("");
        },
      }
    );
  };

  // Check if user can approve (must be the assigned approver and vendor is pending)
  const canApprove =
    vendor?.status === "pending" && vendor?.approvedBy?.id === currentUser?.id;

  const tableHeadData = [
    "Business Name",
    "Status",
    "Vendor Code",
    "Contact Person",
    "Actions",
  ];

  const tableRowData = [
    {
      id: "businessName",
      content: truncateText(vendor?.businessName || "", 40),
    },
    {
      id: "status",
      content: <StatusBadge status={vendor?.status.toUpperCase() || "N/A"} />,
    },
    { id: "vendorCode", content: vendor?.vendorCode },

    { id: "contactPerson", content: vendor?.contactPerson },

    {
      id: "action",
      content: (
        <ActionIcons
          isGeneratingPDF={isGenerating}
          onDownloadPDF={handleDownloadPDF}
          hideInspect={true}
        />
      ),
    },
  ];

  return (
    <div className="flex flex-col space-y-3 pb-80">
      <div className="sticky top-0 z-10 bg-[#F8F8F8] pt-4 md:pt-6 pb-3 space-y-1.5 border-b">
        <div className="flex justify-between items-center">
          <TextHeader>Vendor Details</TextHeader>

          <Button onClick={() => navigate("/procurement/vendor-management")}>
            <List className="h-4 w-4 mr-1 md:mr-2" />
            Back to List
          </Button>
        </div>
      </div>

      <DataStateContainer
        isLoading={isLoading}
        isError={isError}
        data={vendor}
        errorComponent={<NetworkErrorUI />}
        loadingComponent={<Spinner />}
        emptyComponent={<div>No vendor data available.</div>}
      >
        {/* Main Table Section */}
        <div ref={pdfContentRef}>
          <div className="w-full bg-inherit shadow-sm rounded-lg border pb-[200px] overflow-x-scroll">
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
                <tr key={vendor?.id}>
                  {tableRowData.map((data) => (
                    <td
                      key={data.id}
                      className="min-w-[150px] px-3 py-2.5 md:px-6 md:py-3 text-left font-medium text-sm 2xl:text-text-base tracking-wider"
                    >
                      {data.content}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td colSpan={5}>
                    <div className="border border-gray-300 px-3 py-2.5 md:px-6 md:py-3 rounded-md h-auto relative">
                      <VendorDetails vendor={vendor!} />

                      {/* Comments and Actions */}
                      <RequestCommentsAndActions
                        request={vendor!}
                        handleAction={() => {}}
                      />

                      {/* Status Update Form for Approver */}
                      {canApprove && (
                        <div className="mt-4">
                          <StatusUpdateForm
                            requestStatus={vendor?.status!}
                            status={status}
                            setStatus={setStatus}
                            comment={comment}
                            setComment={setComment}
                            isUpdatingStatus={isUpdatingStatus}
                            handleStatusChange={handleStatusChange}
                            statusOptions={[
                              { value: "approved", label: "Approve Vendor" },
                              { value: "rejected", label: "Reject Vendor" },
                            ]}
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
      </DataStateContainer>
    </div>
  );
};

export default Vendor;
