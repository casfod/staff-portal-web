import React, { useEffect, useMemo, useState } from "react";
import { FaPlus } from "react-icons/fa";
import Input from "../../ui/Input";
import Button from "../../ui/Button";
import FormRow from "../../ui/FormRow";
import Row from "../../ui/Row";
import {
  Project,
  PurchaseRequesItemGroupType,
  PurChaseRequestType,
} from "../../interfaces";
import SpinnerMini from "../../ui/SpinnerMini";
import Select from "../../ui/Select";
import { useDispatch } from "react-redux";

import { resetPurchaseRequest } from "../../store/purchaseRequestSlice";
import { useReviewers } from "../user/Hooks/useReviewers";
import { useProjects } from "../project/Hooks/useProjects";
import DatePicker from "../../ui/DatePicker";
import { FileUpload } from "../../ui/FileUpload";
import { useSavePurchaseRequest, useSendPurchaseRequest } from "./Hooks/PRHook";

interface FormEditRequestProps {
  purchaseRequest: PurChaseRequestType;
}

const FormEditPurchaseRequest: React.FC<FormEditRequestProps> = ({
  purchaseRequest,
}) => {
  const dispatch = useDispatch();

  // State for the main form fields
  const [formData, setFormData] = useState<PurChaseRequestType>({
    department: purchaseRequest.department,
    suggestedSupplier: purchaseRequest.suggestedSupplier,
    address: purchaseRequest.address,
    finalDeliveryPoint: purchaseRequest.finalDeliveryPoint,
    city: purchaseRequest.city,
    periodOfActivity: purchaseRequest.periodOfActivity,
    activityDescription: purchaseRequest.activityDescription,
    expenseChargedTo: purchaseRequest.expenseChargedTo,
    accountCode: purchaseRequest.accountCode,
    financeReviewBy: purchaseRequest?.financeReviewBy?.id,
    procurementReviewBy: purchaseRequest?.procurementReviewBy?.id,
    financeReviewStatus: purchaseRequest?.financeReviewStatus,
    procurementReviewStatus: purchaseRequest?.procurementReviewStatus,
    approvedBy: purchaseRequest?.approvedBy?.id,
  });

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const [selectedProject, setSelectedProject] = useState<Project | any>(
    purchaseRequest?.project!
  );

  // Initialize itemGroup with purchaseRequest.itemGroups or an empty array
  const [itemGroup, setItemGroup] = useState<PurchaseRequesItemGroupType[]>(
    purchaseRequest.itemGroups || []
  );

  // Initialize disabledStates with false for each item group
  const [disabledStates, setDisabledStates] = useState<boolean[]>(
    Array(itemGroup.length).fill(false)
  );

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

  const handleNestedChange = (
    parentField: keyof PurChaseRequestType,
    field: string,
    value: Date | string | number | null
  ) => {
    setFormData((prev) => ({
      ...prev,
      [parentField]: {
        ...(prev[parentField] as object),
        [field]: value instanceof Date ? value.toISOString() : value,
      },
    }));
  };

  // Calculate totals whenever frequency, quantity, or unitCost changes
  const frequencies = useMemo(
    () => itemGroup.map((g) => g.frequency).join(","),
    [itemGroup]
  );
  const quantities = useMemo(
    () => itemGroup.map((g) => g.quantity).join(","),
    [itemGroup]
  );
  const unitCosts = useMemo(
    () => itemGroup.map((g) => g.unitCost).join(","),
    [itemGroup]
  );

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
  }, [frequencies, quantities, unitCosts]);

  // Add a new item group
  const addItem = () => {
    setItemGroup([
      ...itemGroup,
      {
        description: "",
        frequency: 1,
        quantity: 1,
        unit: "",
        unitCost: 0,
        total: 0,
      },
    ]);
    setDisabledStates([...disabledStates, false]);
  };

  // Remove an item group
  const removeItem = (index: number) => {
    const newItems = itemGroup.filter((_, i) => i !== index);
    setItemGroup(newItems);
    const newDisabledStates = disabledStates.filter((_, i) => i !== index);
    setDisabledStates(newDisabledStates);
  };

  const { savePurchaseRequest, isPending: isSaving } = useSavePurchaseRequest();

  const { sendPurchaseRequest, isPending: isSending } =
    useSendPurchaseRequest();
  const { data: reviewersData, isLoading: isLoadingReviewers } = useReviewers();

  const { data: projectData, isLoading: isLoadingProjects } = useProjects();

  const reviewers = useMemo(() => reviewersData?.data ?? [], [reviewersData]);

  const projects = useMemo(
    () => projectData?.data?.projects ?? [],
    [projectData]
  );

  // Filter procurement reviewers - exclude the selected finance reviewer
  const procurementReviewerOptions = useMemo(() => {
    if (!reviewers) return [];

    return reviewers
      .filter((reviewer) => reviewer.id)
      .filter((reviewer) => reviewer.id !== formData.financeReviewBy) // Exclude finance reviewer
      .map((reviewer) => ({
        id: reviewer.id as string,
        name: `${reviewer.first_name} ${reviewer.last_name}`,
      }));
  }, [reviewers, formData.financeReviewBy]);

  const handleFormChange = (
    field: keyof PurChaseRequestType,
    value: string
  ) => {
    if (field === "expenseChargedTo") {
      // Find the selected project
      const selectedProject = projects.find(
        (project) =>
          `${project.project_title} - ${project.project_code}` === value
      );

      // Update the selected project state
      setSelectedProject(selectedProject || null);

      // Update the form data with the selected project title and code
      setFormData({
        ...formData,
        expenseChargedTo: value,
        accountCode: "", // Reset account code when project changes
      });
    } else if (field === "accountCode") {
      // Update the selected account code
      setFormData({
        ...formData,
        accountCode: value,
      });
    } else if (field === "financeReviewBy") {
      // If finance reviewer changes, clear procurement reviewer if it was the same person
      setFormData({
        ...formData,
        financeReviewBy: value,
        // Clear procurement reviewer if it matches the new finance reviewer
        procurementReviewBy:
          value === formData.procurementReviewBy
            ? null
            : formData.procurementReviewBy,
      });
    } else {
      // Handle other fields
      setFormData({ ...formData, [field]: value });
    }
  };

  // Handle form submission
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    formData.financeReviewBy = null;
    formData.procurementReviewBy = null;

    const data = { ...formData, itemGroups: [...itemGroup] };
    savePurchaseRequest(data);
    // dispatch(resetPurchaseRequest());
  };

  // Handle form submission
  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form Data:", formData);
    console.log("Item Groups:", itemGroup);

    const data = { ...formData, itemGroups: [...itemGroup] };
    sendPurchaseRequest({ data, files: selectedFiles });

    dispatch(resetPurchaseRequest());
  };

  return (
    <form className="space-y-6 uppercase ">
      <Row>
        <p
          className=" "
          style={{ letterSpacing: "1px" }}
        >{`Status : ${purchaseRequest.status}`}</p>

        <p
          className=" "
          style={{ letterSpacing: "1px" }}
        >{`Request : ${purchaseRequest.requestedBy}`}</p>
      </Row>

      {/* Static inputs */}
      <Row cols="grid-cols-1 md:grid-cols-2">
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

      <Row cols="grid-cols-1 md:grid-cols-2">
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

      <Row cols="grid-cols-1 md:grid-cols-2">
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

      <Row cols="grid-cols-1 md:grid-cols-4">
        <FormRow label="Period Of Activity (From) *">
          <DatePicker
            selected={
              formData?.periodOfActivity?.from
                ? new Date(formData.periodOfActivity.from)
                : null
            }
            onChange={(date) =>
              handleNestedChange(
                "periodOfActivity",
                "from",
                date ? date.toISOString() : null
              )
            }
            variant="secondary"
            placeholder="Select date"
            // minDate={new Date()}
          />
        </FormRow>

        {formData.periodOfActivity?.from && (
          <FormRow label="Period Of Activity (To) *">
            <DatePicker
              selected={
                formData?.periodOfActivity?.to
                  ? new Date(formData.periodOfActivity.to)
                  : null
              }
              onChange={(date) =>
                handleNestedChange(
                  "periodOfActivity",
                  "to",
                  date ? date.toISOString() : null
                )
              }
              variant="secondary"
              placeholder="Select date"
              minDate={formData?.periodOfActivity?.from}
              requiredTrigger={formData.periodOfActivity?.from}
            />
          </FormRow>
        )}
      </Row>

      <Row>
        <FormRow label="Activity Description" type="wide">
          <textarea
            className="border-2 h-32 min-h-32 rounded-lg focus:outline-none p-3  "
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
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 justify-center gap-4 max-h-[580px] border-2 overflow-y-auto px-3 md:px-6 py-4 mdpy-8 rounded-lg">
        {itemGroup.map((group, index) => (
          <div
            key={index}
            className="flex flex-col gap-3 bg-[#F8F8F8] bg-opacity-90 border-2  min-w-[200px] 
p-3 md:p-6 mb-3 rounded-lg shadow-md"
          >
            <h4 className="  text-lg font-semibold">ITEM {index + 1}</h4>

            <FormRow label="Item Name *" type="wide">
              <input
                className="w-full   text-[16px] border-2 border-gray-300 bg-white rounded-lg px-2 py-1 focus:outline-none"
                placeholder=""
                disabled={disabledStates[index]}
                value={group.itemName}
                required
                onChange={(e) =>
                  handleItemChange(index, "itemName", e.target.value)
                }
              />
            </FormRow>
            <Row cols="grid-cols-1 md:grid-cols-2 2xl:grid-cols-3">
              <FormRow label="Frequency *">
                <Input
                  placeholder=""
                  type="number"
                  min="1"
                  disabled={disabledStates[index]}
                  required
                  value={group.frequency}
                  onChange={(e) =>
                    handleItemChange(index, "frequency", e.target.value)
                  }
                />
              </FormRow>
              <FormRow label="Quantity *">
                <Input
                  placeholder=""
                  type="number"
                  min="1"
                  disabled={disabledStates[index]}
                  value={group.quantity}
                  onChange={(e) =>
                    handleItemChange(index, "quantity", e.target.value)
                  }
                />
              </FormRow>
              <FormRow label="Unit">
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

            <Row cols="grid-cols-1 md:grid-cols-2">
              <FormRow label="Unit Cost (₦) *">
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
              <FormRow label="Total (₦) *">
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

            <Row>
              <FormRow label="Description*" type="wide">
                <textarea
                  className="border-2 h-22 min-h-28 rounded-lg focus:outline-none p-3  "
                  maxLength={4000}
                  id="description"
                  required
                  value={group.description}
                  onChange={(e) =>
                    handleItemChange(index, "description", e.target.value)
                  }
                />
              </FormRow>
            </Row>

            <div className="flex gap-2 mt-4">
              <button
                type="button"
                className="text-xs 2xl:text-sm text-white bg-red-500 px-3 py-1 rounded-md hover:bg-red-600 transition-all"
                onClick={() => removeItem(index)}
              >
                Delete Item {index + 1}
              </button>
              <button
                type="button"
                className="text-xs 2xl:text-sm text-white px-3 py-1 rounded-md bg-buttonColor hover:bg-buttonColorHover transition-all"
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
          <FaPlus className="h-4 w-4 mr-1 md:mr-2" /> Add Item
        </Button>
        <span className="  font-bold">
          {itemGroup.length > 1
            ? itemGroup.length + " Items "
            : itemGroup.length + " Item "}
          Added
        </span>
      </div>

      <Row cols="grid-cols-1 md:grid-cols-2">
        {/* First Select: Projects */}
        <FormRow label="Expense Charged To *">
          {isLoadingProjects ? (
            <SpinnerMini />
          ) : (
            <Select
              clearable={true}
              key={projects.length} // Force re-render when projects change
              id="expenseChargedTo"
              customLabel="Select Project"
              value={formData.expenseChargedTo || ""}
              onChange={(value) => handleFormChange("expenseChargedTo", value)}
              options={
                projects
                  ? projects
                      .filter((project) => project.id)
                      .map((project) => ({
                        id: `${project.project_title} - ${project.project_code}`,
                        name: `${project.project_code}`,
                        // name: `${project.project_title} - ${project.project_code}`,
                      }))
                  : []
              }
              required
            />
          )}
        </FormRow>

        {/* Second Select: Account Code */}
        {selectedProject && (
          <FormRow label="Account Code *">
            {isLoadingProjects ? (
              <SpinnerMini />
            ) : (
              <Select
                clearable={true}
                id="accountCode"
                customLabel="Select Account Code"
                value={formData.accountCode || ""}
                onChange={(value) => handleFormChange("accountCode", value)}
                options={
                  selectedProject
                    ? selectedProject.account_code.map(
                        (account: { name: string }) => ({
                          id: `${account.name}`,
                          name: `${account.name}`,
                        })
                      )
                    : []
                }
                required
              />
            )}
          </FormRow>
        )}
      </Row>

      {/* Show current reviewer information */}
      {purchaseRequest.financeReviewBy && (
        <div className="mb-2">
          <p className="mb-1">
            <span className="font-bold mr-1 uppercase">Finance Reviewer:</span>
            {`${purchaseRequest?.financeReviewBy?.first_name} ${purchaseRequest?.financeReviewBy?.last_name}`}
          </p>
          {purchaseRequest.financeReviewStatus && (
            <p className="mb-1">
              <span className="font-bold mr-1 uppercase">Finance Status:</span>
              <span
                className={`px-2 py-1 rounded text-xs ${
                  purchaseRequest.financeReviewStatus === "approved"
                    ? "bg-green-100 text-green-800"
                    : purchaseRequest.financeReviewStatus === "rejected"
                    ? "bg-red-100 text-red-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {purchaseRequest.financeReviewStatus.toUpperCase()}
              </span>
            </p>
          )}
        </div>
      )}

      {purchaseRequest.procurementReviewBy && (
        <div className="mb-2">
          <p className="mb-1">
            <span className="font-bold mr-1 uppercase">
              Procurement Reviewer:
            </span>
            {`${purchaseRequest?.procurementReviewBy?.first_name} ${purchaseRequest?.procurementReviewBy?.last_name}`}
          </p>
          {purchaseRequest.procurementReviewStatus && (
            <p className="mb-1">
              <span className="font-bold mr-1 uppercase">
                Procurement Status:
              </span>
              <span
                className={`px-2 py-1 rounded text-xs ${
                  purchaseRequest.procurementReviewStatus === "approved"
                    ? "bg-green-100 text-green-800"
                    : purchaseRequest.procurementReviewStatus === "rejected"
                    ? "bg-red-100 text-red-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {purchaseRequest.procurementReviewStatus.toUpperCase()}
              </span>
            </p>
          )}
        </div>
      )}

      {/* Two-step approval reviewers */}
      <Row cols="grid-cols-1 md:grid-cols-2">
        <FormRow label="Finance Reviewer *">
          {isLoadingReviewers ? (
            <SpinnerMini />
          ) : (
            <Select
              clearable={true}
              id="financeReviewBy"
              customLabel="Select Finance Reviewer"
              value={formData.financeReviewBy || ""}
              onChange={(value) => handleFormChange("financeReviewBy", value)}
              options={
                reviewers
                  ? reviewers
                      .filter((reviewer) => reviewer.id)
                      .map((reviewer) => ({
                        id: reviewer.id as string,
                        name: `${reviewer.first_name} ${reviewer.last_name}`,
                      }))
                  : []
              }
              required
            />
          )}
        </FormRow>
        {formData.financeReviewBy && (
          <FormRow label="Procurement Reviewer *">
            {isLoadingReviewers ? (
              <SpinnerMini />
            ) : (
              <Select
                clearable={true}
                id="procurementReviewBy"
                customLabel="Select Procurement Reviewer"
                value={formData.procurementReviewBy || ""}
                onChange={(value) =>
                  handleFormChange("procurementReviewBy", value)
                }
                options={procurementReviewerOptions}
                required
              />
            )}
          </FormRow>
        )}
      </Row>

      {formData.financeReviewBy && formData.procurementReviewBy && (
        <FileUpload
          selectedFiles={selectedFiles}
          setSelectedFiles={setSelectedFiles}
          accept=".jpg,.png,.pdf,.xlsx,.docx"
          multiple={true}
        />
      )}

      <div className="flex justify-center w-full gap-4">
        {formData.financeReviewBy && formData.procurementReviewBy ? (
          <Button size="medium" disabled={isSending} onClick={handleSend}>
            {isSending ? <SpinnerMini /> : "Update And Send"}
          </Button>
        ) : (
          <Button size="medium" disabled={isSaving} onClick={handleSave}>
            {isSaving ? <SpinnerMini /> : "Update And Save"}
          </Button>
        )}
      </div>
    </form>
  );
};

export default FormEditPurchaseRequest;
