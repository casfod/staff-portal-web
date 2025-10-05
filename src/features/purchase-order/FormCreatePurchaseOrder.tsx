import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../../ui/Input";
import Button from "../../ui/Button";
import FormRow from "../../ui/FormRow";
import Row from "../../ui/Row";
import { CreatePurchaseOrderType, ItemGroupType } from "../../interfaces";
import SpinnerMini from "../../ui/SpinnerMini";
import { useCreateIndependentPurchaseOrder } from "./Hooks/usePurchaseOrder";
import { FileUpload } from "../../ui/FileUpload";
import { Plus, Trash2 } from "lucide-react";

import { useAdmins } from "../user/Hooks/useAdmins";
import Select from "../../ui/Select";
import { useVendors } from "../Vendor/Hooks/useVendor";

const FormCreatePurchaseOrder: React.FC = () => {
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState<CreatePurchaseOrderType>({
    RFQTitle: "",
    deliveryPeriod: "",
    bidValidityPeriod: "",
    guaranteePeriod: "",
    itemGroups: [],
    copiedTo: [],
    selectedVendor: "",
    approvedBy: "",
  });

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<string>("");
  const [selectedAdmin, setSelectedAdmin] = useState<string>("");

  const { createIndependentPurchaseOrder, isPending: isCreating } =
    useCreateIndependentPurchaseOrder();

  // Fetch vendors and admins
  const { data: vendorsData, isLoading: isLoadingVendors } = useVendors({});
  const { data: adminsData, isLoading: isLoadingAdmins } = useAdmins();

  const vendors = useMemo(
    () => vendorsData?.data?.vendors ?? [],
    [vendorsData]
  );
  const admins = useMemo(() => adminsData?.data ?? [], [adminsData]);

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
    field: keyof CreatePurchaseOrderType,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isFormValid = (e.target as HTMLFormElement).reportValidity();
    if (!isFormValid) return;

    // Validate that all items have prices
    const hasEmptyPrices = itemGroups.some(
      (item) => !item.unitCost || item.unitCost <= 0
    );
    if (hasEmptyPrices) {
      alert("Please fill in all unit costs");
      return;
    }

    if (!selectedVendor) {
      alert("Please select a vendor");
      return;
    }

    if (!selectedAdmin) {
      alert("Please select an admin for approval");
      return;
    }

    const submitData = {
      ...formData,
      copiedTo: [selectedVendor],
      selectedVendor: selectedVendor,
      approvedBy: selectedAdmin, // Add approvedBy field
      files: selectedFiles,
    };

    createIndependentPurchaseOrder(submitData as any, {
      onSuccess: (data: any) => {
        if (data.status === 200 || data.status === 201) {
          navigate("/procurement/purchase-orders");
        }
      },
    });
  };

  const totalAmount = itemGroups.reduce((sum, item) => sum + item.total, 0);

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

        {/* Vendor Selection */}
        <Row>
          <FormRow label="Select Vendor *" type="wide">
            <Select
              id="vendor"
              customLabel="Select Vendor"
              value={selectedVendor}
              onChange={setSelectedVendor}
              options={vendors.map((vendor) => ({
                id: vendor.id,
                name: vendor.businessName,
              }))}
              required
            />
          </FormRow>
        </Row>

        {/* Admin Approval Selection */}
        <Row>
          <FormRow label="Approved By *" type="wide">
            <Select
              id="approvedBy"
              customLabel="Select Admin for Approval"
              value={selectedAdmin}
              onChange={setSelectedAdmin}
              options={admins
                .filter((admin) => admin.id)
                .map((admin) => ({
                  id: admin.id as string,
                  name: `${admin.first_name} ${admin.last_name} (${admin.role})`,
                }))}
              required
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
            accept=".jpg,.png,.pdf,.xlsx,.docx"
            multiple={true}
          />
        </FormRow>
      </Row>

      {/* Action Buttons */}
      <div className="flex justify-center w-full gap-4 pt-6">
        <div className="flex flex-col md:flex-row gap-4">
          <Button type="submit" size="medium" disabled={isCreating}>
            {isCreating ? <SpinnerMini /> : "Create Purchase Order"}
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
  );
};

export default FormCreatePurchaseOrder;
