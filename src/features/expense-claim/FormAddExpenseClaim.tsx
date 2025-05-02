import React, { useEffect, useMemo, useState } from "react";
import { FaPlus } from "react-icons/fa";
import Input from "../../ui/Input";
import Button from "../../ui/Button";
import FormRow from "../../ui/FormRow";
import Row from "../../ui/Row";
import {
  Project,
  ExpenseClaimItemGroup,
  ExpenseClaimType,
} from "../../interfaces";
import { useSaveExpenseClaim } from "./Hooks/useSaveExpenseClaim";
import SpinnerMini from "../../ui/SpinnerMini";
import { useReviewers } from "../user/Hooks/useReviewers";
import Select from "../../ui/Select";
import { useSendExpenseClaim } from "./Hooks/useSendExpenseClaim";
import { useProjects } from "../project/Hooks/useProjects";
import { expenses } from "../../assets/expenses";
import DatePicker from "../../ui/DatePicker";

const FormAddExpenseClaim: React.FC = () => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState<ExpenseClaimType>({
    expenseReason: "",
    expenseClaim: { from: "", to: "" },
    dayOfDeparture: "",
    dayOfReturn: "",
    expenses: [],
    project: null,
    expenseChargedTo: "",
    accountCode: "",
    budget: 0,
    amountInWords: "",
    reviewedBy: null,
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const [itemGroup, setItemGroup] = useState<ExpenseClaimItemGroup[]>([]);
  const [disabledStates, setDisabledStates] = useState<boolean[]>([]);

  const { data: projectData, isLoading: isLoadingProjects } = useProjects();
  const projects = useMemo(
    () => projectData?.data?.projects ?? [],
    [projectData]
  );

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

  // Calculate budget whenever itemGroup changes
  useEffect(() => {
    const totalBudget = itemGroup.reduce(
      (sum, item) => sum + (item.total || 0),
      0
    );
    setFormData((prev) => ({
      ...prev,
      budget: totalBudget, // Round to 2 decimal places
    }));
  }, [itemGroup]);

  const addItem = () => {
    setItemGroup([
      ...itemGroup,
      {
        expense: "",
        frequency: 0,
        quantity: 0,
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

  const handleItemChange = (
    index: number,
    field: keyof ExpenseClaimItemGroup,
    value: string | number
  ) => {
    setItemGroup((prev) => {
      const newItems = [...prev];
      newItems[index] = { ...newItems[index], [field]: value };
      return newItems;
    });
  };

  const handleNestedChange = (
    parentField: keyof ExpenseClaimType,
    field: string,
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [parentField]: {
        ...(prev[parentField] as object),
        [field]: value,
      },
    }));
  };

  const handleEdit = (index: number) => {
    setDisabledStates((prev) => {
      const newStates = [...prev];
      newStates[index] = !newStates[index];
      return newStates;
    });
  };

  const handleFormChange = (field: keyof ExpenseClaimType, value: string) => {
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files);
  };

  const { saveExpenseClaim, isPending } = useSaveExpenseClaim();
  const { sendExpenseClaim, isPending: isSending } = useSendExpenseClaim();
  const { data, isLoading } = useReviewers();
  const reviewers = useMemo(() => data?.data ?? [], [data]);

  const handleSave = (e: React.FormEvent) => {
    const isFormValid = (e.target as HTMLFormElement).reportValidity();
    if (!isFormValid) return;

    e.preventDefault();
    const data = {
      ...formData,
      expenses: [...itemGroup],
      reviewedBy: formData.reviewedBy === "" ? null : formData.reviewedBy,
    };
    // saveExpenseClaim(data);

    saveExpenseClaim({ data, files: selectedFiles });
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...formData,
      expenses: [...itemGroup],
      reviewedBy: formData.reviewedBy === "" ? null : formData.reviewedBy,
    };
    sendExpenseClaim({ data, files: selectedFiles });
  };

  return (
    <form className="space-y-6">
      {/* Static inputs */}

      <Row cols="grid-cols-1 md:grid-cols-4">
        <FormRow label="Day Of Departure *">
          <DatePicker
            selected={
              formData.dayOfDeparture ? new Date(formData.dayOfDeparture) : null
            }
            onChange={(date) =>
              handleFormChange("dayOfDeparture", date ? date.toISOString() : "")
            }
            variant="secondary"
            size="md" // or "sm"/"lg" based on your form size
            placeholder="Select date"
            // className="custom-class-if-needed"
            clearable={true}
            maxDate={new Date()}
          />
        </FormRow>
        {formData.dayOfDeparture && (
          <FormRow label="Day Of Return *">
            <DatePicker
              selected={
                formData.dayOfReturn ? new Date(formData.dayOfReturn) : null
              }
              onChange={(date) =>
                handleFormChange("dayOfReturn", date ? date.toISOString() : "")
              }
              variant="secondary"
              size="md" // or "sm"/"lg" based on your form size
              placeholder="Select date"
              // className="custom-class-if-needed"
              clearable={true}
              minDate={formData.dayOfDeparture!}
              maxDate={new Date()}
              requiredTrigger={!!formData.dayOfDeparture}
            />
          </FormRow>
        )}
      </Row>
      <Row>
        <FormRow label="Expense Reason *" type="wide">
          <textarea
            className="border-2 h-32 min-h-32 rounded-lg focus:outline-none p-3 text-gray-600"
            maxLength={4000}
            placeholder=""
            id="expenseReason"
            value={formData.expenseReason}
            onChange={(e) => handleFormChange("expenseReason", e.target.value)}
          />
        </FormRow>
      </Row>

      <Row>
        <FormRow label="Departure (From) *" type="wide">
          <Input
            type="text"
            id="expenseClaim_from"
            required
            value={formData.expenseClaim.from}
            onChange={(e) =>
              handleNestedChange("expenseClaim", "from", e.target.value)
            }
          />
        </FormRow>
      </Row>
      <Row>
        <FormRow label="Destination (To) *" type="wide">
          <Input
            type="text"
            id="expenseClaim_to"
            required
            value={formData.expenseClaim.to}
            onChange={(e) =>
              handleNestedChange("expenseClaim", "to", e.target.value)
            }
          />
        </FormRow>
      </Row>

      {/* Dynamic itemGroup */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 justify-center gap-4 max-h-[450px] border-2 overflow-y-auto px-3 md:px-6 py-4 mdpy-8 rounded-lg">
        {itemGroup.map((group, index) => (
          <div
            key={index}
            className="flex flex-col gap-3 bg-[#F8F8F8] bg-opacity-90 border-2  min-w-[200px] 
p-3 md:p-6 mb-3 rounded-lg shadow-md"
          >
            {" "}
            <h4 className="text-gray-600 text-lg font-semibold">
              EXPENSE {index + 1}
            </h4>
            <Row>
              <FormRow label="Expense *" type="wide">
                <Select
                  clearable={true}
                  id="expense"
                  customLabel="Select an Expense"
                  required
                  value={group.expense || ""}
                  onChange={(value) =>
                    handleItemChange(index, "expense", value)
                  }
                  options={
                    expenses
                      ? expenses.map((expense) => ({
                          id: expense.name as string, // Assert that expense.id is a string
                          name: `${expense.name}`,
                        }))
                      : []
                  }
                />
              </FormRow>
            </Row>
            <Row cols="grid-cols-1 md:grid-cols-2 2xl:grid-cols-3">
              <FormRow label="Frequency *">
                <Input
                  placeholder=""
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
              <FormRow label="Quantity *">
                <Input
                  placeholder=""
                  type="number"
                  min="0"
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
        <span className="text-gray-600 font-bold">
          {itemGroup.length > 1
            ? itemGroup.length + " Items "
            : itemGroup.length + " Item "}
          Added
        </span>
      </div>

      <Row>
        <FormRow label="Budget *">
          <Input
            placeholder=""
            type="number"
            value={formData.budget}
            readOnly
            required
          />
        </FormRow>
      </Row>

      <Row>
        <FormRow label="Amount In Words*">
          <Input
            type="text"
            id="amountInWords"
            required
            value={formData.amountInWords}
            onChange={(e) => handleFormChange("amountInWords", e.target.value)}
          />
        </FormRow>
      </Row>

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
        <FormRow label="Reviewed By *">
          {isLoading ? (
            <SpinnerMini /> // Show a spinner while loading reviewers
          ) : (
            <Select
              clearable={true}
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
              optionsHeight={220}
              filterable={true}
              required
            />
          )}
        </FormRow>
      </Row>

      <input
        type="file"
        name="files"
        multiple
        accept=".jpg,.png,.pdf,.doc,.docx,.xlsx"
        onChange={handleFileChange}
      />

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

export default FormAddExpenseClaim;
