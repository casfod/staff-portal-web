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
import { useSavePurchaseRequest } from "./Hooks/useSavePurchaseRequest";
import SpinnerMini from "../../ui/SpinnerMini";
import { useReviewers } from "../user/Hooks/useReviewers";
import Select from "../../ui/Select";
import { useSendPurchaseRequest } from "./Hooks/useSendPurchaseRequest";
import { useProjects } from "../project/Hooks/useProjects";

const FormAddPurchaseReques: React.FC = () => {
  // State for the main form fields
  const [formData, setFormData] = useState<PurChaseRequestType>({
    department: "",
    suggestedSupplier: "",
    address: "",
    finalDeliveryPoint: "",
    city: "",
    project: null,
    periodOfActivity: "",
    activityDescription: "",
    expenseChargedTo: "",
    accountCode: "",
    reviewedBy: null,
  });

  // State for the item groups
  const [itemGroup, setItemGroup] = useState<PurchaseRequesItemGroupType[]>([]);
  const [disabledStates, setDisabledStates] = useState<boolean[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

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
    setDisabledStates([...disabledStates, false]);
  };

  const { savePurchaseRequest, isPending } = useSavePurchaseRequest();
  const { sendPurchaseRequest, isPending: isSending } =
    useSendPurchaseRequest();

  const { data, isLoading } = useReviewers();
  const { data: projectData, isLoading: isLoadingProjects } = useProjects();

  const reviewers = useMemo(() => data?.data ?? [], [data]);
  const projects = useMemo(
    () => projectData?.data?.projects ?? [],
    [projectData]
  );

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

  // Remove an item group
  const removeItem = (index: number) => {
    const newItems = itemGroup.filter((_, i) => i !== index);
    setItemGroup(newItems);
    const newDisabledStates = disabledStates.filter((_, i) => i !== index);
    setDisabledStates(newDisabledStates);
  };

  // Toggle edit mode for an item group
  const handleEdit = (index: number) => {
    const newDisabledStates = [...disabledStates];
    newDisabledStates[index] = !newDisabledStates[index];
    setDisabledStates(newDisabledStates);
  };

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

      formData.project = selectedProject?.id;
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
    } else {
      // Handle other fields
      setFormData({ ...formData, [field]: value });
    }
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
  const handleSave = (e: React.FormEvent) => {
    const isFormValid = (e.target as HTMLFormElement).reportValidity();
    console.log("Is form valid?", isFormValid);
    if (formData.reviewedBy === "") {
      formData.reviewedBy = null;
    }

    if (!isFormValid) return; // Stop if form is invalid
    e.preventDefault();
    const data = { ...formData, itemGroups: [...itemGroup] };
    savePurchaseRequest(data);
  };
  // Handle form submission
  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();

    const data = { ...formData, itemGroups: [...itemGroup] };
    sendPurchaseRequest(data);
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
        {/* First Select: Projects */}
        <FormRow label="Expense Charged To *" type="small">
          {isLoadingProjects ? (
            <SpinnerMini />
          ) : (
            <Select
              key={projects.length} // Force re-render when projects change
              id="expenseChargedTo"
              customLabel="Select Project"
              value={formData.expenseChargedTo || ""}
              onChange={(e) =>
                handleFormChange("expenseChargedTo", e.target.value)
              }
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
          <FormRow label="Account Code *" type="small">
            {isLoadingProjects ? (
              <SpinnerMini />
            ) : (
              <Select
                id="accountCode"
                customLabel="Select Account Code"
                value={formData.accountCode || ""}
                onChange={(e) =>
                  handleFormChange("accountCode", e.target.value)
                }
                options={
                  selectedProject
                    ? selectedProject.account_code.map((account) => ({
                        id: `${account.name}`,
                        name: `${account.name}`,
                      }))
                    : []
                }
                required
              />
            )}
          </FormRow>
        )}
      </Row>
      <Row>
        <FormRow label="Reviewed By *" type="small">
          {isLoading ? (
            <SpinnerMini /> // Show a spinner while loading reviewers
          ) : (
            <Select
              id="reviewedBy"
              customLabel="Select Reviewer"
              value={formData.reviewedBy || ""} // Use empty string if null
              onChange={(e) => handleFormChange("reviewedBy", e.target.value)}
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

      <div className="flex justify-center w-full gap-4">
        {!formData.reviewedBy && (
          <Button size="medium" onClick={handleSave}>
            {isPending ? <SpinnerMini /> : "Save"}
          </Button>
        )}
        {formData.reviewedBy && (
          <Button size="medium" onClick={handleSend}>
            {isSending ? <SpinnerMini /> : "Save And Send"}
          </Button>
        )}
      </div>
    </form>
  );
};

export default FormAddPurchaseReques;
