import { List } from "lucide-react";
import { useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { RootState } from "../../store/store";
import { useSelector } from "react-redux";
import TextHeader from "../../ui/TextHeader";
import Button from "../../ui/Button";
import { VendorDetails } from "./VendorDetails";
import { truncateText } from "../../utils/truncateText";
import { usePdfDownload } from "../../hooks/usePdfDownload";
import ActionIcons from "../../ui/ActionIcons";

const Vendor = () => {
  const navigate = useNavigate();
  const param = useParams();
  const vendor = useSelector((state: RootState) => state.vendor?.vendor);

  // Redirect if no vendor or params are available
  useEffect(() => {
    if (!vendor || !param) {
      navigate("/vendors");
    }
  }, [vendor, param, navigate]);

  // PDF logic
  const pdfContentRef = useRef<HTMLDivElement>(null);
  const { downloadPdf, isGenerating } = usePdfDownload({
    filename: `Vendor-${vendor?.vendorCode}`,
    multiPage: true,
  });
  const handleDownloadPDF = () => {
    downloadPdf(pdfContentRef);
  };

  // Handle the case where vendor is null
  if (!vendor) {
    return <div>No vendor data available.</div>;
  }

  const tableHeadData = [
    "Business Name",
    "Vendor Code",
    "Category",
    "Contact Person",
    "Actions",
  ];

  // const vendorCreatedAt = vendor.createdAt ?? "";

  const tableRowData = [
    { id: "businessName", content: truncateText(vendor.businessName, 40) },
    { id: "vendorCode", content: vendor.vendorCode },
    { id: "category", content: vendor.category || "N/A" },
    { id: "contactPerson", content: vendor.contactPerson },
    {
      id: "action",
      content: (
        <ActionIcons
          isGeneratingPDF={isGenerating}
          onDownloadPDF={handleDownloadPDF}
        />
      ),
    },
  ];

  return (
    <div className="flex flex-col space-y-3 pb-80">
      <div className="sticky top-0 z-10 bg-[#F8F8F8] pt-4 md:pt-6 pb-3 space-y-1.5 border-b">
        <div className="flex justify-between items-center">
          <TextHeader>Vendor Details</TextHeader>

          <Button onClick={() => navigate(-1)}>
            <List className="h-4 w-4 mr-1 md:mr-2" />
            Back to List
          </Button>
        </div>
      </div>

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
              <tr key={vendor.id}>
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
                    <VendorDetails vendor={vendor} />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Vendor;
