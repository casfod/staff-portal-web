import { useMemo, useState } from "react";
import { StaffStrategyType, ObjectiveType } from "../../interfaces";
import FormRow from "../../ui/FormRow";
import Input from "../../ui/Input";
import Row from "../../ui/Row";
import { useUsers } from "../user/Hooks/useUsers";
import SpinnerMini from "../../ui/SpinnerMini";
import Select from "../../ui/Select";
import Button from "../../ui/Button";
import NetworkErrorUI from "../../ui/NetworkErrorUI";
import { FileUpload } from "../../ui/FileUpload";
import {
  useCreateStaffStrategy,
  useSaveStaffStrategyDraft,
} from "./Hooks/useStaffStrategy";
import { localStorageUser } from "../../utils/localStorageUser";
import { Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

const FormAddStaffStrategy = () => {
  const currentUser = localStorageUser();

  const [formData, setFormData] = useState<Partial<StaffStrategyType>>({
    staffName: "",
    staffId: "",
    jobTitle: "",
    department: "",
    supervisor: "",
    supervisorId: "",
    period: "",
    accountabilityAreas: [
      {
        areaName: "",
        objectives: [
          {
            objective: "",
            timeline: "Routine",
            expectedOutcome: "",
            kpi: "",
            possibleChallenges: "",
            supportRequired: "",
          },
        ],
      },
    ],
    approvedBy: null,
  });

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  // Fetch users data
  const { data: usersData, isLoading: isLoadingUsers } = useUsers({
    limit: 1000,
  });
  const users = useMemo(
    () =>
      usersData?.data?.users.filter((user) => user.id !== currentUser.id) ?? [],
    [usersData]
  );

  const handleFormChange = (field: keyof StaffStrategyType, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  // Accountability Area handlers
  const handleAreaChange = (areaIndex: number, value: string) => {
    const updatedAreas = [...(formData.accountabilityAreas || [])];
    updatedAreas[areaIndex] = {
      ...updatedAreas[areaIndex],
      areaName: value,
    };
    setFormData({ ...formData, accountabilityAreas: updatedAreas });
  };

  const addArea = () => {
    const updatedAreas = [
      ...(formData.accountabilityAreas || []),
      {
        areaName: "",
        objectives: [
          {
            objective: "",
            timeline: "Routine",
            expectedOutcome: "",
            kpi: "",
            possibleChallenges: "",
            supportRequired: "",
          },
        ],
      },
    ];
    setFormData({ ...formData, accountabilityAreas: updatedAreas });
  };

  const removeArea = (areaIndex: number) => {
    if ((formData.accountabilityAreas?.length || 0) > 1) {
      const updatedAreas = formData.accountabilityAreas?.filter(
        (_, i) => i !== areaIndex
      );
      setFormData({ ...formData, accountabilityAreas: updatedAreas });
    }
  };

  // Objective handlers
  const handleObjectiveChange = (
    areaIndex: number,
    objIndex: number,
    field: keyof ObjectiveType,
    value: string
  ) => {
    const updatedAreas = [...(formData.accountabilityAreas || [])];
    const updatedObjectives = [...updatedAreas[areaIndex].objectives];
    updatedObjectives[objIndex] = {
      ...updatedObjectives[objIndex],
      [field]: value,
    };
    updatedAreas[areaIndex].objectives = updatedObjectives;
    setFormData({ ...formData, accountabilityAreas: updatedAreas });
  };

  const addObjective = (areaIndex: number) => {
    const updatedAreas = [...(formData.accountabilityAreas || [])];
    updatedAreas[areaIndex].objectives.push({
      objective: "",
      timeline: "Routine",
      expectedOutcome: "",
      kpi: "",
      possibleChallenges: "",
      supportRequired: "",
    });
    setFormData({ ...formData, accountabilityAreas: updatedAreas });
  };

  const removeObjective = (areaIndex: number, objIndex: number) => {
    const updatedAreas = [...(formData.accountabilityAreas || [])];
    if (updatedAreas[areaIndex].objectives.length > 1) {
      updatedAreas[areaIndex].objectives = updatedAreas[
        areaIndex
      ].objectives.filter((_, i) => i !== objIndex);
      setFormData({ ...formData, accountabilityAreas: updatedAreas });
    }
  };

  const {
    createStaffStrategy,
    isPending: isCreating,
    isError: isErrorCreate,
  } = useCreateStaffStrategy();
  const {
    saveStaffStrategyDraft,
    isPending: isSaving,
    isError: isErrorSave,
  } = useSaveStaffStrategyDraft();

  const handleSaveDraft = (e: React.FormEvent) => {
    e.preventDefault();
    const isFormValid = (e.target as HTMLFormElement).reportValidity();

    if (!isFormValid) return;

    // Clear approver for draft save
    formData.approvedBy = null;

    const data = { ...formData };
    saveStaffStrategyDraft(data);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isFormValid = (e.target as HTMLFormElement).reportValidity();

    if (!isFormValid) return;

    console.log("formData:::", formData);

    // Validate that staff and supervisor are selected
    if (!formData.staffId) {
      toast.error("Please select a staff member");
      return;
    }
    if (!formData.supervisorId) {
      toast.error("Please select a supervisor");
      return;
    }

    // Validate accountability areas have objectives
    const hasEmptyAreas = formData.accountabilityAreas?.some(
      (area) => !area.areaName.trim()
    );
    if (hasEmptyAreas) {
      toast.error("Please fill in all accountability area names");
      return;
    }

    const hasEmptyObjectives = formData.accountabilityAreas?.some((area) =>
      area.objectives.some(
        (obj) =>
          !obj.objective.trim() ||
          !obj.expectedOutcome.trim() ||
          !obj.kpi.trim()
      )
    );
    if (hasEmptyObjectives) {
      toast.error(
        "Please fill in all required objective fields (Objective, Expected Outcome, KPI)"
      );
      return;
    }

    const data = { ...formData };
    createStaffStrategy({ data, files: selectedFiles });
  };

  if (isErrorCreate || isErrorSave) {
    return <NetworkErrorUI />;
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {/* Staff Information */}
      <Row cols="grid-cols-1 md:grid-cols-2">
        <FormRow label="Staff Name *">
          <Input
            type="text"
            id="staffName"
            required
            value={formData.staffName}
            onChange={(e) => handleFormChange("staffName", e.target.value)}
            placeholder="Enter staff name"
          />
        </FormRow>

        <FormRow label="Select Staff *">
          {isLoadingUsers ? (
            <SpinnerMini />
          ) : (
            // <Select
            //   filterable={true}
            //   clearable={true}
            //   id="staffId"
            //   customLabel="Select Staff Member"
            //   value={formData.staffId || ""}
            //   onChange={(value) => {
            //     const selectedUser = users.find((u) => u.id === value);
            //     handleFormChange("staffId", value);
            //     if (selectedUser) {
            //       handleFormChange(
            //         "staffName",
            //         `${selectedUser.first_name} ${selectedUser.last_name}`
            //       );
            //     }
            //   }}
            //   options={users.map((user) => ({
            //     id: user.id as string,
            //     name: `${user.first_name} ${user.last_name} (${user.email})`,
            //   }))}
            //   required
            // />

            <Select
              filterable={true}
              clearable={true}
              id="staffId"
              customLabel="Select Staff Member"
              value={formData.staffId || ""}
              onChange={(value) => {
                console.log("Selected staff ID:", value); // Add this to debug
                const selectedUser = users.find((u) => u.id === value);

                // Update both staffId and staffName
                setFormData((prev) => ({
                  ...prev,
                  staffId: value, // This should now be set
                  staffName: selectedUser
                    ? `${selectedUser.first_name} ${selectedUser.last_name}`
                    : prev.staffName,
                }));
              }}
              options={users.map((user) => ({
                id: user.id as string,
                name: `${user.first_name} ${user.last_name} (${user.email})`,
              }))}
              required
            />
          )}
        </FormRow>
      </Row>

      <Row cols="grid-cols-1 md:grid-cols-2">
        <FormRow label="Job Title *">
          <Input
            type="text"
            id="jobTitle"
            required
            value={formData.jobTitle}
            onChange={(e) => handleFormChange("jobTitle", e.target.value)}
            placeholder="Enter job title"
          />
        </FormRow>

        <FormRow label="Department *">
          <Input
            type="text"
            id="department"
            required
            value={formData.department}
            onChange={(e) => handleFormChange("department", e.target.value)}
            placeholder="Enter department"
          />
        </FormRow>
      </Row>

      <Row cols="grid-cols-1 md:grid-cols-2">
        <FormRow label="Supervisor Name *">
          <Input
            type="text"
            id="supervisor"
            required
            value={formData.supervisor}
            onChange={(e) => handleFormChange("supervisor", e.target.value)}
            placeholder="Enter supervisor name"
          />
        </FormRow>

        <FormRow label="Select Supervisor *">
          {isLoadingUsers ? (
            <SpinnerMini />
          ) : (
            // <Select
            //   filterable={true}
            //   clearable={true}
            //   id="supervisorId"
            //   customLabel="Select Supervisor"
            //   value={formData.supervisorId || ""}
            //   onChange={(value) => {
            //     const selectedUser = users.find((u) => u.id === value);
            //     handleFormChange("supervisorId", value);
            //     if (selectedUser) {
            //       handleFormChange(
            //         "supervisor",
            //         `${selectedUser.first_name} ${selectedUser.last_name}`
            //       );
            //     }
            //   }}
            //   options={users.map((user) => ({
            //     id: user.id as string,
            //     name: `${user.first_name} ${user.last_name} (${user.email})`,
            //   }))}
            //   required
            // />

            <Select
              filterable={true}
              clearable={true}
              id="supervisorId"
              customLabel="Select Supervisor"
              value={formData.supervisorId || ""}
              onChange={(value) => {
                console.log("Selected supervisor ID:", value); // Add this to debug
                const selectedUser = users.find((u) => u.id === value);

                // Update both supervisorId and supervisor
                setFormData((prev) => ({
                  ...prev,
                  supervisorId: value, // This should now be set
                  supervisor: selectedUser
                    ? `${selectedUser.first_name} ${selectedUser.last_name}`
                    : prev.supervisor,
                }));
              }}
              options={users.map((user) => ({
                id: user.id as string,
                name: `${user.first_name} ${user.last_name} (${user.email})`,
              }))}
              required
            />
          )}
        </FormRow>
      </Row>

      <Row cols="grid-cols-1 md:grid-cols-2">
        <FormRow label="Period *">
          <Input
            type="text"
            id="period"
            required
            value={formData.period}
            onChange={(e) => handleFormChange("period", e.target.value)}
            placeholder="e.g., Q1 2024, Annual 2024"
          />
        </FormRow>
      </Row>

      {/* Accountability Areas Section */}
      <Row>
        <FormRow label="Accountability Areas & Objectives *" type="wide">
          <div className="space-y-6">
            {formData.accountabilityAreas?.map((area, areaIndex) => (
              <div
                key={areaIndex}
                className="space-y-4 border rounded-lg p-4 bg-gray-50"
              >
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-gray-700">
                    Accountability Area {areaIndex + 1}
                  </h4>
                  {formData.accountabilityAreas!.length > 1 && (
                    <Button
                      type="button"
                      variant="secondary"
                      size="small"
                      onClick={() => removeArea(areaIndex)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <FormRow label="Area Name *">
                  <Input
                    type="text"
                    value={area.areaName}
                    onChange={(e) =>
                      handleAreaChange(areaIndex, e.target.value)
                    }
                    placeholder="e.g., Program Delivery, Financial Management"
                    required
                  />
                </FormRow>

                {/* Objectives */}
                <div className="space-y-4 pl-4 border-l-2 border-gray-300">
                  <h5 className="font-medium text-gray-600">Objectives</h5>
                  {area.objectives.map((objective, objIndex) => (
                    <div
                      key={objIndex}
                      className="space-y-3 border rounded p-3 bg-white"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">
                          Objective {objIndex + 1}
                        </span>
                        {area.objectives.length > 1 && (
                          <Button
                            type="button"
                            variant="secondary"
                            size="small"
                            onClick={() => removeObjective(areaIndex, objIndex)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>

                      <Row cols="grid-cols-1">
                        <FormRow label="Objective *">
                          <textarea
                            className="border-2 h-20 min-h-20 rounded-lg focus:outline-none p-3"
                            value={objective.objective}
                            onChange={(e) =>
                              handleObjectiveChange(
                                areaIndex,
                                objIndex,
                                "objective",
                                e.target.value
                              )
                            }
                            required
                          />
                        </FormRow>
                      </Row>

                      <Row cols="grid-cols-1 md:grid-cols-2">
                        <FormRow label="Timeline">
                          <Select
                            customLabel=""
                            id={`timeline-${areaIndex}-${objIndex}`}
                            value={objective.timeline}
                            onChange={(value) =>
                              handleObjectiveChange(
                                areaIndex,
                                objIndex,
                                "timeline",
                                value
                              )
                            }
                            options={[
                              { id: "Routine", name: "Routine" },
                              { id: "Short-term", name: "Short-term" },
                              { id: "Medium-term", name: "Medium-term" },
                              { id: "Long-term", name: "Long-term" },
                            ]}
                          />
                        </FormRow>

                        <FormRow label="Expected Outcome *">
                          <Input
                            type="text"
                            value={objective.expectedOutcome}
                            onChange={(e) =>
                              handleObjectiveChange(
                                areaIndex,
                                objIndex,
                                "expectedOutcome",
                                e.target.value
                              )
                            }
                            required
                          />
                        </FormRow>
                      </Row>

                      <Row cols="grid-cols-1 md:grid-cols-2">
                        <FormRow label="KPI *">
                          <Input
                            type="text"
                            value={objective.kpi}
                            onChange={(e) =>
                              handleObjectiveChange(
                                areaIndex,
                                objIndex,
                                "kpi",
                                e.target.value
                              )
                            }
                            required
                          />
                        </FormRow>

                        <FormRow label="Possible Challenges">
                          <Input
                            type="text"
                            value={objective.possibleChallenges || ""}
                            onChange={(e) =>
                              handleObjectiveChange(
                                areaIndex,
                                objIndex,
                                "possibleChallenges",
                                e.target.value
                              )
                            }
                          />
                        </FormRow>
                      </Row>

                      <Row cols="grid-cols-1">
                        <FormRow label="Support Required">
                          <Input
                            type="text"
                            value={objective.supportRequired || ""}
                            onChange={(e) =>
                              handleObjectiveChange(
                                areaIndex,
                                objIndex,
                                "supportRequired",
                                e.target.value
                              )
                            }
                          />
                        </FormRow>
                      </Row>
                    </div>
                  ))}

                  <Button
                    type="button"
                    onClick={() => addObjective(areaIndex)}
                    variant="secondary"
                    size="small"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Objective
                  </Button>
                </div>
              </div>
            ))}

            <Button type="button" onClick={addArea} variant="primary">
              <Plus className="h-4 w-4 mr-2" />
              Add Accountability Area
            </Button>
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
          <Button
            type="button"
            size="medium"
            variant="secondary"
            disabled={isSaving}
            onClick={handleSaveDraft}
          >
            {isSaving ? <SpinnerMini /> : "Save as Draft"}
          </Button>

          <Button type="submit" size="medium" disabled={isCreating}>
            {isCreating ? <SpinnerMini /> : "Submit for Review"}
          </Button>

          <Button
            type="button"
            size="medium"
            variant="secondary"
            onClick={() => window.history.back()}
          >
            Cancel
          </Button>
        </div>
      </div>
    </form>
  );
};

export default FormAddStaffStrategy;
