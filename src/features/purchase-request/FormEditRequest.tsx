import React, { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";
import Input from "../../ui/Input";
import Button from "../../ui/Button";
import FormRow from "../../ui/FormRow";
import Row from "../../ui/Row";
import {
  PurchaseRequesItemGroupType,
  PurChaseRequestType,
} from "../../interfaces";
import SpinnerMini from "../../ui/SpinnerMini";
import { useAdmins } from "../user/userHooks/useAdmins";
import Select from "../../ui/Select";
import { useSendPurchaseRequest } from "./pRHooks/useSendPurchaseRequest";
import { useDispatch } from "react-redux";

import { resetPurchaseRequest } from "../../store/purchaseRequestSlice";
import { useUpdatePurChaseRequest } from "./pRHooks/useUpdatePurChaseRequest";
import { useParams } from "react-router-dom";

interface FormEditRequestProps {
  purchaseRequest: PurChaseRequestType;
}

const FormEditRequest: React.FC<FormEditRequestProps> = ({
  purchaseRequest,
}) => {
  const dispatch = useDispatch();
  const param = useParams();

  // State for the main form fields
  const [formData, setFormData] = useState<PurChaseRequestType>({
    department: purchaseRequest.department,
    suggestedSupplier: purchaseRequest.suggestedSupplier,
    requestedBy: purchaseRequest.requestedBy,
    address: purchaseRequest.address,
    finalDeliveryPoint: purchaseRequest.finalDeliveryPoint,
    city: purchaseRequest.city,
    periodOfActivity: purchaseRequest.periodOfActivity,
    activityDescription: purchaseRequest.activityDescription,
    expenseChargedTo: purchaseRequest.expenseChargedTo,
    accountCode: purchaseRequest.accountCode,
    reviewedBy: null,
  });

  // Initialize itemGroup with purchaseRequest.itemGroups or an empty array
  const [itemGroup, setItemGroup] = useState<PurchaseRequesItemGroupType[]>(
    purchaseRequest.itemGroups || []
  );

  // Initialize disabledStates with false for each item group
  const [disabledStates, setDisabledStates] = useState<boolean[]>(
    Array(itemGroup.length).fill(false)
  );

  // Add a new item group
  const addItem = () => {
    setItemGroup([
      ...itemGroup,
      {
        description: "",
        frequency: 0,
        quantity: 0,
        unit: "",
        unitCost: 0,
        total: 0,
      },
    ]);
    setDisabledStates([...disabledStates, false]); // Add a new disabled state
  };

  // Remove an item group
  const removeItem = (index: number) => {
    const newItems = itemGroup.filter((_, i) => i !== index);
    setItemGroup(newItems);
    const newDisabledStates = disabledStates.filter((_, i) => i !== index);
    setDisabledStates(newDisabledStates); // Remove the corresponding disabled state
  };

  // Toggle edit mode for an item group
  const handleEdit = (index: number) => {
    const newDisabledStates = [...disabledStates];
    newDisabledStates[index] = !newDisabledStates[index];
    setDisabledStates(newDisabledStates);
  };

  // Update item group fields
  const handleItemChange = (
    index: number,
    field: keyof PurchaseRequesItemGroupType,
    value: string | number
  ) => {
    const newItems = [...itemGroup];
    newItems[index][field] = value as never;
    setItemGroup(newItems);
  };

  // Calculate totals whenever frequency, quantity, or unitCost changes
  useEffect(() => {
    const updatedGroups = itemGroup.map((group) => ({
      ...group,
      total: parseFloat(
        (
          (group.frequency || 1) *
          (group.quantity || 1) *
          (group.unitCost || 0)
        ).toFixed(2)
      ),
    }));
    setItemGroup(updatedGroups);
  }, [
    itemGroup.map((g) => g.frequency).join(","),
    itemGroup.map((g) => g.quantity).join(","),
    itemGroup.map((g) => g.unitCost).join(","),
  ]);

  const { updatePurchaseRequest, isPending } = useUpdatePurChaseRequest(
    param.requestId!
  );
  const { sendPurchaseRequest, isPending: isSending } =
    useSendPurchaseRequest();
  const { data, isLoading } = useAdmins();

  const admins = data?.data;

  console.log("Admins:", admins);

  // Update main form fields
  const handleFormChange = (
    field: keyof PurChaseRequestType,
    value: string
  ) => {
    setFormData({ ...formData, [field]: value });
  };

  // Calculate totals whenever frequency, quantity, or unitCost changes
  useEffect(() => {
    const updatedGroups = itemGroup.map((group) => ({
      ...group,
      total: parseFloat(
        (
          (group.frequency || 1) *
          (group.quantity || 1) *
          (group.unitCost || 0)
        ).toFixed(2)
      ),
    }));
    setItemGroup(updatedGroups);
  }, [
    itemGroup.map((g) => g.frequency).join(","),
    itemGroup.map((g) => g.quantity).join(","),
    itemGroup.map((g) => g.unitCost).join(","),
  ]);

  // Handle form submission
  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form Data:", formData);
    console.log("Item Groups:", itemGroup);

    const data = { ...formData, itemGroups: [...itemGroup] };
    updatePurchaseRequest(data);
    // dispatch(resetPurchaseRequest());
  };
  // Handle form submission
  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form Data:", formData);
    console.log("Item Groups:", itemGroup);

    const data = { ...formData, itemGroups: [...itemGroup] };
    sendPurchaseRequest(data);

    dispatch(resetPurchaseRequest());
  };
  return (
    <form className="space-y-6">
      {/* Static inputs */}
      <Row>
        <FormRow label="Department *">
          <Input
            type="text"
            id="department"
            required
            value={formData.department}
            onChange={(e) => handleFormChange("department", e.target.value)}
          />
        </FormRow>
      </Row>

      <Row>
        <FormRow label="Suggested supplier *">
          <Input
            placeholder=""
            id="suggestedSupplier"
            required
            value={formData.suggestedSupplier}
            onChange={(e) =>
              handleFormChange("suggestedSupplier", e.target.value)
            }
          />
        </FormRow>
        <FormRow label="Requested By *">
          <Input
            placeholder=""
            id="requestedBy"
            required
            value={formData.requestedBy}
            onChange={(e) => handleFormChange("requestedBy", e.target.value)}
          />
        </FormRow>
      </Row>

      <Row>
        <FormRow label="Address *">
          <Input
            placeholder=""
            id="address"
            required
            value={formData.address}
            onChange={(e) => handleFormChange("address", e.target.value)}
          />
        </FormRow>
        <FormRow label="Final delivery point *">
          <Input
            placeholder=""
            id="finalDeliveryPoint"
            required
            value={formData.finalDeliveryPoint}
            onChange={(e) =>
              handleFormChange("finalDeliveryPoint", e.target.value)
            }
          />
        </FormRow>
      </Row>

      <Row>
        <FormRow label="City *">
          <Input
            placeholder=""
            id="city"
            required
            value={formData.city}
            onChange={(e) => handleFormChange("city", e.target.value)}
          />
        </FormRow>
        <FormRow label="Period of Activity *">
          <Input
            placeholder=""
            id="periodOfActivity"
            required
            value={formData.periodOfActivity}
            onChange={(e) =>
              handleFormChange("periodOfActivity", e.target.value)
            }
          />
        </FormRow>
      </Row>

      <Row>
        <FormRow label="Activity Description" type="wide">
          <Input
            size={50}
            placeholder=""
            id="activityDescription"
            value={formData.activityDescription}
            onChange={(e) =>
              handleFormChange("activityDescription", e.target.value)
            }
          />
        </FormRow>
      </Row>

      {/* Dynamic itemGroup */}
      <div className="flex flex-wrap justify-center gap-4 max-h-[450px] border-2 overflow-y-auto px-6 py-8 rounded-lg">
        {itemGroup.map((group, index) => (
          <div
            key={index}
            className="flex flex-col gap-3 bg-[#F8F8F8] bg-opacity-90 border-2 w-[48%] p-6 mb-3 rounded-lg shadow-md"
          >
            <h4 className="text-gray-600 text-lg font-semibold">
              ITEM {index + 1}
            </h4>

            <FormRow label="Description *" type="wide">
              <Input
                placeholder=""
                inputSize={100}
                disabled={disabledStates[index]}
                value={group.description}
                required
                onChange={(e) =>
                  handleItemChange(index, "description", e.target.value)
                }
              />
            </FormRow>

            <Row>
              <FormRow label="Frequency *" type="small">
                <Input
                  placeholder=""
                  inputSize={100}
                  type="number"
                  min="0"
                  disabled={disabledStates[index]}
                  required
                  value={group.frequency}
                  onChange={(e) =>
                    handleItemChange(index, "frequency", e.target.value)
                  }
                />
              </FormRow>
              <FormRow label="Quantity *" type="small">
                <Input
                  placeholder=""
                  inputSize={100}
                  type="number"
                  min="0"
                  disabled={disabledStates[index]}
                  value={group.quantity}
                  onChange={(e) =>
                    handleItemChange(index, "quantity", e.target.value)
                  }
                />
              </FormRow>
              <FormRow label="Unit" type="small">
                <Input
                  disabled={disabledStates[index]}
                  value={group.unit}
                  placeholder=""
                  onChange={(e) =>
                    handleItemChange(index, "unit", e.target.value)
                  }
                />
              </FormRow>
            </Row>

            <Row>
              <FormRow label="Unit Cost (₦) *" type="medium">
                <Input
                  type="number"
                  min="0"
                  disabled={disabledStates[index]}
                  value={group.unitCost}
                  placeholder="123..."
                  onChange={(e) =>
                    handleItemChange(index, "unitCost", e.target.value)
                  }
                />
              </FormRow>
              <FormRow label="Total (₦) *" type="medium">
                <Input
                  type="number"
                  disabled={disabledStates[index]}
                  value={group.total}
                  onChange={(e) =>
                    handleItemChange(index, "total", e.target.value)
                  }
                />
              </FormRow>
            </Row>

            <div className="flex gap-2 mt-4">
              <button
                type="button"
                className="text-white bg-red-500 px-3 py-1 rounded-md hover:bg-red-600 transition-all"
                onClick={() => removeItem(index)}
              >
                Delete Item {index + 1}
              </button>
              <button
                type="button"
                className="text-white px-3 py-1 rounded-md bg-buttonColor hover:bg-buttonColorHover transition-all"
                onClick={() => handleEdit(index)}
              >
                {disabledStates[index] ? "Edit Item" : "Done"}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-4 w-full">
        <Button type="button" onClick={addItem}>
          <FaPlus /> Add Item
        </Button>
        <span className="text-gray-700 font-bold">
          {itemGroup.length > 1
            ? itemGroup.length + " Items "
            : itemGroup.length + " Item "}
          Added
        </span>
      </div>

      <Row>
        <FormRow label="Expense Charged To *" type="medium">
          <Input
            type="text"
            required
            id="expenseChargedTo"
            value={formData.expenseChargedTo}
            onChange={(e) =>
              handleFormChange("expenseChargedTo", e.target.value)
            }
          />
        </FormRow>
        <FormRow label="Account Code *" type="small">
          <Input
            type="text"
            required
            placeholder=""
            id="accountCode"
            value={formData.accountCode}
            onChange={(e) => handleFormChange("accountCode", e.target.value)}
          />
        </FormRow>
      </Row>

      <Row>
        <FormRow label="Reviewed By *" type="small">
          {isLoading ? (
            <SpinnerMini /> // Show a spinner while loading admins
          ) : (
            <Select
              id="reviewedBy"
              value={formData.reviewedBy || ""} // Use empty string if null
              onChange={(e) => handleFormChange("reviewedBy", e.target.value)}
              options={
                admins
                  ? admins
                      .filter((admin) => admin.id) // Filter out admins with undefined IDs
                      .map((admin) => ({
                        id: admin.id as string, // Assert that admin.id is a string
                        name: `${admin.first_name} ${admin.last_name}`,
                      }))
                  : []
              }
              required
            />
          )}
        </FormRow>
      </Row>

      <div className="flex justify-center w-full gap-4">
        <Button size="medium" onClick={handleUpdate}>
          {isPending ? <SpinnerMini /> : "Update"}
        </Button>
        {formData.reviewedBy && (
          <Button size="medium" onClick={handleSend}>
            {isSending ? <SpinnerMini /> : "Save And Send"}
          </Button>
        )}
      </div>
    </form>
  );
};

export default FormEditRequest;
