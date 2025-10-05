import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import Input from "../../ui/Input";
import Button from "../../ui/Button";
import FormRow from "../../ui/FormRow";
import Row from "../../ui/Row";
// import { CreatePurchaseOrderType, ItemGroupType } from "../../interfaces";
import { ItemGroupType } from "../../interfaces";
import SpinnerMini from "../../ui/SpinnerMini";
import { useCreatePurchaseOrderFromRFQ } from "./Hooks/usePurchaseOrder";
import { FileUpload } from "../../ui/FileUpload";
import { useRFQ } from "../rfq/Hooks/useRFQ";

import Select from "../../ui/Select";
import NetworkErrorUI from "../../ui/NetworkErrorUI";
import { useVendors } from "../Vendor/Hooks/useVendor";
import { useAdmins } from "../user/Hooks/useAdmins";

interface FormCreatePurchaseOrderFromRFQProps {
  rfqId: string;
}

const FormCreatePurchaseOrderFromRFQ: React.FC<
  FormCreatePurchaseOrderFromRFQProps
> = ({ rfqId }) => {
  const navigate = useNavigate();
  const rfq = useSelector((state: RootState) => state.rfq.rfq);

  const { data: remoteRFQData, isLoading: isLoadingRFQ } = useRFQ(rfqId);
  const { data: vendorsData, isLoading: isLoadingVendors } = useVendors({});

  const { createPurchaseOrderFromRFQ, isPending: isCreating } =
    useCreatePurchaseOrderFromRFQ();

  const [selectedVendor, setSelectedVendor] = useState<string>("");
  const [selectedAdmin, setSelectedAdmin] = useState<string>("");
  const [itemGroups, setItemGroups] = useState<ItemGroupType[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  // Fetch admins data
  // const { data: adminsData, isLoading: isLoadingAdmins } = useAdmins();
  const { data: adminsData } = useAdmins();
  const admins = useMemo(() => adminsData?.data ?? [], [adminsData]);

  const rfqData = remoteRFQData?.data?.rfq || rfq;

  const vendors = vendorsData?.data?.vendors || [];

  // Get vendors from RFQ's copiedTo array
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

  useEffect(() => {
    if (rfqData?.itemGroups) {
      // Initialize item groups with RFQ data but allow price editing
      setItemGroups(
        rfqData.itemGroups.map((item) => ({
          ...item,
          unitCost: 0, // Reset unit cost for vendor to fill
          total: 0, // Reset total
        }))
      );
    }
  }, [rfqData]);

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
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedVendor) {
      alert("Please select a vendor");
      return;
    }

    if (!selectedAdmin) {
      alert("Please select an admin for approval");
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

    createPurchaseOrderFromRFQ(
      {
        rfqId: rfqId,
        vendorId: selectedVendor,
        data: { itemGroups },
        files: selectedFiles,
        approvedBy: selectedAdmin, // Include approvedBy
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

  const totalAmount = itemGroups.reduce((sum, item) => sum + item.total, 0);

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
      {/* RFQ Information */}
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

      <Row cols="grid-cols-1 md:grid-cols-2">
        <FormRow label="RFQ Code">
          <Input
            type="text"
            value={rfqData.RFQCode}
            disabled
            className="bg-gray-100"
          />
        </FormRow>

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
              required
            />
          )}
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

      {/* Item Groups with Prices */}
      <Row>
        <FormRow label="Items with Prices *" type="wide">
          <div className="space-y-4">
            {itemGroups.map((item, index) => (
              <div key={index} className="border rounded-lg p-4 bg-gray-50">
                <h4 className="font-semibold text-gray-700 mb-3">
                  Item {index + 1}: {item.description}
                </h4>

                <Row cols="grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                  <FormRow label="Description">
                    <Input
                      type="text"
                      value={item.description}
                      disabled
                      className="bg-gray-100"
                    />
                  </FormRow>

                  <FormRow label="Frequency">
                    <Input
                      type="number"
                      value={item.frequency}
                      disabled
                      className="bg-gray-100"
                    />
                  </FormRow>

                  <FormRow label="Quantity">
                    <Input
                      type="number"
                      value={item.quantity}
                      disabled
                      className="bg-gray-100"
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
