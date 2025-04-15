import React, { useEffect, useMemo, useState } from "react";
import { FaPlus } from "react-icons/fa";
import Input from "../../ui/Input";
import Button from "../../ui/Button";
import FormRow from "../../ui/FormRow";
import Row from "../../ui/Row";
import {
  Project,
  TravelRequestItemGroup,
  TravelRequestType,
} from "../../interfaces";
import { useSaveTravelRequest } from "./Hooks/useSaveTravelRequest";
import SpinnerMini from "../../ui/SpinnerMini";
import { useReviewers } from "../user/Hooks/useReviewers";
import Select from "../../ui/Select";
import { useSendTravelRequest } from "./Hooks/useSendTravelRequest";
import { useProjects } from "../project/Hooks/useProjects";
import { expenses } from "../../assets/expenses";

const FormAddTravelRequest: React.FC = () => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // State for the main form fields
  const [formData, setFormData] = useState<TravelRequestType>({
    travelReason: "",
    travelRequest: { from: "", to: "" },
    dayOfDeparture: "",
    dayOfReturn: "",
    expenses: [],
    project: "",
    budget: 0,
    reviewedBy: null,
  });

  // State for the item groups
  const [itemGroup, setItemGroup] = useState<TravelRequestItemGroup[]>([]);
  const [disabledStates, setDisabledStates] = useState<boolean[]>([]);

  const { data: projectData, isLoading: isLoadingProjects } = useProjects();

  const projects = useMemo(
    () => projectData?.data?.projects ?? [],
    [projectData]
  );

  const handelProjectsChange = (value: string) => {
    if (value) {
      const selectedProject = projects?.find(
        (project) =>
          `${project.project_title} - ${project.project_code}` === value
      );
      if (selectedProject) {
        setSelectedProject(selectedProject);
        // Update formData with the combined string
        setFormData((prev) => ({
          ...prev,
          project: `${selectedProject.project_code}`,
        }));
      }
    } else {
      setSelectedProject(null);
      setFormData((prev) => ({
        ...prev,
        project: "",
      }));
    }
  };
  // Add a new item group
  const addItem = () => {
    setItemGroup([
      ...itemGroup,
      {
        location: "",
        daysNumber: 0,
        rate: 0,
        expense: "",
        total: 0,
      },
    ]);
    setDisabledStates([...disabledStates, false]);
  };

  const { saveTravelRequest, isPending } = useSaveTravelRequest();
  const { sendTravelRequest, isPending: isSending } = useSendTravelRequest();

  const { data, isLoading } = useReviewers();

  const reviewers = useMemo(() => data?.data ?? [], [data]);

  // Update item group fields
  const handleItemChange = (
    index: number,
    field: keyof TravelRequestItemGroup,
    value: string | number
  ) => {
    const newItems = [...itemGroup];
    newItems[index][field] = value as never;
    setItemGroup(newItems);
  };

  const handleNestedChange = (
    parentField: keyof TravelRequestType,
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

  const handleFormChange = (field: keyof TravelRequestType, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  // Calculate totals whenever frequency, quantity, or unitCost changes
  const daysNumber = useMemo(
    () => itemGroup.map((g) => g.daysNumber).join(","),
    [itemGroup]
  );

  const rate = useMemo(
    () => itemGroup.map((g) => g.rate).join(","),
    [itemGroup]
  );

  useEffect(() => {
    const updatedGroups = itemGroup.map((group) => ({
      ...group,
      total: parseFloat(
        ((group.daysNumber || 1) * (group.rate || 1)).toFixed(2)
      ),
    }));
    setItemGroup(updatedGroups);
  }, [daysNumber, rate]);

  // Handle form submission
  const handleSave = (e: React.FormEvent) => {
    const isFormValid = (e.target as HTMLFormElement).reportValidity();
    console.log("Is form valid?", isFormValid);
    if (formData.reviewedBy === "") {
      formData.reviewedBy = null;
    }

    if (!isFormValid) return; // Stop if form is invalid
    e.preventDefault();
    const data = { ...formData, expenses: [...itemGroup] };
    saveTravelRequest(data);
  };
  // Handle form submission
  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();

    const data = { ...formData, expenses: [...itemGroup] };

    // console.log(data);

    sendTravelRequest(data);
  };

  return (
    <form className="space-y-6">
      {/* Static inputs */}

      <Row>
        <FormRow label="Day Of Departure *">
          <Input
            type="date"
            id="dayOfDeparture"
            required
            value={formData.dayOfDeparture}
            onChange={(e) => handleFormChange("dayOfDeparture", e.target.value)}
          />
        </FormRow>
        <FormRow label="Day Of Return *">
          <Input
            type="date"
            id="dayOfReturn"
            required
            value={formData.dayOfReturn}
            onChange={(e) => handleFormChange("dayOfReturn", e.target.value)}
          />
        </FormRow>
      </Row>

      <Row>
        <FormRow label="Travel Reason *" type="wide">
          <textarea
            className="border-2 h-32 min-h-32 rounded-lg focus:outline-none p-3 text-gray-600"
            maxLength={4000}
            placeholder=""
            id="travelReason"
            value={formData.travelReason}
            onChange={(e) => handleFormChange("travelReason", e.target.value)}
          />
        </FormRow>
      </Row>

      <Row>
        <FormRow label="Departure (From) *" type="wide">
          <Input
            type="text"
            id="travelRequest_from"
            required
            value={formData.travelRequest.from}
            onChange={(e) =>
              handleNestedChange("travelRequest", "from", e.target.value)
            }
          />
        </FormRow>
      </Row>
      <Row>
        <FormRow label="Destination (To) *" type="wide">
          <Input
            type="text"
            id="travelRequest_to"
            required
            value={formData.travelRequest.to}
            onChange={(e) =>
              handleNestedChange("travelRequest", "to", e.target.value)
            }
          />
        </FormRow>
      </Row>

      {/* Dynamic itemGroup */}
      <div className="flex flex-wrap justify-center gap-4 max-h-[500px] border-2 overflow-y-auto px-6 py-8 rounded-lg">
        {itemGroup.map((group, index) => (
          <div
            key={index}
            className="flex flex-col gap-3 bg-[#F8F8F8] bg-opacity-90 border-2 w-[48%] p-6 mb-3 rounded-lg shadow-md"
          >
            <h4 className="text-gray-600 text-lg font-semibold">
              EXPENSE {index + 1}
            </h4>
            <Row>
              {/* <FormRow label="Expense *" type="wide">
                <Input
                  className="w-full text-gray-600 text-[16px] border-2 border-gray-300 bg-white rounded-lg px-2 py-1 focus:outline-none"
                  placeholder=""
                  disabled={disabledStates[index]}
                  required
                  value={group.expense}
                  onChange={(e) =>
                    handleItemChange(index, "expense", e.target.value)
                  }
                />
              </FormRow> */}

              <FormRow label="Expense *" type="wide">
                <Select
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

            <Row>
              <FormRow label="Location *" type="wide">
                <input
                  className="w-full text-gray-600 text-[16px] border-2 border-gray-300 bg-white rounded-lg px-2 py-1 focus:outline-none"
                  placeholder=""
                  disabled={disabledStates[index]}
                  value={group.location}
                  required
                  onChange={(e) =>
                    handleItemChange(index, "location", e.target.value)
                  }
                />
              </FormRow>
            </Row>

            <Row>
              <FormRow label="Days Number *" type="small">
                <Input
                  placeholder=""
                  inputSize={100}
                  type="number"
                  min="0"
                  disabled={disabledStates[index]}
                  required
                  value={group.daysNumber}
                  onChange={(e) =>
                    handleItemChange(index, "daysNumber", e.target.value)
                  }
                />
              </FormRow>
              <FormRow label="Rate *" type="small">
                <Input
                  placeholder=""
                  inputSize={100}
                  type="number"
                  min="0"
                  disabled={disabledStates[index]}
                  value={group.rate}
                  onChange={(e) =>
                    handleItemChange(index, "rate", e.target.value)
                  }
                />
              </FormRow>
            </Row>

            <Row>
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
                Delete Expense {index + 1}
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
        <FormRow label="Budget *" type="small">
          <Input
            placeholder=""
            inputSize={100}
            type="number"
            min="0"
            value={formData.budget}
            onChange={(e) => handleFormChange("budget", e.target.value)}
          />
        </FormRow>
      </Row>

      <Row>
        <FormRow label="Projects" type="small">
          {isLoadingProjects ? (
            <SpinnerMini />
          ) : (
            <Select
              key={projects.length}
              id="projects"
              customLabel="Select Project"
              value={formData.project} // Now uses the combined string from formData
              onChange={(value) => handelProjectsChange(value)}
              options={
                projects
                  ? projects
                      .filter((project) => project.id)
                      .map((project) => ({
                        id: `${project.project_title} - ${project.project_code}`,
                        name: `${project.project_title} - ${project.project_code}`, // Show full format in dropdown
                      }))
                  : []
              }
              required
            />
          )}
        </FormRow>

        <FormRow label="Project Code *" type="small">
          <Input
            type="text"
            id="project"
            required
            readOnly
            value={selectedProject?.project_code || ""} // Still shows just the code
          />
        </FormRow>
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

export default FormAddTravelRequest;
