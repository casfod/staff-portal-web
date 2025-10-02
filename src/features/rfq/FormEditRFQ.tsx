// Add PDF preview functionality to FormEditRFQ.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../../ui/Input";
import Button from "../../ui/Button";
import FormRow from "../../ui/FormRow";
import Row from "../../ui/Row";
import { UpdateRFQType, RFQType, ItemGroupType } from "../../interfaces";
import SpinnerMini from "../../ui/SpinnerMini";
import { useUpdateRFQ } from "./Hooks/useRFQ";
import { FileUpload } from "../../ui/FileUpload";
import { Plus, Trash2, Eye } from "lucide-react";
import RFQPDFTemplate from "./RFQPDFTemplate";
import PDFPreviewModal from "../../ui/PDFPreviewModal";
import toast from "react-hot-toast";

interface FormEditRFQProps {
  rfq: RFQType | null;
}

const FormEditRFQ: React.FC<FormEditRFQProps> = ({ rfq }) => {
  const navigate = useNavigate();
  const [showPDFPreview, setShowPDFPreview] = useState(false);

  // Form state
  const [formData, setFormData] = useState<UpdateRFQType>({
    RFQTitle: rfq?.RFQTitle,
    deliveryPeriod: rfq?.deliveryPeriod,
    bidValidityPeriod: rfq?.bidValidityPeriod,
    guaranteePeriod: rfq?.guaranteePeriod,
    itemGroups: rfq?.itemGroups || [],
    copiedTo: Array.isArray(rfq?.copiedTo)
      ? rfq.copiedTo.map((vendor) =>
          typeof vendor === "object" ? (vendor as any).id : vendor
        )
      : [],
  });

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const { updateRFQ, isPending } = useUpdateRFQ();

  // Item Groups Management
  const [itemGroups, setItemGroups] = useState<ItemGroupType[]>(
    rfq?.itemGroups || []
  );

  useEffect(() => {
    if (rfq) {
      setFormData({
        RFQTitle: rfq.RFQTitle,
        deliveryPeriod: rfq.deliveryPeriod,
        bidValidityPeriod: rfq.bidValidityPeriod,
        guaranteePeriod: rfq.guaranteePeriod,
        itemGroups: rfq.itemGroups,
        copiedTo: Array.isArray(rfq.copiedTo)
          ? rfq.copiedTo.map((vendor) =>
              typeof vendor === "object" ? (vendor as any).id : vendor
            )
          : [],
      });
      setItemGroups(rfq.itemGroups);
    }
  }, [rfq]);

  const handleFormChange = (
    field: keyof UpdateRFQType,
    value: string | string[]
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
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

  const handlePreviewPDF = () => {
    if (!formData.RFQTitle) {
      toast.error("Please enter RFQ title first");
      return;
    }

    if (
      itemGroups.length === 0 ||
      itemGroups.some((item) => !item.description)
    ) {
      toast.error("Please add at least one item with description");
      return;
    }

    setShowPDFPreview(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isFormValid = (e.target as HTMLFormElement).reportValidity();
    if (!isFormValid) return;

    const submitData = {
      ...formData,
      files: selectedFiles,
    };

    updateRFQ(
      {
        rfqId: rfq?.id!,
        data: submitData,
      },
      {
        onSuccess: (data: any) => {
          if (data.status === 200) {
            navigate("/procurement/rfq");
          }
        },
      }
    );
  };

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
        </div>

        {/* File Upload */}
        <FileUpload
          selectedFiles={selectedFiles}
          setSelectedFiles={setSelectedFiles}
          accept=".pdf,.jpg,.png,.xlsx,.docx"
          multiple={true}
        />

        {/* PDF Preview Button */}
        <div className="flex justify-end border-t pt-4">
          <Button
            type="button"
            variant="primary"
            onClick={handlePreviewPDF}
            disabled={!formData.RFQTitle || itemGroups.length === 0}
            className="flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            Preview PDF
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center w-full gap-4 pt-6">
          <Button type="submit" size="medium" disabled={isPending}>
            {isPending ? <SpinnerMini /> : "Update RFQ"}
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
      </form>

      {/* PDF Preview Modal */}
      <PDFPreviewModal
        isOpen={showPDFPreview}
        onClose={() => setShowPDFPreview(false)}
        onDownload={() => {
          // Simple download handler for form preview
          const element = document.createElement("a");
          const text = "PDF download would be available after updating the RFQ";
          const blob = new Blob([text], { type: "text/plain" });
          element.href = URL.createObjectURL(blob);
          element.download = "readme.txt";
          document.body.appendChild(element);
          element.click();
          document.body.removeChild(element);
        }}
        isGenerating={false}
        title={`RFQ Preview - ${rfq?.RFQCode || "EDIT"}`}
      >
        <RFQPDFTemplate
          rfqData={{
            RFQTitle: formData.RFQTitle || "Preview RFQ",
            RFQCode: rfq?.RFQCode || "RFQ-EDIT-PREVIEW",
            itemGroups: itemGroups,
            deliveryPeriod: formData.deliveryPeriod || "",
            bidValidityPeriod: formData.bidValidityPeriod || "",
            guaranteePeriod: formData.guaranteePeriod || "",
            createdBy: rfq?.createdBy,
            createdAt: rfq?.createdAt,
          }}
        />
      </PDFPreviewModal>
    </>
  );
};

export default FormEditRFQ;
