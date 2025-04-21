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
import SpinnerMini from "../../ui/SpinnerMini";
import Select from "../../ui/Select";
import { useDispatch } from "react-redux";

import { useReviewers } from "../user/Hooks/useReviewers";
import { useUpdateTravelRequest } from "./Hooks/useUpdateTravelRequest";
import { useSendTravelRequest } from "./Hooks/useSendTravelRequest";
import { resetTravelRequest } from "../../store/travelRequestSlice";
import { useProjects } from "../project/Hooks/useProjects";
import { useAdmins } from "../user/Hooks/useAdmins";
import { expenses } from "../../assets/expenses";
import DatePicker from "../../ui/DatePicker";

interface FormEditTravelRequestProps {
  travelRequest: TravelRequestType;
}

const FormEditTravelRequest: React.FC<FormEditTravelRequestProps> = ({
  travelRequest,
}) => {
  const dispatch = useDispatch();
  // const param = useParams();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // State for the main form fields
  const [formData, setFormData] = useState<TravelRequestType>({
    travelReason: travelRequest.travelReason,
    travelRequest: {
      from: travelRequest.travelRequest.from,
      to: travelRequest.travelRequest.to,
    },
    dayOfDeparture: travelRequest.dayOfDeparture,
    dayOfReturn: travelRequest.dayOfReturn,
    expenses: [...travelRequest.expenses],
    project: travelRequest.project,
    budget: travelRequest.budget,
    reviewedBy: travelRequest.reviewedBy,
  });
  // State for the item groups
  const [itemGroup, setItemGroup] = useState<TravelRequestItemGroup[]>([
    ...travelRequest.expenses,
  ]);

  const [disabledStates, setDisabledStates] = useState<boolean[]>([]);

  const { data: projectData, isLoading: isLoadingProjects } = useProjects();
  const projects = useMemo(
    () => projectData?.data?.projects ?? [],
    [projectData]
  );

  // Calculate totals whenever frequency, quantity, or unitCost changes
  const daysNumber = useMemo(
    () => itemGroup.map((g) => g.daysNumber).join(","),
    [itemGroup]
  );

  const rate = useMemo(
    () => itemGroup.map((g) => g.rate).join(","),
    [itemGroup]
  );

  // Calculate totals whenever itemGroup changes
  useEffect(() => {
    const updatedGroups = itemGroup.map((group) => ({
      ...group,
      total: parseFloat(
        ((group.daysNumber || 0) * (group.rate || 0)).toFixed(2)
      ),
    }));

    const grandtotal = updatedGroups.reduce(
      (sum, item) => sum + (item.total || 0),
      0
    );

    setItemGroup(updatedGroups);
    setFormData((prev) => ({ ...prev, budget: grandtotal }));
  }, [daysNumber, rate]);

  const handleProjectsChange = (value: string) => {
    if (value) {
      const selected = projects.find(
        (project) =>
          `${project.project_title} - ${project.project_code}` === value
      );
      if (selected) {
        setSelectedProject(selected);
        setFormData((prev) => ({
          ...prev,
          project: `${selected.project_code}`,
        }));
      }
    } else {
      setSelectedProject(null);
      setFormData((prev) => ({ ...prev, project: "" }));
    }
  };

  const addItem = () => {
    const newItem = {
      location: "",
      daysNumber: 0,
      rate: 0,
      expense: "",
      total: 0,
    };
    setItemGroup((prev) => [...prev, newItem]);
    setDisabledStates((prev) => [...prev, false]);
  };

  const handleItemChange = (
    index: number,
    field: keyof TravelRequestItemGroup,
    value: string | number
  ) => {
    setItemGroup((prev) => {
      const newItems = [...prev];
      newItems[index] = { ...newItems[index], [field]: value };
      return newItems;
    });
  };

  const handleNestedChange = (
    parentField: keyof TravelRequestType,
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

  const removeItem = (index: number) => {
    setItemGroup((prev) => prev.filter((_, i) => i !== index));
    setDisabledStates((prev) => prev.filter((_, i) => i !== index));
  };

  const handleEdit = (index: number) => {
    setDisabledStates((prev) => {
      const newStates = [...prev];
      newStates[index] = !newStates[index];
      return newStates;
    });
  };

  const handleFormChange = (field: keyof TravelRequestType, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const { updateTravelRequest, isPending } = useUpdateTravelRequest(
    travelRequest.id!
  );
  const { sendTravelRequest, isPending: isSending } = useSendTravelRequest();
  const { data: reviewersData, isLoading: isLoadingReviewers } = useReviewers();
  const { data: adminsData, isLoading: isLoadingAmins } = useAdmins();
  const admins = useMemo(() => adminsData?.data ?? [], [adminsData]);
  const reviewers = useMemo(() => reviewersData?.data ?? [], [reviewersData]);

  // Handle form submission
  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form Data:", formData);
    console.log("Item Groups:", itemGroup);
    if (formData.reviewedBy === "") {
      formData.reviewedBy = null;
    }

    const data = { ...formData, expenses: [...itemGroup] };
    updateTravelRequest(data);
    // dispatch(resetTravelRequest());
  };
  // Handle form submission
  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form Data:", formData);
    console.log("Item Groups:", itemGroup);

    const data = { ...formData, expenses: [...itemGroup] };
    sendTravelRequest(data);

    dispatch(resetTravelRequest());
  };

  return (
    <form className="space-y-6">
      {/* Static inputs */}

      <Row cols="grid-cols-1 md:grid-cols-2">
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
          />
        </FormRow>
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
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 justify-center gap-4 max-h-[450px] border-2 overflow-y-auto px-3 md:px-6 py-4 mdpy-8 rounded-lg">
        {itemGroup.map((group, index) => (
          <div
            key={index}
            className="flex flex-col gap-3 bg-[#F8F8F8] bg-opacity-90 border-2  min-w-[200px] 
p-3 md:p-6 mb-3 rounded-lg shadow-md"
          >
            <h4 className="text-gray-600 text-lg font-semibold">
              EXPENSE {index + 1}
            </h4>
            <Row>
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

            <Row cols="grid-cols-1 md:grid-cols-2">
              <FormRow label="Days Number *">
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
              <FormRow label="Rate *">
                <Input
                  placeholder=""
                  inputSize={100}
                  type="number"
                  min="0"
                  disabled={disabledStates[index]}
                  required
                  value={group.rate}
                  onChange={(e) =>
                    handleItemChange(index, "rate", e.target.value)
                  }
                />
              </FormRow>
            </Row>

            <Row>
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
                Delete item {index + 1}
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
            inputSize={100}
            type="number"
            value={formData.budget}
            readOnly
            required
          />
        </FormRow>
      </Row>

      <Row cols="grid-cols-1 md:grid-cols-2">
        <FormRow label="Projects">
          {isLoadingProjects ? (
            <SpinnerMini />
          ) : (
            <Select
              key={projects.length}
              id="projects"
              customLabel="Select Project"
              value={formData.project} // Now uses the combined string from formData
              onChange={(value) => handleProjectsChange(value)}
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

        <FormRow label="Project Code *">
          <Input
            type="text"
            id="project"
            required
            readOnly
            value={
              selectedProject
                ? selectedProject?.project_code
                : travelRequest.project || ""
            } // Still shows just the code
          />
        </FormRow>
      </Row>

      {travelRequest.reviewedBy ? (
        <div className="text-gray-600">
          <p className="mb-2">
            <span className="font-bold mr-1  uppercase">Reviewed By :</span>
            {`${travelRequest?.reviewedBy?.first_name} ${travelRequest?.reviewedBy?.last_name}`}
          </p>

          {travelRequest?.comments && (
            <div className="mb-2">
              <span className="font-bold mr-1  uppercase">Comments :</span>

              {travelRequest?.comments?.map((comment) => (
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
      ) : travelRequest.status === "reviewed" ? (
        <Row>
          <FormRow label="Approved By *">
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
          <FormRow label="Reviewed By *">
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

export default FormEditTravelRequest;
