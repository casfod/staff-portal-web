// FormAddRFQ.tsx - Updated version
import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../../ui/Input";
import Button from "../../ui/Button";
import FormRow from "../../ui/FormRow";
import Row from "../../ui/Row";
import { CreateRFQType, ItemGroupType } from "../../interfaces";
import SpinnerMini from "../../ui/SpinnerMini";
import { useCreateRFQ, useCreateAndSendRFQ } from "./Hooks/useRFQ";
import { FileUpload } from "../../ui/FileUpload";
import { Plus, Trash2, Eye, Download, X } from "lucide-react";
import { useVendors } from "../Vendor/Hooks/useVendor";
import { useRFQPDFDownload } from "../../hooks/useRFQPDFDownload";
import RFQPDFTemplate from "./RFQPDFTemplate";
import toast from "react-hot-toast";
import html2canvas from "html2canvas";

const FormAddRFQ: React.FC = () => {
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState<CreateRFQType>({
    RFQTitle: "",
    deliveryPeriod: "",
    bidValidityPeriod: "",
    guaranteePeriod: "",
    itemGroups: [],
    copiedTo: [],
  });

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
  const [isSendMode, setIsSendMode] = useState(false);
  const [showPDFPreview, setShowPDFPreview] = useState(false);
  const [generatedPDFFile, setGeneratedPDFFile] = useState<File | null>(null);

  const pdfRef = useRef<HTMLDivElement>(null);
  const {
    downloadRFQPDF,
    isGenerating: isGeneratingPDF,
    error: pdfError,
  } = useRFQPDFDownload();

  const [previewRFQCode] = useState("RFQ-CASFOD-PREVIEW");

  // Get vendors for selection
  const { data: vendorsData } = useVendors({ page: 1, limit: 1000 });
  const vendors = vendorsData?.data?.vendors || [];

  const { createRFQ, isPending: isCreating } = useCreateRFQ();
  const { createAndSendRFQ, isPending: isSending } = useCreateAndSendRFQ();

  const isPending = isCreating || isSending;

  // Item Groups Management
  const [itemGroups, setItemGroups] = useState<ItemGroupType[]>([
    {
      description: "",
      frequency: 1,
      quantity: 1,
      unit: "",
      unitCost: 0,
      total: 0,
    },
  ]);

  const handleFormChange = (
    field: keyof CreateRFQType,
    value: string | string[]
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleVendorChange = (vendorId: string) => {
    setSelectedVendors((prev) => {
      const newVendorIds = prev.includes(vendorId)
        ? prev.filter((id) => id !== vendorId)
        : [...prev, vendorId];

      setFormData((prev) => ({
        ...prev,
        copiedTo: newVendorIds,
      }));

      return newVendorIds;
    });
  };

  // Item Group Handlers
  const handleItemGroupChange = (
    index: number,
    field: keyof ItemGroupType,
    value: string | number
  ) => {
    const updatedItems = [...itemGroups];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value,
    };

    // Calculate total if unitCost or quantity changes
    if (field === "unitCost" || field === "quantity") {
      const unitCost =
        field === "unitCost" ? Number(value) : updatedItems[index].unitCost;
      const quantity =
        field === "quantity" ? Number(value) : updatedItems[index].quantity;
      const frequency = updatedItems[index].frequency;

      updatedItems[index].total = unitCost * quantity * frequency;
    }

    setItemGroups(updatedItems);
    setFormData((prev) => ({
      ...prev,
      itemGroups: updatedItems,
    }));
  };

  const addItemGroup = () => {
    setItemGroups([
      ...itemGroups,
      {
        description: "",
        frequency: 1,
        quantity: 1,
        unit: "",
        unitCost: 0,
        total: 0,
      },
    ]);
  };

  const removeItemGroup = (index: number) => {
    if (itemGroups.length > 1) {
      const updatedItems = itemGroups.filter((_, i) => i !== index);
      setItemGroups(updatedItems);
      setFormData((prev) => ({
        ...prev,
        itemGroups: updatedItems,
      }));
    }
  };

  // Generate PDF and add to selected files
  const generateAndAddPDF = async (): Promise<File | null> => {
    if (!formData.RFQTitle) {
      toast.error("Please enter RFQ title first");
      return null;
    }

    if (
      itemGroups.length === 0 ||
      itemGroups.some((item) => !item.description)
    ) {
      toast.error("Please add at least one item with description");
      return null;
    }

    try {
      // Generate PDF blob
      const element = pdfRef.current;
      if (!element) {
        toast.error("PDF template not found");
        return null;
      }

      // Create a temporary canvas to generate PDF blob
      const canvas = await html2canvas(element);
      const pdfBlob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
        }, "application/pdf");
      });

      // Create File object from blob
      const pdfFile = new File([pdfBlob], `${previewRFQCode}.pdf`, {
        type: "application/pdf",
      });

      return pdfFile;
    } catch (error) {
      console.error("PDF generation failed:", error);
      toast.error("Failed to generate PDF");
      return null;
    }
  };

  // Updated preview handler that adds PDF to selected files
  // const handlePreviewPDF = async () => {
  //   const pdfFile = await generateAndAddPDF();
  //   if (pdfFile) {
  //     // Add generated PDF to selected files
  //     setSelectedFiles((prev) => {
  //       // Remove any previously generated PDF
  //       const filteredFiles = prev.filter(
  //         (file) =>
  //           !file.name.startsWith("RFQ-CASFOD-PREVIEW") &&
  //           !file.name.startsWith("RFQ-CASFOD")
  //       );
  //       return [...filteredFiles, pdfFile];
  //     });
  //     setGeneratedPDFFile(pdfFile);
  //     setShowPDFPreview(true);
  //     toast.success("PDF generated and added to attachments");
  //   }
  // };

  // Remove generated PDF from selected files
  const removeGeneratedPDF = () => {
    if (generatedPDFFile) {
      setSelectedFiles((prev) =>
        prev.filter((file) => file !== generatedPDFFile)
      );
      setGeneratedPDFFile(null);
      toast.success("Generated PDF removed from attachments");
    }
  };

  // Remove the complex PDF generation from form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isFormValid = (e.target as HTMLFormElement).reportValidity();
    if (!isFormValid) return;

    const submitData = {
      ...formData,
      files: selectedFiles,
    };

    if (isSendMode) {
      // This now just creates a preview RFQ
      createAndSendRFQ(submitData, {
        onSuccess: (data: any) => {
          if (data.status === 200 || data.status === 201) {
            toast.success(
              "RFQ prepared successfully. You can now send it to vendors."
            );
            navigate("/procurement/rfq");
          }
        },
      });
    } else {
      // Save as draft
      createRFQ(submitData, {
        onSuccess: (data: any) => {
          if (data.status === 200 || data.status === 201) {
            navigate("/procurement/rfq");
          }
        },
      });
    }
  };

  // Keep PDF preview for user review, but don't attach it
  const handlePreviewPDF = async () => {
    // Just show preview, don't add to files
    setShowPDFPreview(true);
  };

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   const isFormValid = (e.target as HTMLFormElement).reportValidity();
  //   if (!isFormValid) return;

  //   // Auto-generate PDF if in send mode and no PDF exists
  //   if (isSendMode && !generatedPDFFile) {
  //     const pdfFile = await generateAndAddPDF();
  //     if (pdfFile) {
  //       setSelectedFiles((prev) => [...prev, pdfFile]);
  //       setGeneratedPDFFile(pdfFile);
  //     }
  //   }

  //   const submitData = {
  //     ...formData,
  //     files: selectedFiles,
  //   };

  //   if (isSendMode) {
  //     createAndSendRFQ(submitData, {
  //       onSuccess: (data: any) => {
  //         if (data.status === 200 || data.status === 201) {
  //           navigate("/procurement/rfq");
  //         }
  //       },
  //     });
  //   } else {
  //     createRFQ(submitData, {
  //       onSuccess: (data: any) => {
  //         if (data.status === 200 || data.status === 201) {
  //           navigate("/procurement/rfq");
  //         }
  //       },
  //     });
  //   }
  // };

  const totalAmount = itemGroups.reduce((sum, item) => sum + item.total, 0);

  return (
    <>
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-6">
          <Row>
            <FormRow label="RFQ Title *" type="wide">
              <Input
                type="text"
                id="RFQTitle"
                required
                value={formData.RFQTitle}
                onChange={(e) => handleFormChange("RFQTitle", e.target.value)}
                placeholder="Enter RFQ title"
              />
            </FormRow>
          </Row>

          <Row cols="grid-cols-1 md:grid-cols-3">
            <FormRow label="Delivery Period *">
              <Input
                type="text"
                id="deliveryPeriod"
                required
                value={formData.deliveryPeriod}
                onChange={(e) =>
                  handleFormChange("deliveryPeriod", e.target.value)
                }
                placeholder="e.g., 30 days"
              />
            </FormRow>

            <FormRow label="Bid Validity Period *">
              <Input
                type="text"
                id="bidValidityPeriod"
                required
                value={formData.bidValidityPeriod}
                onChange={(e) =>
                  handleFormChange("bidValidityPeriod", e.target.value)
                }
                placeholder="e.g., 60 days"
              />
            </FormRow>

            <FormRow label="Guarantee Period">
              <Input
                type="text"
                id="guaranteePeriod"
                value={formData.guaranteePeriod}
                onChange={(e) =>
                  handleFormChange("guaranteePeriod", e.target.value)
                }
                placeholder="e.g., 12 months"
              />
            </FormRow>
          </Row>

          {/* Item Groups Section */}
          <Row>
            <FormRow label="Items *" type="wide">
              <div className="space-y-4">
                {itemGroups.map((item, index) => (
                  <div key={index} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-semibold text-gray-700">
                        Item {index + 1}
                      </h4>
                      {itemGroups.length > 1 && (
                        <Button
                          type="button"
                          variant="secondary"
                          size="small"
                          onClick={() => removeItemGroup(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <Row cols="grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                      <FormRow label="Description">
                        <Input
                          type="text"
                          value={item.description}
                          onChange={(e) =>
                            handleItemGroupChange(
                              index,
                              "description",
                              e.target.value
                            )
                          }
                          placeholder="Item description"
                          required
                        />
                      </FormRow>

                      <FormRow label="Frequency">
                        <Input
                          type="number"
                          min="1"
                          value={item.frequency}
                          onChange={(e) =>
                            handleItemGroupChange(
                              index,
                              "frequency",
                              parseInt(e.target.value)
                            )
                          }
                          required
                        />
                      </FormRow>

                      <FormRow label="Quantity">
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            handleItemGroupChange(
                              index,
                              "quantity",
                              parseInt(e.target.value)
                            )
                          }
                          required
                        />
                      </FormRow>

                      <FormRow label="Unit">
                        <Input
                          type="text"
                          value={item.unit}
                          onChange={(e) =>
                            handleItemGroupChange(index, "unit", e.target.value)
                          }
                          placeholder="e.g., pieces, kg"
                        />
                      </FormRow>

                      <FormRow label="Unit Cost (₦)">
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitCost}
                          onChange={(e) =>
                            handleItemGroupChange(
                              index,
                              "unitCost",
                              parseFloat(e.target.value)
                            )
                          }
                          required
                        />
                      </FormRow>

                      <FormRow label="Total (₦)">
                        <Input
                          type="number"
                          value={item.total}
                          disabled
                          className="bg-gray-100 font-semibold"
                        />
                      </FormRow>
                    </Row>
                  </div>
                ))}

                <Button
                  type="button"
                  onClick={addItemGroup}
                  variant="secondary"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>

                {itemGroups.length > 0 && (
                  <div className="text-right">
                    <div className="text-lg font-bold border-t pt-2">
                      Grand Total: ₦{totalAmount.toLocaleString()}
                    </div>
                  </div>
                )}
              </div>
            </FormRow>
          </Row>

          {/* Vendor Selection */}
          <Row>
            <FormRow label="Select Vendors">
              <div className="space-y-2">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto p-2 border rounded">
                  {vendors.map((vendor) => (
                    <label
                      key={vendor.id}
                      className="flex items-center space-x-2 cursor-pointer p-2 hover:bg-gray-100 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={selectedVendors.includes(vendor.id)}
                        onChange={() => handleVendorChange(vendor.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div>
                        <span className="text-sm font-medium text-gray-700">
                          {vendor.businessName}
                        </span>
                        <span className="text-xs text-gray-500 block">
                          {vendor.vendorCode}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
                {selectedVendors.length > 0 && (
                  <p className="text-xs text-gray-500">
                    Selected: {selectedVendors.length} vendor(s)
                  </p>
                )}
                {vendors.length === 0 && (
                  <p className="text-sm text-gray-500">
                    No vendors available. Please create vendors first.
                  </p>
                )}
              </div>
            </FormRow>
          </Row>
        </div>

        {/* File Upload */}
        <FileUpload
          selectedFiles={selectedFiles}
          setSelectedFiles={setSelectedFiles}
          accept=".pdf,.jpg,.png,.xlsx,.docx"
          multiple={true}
        />

        {/* Generated PDF Preview Section */}
        {generatedPDFFile && (
          <div className="border rounded-lg p-4 bg-blue-50">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-blue-800">Generated RFQ PDF</h3>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="primary"
                  size="small"
                  onClick={() => setShowPDFPreview(!showPDFPreview)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  {showPDFPreview ? "Hide Preview" : "Show Preview"}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="small"
                  onClick={removeGeneratedPDF}
                >
                  <X className="h-4 w-4 mr-1" />
                  Remove
                </Button>
              </div>
            </div>
            <p className="text-sm text-blue-600">
              {generatedPDFFile.name} -{" "}
              {(generatedPDFFile.size / 1024).toFixed(2)} KB
            </p>
          </div>
        )}

        {/* PDF Preview Section */}
        {showPDFPreview && (
          <div className="border rounded-lg p-4 bg-white shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-700">PDF Preview</h3>
              <Button
                type="button"
                variant="secondary"
                size="small"
                onClick={() => setShowPDFPreview(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="border rounded overflow-auto max-h-96">
              <RFQPDFTemplate
                rfqData={{
                  RFQTitle: formData.RFQTitle || "Preview RFQ",
                  RFQCode: previewRFQCode,
                  itemGroups: itemGroups,
                  deliveryPeriod: formData.deliveryPeriod || "",
                  bidValidityPeriod: formData.bidValidityPeriod || "",
                  guaranteePeriod: formData.guaranteePeriod || "",
                }}
              />
            </div>
          </div>
        )}

        {/* PDF Preview Button */}
        <div className="flex justify-end border-t pt-4">
          <Button
            type="button"
            variant="primary"
            onClick={handlePreviewPDF}
            disabled={
              isGeneratingPDF || !formData.RFQTitle || itemGroups.length === 0
            }
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            {isGeneratingPDF ? "Generating PDF..." : "Generate & Add PDF"}
          </Button>
        </div>

        {/* PDF Error Display */}
        {pdfError && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-700 text-sm">PDF Error: {pdfError}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center w-full gap-4 pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <Button
              type="submit"
              size="medium"
              disabled={isPending}
              onClick={() => setIsSendMode(false)}
            >
              {isPending && !isSendMode ? <SpinnerMini /> : "Save as Draft"}
            </Button>

            <Button
              type="submit"
              size="medium"
              disabled={isPending || selectedVendors.length === 0}
              onClick={() => setIsSendMode(true)}
            >
              {isPending && isSendMode ? (
                <SpinnerMini />
              ) : (
                "Save & Send to Vendors"
              )}
            </Button>

            <Button
              type="button"
              size="medium"
              variant="secondary"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </form>

      {/* Hidden PDF Template for generation */}
      <div style={{ position: "absolute", left: "-9999px", top: "-9999px" }}>
        <div ref={pdfRef}>
          <RFQPDFTemplate
            rfqData={{
              RFQTitle: formData.RFQTitle || "Preview RFQ",
              RFQCode: previewRFQCode,
              itemGroups: itemGroups,
              deliveryPeriod: formData.deliveryPeriod || "",
              bidValidityPeriod: formData.bidValidityPeriod || "",
              guaranteePeriod: formData.guaranteePeriod || "",
            }}
          />
        </div>
      </div>
    </>
  );
};

export default FormAddRFQ;
