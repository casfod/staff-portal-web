// RFQ.tsx - Updated version
import { List } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { RootState } from "../../store/store";
import { useSelector } from "react-redux";
import TextHeader from "../../ui/TextHeader";
import Button from "../../ui/Button";
import { RFQDetails } from "./RFQDetails";
import { truncateText } from "../../utils/truncateText";
import ActionIcons from "../../ui/ActionIcons";
import { useCopyRFQToVendors } from "./Hooks/useRFQ";
import { useRFQPDF } from "../../hooks/useRFQPDF";
import PDFPreviewModal from "../../ui/PDFPreviewModal";
import RFQPDFTemplate from "./RFQPDFTemplate";
import { localStorageUser } from "../../utils/localStorageUser";
import toast from "react-hot-toast";

const RFQ = () => {
  const navigate = useNavigate();
  const param = useParams();
  const rfq = useSelector((state: RootState) => state.rfq?.rfq);
  const currentUser = localStorageUser();

  // Redirect if no rfq or params are available
  useEffect(() => {
    if (!rfq || !param) {
      navigate("/rfqs");
    }
  }, [rfq, param, navigate]);

  // Modular PDF system
  const {
    pdfRef,
    isGenerating,
    showPreview,
    setShowPreview,
    generatePDF,
    previewPDF,
  } = useRFQPDF(rfq);

  // Copy to vendors functionality
  const { copyRFQToVendors, isPending: isCopying } = useCopyRFQToVendors();
  const [showTagDropdown, setShowTagDropdown] = useState(false);

  const handleCopyToVendors = async ({
    vendorIds,
  }: {
    vendorIds: string[];
  }) => {
    if (!rfq?.id) return;
    // setShowPreview(true);
    try {
      // Generate PDF first
      const pdfFile = await generatePDF();
      if (!pdfFile) {
        toast.error("Failed to generate PDF for RFQ");
        return;
      }

      // Create FormData to include the PDF file
      const formData = new FormData();
      formData.append("file", pdfFile);
      vendorIds.forEach((vendorId) => {
        formData.append("vendorIds", vendorId);
      });

      // Call the copyRFQToVendors mutation with FormData
      await copyRFQToVendors({
        rfqId: rfq.id,
        vendorIds,
        file: pdfFile, // Pass the generated PDF file
      });

      // toast.success("RFQ sent to vendors successfully");
    } catch (error) {
      console.error("Failed to send RFQ to vendors:", error);
      toast.error("Failed to send RFQ to vendors");
    }
  };

  const handleDownloadPDF = async () => {
    const pdfFile = await generatePDF();
    if (pdfFile) {
      // Create download link
      const url = URL.createObjectURL(pdfFile);
      const link = document.createElement("a");
      link.href = url;
      link.download = pdfFile.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  // Permission checks
  const canShareRequest =
    rfq &&
    (rfq.status === "preview" ||
      rfq.status === "draft" ||
      rfq.createdBy?.id === currentUser.id ||
      ["SUPER-ADMIN", "ADMIN"].includes(currentUser.role));

  // Handle the case where rfq is null
  if (!rfq) {
    return <div>No RFQ data available.</div>;
  }

  const tableHeadData = [
    "RFQ Title",
    "RFQ Code",
    "Status",
    // "Delivery Period",
    "Actions",
  ];

  const tableRowData = [
    { id: "RFQTitle", content: truncateText(rfq.RFQTitle, 40) },
    { id: "RFQCode", content: rfq.RFQCode },
    {
      id: "status",
      content: (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            rfq.status === "sent"
              ? "bg-green-100 text-green-800"
              : rfq.status === "draft"
              ? "bg-yellow-100 text-yellow-800"
              : rfq.status === "preview"
              ? "bg-blue-100 text-blue-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {rfq.status.toUpperCase()}
        </span>
      ),
    },
    // { id: "deliveryPeriod", content: rfq.deliveryPeriod || "N/A" },
    {
      id: "action",
      content: (
        <ActionIcons
          copyToVendors={handleCopyToVendors}
          isCopying={isCopying}
          canShareRequest={canShareRequest!}
          isGeneratingPDF={isGenerating}
          onDownloadPDF={handleDownloadPDF}
          onPreviewPDF={previewPDF}
          showTagDropdown={showTagDropdown}
          setShowTagDropdown={setShowTagDropdown}
          requestId={rfq.id}
          rfqStatus={rfq.status}
          mode="vendors"
        />
      ),
    },
  ];

  return (
    <>
      <div className="flex flex-col space-y-3 pb-80">
        <div className="sticky top-0 z-10 bg-[#F8F8F8] pt-4 md:pt-6 pb-3 space-y-1.5 border-b">
          <div className="flex justify-between items-center">
            <TextHeader>RFQ Details</TextHeader>

            <Button onClick={() => navigate(-1)}>
              <List className="h-4 w-4 mr-1 md:mr-2" />
              Back to List
            </Button>
          </div>
        </div>

        {/* Main Table Section */}
        <div>
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
                <tr key={rfq.id}>
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
                    <div className="border border-gray-300 px-3 py-2.5 md:px-6 md:py-3 rounded-md h-auto relative">
                      <RFQDetails rfq={rfq} />
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Always render PDF template but hide it */}
      {/* <div style={{ position: "absolute", left: "-9999px", top: "-9999px" }}> */}
      <div
        ref={pdfRef}
        style={{ position: "absolute", left: "-9999px", top: "-9999px" }}
      >
        <RFQPDFTemplate
          rfqData={{
            RFQTitle: rfq.RFQTitle,
            RFQCode: rfq.RFQCode,
            itemGroups: rfq.itemGroups,
            deliveryPeriod: rfq.deliveryPeriod,
            bidValidityPeriod: rfq.bidValidityPeriod,
            guaranteePeriod: rfq.guaranteePeriod,
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
        isGenerating={isGenerating}
        title={`RFQ Preview - ${rfq.RFQCode}`}
      >
        <RFQPDFTemplate
          pdfRef={null}
          rfqData={{
            RFQTitle: rfq.RFQTitle,
            RFQCode: rfq.RFQCode,
            itemGroups: rfq.itemGroups,
            deliveryPeriod: rfq.deliveryPeriod,
            bidValidityPeriod: rfq.bidValidityPeriod,
            guaranteePeriod: rfq.guaranteePeriod,
            createdBy: rfq.createdBy,
            createdAt: rfq.createdAt,
          }}
        />
      </PDFPreviewModal>
    </>
  );
};

export default RFQ;
