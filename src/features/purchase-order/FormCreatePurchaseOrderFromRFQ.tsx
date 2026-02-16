// FormCreatePurchaseOrderFromRFQ.tsx
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import Input from "../../ui/Input";
import Button from "../../ui/Button";
import FormRow from "../../ui/FormRow";
import Row from "../../ui/Row";
import { CreatePurchaseOrderType, RFQItemGroupType } from "../../interfaces";
import SpinnerMini from "../../ui/SpinnerMini";
import { useCreatePurchaseOrderFromRFQ } from "./Hooks/usePurchaseOrder";
import { FileUpload } from "../../ui/FileUpload";
import { useRFQ } from "../rfq/Hooks/useRFQ";
import Select from "../../ui/Select";
import NetworkErrorUI from "../../ui/NetworkErrorUI";
import { useVendors } from "../Vendor/Hooks/useVendor";
import { useAdmins } from "../user/Hooks/useUsers";
import DatePicker from "../../ui/DatePicker";
import { casfodAddress } from "../rfq/FormAddRFQ";
import toast from "react-hot-toast";

interface FormCreatePurchaseOrderFromRFQProps {
  rfqId: string;
}

const FormCreatePurchaseOrderFromRFQ: React.FC<
  FormCreatePurchaseOrderFromRFQProps
> = ({ rfqId }) => {
  const navigate = useNavigate();
  const rfq = useSelector((state: RootState) => state.rfq.rfq);

  const { data: remoteRFQData, isLoading: isLoadingRFQ } = useRFQ(rfqId);
  const { data: vendorsData, isLoading: isLoadingVendors } = useVendors({
    page: 1,
    limit: 1000,
  });

  const { createPurchaseOrderFromRFQ, isPending: isCreating } =
    useCreatePurchaseOrderFromRFQ();

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<string>("");
  const [selectedAdmin, setSelectedAdmin] = useState<string>("");
  const [itemGroups, setItemGroups] = useState<RFQItemGroupType[]>([]);

  // In FormCreatePurchaseOrderFromRFQ.tsx
  const [formData, setFormData] = useState<{
    casfodAddressId: string;
    poDate: string;
    deliveryDate: string;
    VAT: number;
  }>({
    casfodAddressId: "",
    poDate: "",
    deliveryDate: "",
    VAT: 0,
  });

  const { data: adminsData } = useAdmins();
  const admins = useMemo(() => adminsData?.data ?? [], [adminsData]);

  const rfqData = remoteRFQData?.data?.rfq || rfq;
  const vendors = vendorsData?.data?.vendors || [];

  // Filter vendors from RFQ's copiedTo
  const rfqVendors = useMemo(() => {
    if (!rfqData?.copiedTo) return [];
    return vendors.filter((vendor) =>
      rfqData.copiedTo.some((copiedVendor) =>
        typeof copiedVendor === "object"
          ? copiedVendor.id === vendor.id
          : copiedVendor === vendor.id
      )
    );
  }, [rfqData?.copiedTo, vendors]);

  // Sync itemGroups from RFQ, resetting prices
  useEffect(() => {
    if (rfqData?.itemGroups) {
      const resetItems = rfqData.itemGroups.map((item) => ({
        ...item,
        unitCost: 0,
        total: 0,
      }));
      setItemGroups(resetItems);
      setFormData((prev) => ({
        ...prev,
        poDate: rfqData.poDate || "",
        deliveryDate: rfqData.deliveryDate || "",
        casfodAddressId: rfqData.casfodAddressId || "",
      }));
    }
  }, [rfqData]);

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
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate timeline fields

    if (!selectedVendor) {
      toast.error("Please select a vendor");
      return;
    }
    if (!selectedAdmin) {
      toast.error("Please select an admin for approval");
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

    createPurchaseOrderFromRFQ(
      {
        rfqId,
        vendorId: selectedVendor,
        data: {
          ...formData,
          itemGroups,
        },
        files: selectedFiles,
        approvedBy: selectedAdmin,
      },
      {
        onSuccess: (data: any) => {
          if (data.status === 200 || data.status === 201) {
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

  if (isLoadingRFQ) {
    return (
      <div className="flex justify-center py-8">
        <SpinnerMini />
      </div>
    );
  }

  if (!rfqData) {
    return <NetworkErrorUI />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* RFQ Information (Read-only) */}
      <Row>
        <FormRow label="RFQ Title" type="wide">
          <Input
            type="text"
            value={rfqData.RFQTitle}
            disabled
            className="bg-gray-100"
          />
        </FormRow>
      </Row>

      <Row>
        <FormRow label="RFQ Code">
          <Input
            type="text"
            value={rfqData.RFQCode || ""}
            disabled
            className="bg-gray-100"
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

        <FormRow label="Delivery Date">
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
            // minDate={new Date()}
          />
        </FormRow>
      </Row>

      <Row cols="grid-cols-1 md:grid-cols-2">
        <FormRow label="Select Vendor *">
          {isLoadingVendors ? (
            <SpinnerMini />
          ) : (
            <Select
              id="vendor"
              customLabel="Select Vendor from RFQ"
              value={selectedVendor}
              onChange={setSelectedVendor}
              options={rfqVendors.map((vendor) => ({
                id: vendor.id,
                name: vendor.businessName,
              }))}
              filterable={true}
              required
            />
          )}
        </FormRow>

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
            filterable={true}
            required
          />
        </FormRow>
      </Row>

      {/* Item Groups with Prices */}
      <Row>
        <FormRow label="Items with Prices *" type="wide">
          <div className="space-y-4">
            {itemGroups.map((item, index) => (
              <div key={index} className="border rounded-lg p-4 bg-gray-50">
                <h4 className="font-semibold text-gray-700 mb-3">
                  Item {index + 1}: {item.itemName}
                </h4>

                <Row cols="grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                  <FormRow label="Item Name">
                    <Input
                      type="text"
                      value={item.itemName}
                      onChange={(e) =>
                        handleItemGroupChange(index, "itemName", e.target.value)
                      }
                      placeholder="Item Name"
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
                          parseInt(e.target.value) || 1
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
                      disabled
                      className="bg-gray-100"
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
                          parseFloat(e.target.value) || 0
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
                      onChange={(e) => handleFormChange("VAT", e.target.value)}
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

export default FormCreatePurchaseOrderFromRFQ;
