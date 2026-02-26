import { useState, useEffect } from "react";
import { StaffStrategyType, ObjectiveType } from "../../interfaces";
import FormRow from "../../ui/FormRow";
import Input from "../../ui/Input";
import Row from "../../ui/Row";

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
import { useNavigate } from "react-router-dom";

interface FormEditStaffStrategyProps {
  staffStrategy: StaffStrategyType | null;
}

const FormEditStaffStrategy: React.FC<FormEditStaffStrategyProps> = ({
  staffStrategy,
}) => {
  const currentUser = localStorageUser();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<Partial<StaffStrategyType>>({
    staffName: "",
    staffId: "",
    jobTitle: "",
    department: "",
    supervisor: "",
    supervisorId: "",
    period: "",
    accountabilityAreas: [],
    approvedBy: null,
  });

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  // Initialize form data from staffStrategy
  useEffect(() => {
    if (staffStrategy) {
      setFormData({
        staffName: staffStrategy.staffName,
        staffId: staffStrategy.staffId?.id || "",
        jobTitle: staffStrategy.jobTitle,
        department: staffStrategy.department,
        supervisor: staffStrategy.supervisor,
        supervisorId: staffStrategy.supervisorId?.id || "",
        period: staffStrategy.period,
        accountabilityAreas: staffStrategy.accountabilityAreas || [],
        approvedBy: staffStrategy.approvedBy?.id || null,
      });
    }
  }, [staffStrategy]);

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
    const draftData = { ...formData, approvedBy: null };
    saveStaffStrategyDraft(draftData);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isFormValid = (e.target as HTMLFormElement).reportValidity();

    if (!isFormValid) return;

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

  // Check editability
  const isEditable =
    staffStrategy?.status === "draft" || staffStrategy?.status === "rejected";

  if (!staffStrategy) {
    return (
      <div className="text-center py-8">
        <p className="text-lg text-gray-600">Staff Strategy not found</p>
        <Button
          type="button"
          size="medium"
          variant="secondary"
          onClick={() => navigate(-1)}
          className="mt-4"
        >
          Go Back
        </Button>
      </div>
    );
  }

  if (!isEditable) {
    return (
      <div className="text-center py-8">
        <p className="text-lg text-gray-600">
          This staff strategy cannot be edited because it is{" "}
          <span className="font-semibold uppercase">
            {staffStrategy.status}
          </span>
          .
        </p>
        <Button
          type="button"
          size="medium"
          variant="secondary"
          onClick={() => navigate(-1)}
          className="mt-4"
        >
          Go Back
        </Button>
      </div>
    );
  }

  if (isErrorCreate || isErrorSave) {
    return <NetworkErrorUI />;
  }

  if (currentUser.employmentInfo?.isProfileComplete === false) {
    return (
      <span className="text-amber-600 font-extrabold">
        <span className="text-2xl">⚠️</span>
        Please complete your employment info to access staff strategy form.
        <span
          onClick={() => navigate("/human-resources/staff-information")}
          className="underline hover:text-blue-600"
        >
          {" "}
          Click here
        </span>
      </span>
    );
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {/* Staff Information */}

      <Row cols="grid-cols-1 md:grid-cols-2">
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
        <FormRow label="Period *">
          <Select
            id="period"
            customLabel="Select Period"
            value={formData.period || ""}
            onChange={(value) => handleFormChange("period", value)}
            options={[
              { id: "January - March", name: "January - March (Q1)" },

              { id: "April - June", name: "April - June (Q2)" },

              { id: "July - September", name: "July - September (Q3)" },

              { id: "October - December", name: "October - December (Q4)" },
            ]}
            required
          />
        </FormRow>

        <FormRow label="Supervisor *">
          <Input
            type="text"
            readOnly
            value={currentUser.employmentInfo?.jobDetails?.supervisor}
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
                            className="border-2 h-20 min-h-20 rounded-lg focus:outline-none p-3 w-full"
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
                              { id: "Monthly", name: "Monthly" },
                              { id: "Quarterly", name: "Quarterly" },
                              { id: "Annually", name: "Annually" },
                            ]}
                          />
                        </FormRow>
                      </Row>

                      <Row>
                        <FormRow label="Expected Outcome *">
                          <textarea
                            className="border-2 h-20 min-h-20 rounded-lg focus:outline-none p-3 w-full"
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

                      <Row>
                        <FormRow label="KPI *">
                          <textarea
                            className="border-2 h-20 min-h-20 rounded-lg focus:outline-none p-3 w-full"
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
                      </Row>
                      <Row>
                        <FormRow label="Possible Challenges">
                          <textarea
                            className="border-2 h-20 min-h-20 rounded-lg focus:outline-none p-3 w-full"
                            value={objective.possibleChallenges || ""}
                            onChange={(e) =>
                              handleObjectiveChange(
                                areaIndex,
                                objIndex,
                                "possibleChallenges",
                                e.target.value
                              )
                            }
                            required
                          />
                        </FormRow>
                      </Row>

                      <Row cols="grid-cols-1">
                        <FormRow label="Support Required">
                          <textarea
                            className="border-2 h-20 min-h-20 rounded-lg focus:outline-none p-3 w-full"
                            value={objective.supportRequired || ""}
                            onChange={(e) =>
                              handleObjectiveChange(
                                areaIndex,
                                objIndex,
                                "supportRequired",
                                e.target.value
                              )
                            }
                            required
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
            {isCreating ? <SpinnerMini /> : "Submit for Approval"}
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

      {/* Status Information */}
      <div className="text-center text-sm text-gray-600">
        Current Status:{" "}
        <span className="font-semibold uppercase">{staffStrategy.status}</span>
      </div>
    </form>
  );
};

export default FormEditStaffStrategy;
