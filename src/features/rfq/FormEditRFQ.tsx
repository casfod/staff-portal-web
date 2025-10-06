// FormEditRFQ.tsx - Updated with useCreateAndSendRFQ hook
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../../ui/Input";
import Button from "../../ui/Button";
import FormRow from "../../ui/FormRow";
import Row from "../../ui/Row";
import {
  UpdateRFQType,
  RFQType,
  RFQItemGroupType,
  CreateRFQType,
} from "../../interfaces";
import SpinnerMini from "../../ui/SpinnerMini";
import { useUpdateRFQ, useCreateAndSendRFQ } from "./Hooks/useRFQ";
import { FileUpload } from "../../ui/FileUpload";
import { Plus, Trash2 } from "lucide-react";
import DatePicker from "../../ui/DatePicker";
import Select from "../../ui/Select";
import { casfodAddress } from "./FormAddRFQ";
// import { Plus, Trash2, Eye } from "lucide-react";
// import RFQPDFTemplate from "./RFQPDFTemplate";
// import PDFPreviewModal from "../../ui/PDFPreviewModal";
// import toast from "react-hot-toast";

interface FormEditRFQProps {
  rfq: RFQType | null;
}

const FormEditRFQ: React.FC<FormEditRFQProps> = ({ rfq }) => {
  const navigate = useNavigate();
  // const [showPDFPreview, setShowPDFPreview] = useState(false);
  const [isSendMode, setIsSendMode] = useState(false);

  // Form state
  const [formData, setFormData] = useState<UpdateRFQType>({
    RFQTitle: rfq?.RFQTitle,
    rfqDate: rfq?.rfqDate,
    deadlineDate: rfq?.deadlineDate,
    casfodAddressId: rfq?.casfodAddressId,
    itemGroups: rfq?.itemGroups || [],
    copiedTo: Array.isArray(rfq?.copiedTo)
      ? rfq.copiedTo.map((vendor) =>
          typeof vendor === "object" ? (vendor as any).id : vendor
        )
      : [],
  });

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const { updateRFQ, isPending: isUpdating } = useUpdateRFQ();
  const { createAndSendRFQ, isPending: isSending } = useCreateAndSendRFQ();

  const isPending = isUpdating || isSending;

  // Item Groups Management
  const [itemGroups, setItemGroups] = useState<RFQItemGroupType[]>(
    rfq?.itemGroups || []
  );

  useEffect(() => {
    if (rfq) {
      setFormData({
        RFQTitle: rfq.RFQTitle,
        rfqDate: rfq.rfqDate,
        deadlineDate: rfq.deadlineDate,
        casfodAddressId: rfq?.casfodAddressId,
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
    field: keyof RFQItemGroupType,
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
        itemName: "",
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

  // const handlePreviewPDF = () => {
  //   if (!formData.RFQTitle) {
  //     toast.error("Please enter RFQ title first");
  //     return;
  //   }

  //   if (
  //     itemGroups.length === 0 ||
  //     itemGroups.some((item) => !item.description)
  //   ) {
  //     toast.error("Please add at least one item with description");
  //     return;
  //   }

  //   // setShowPDFPreview(true);
  // };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isFormValid = (e.target as HTMLFormElement).reportValidity();
    if (!isFormValid) return;

    const submitData = {
      ...formData,
      files: selectedFiles,
    };

    if (isSendMode) {
      // Use createAndSendRFQ hook for "Save & Prepare for Sending"
      createAndSendRFQ(submitData as CreateRFQType, {
        onSuccess: (data: any) => {
          if (data.status === 200 || data.status === 201) {
            navigate("/procurement/rfq");
          }
        },
      });
    } else {
      // Regular update for draft
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
    }
  };

  const totalAmount = itemGroups.reduce((sum, item) => sum + item.total, 0);

  // Check if RFQ is in draft status to show "Save & Prepare for Sending" button
  const isDraftStatus = rfq?.status === "draft";

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

          <Row>
            <FormRow label="Select CASFOD Address *">
              <Select
                clearable={true}
                id="casfodAddressId"
                customLabel="Select a State"
                value={formData.casfodAddressId || ""}
                onChange={(value) => handleFormChange("casfodAddressId", value)} // Direct value now
                options={
                  casfodAddress
                    ? casfodAddress.map((bank) => ({
                        id: bank.id as string,
                        name: `${bank.name}`,
                      }))
                    : []
                }
                optionsHeight={220}
                filterable={true}
                required
              />
            </FormRow>
          </Row>

          <Row cols="grid-cols-1 md:grid-cols-4">
            <FormRow label="RFQ Date *">
              <DatePicker
                selected={formData.rfqDate ? new Date(formData.rfqDate) : null}
                onChange={(date) =>
                  handleFormChange("rfqDate", date ? date.toISOString() : "")
                }
                variant="secondary"
                size="md" // or "sm"/"lg" based on your form size
                placeholder="Select date"
                // className="custom-class-if-needed"
                clearable={true}
                // minDate={new Date()}
              />
            </FormRow>

            <FormRow label="Deadline Date *">
              <DatePicker
                selected={
                  formData.deadlineDate ? new Date(formData.deadlineDate) : null
                }
                onChange={(date) =>
                  handleFormChange(
                    "deadlineDate",
                    date ? date.toISOString() : ""
                  )
                }
                variant="secondary"
                size="md" // or "sm"/"lg" based on your form size
                placeholder="Select date"
                // className="custom-class-if-needed"
                clearable={true}
                minDate={Date.now()}
                // requiredTrigger={!!formData.dayOfDeparture}
              />
            </FormRow>
          </Row>

          {/* Item Groups Section */}
          <Row>
            <FormRow label="Items *" type="wide">
              <div className="space-y-4">
                {itemGroups.map((item, index) => (
                  <div
                    key={index}
                    className="space-y-3 border rounded-lg p-4 bg-gray-50"
                  >
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
                      <FormRow label="Item Name">
                        <Input
                          type="text"
                          value={item.itemName}
                          onChange={(e) =>
                            handleItemGroupChange(
                              index,
                              "itemName",
                              e.target.value
                            )
                          }
                          placeholder="Item Name"
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
                          disabled
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

                    <Row>
                      <FormRow label="Description*" type="wide">
                        <textarea
                          className="border-2 h-32 min-h-32 rounded-lg focus:outline-none p-3  "
                          maxLength={4000}
                          id="description"
                          required
                          value={item.description}
                          onChange={(e) =>
                            handleItemGroupChange(
                              index,
                              "description",
                              e.target.value
                            )
                          }
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
        {/* <div className="flex justify-end border-t pt-4">
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
        </div> */}

        {/* Action Buttons */}
        <div className="flex justify-center w-full gap-4 pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <Button
              type="submit"
              size="medium"
              disabled={isPending}
              onClick={() => setIsSendMode(false)}
            >
              {isPending && !isSendMode ? <SpinnerMini /> : "Update RFQ"}
            </Button>

            {/* Show "Save & Prepare for Sending" only for draft RFQs */}
            {isDraftStatus && (
              <Button
                type="submit"
                size="medium"
                disabled={isPending}
                onClick={() => setIsSendMode(true)}
              >
                {isPending && isSendMode ? (
                  <SpinnerMini />
                ) : (
                  "Save & Prepare for Sending"
                )}
              </Button>
            )}

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

        {/* Status Information */}
        {rfq?.status && (
          <div className="text-center text-sm text-gray-600">
            Current Status:{" "}
            <span className="font-semibold capitalize">{rfq.status}</span>
            {!isDraftStatus && (
              <p className="mt-1 text-xs">
                "Save & Prepare for Sending" is only available for draft RFQs
              </p>
            )}
          </div>
        )}
      </form>

      {/* PDF Preview Modal */}
      {/* <PDFPreviewModal
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
      </PDFPreviewModal> */}
    </>
  );
};

export default FormEditRFQ;
