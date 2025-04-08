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

  const { updateTravelRequest, isPending } = useUpdateTravelRequest(
    travelRequest.id!
  );
  const { sendTravelRequest, isPending: isSending } = useSendTravelRequest();

  const { data: reviewersData, isLoading: isLoadingReviewers } = useReviewers();
  const { data: adminsData, isLoading: isLoadingAmins } = useAdmins();

  const admins = useMemo(() => adminsData?.data ?? [], [adminsData]);
  const reviewers = useMemo(() => reviewersData?.data ?? [], [reviewersData]);

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
  useEffect(() => {
    const updatedGroups = itemGroup.map((group) => ({
      ...group,
      total: parseFloat(
        ((group.daysNumber || 1) * (group.rate || 1)).toFixed(2)
      ),
    }));
    setItemGroup(updatedGroups);
  }, [
    itemGroup.map((g) => g.daysNumber).join(","),
    itemGroup.map((g) => g.rate).join(","),
  ]);

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
        <FormRow label="Travel Request (From) *" type="wide">
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
        <FormRow label="Travel Request (To) *" type="wide">
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
              <FormRow label="Expense *" type="wide">
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
            value={
              selectedProject
                ? selectedProject?.project_code
                : travelRequest.project || ""
            } // Still shows just the code
          />
        </FormRow>
      </Row>

      {travelRequest.reviewedBy ? (
        <div className="text-gray-700">
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

export default FormEditTravelRequest;
