// FormEditPurchaseOrder.tsx
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../../ui/Input";
import Button from "../../ui/Button";
import FormRow from "../../ui/FormRow";
import Row from "../../ui/Row";
import {
  CreatePurchaseOrderType,
  PurchaseOrderType,
  RFQItemGroupType,
} from "../../interfaces";
import SpinnerMini from "../../ui/SpinnerMini";
import { useCreateIndependentPurchaseOrder } from "./Hooks/usePurchaseOrder";
import { FileUpload } from "../../ui/FileUpload";
import { Plus, Trash2 } from "lucide-react";
import DatePicker from "../../ui/DatePicker";
import Select from "../../ui/Select";
import { casfodAddress } from "../rfq/FormAddRFQ";
import toast from "react-hot-toast";
import { useVendors } from "../Vendor/Hooks/useVendor";
import { useAdmins } from "../user/Hooks/useUsers";

interface FormEditPurchaseOrderProps {
  purchaseOrder: PurchaseOrderType | null;
}

const FormEditPurchaseOrder: React.FC<FormEditPurchaseOrderProps> = ({
  purchaseOrder,
}) => {
  const navigate = useNavigate();

  // Unified form state
  const [formData, setFormData] = useState<CreatePurchaseOrderType>({
    RFQTitle: "",
    casfodAddressId: "",
    poDate: "",
    deliveryDate: "",
    VAT: 0,
    itemGroups: [],
    selectedVendor: "",
    copiedTo: [],
    approvedBy: "",
  });

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const { createIndependentPurchaseOrder, isPending: isUpdating } =
    useCreateIndependentPurchaseOrder();

  // Item Groups - synchronized with formData
  const [itemGroups, setItemGroups] = useState<RFQItemGroupType[]>([]);

  // Initialize form data from purchaseOrder
  useEffect(() => {
    if (purchaseOrder) {
      const initialData: CreatePurchaseOrderType = {
        RFQTitle: purchaseOrder.RFQTitle,
        casfodAddressId: purchaseOrder.casfodAddressId,
        poDate: purchaseOrder.poDate || "",
        VAT: purchaseOrder.VAT || 0,
        deliveryDate: purchaseOrder.deliveryDate || "",
        itemGroups: purchaseOrder.itemGroups,
        selectedVendor: "",
        copiedTo: purchaseOrder.copiedTo?.map((vendor) => vendor.id) || [],
        approvedBy: "",
      };
      setFormData(initialData);
      setItemGroups(purchaseOrder.itemGroups);
    }
  }, [purchaseOrder]);

  // Fetch vendors and admins
  const { data: vendorsData, isLoading: isLoadingVendors } = useVendors({
    page: 1,
    limit: 1000,
  });
  const { data: adminsData, isLoading: isLoadingAdmins } = useAdmins();

  const vendors = useMemo(
    () => vendorsData?.data?.vendors ?? [],
    [vendorsData]
  );
  const admins = useMemo(() => adminsData?.data ?? [], [adminsData]);

  const handleFormChange = (
    field: keyof CreatePurchaseOrderType,
    value: string | string[]
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Item Group Handlers - updates both local state and formData
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

    // Recalculate total on relevant changes
    if (["unitCost", "quantity", "frequency"].includes(field as string)) {
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
    const newItemGroup: RFQItemGroupType = {
      description: "",
      itemName: "",
      frequency: 1,
      quantity: 1,
      unit: "",
      unitCost: 0,
      total: 0,
    };
    const updatedItems = [...itemGroups, newItemGroup];
    setItemGroups(updatedItems);
    setFormData((prev) => ({
      ...prev,
      itemGroups: updatedItems,
    }));
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

    // Validate core fields
    if (!formData.RFQTitle?.trim()) {
      toast.error("Please enter a purchase order title");
      return;
    }
    if (!formData.casfodAddressId) {
      toast.error("Please select a CASFOD address");
      return;
    }

    // Validate item groups
    const hasEmptyPrices = itemGroups.some((item) => item.unitCost <= 0);
    if (hasEmptyPrices) {
      toast.error("Please fill in all unit costs");
      return;
    }
    const hasInvalidQuantity = itemGroups.some((item) => item.quantity <= 0);
    if (hasInvalidQuantity) {
      toast.error("Please enter valid quantities for all items");
      return;
    }
    const hasInvalidFrequency = itemGroups.some((item) => item.frequency <= 0);
    if (hasInvalidFrequency) {
      toast.error("Please enter valid frequencies for all items");
      return;
    }
    // const hasEmptyDescriptions = itemGroups.some(
    //   (item) => !item.description.trim()
    // );
    // if (hasEmptyDescriptions) {
    //   toast.error("Please enter descriptions for all items");
    //   return;
    // }

    const submitData = {
      ...formData,
      itemGroups,
      // files: selectedFiles,
    };

    createIndependentPurchaseOrder(
      {
        // purchaseOrderId: purchaseOrder?.id!,
        data: submitData,
        files: selectedFiles,
      },
      {
        onSuccess: (data: any) => {
          if (data.status === 200) {
            navigate("/procurement/purchase-order/purchase-orders");
          }
        },
      }
    );
  };

  // Memoized total calculation
  const totalAmount = useMemo(
    () => itemGroups.reduce((sum, item) => sum + item.total, 0),
    [itemGroups]
  );

  // Check editability
  const isEditable = purchaseOrder?.status === "rejected";

  if (!purchaseOrder || !isEditable) {
    return (
      <div className="text-center py-8">
        <p className="text-lg text-gray-600">
          This purchase order cannot be edited because it is{" "}
          {purchaseOrder?.status || "not available"}.
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

  if (isLoadingVendors || isLoadingAdmins) {
    return (
      <div className="flex justify-center py-8">
        <SpinnerMini />
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

        <Row>
          <FormRow label="Select CASFOD Delivery Address *">
            <Select
              clearable={true}
              id="casfodAddressId"
              customLabel="Select a State"
              value={formData.casfodAddressId || ""}
              onChange={(value) => handleFormChange("casfodAddressId", value)}
              options={
                casfodAddress
                  ? casfodAddress.map((addr) => ({
                      id: addr.id as string,
                      name: `${addr.name}`,
                    }))
                  : []
              }
              optionsHeight={220}
              filterable={true}
              required
            />
          </FormRow>
        </Row>

        <Row cols="grid-cols-1 md:grid-cols-2">
          <FormRow label="PO Date">
            <DatePicker
              selected={formData.poDate ? new Date(formData.poDate) : null}
              onChange={(date) =>
                handleFormChange("poDate", date ? date.toISOString() : "")
              }
              variant="secondary"
              size="md"
              placeholder="Select date"
              clearable={true}
            />
          </FormRow>

          <FormRow label="Deadline Date">
            <DatePicker
              selected={
                formData.deliveryDate ? new Date(formData.deliveryDate) : null
              }
              onChange={(date) =>
                handleFormChange("deliveryDate", date ? date.toISOString() : "")
              }
              variant="secondary"
              size="md"
              placeholder="Select date"
              clearable={true}
              minDate={new Date()}
            />
          </FormRow>
        </Row>

        {/* Vendor Information (Read-only) */}
        <Row cols="grid-cols-1 md:grid-cols-2">
          <FormRow label="Select Vendor *" type="wide">
            <Select
              id="vendor"
              customLabel="Select Vendor"
              value={formData.selectedVendor}
              onChange={(value) => handleFormChange("selectedVendor", value)}
              options={vendors.map((vendor) => ({
                id: vendor.id,
                name: vendor.businessName,
              }))}
              filterable={true}
              required
            />
          </FormRow>

          <FormRow label="Approved By *" type="wide">
            <Select
              id="approvedBy"
              customLabel="Select Admin for Approval"
              value={(formData.approvedBy as string) || ""}
              onChange={(value) => handleFormChange("approvedBy", value)}
              options={admins
                .filter((admin) => admin.id)
                .map((admin) => ({
                  id: admin.id as string,
                  name: `${admin.first_name} ${admin.last_name} (${admin.role})`,
                }))}
              filterable={true}
              required
            />
          </FormRow>
        </Row>

        {/* Approved By Information (Read-only) */}

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
                            parseInt(e.target.value) || 1
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
                            parseInt(e.target.value) || 1
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
                            parseFloat(e.target.value) || 0
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
                    <FormRow label="Description *" type="wide">
                      <textarea
                        className="border-2 h-32 min-h-32 rounded-lg focus:outline-none p-3"
                        maxLength={4000}
                        id={`description-${index}`}
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

              <Button type="button" onClick={addItemGroup} variant="primary">
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>

              {itemGroups.length > 0 && (
                <div className="flex flex-col border-t pt-2 gap-2 text-right">
                  <div className="flex justify-end gap-4">
                    {/* VAT Input */}
                    <FormRow label="WHT (%)" type="small">
                      <Input
                        id="VAT"
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={formData.VAT}
                        onChange={(e) =>
                          handleFormChange("VAT", e.target.value)
                        }
                        placeholder="0.00"
                      />
                    </FormRow>
                  </div>

                  {/* Grand Total */}
                  <div className="text-lg font-bold  text-gray-600">
                    GROSS TOTAL: ₦
                    {totalAmount.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>

                  {/* VAT Amount */}
                  {formData.VAT > 0 && (
                    <div className="text-lg font-semibold text-gray-600">
                      {`(${formData.VAT}%) WHT Amount: ₦`}
                      {(
                        (totalAmount * Number(formData.VAT)) /
                        100
                      ).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                  )}

                  {/* NET Total */}
                  <div className="text-lg font-bold  text-gray-600">
                    NET Total: ₦
                    {(
                      totalAmount -
                      (totalAmount * Number(formData.VAT || 0)) / 100
                    ).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
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
            {isUpdating ? <SpinnerMini /> : "Create New PO From This."}
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
      <div className="text-center text-sm text-gray-600">
        Current Status:{" "}
        <span className="font-semibold capitalize">{purchaseOrder.status}</span>
      </div>
    </form>
  );
};

export default FormEditPurchaseOrder;
