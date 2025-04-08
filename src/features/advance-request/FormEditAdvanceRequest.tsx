import React, { useEffect, useMemo, useState } from "react";
import { FaPlus } from "react-icons/fa";
import Input from "../../ui/Input";
import Button from "../../ui/Button";
import FormRow from "../../ui/FormRow";
import Row from "../../ui/Row";
import {
  AdvanceRequesItemGroupType,
  AdvanceRequestType,
} from "../../interfaces";
import SpinnerMini from "../../ui/SpinnerMini";
import Select from "../../ui/Select";
import { useSendAdvanceRequest } from "./Hooks/useSendAdvanceRequest";
import { useDispatch } from "react-redux";

import { resetAdvanceRequest } from "../../store/advanceRequestSlice";
import { useUpdateAdvanceRequest } from "./Hooks/useUpdateAdvanceRequest";
import { useParams } from "react-router-dom";
import { useAdmins } from "../user/Hooks/useAdmins";
import { useReviewers } from "../user/Hooks/useReviewers";
import { bankNames } from "../../assets/Banks";

interface FormEditAdavanceRequestProps {
  advanceRequest: AdvanceRequestType;
}

const FormEditAdavanceRequest: React.FC<FormEditAdavanceRequestProps> = ({
  advanceRequest,
}) => {
  const dispatch = useDispatch();
  const param = useParams();

  // State for the main form fields
  const [formData, setFormData] = useState<AdvanceRequestType>({
    department: advanceRequest.department,
    suggestedSupplier: advanceRequest.suggestedSupplier,
    address: advanceRequest.address,
    finalDeliveryPoint: advanceRequest.finalDeliveryPoint,
    city: advanceRequest.city,
    periodOfActivity: advanceRequest.periodOfActivity,
    activityDescription: advanceRequest.activityDescription,
    accountNumber: advanceRequest.accountNumber,
    accountName: advanceRequest.accountNumber,
    bankName: advanceRequest.bankName,
    reviewedBy: advanceRequest?.reviewedBy?.id,
    approvedBy: advanceRequest?.approvedBy?.id,
  });
  // const [selectedProject, setSelectedProject] = useState<Project | any>(
  //   purchaseRequest?.project!
  // );

  // Initialize itemGroup with purchaseRequest.itemGroups or an empty array
  const [itemGroup, setItemGroup] = useState<AdvanceRequesItemGroupType[]>(
    advanceRequest.itemGroups || []
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
    field: keyof AdvanceRequesItemGroupType,
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

  const { updateAdvanceRequest, isPending } = useUpdateAdvanceRequest(
    param.requestId!
  );
  const { sendAdvanceRequest, isPending: isSending } = useSendAdvanceRequest();
  const { data: reviewersData, isLoading: isLoadingReviewers } = useReviewers();
  const { data: adminsData, isLoading: isLoadingAmins } = useAdmins();

  const admins = useMemo(() => adminsData?.data ?? [], [adminsData]);
  const reviewers = useMemo(() => reviewersData?.data ?? [], [reviewersData]);

  // Update main form fields
  // const handleFormChange = (
  //   field: keyof AdvanceRequestType,
  //   value: string
  // ) => {
  //   setFormData({ ...formData, [field]: value });
  // };

  const handleFormChange = (field: keyof AdvanceRequestType, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleNestedChange = (
    parentField: keyof AdvanceRequestType,
    field: string,
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [parentField]: {
        ...(prev[parentField] as object), // Explicitly cast to object
        [field]: value,
      },
    }));
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
    if (formData.reviewedBy === "") {
      formData.reviewedBy = null;
    }

    const data = { ...formData, itemGroups: [...itemGroup] };
    updateAdvanceRequest(data);
    // dispatch(resetAdvanceRequest());
  };
  // Handle form submission
  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form Data:", formData);
    console.log("Item Groups:", itemGroup);

    const data = { ...formData, itemGroups: [...itemGroup] };
    sendAdvanceRequest(data);

    dispatch(resetAdvanceRequest());
  };

  return (
    <form className="space-y-6 uppercase ">
      <Row>
        <p
          className="text-gray-700"
          style={{ letterSpacing: "1px" }}
        >{`Status : ${advanceRequest.status}`}</p>

        <p
          className="text-gray-700"
          style={{ letterSpacing: "1px" }}
        >{`Requested by : ${advanceRequest.requestedBy}`}</p>
      </Row>

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
      </Row>

      <Row>
        <FormRow label="Period Of Activity (From) *">
          <Input
            type="date"
            id="periodOfActivity_from"
            required
            value={formData.periodOfActivity.from}
            onChange={(e) =>
              handleNestedChange("periodOfActivity", "from", e.target.value)
            }
          />
        </FormRow>
        <FormRow label="Period Of Activity (To) *">
          <Input
            type="date"
            id="periodOfActivity_to"
            required
            value={formData.periodOfActivity.to}
            onChange={(e) =>
              handleNestedChange("periodOfActivity", "to", e.target.value)
            }
          />
        </FormRow>
      </Row>
      <Row>
        <FormRow label="Activity Description" type="wide">
          <textarea
            className="border-2 h-32 min-h-32 rounded-lg focus:outline-none p-3 text-gray-600"
            maxLength={4000}
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
              <input
                className="w-full text-gray-600 text-[16px] border-2 border-gray-300 bg-white rounded-lg px-2 py-1 focus:outline-none"
                placeholder=""
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

      <Row>
        <FormRow label="Account Number*">
          <Input
            type="text"
            id="accountNumber"
            required
            value={formData.accountNumber}
            onChange={(e) => handleFormChange("accountNumber", e.target.value)}
          />
        </FormRow>
        <FormRow label="Account Name*">
          <Input
            type="text"
            id="accountName"
            required
            value={formData.accountName}
            onChange={(e) => handleFormChange("accountName", e.target.value)}
          />
        </FormRow>
      </Row>
      <Row>
        <FormRow label="Bank Name *" type="small">
          <Select
            id="bankName"
            customLabel="Select a Bank"
            value={formData.bankName || ""} // Use empty string if null
            onChange={(value) => handleFormChange("bankName", value)}
            options={
              bankNames
                ? bankNames.map((bank) => ({
                    id: bank.name as string, // Assert that bank.id is a string
                    name: `${bank.name}`,
                  }))
                : []
            }
            required
          />
        </FormRow>
      </Row>

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

      {/* <Row>
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
      </Row> */}

      {advanceRequest.reviewedBy ? (
        <div className="text-gray-700">
          <p className="mb-2">
            <span className="font-bold mr-1  uppercase">Reviewed By :</span>
            {`${advanceRequest?.reviewedBy?.first_name} ${advanceRequest?.reviewedBy?.last_name}`}
          </p>

          {advanceRequest?.comments && (
            <div className="mb-2">
              <span className="font-bold mr-1  uppercase">Comments :</span>

              {advanceRequest?.comments?.map((comment) => (
                <div className="border-2 px-4 py-2 rounded-lg shadow-lg">
                  <p className="text-base font-extrabold">
                    {`${comment.user.first_name} ${comment.user.last_name}`}
                  </p>
                  <p className="text-sm">{`${comment.text}`}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : advanceRequest.status === "reviewed" ? (
        <Row>
          <FormRow label="Approved By *" type="small">
            {isLoadingAmins ? (
              <SpinnerMini /> // Show a spinner while loading Reviewers
            ) : (
              <Select
                id="approvedBy"
                customLabel="Select an admin"
                value={formData.approvedBy || ""} // Use empty string if null
                onChange={(value) => handleFormChange("reviewedBy", value)}
                options={
                  admins
                    ? admins
                        .filter((admin) => admin.id) // Filter out Reviewers with undefined IDs
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
      ) : (
        <Row>
          <FormRow label="Reviewed By *" type="small">
            {isLoadingReviewers ? (
              <SpinnerMini /> // Show a spinner while loading Reviewers
            ) : (
              <Select
                id="reviewedBy"
                customLabel="Select Reviewer"
                value={formData.reviewedBy || ""} // Use empty string if null
                onChange={(value) => handleFormChange("reviewedBy", value)}
                options={
                  reviewers
                    ? reviewers
                        .filter((reviewer) => reviewer.id) // Filter out reviewers with undefined IDs
                        .map((reviewer) => ({
                          id: reviewer.id as string, // Assert that reviewer.id is a string
                          name: `${reviewer.first_name} ${reviewer.last_name}`,
                        }))
                    : []
                }
                required
              />
            )}
          </FormRow>
        </Row>
      )}

      <div className="flex justify-center w-full gap-4">
        <Button size="medium" onClick={handleUpdate}>
          {isPending ? <SpinnerMini /> : "Update"}
        </Button>
        {formData.reviewedBy && (
          <Button size="medium" onClick={handleSend}>
            {isSending ? <SpinnerMini /> : "Update And Send"}
          </Button>
        )}
      </div>
    </form>
  );
};

export default FormEditAdavanceRequest;
