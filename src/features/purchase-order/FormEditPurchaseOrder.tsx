import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../../ui/Input";
import Button from "../../ui/Button";
import FormRow from "../../ui/FormRow";
import Row from "../../ui/Row";
import {
  UpdatePurchaseOrderType,
  PurchaseOrderType,
  ItemGroupType,
} from "../../interfaces";
import SpinnerMini from "../../ui/SpinnerMini";
import { useUpdatePurchaseOrder } from "./Hooks/usePurchaseOrder";
import { FileUpload } from "../../ui/FileUpload";
import { Plus, Trash2 } from "lucide-react";

interface FormEditPurchaseOrderProps {
  purchaseOrder: PurchaseOrderType | null;
}

const FormEditPurchaseOrder: React.FC<FormEditPurchaseOrderProps> = ({
  purchaseOrder,
}) => {
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState<UpdatePurchaseOrderType>({
    RFQTitle: purchaseOrder?.RFQTitle || "",
    deliveryPeriod: purchaseOrder?.deliveryPeriod || "",
    bidValidityPeriod: purchaseOrder?.bidValidityPeriod || "",
    guaranteePeriod: purchaseOrder?.guaranteePeriod || "",
    itemGroups: purchaseOrder?.itemGroups || [],
    selectedVendor: purchaseOrder?.selectedVendor?.id || "",
    copiedTo: purchaseOrder?.copiedTo?.map((vendor) => vendor.id) || [],
    approvedBy: purchaseOrder?.approvedBy as string,
  });

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const { updatePurchaseOrder, isPending: isUpdating } =
    useUpdatePurchaseOrder();

  // Item Groups Management
  const [itemGroups, setItemGroups] = useState<ItemGroupType[]>(
    purchaseOrder?.itemGroups || []
  );

  useEffect(() => {
    if (purchaseOrder) {
      setFormData({
        RFQTitle: purchaseOrder.RFQTitle,
        deliveryPeriod: purchaseOrder.deliveryPeriod,
        bidValidityPeriod: purchaseOrder.bidValidityPeriod,
        guaranteePeriod: purchaseOrder.guaranteePeriod,
        itemGroups: purchaseOrder.itemGroups,
        selectedVendor: purchaseOrder.selectedVendor?.id,
        copiedTo: purchaseOrder.copiedTo?.map((vendor) => vendor.id) || [],
        approvedBy: purchaseOrder?.approvedBy as string,
      });
      setItemGroups(purchaseOrder.itemGroups);
    }
  }, [purchaseOrder]);

  const handleFormChange = (
    field: keyof UpdatePurchaseOrderType,
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

    // Calculate total if unitCost, quantity, or frequency changes
    if (field === "unitCost" || field === "quantity" || field === "frequency") {
      const unitCost =
        field === "unitCost" ? Number(value) : updatedItems[index].unitCost;
      const quantity =
        field === "quantity" ? Number(value) : updatedItems[index].quantity;
      const frequency =
        field === "frequency" ? Number(value) : updatedItems[index].frequency;

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isFormValid = (e.target as HTMLFormElement).reportValidity();
    if (!isFormValid) return;

    // Validate required timeline fields
    if (!formData.RFQTitle?.trim()) {
      alert("Please enter a purchase order title");
      return;
    }

    if (!formData.deliveryPeriod?.trim()) {
      alert("Please enter a delivery period");
      return;
    }

    if (!formData.bidValidityPeriod?.trim()) {
      alert("Please enter a bid validity period");
      return;
    }

    if (!formData.guaranteePeriod?.trim()) {
      alert("Please enter a guarantee period");
      return;
    }

    // Validate that all items have prices
    const hasEmptyPrices = itemGroups.some(
      (item) => !item.unitCost || item.unitCost <= 0
    );
    if (hasEmptyPrices) {
      alert("Please fill in all unit costs");
      return;
    }

    // Validate that all items have valid quantity and frequency
    const hasInvalidQuantity = itemGroups.some(
      (item) => !item.quantity || item.quantity <= 0
    );
    if (hasInvalidQuantity) {
      alert("Please enter valid quantities for all items");
      return;
    }

    const hasInvalidFrequency = itemGroups.some(
      (item) => !item.frequency || item.frequency <= 0
    );
    if (hasInvalidFrequency) {
      alert("Please enter valid frequencies for all items");
      return;
    }

    const submitData = {
      ...formData,
      files: selectedFiles,
    };

    updatePurchaseOrder(
      {
        purchaseOrderId: purchaseOrder?.id!,
        data: submitData,
      },
      {
        onSuccess: (data: any) => {
          if (data.status === 200) {
            navigate("/procurement/purchase-orders");
          }
        },
      }
    );
  };

  const totalAmount = itemGroups.reduce((sum, item) => sum + item.total, 0);

  // Check if PO is editable (only pending POs can be edited)
  const isEditable = purchaseOrder?.status === "pending";

  if (!isEditable) {
    return (
      <div className="text-center py-8">
        <p className="text-lg text-gray-600">
          This purchase order cannot be edited because it is{" "}
          {purchaseOrder?.status}.
        </p>
        <Button
          type="button"
          size="medium"
          variant="secondary"
          onClick={() => navigate(-1)}
          className="mt-4"
        >
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="space-y-6">
        {/* Basic Information */}
        <Row>
          <FormRow label="Purchase Order Title *" type="wide">
            <Input
              type="text"
              id="RFQTitle"
              required
              value={formData.RFQTitle}
              onChange={(e) => handleFormChange("RFQTitle", e.target.value)}
              placeholder="Enter purchase order title"
            />
          </FormRow>
        </Row>

        {/* Timeline & Validity Section */}
        <div className="border rounded-lg p-4 bg-blue-50 border-blue-200">
          <h3 className="text-lg font-semibold text-blue-800 mb-4">
            Timeline & Validity
          </h3>
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
                required
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
                required
              />
            </FormRow>

            <FormRow label="Guarantee Period *">
              <Input
                type="text"
                id="guaranteePeriod"
                value={formData.guaranteePeriod}
                onChange={(e) =>
                  handleFormChange("guaranteePeriod", e.target.value)
                }
                placeholder="e.g., 12 months"
                required
              />
            </FormRow>
          </Row>
        </div>

        {/* Vendor Information (Read-only) */}
        {purchaseOrder?.selectedVendor && (
          <Row>
            <FormRow label="Selected Vendor" type="wide">
              <Input
                type="text"
                value={purchaseOrder.selectedVendor.businessName}
                disabled
                className="bg-gray-100"
              />
            </FormRow>
          </Row>
        )}

        {/* Approved By Information (Read-only) */}
        {purchaseOrder?.approvedBy && (
          <Row>
            <FormRow label="Approved By" type="wide">
              <Input
                type="text"
                value={`${purchaseOrder.approvedBy.first_name} ${purchaseOrder.approvedBy.last_name}`}
                disabled
                className="bg-gray-100"
              />
            </FormRow>
          </Row>
        )}

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
                    <FormRow label="Description *">
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

                    <FormRow label="Frequency *">
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

                    <FormRow label="Quantity *">
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

                    <FormRow label="Unit Cost (₦) *">
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

              <Button type="button" onClick={addItemGroup} variant="secondary">
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
      <Row>
        <FormRow label="Attachments" type="wide">
          <FileUpload
            selectedFiles={selectedFiles}
            setSelectedFiles={setSelectedFiles}
            accept=".pdf,.jpg,.png,.xlsx,.docx"
            multiple={true}
          />
        </FormRow>
      </Row>

      {/* Action Buttons */}
      <div className="flex justify-center w-full gap-4 pt-6">
        <div className="flex flex-col md:flex-row gap-4">
          <Button type="submit" size="medium" disabled={isUpdating}>
            {isUpdating ? <SpinnerMini /> : "Update Purchase Order"}
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

      {/* Status Information */}
      {purchaseOrder?.status && (
        <div className="text-center text-sm text-gray-600">
          Current Status:{" "}
          <span className="font-semibold capitalize">
            {purchaseOrder.status}
          </span>
        </div>
      )}
    </form>
  );
};

export default FormEditPurchaseOrder;
