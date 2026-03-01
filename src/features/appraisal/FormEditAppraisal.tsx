// src/features/appraisal/FormEditAppraisal.tsx
import { useState, useEffect } from "react";
import { AppraisalType } from "../../interfaces";
import FormRow from "../../ui/FormRow";
import Input from "../../ui/Input";
import Row from "../../ui/Row";
import SpinnerMini from "../../ui/SpinnerMini";
import Select from "../../ui/Select";
import Button from "../../ui/Button";
import { FileUpload } from "../../ui/FileUpload";
import { useUpdateAppraisal } from "./Hooks/useAppraisal";
import { localStorageUser } from "../../utils/localStorageUser";
import { useNavigate } from "react-router-dom";
import { FileText, AlertCircle } from "lucide-react";

interface SafeguardingType {
  actionsTaken: string;
  trainingCompleted: "Yes" | "Partly" | "No";
  areasNotUnderstood: string[];
}

interface FormEditAppraisalProps {
  appraisal: AppraisalType | null;
}

const FormEditAppraisal = ({ appraisal }: FormEditAppraisalProps) => {
  const currentUser = localStorageUser();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<Partial<AppraisalType>>({
    staffId: "",
    staffName: "",
    position: "",
    department: "",
    lengthOfTimeInPosition: "",
    appraisalPeriod: "",
    dateOfAppraisal: "",
    supervisorId: "",
    supervisorName: "",
    lengthOfTimeSupervised: "",
    objectives: [],
    safeguarding: {
      actionsTaken: "",
      trainingCompleted: "No",
      areasNotUnderstood: [],
    },
    performanceAreas: [],
    supervisorComments: "",
    overallRating: "Meets Requirements",
    futureGoals: "",
    signatures: {
      staffSignature: false,
      supervisorSignature: false,
    },
  });

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [areasNotUnderstoodInput, setAreasNotUnderstoodInput] = useState("");

  // Initialize form data from appraisal
  useEffect(() => {
    if (appraisal) {
      setFormData({
        staffId: appraisal.staffId?.id || "",
        staffName: appraisal.staffName || "",
        position: appraisal.position || "",
        department: appraisal.department || "",
        lengthOfTimeInPosition: appraisal.lengthOfTimeInPosition || "",
        appraisalPeriod: appraisal.appraisalPeriod || "",
        dateOfAppraisal: appraisal.dateOfAppraisal?.split("T")[0] || "",
        supervisorId: appraisal.supervisorId?.id || "",
        supervisorName: appraisal.supervisorName || "",
        lengthOfTimeSupervised: appraisal.lengthOfTimeSupervised || "",
        objectives: appraisal.objectives || [],
        safeguarding: appraisal.safeguarding || {
          actionsTaken: "",
          trainingCompleted: "No",
          areasNotUnderstood: [],
        },
        performanceAreas: appraisal.performanceAreas || [],
        supervisorComments: appraisal.supervisorComments || "",
        overallRating: appraisal.overallRating || "Meets Requirements",
        futureGoals: appraisal.futureGoals || "",
        signatures: appraisal.signatures || {
          staffSignature: false,
          supervisorSignature: false,
        },
      });
    }
  }, [appraisal]);

  const { updateAppraisal, isPending: isUpdating } = useUpdateAppraisal(
    appraisal?.id || ""
  );

  const handleFormChange = (field: keyof AppraisalType, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleObjectiveRatingChange = (
    index: number,
    field: "employeeRating" | "supervisorRating",
    value: string
  ) => {
    const updatedObjectives = [...(formData.objectives || [])];
    updatedObjectives[index] = {
      ...updatedObjectives[index],
      [field]: value,
    };
    setFormData({ ...formData, objectives: updatedObjectives });
  };

  const handlePerformanceAreaChange = (index: number, value: string) => {
    const updatedAreas = [...(formData.performanceAreas || [])];
    updatedAreas[index] = {
      ...updatedAreas[index],
      rating: value as
        | "Needs Improvement"
        | "Meets Expectations"
        | "Exceeds Expectations",
    };
    setFormData({ ...formData, performanceAreas: updatedAreas });
  };

  const handleSafeguardingChange = (
    field: keyof SafeguardingType,
    value: any
  ) => {
    setFormData({
      ...formData,
      safeguarding: {
        ...(formData.safeguarding as SafeguardingType),
        [field]: value,
      },
    });
  };

  const addAreaNotUnderstood = () => {
    if (areasNotUnderstoodInput.trim()) {
      const currentAreas =
        (formData.safeguarding as SafeguardingType)?.areasNotUnderstood || [];
      setFormData({
        ...formData,
        safeguarding: {
          ...(formData.safeguarding as SafeguardingType),
          areasNotUnderstood: [...currentAreas, areasNotUnderstoodInput.trim()],
        },
      });
      setAreasNotUnderstoodInput("");
    }
  };

  const removeAreaNotUnderstood = (index: number) => {
    const currentAreas =
      (formData.safeguarding as SafeguardingType)?.areasNotUnderstood || [];
    setFormData({
      ...formData,
      safeguarding: {
        ...(formData.safeguarding as SafeguardingType),
        areasNotUnderstood: currentAreas.filter((_, i) => i !== index),
      },
    });
  };

  // Check editability
  const isEditable =
    appraisal?.status === "draft" ||
    appraisal?.status === "pending-employee" ||
    appraisal?.status === "pending-supervisor";

  const isStaff = formData.staffId === currentUser?.id;
  const isSupervisor = formData.supervisorId === currentUser?.id;
  const isAdmin = ["SUPER-ADMIN", "ADMIN"].includes(currentUser?.role || "");

  const canEdit = isEditable && (isStaff || isSupervisor || isAdmin);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isFormValid = (e.target as HTMLFormElement).reportValidity();

    if (!isFormValid) return;

    updateAppraisal({ data: formData, files: selectedFiles });
  };

  if (!appraisal) {
    return (
      <div className="text-center py-8">
        <p className="text-lg text-gray-600">Appraisal not found</p>
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

  if (!canEdit) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
        <p className="text-lg text-gray-600">
          This appraisal cannot be edited because it is{" "}
          <span className="font-semibold uppercase">{appraisal.status}</span>
          {appraisal.status === "completed" && " and has been completed"}.
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Only draft or pending appraisals can be edited.
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

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {/* Section 1: Staff Information */}
      <div className="rounded-lg p-4 border bg-gray-50 border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-300 flex items-center">
          <FileText className="h-5 w-5 mr-2" />
          SECTION 1: STAFF INFORMATION
        </h3>

        <Row cols="grid-cols-1 md:grid-cols-2">
          <FormRow label="Department *">
            <Input
              type="text"
              required
              value={formData.department}
              onChange={(e) => handleFormChange("department", e.target.value)}
              placeholder="Enter department"
              disabled={!isAdmin && !isSupervisor}
            />
          </FormRow>

          <FormRow label="Length of Time in Position">
            <Input
              type="text"
              value={formData.lengthOfTimeInPosition}
              onChange={(e) =>
                handleFormChange("lengthOfTimeInPosition", e.target.value)
              }
              placeholder="e.g., 2 years"
              disabled={!isAdmin && !isSupervisor}
            />
          </FormRow>
        </Row>

        <Row cols="grid-cols-1 md:grid-cols-2">
          <FormRow label="Appraisal Period">
            <Input
              type="text"
              value={formData.appraisalPeriod}
              disabled
              className="bg-gray-100"
            />
          </FormRow>

          <FormRow label="Date of Appraisal">
            <Input
              type="date"
              value={formData.dateOfAppraisal}
              onChange={(e) =>
                handleFormChange("dateOfAppraisal", e.target.value)
              }
              disabled={!isAdmin && !isSupervisor}
            />
          </FormRow>
        </Row>

        <Row cols="grid-cols-1 md:grid-cols-2">
          <FormRow label="Supervisor Name">
            <Input
              type="text"
              readOnly
              value={formData.supervisorName || ""}
              className="bg-gray-100"
            />
          </FormRow>

          <FormRow label="Length of Time Supervised">
            <Input
              type="text"
              value={formData.lengthOfTimeSupervised}
              onChange={(e) =>
                handleFormChange("lengthOfTimeSupervised", e.target.value)
              }
              placeholder="e.g., 1 year"
              disabled={!isAdmin && !isSupervisor}
            />
          </FormRow>
        </Row>
      </div>

      {/* Section 2: Performance Objectives */}
      <div className="rounded-lg p-4 border bg-gray-50 border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-300">
          SECTION 2: PERFORMANCE OBJECTIVES
        </h3>

        {formData.objectives && formData.objectives.length > 0 ? (
          <div className="space-y-4">
            {formData.objectives.map((obj, index) => (
              <div key={index} className="p-3 bg-white rounded-lg border">
                <div className="font-medium text-gray-700 mb-2">
                  Objective {index + 1}:{" "}
                  {obj.objective || `Objective ${index + 1}`}
                </div>
                <Row cols="grid-cols-1 md:grid-cols-2">
                  <FormRow label="Employee Rating">
                    <Select
                      id={`emp-rating-${index}`}
                      customLabel="Select Rating"
                      value={obj.employeeRating || ""}
                      onChange={(value) =>
                        handleObjectiveRatingChange(
                          index,
                          "employeeRating",
                          value
                        )
                      }
                      options={[
                        { id: "Achieved", name: "Achieved (3 pts)" },
                        {
                          id: "Partly Achieved",
                          name: "Partly Achieved (2 pts)",
                        },
                        { id: "Not Achieved", name: "Not Achieved (0 pts)" },
                      ]}
                      disabled={!isStaff && !isAdmin}
                    />
                  </FormRow>

                  <FormRow label="Supervisor Rating">
                    <Select
                      id={`sup-rating-${index}`}
                      customLabel="Select Rating"
                      value={obj.supervisorRating || ""}
                      onChange={(value) =>
                        handleObjectiveRatingChange(
                          index,
                          "supervisorRating",
                          value
                        )
                      }
                      options={[
                        { id: "Achieved", name: "Achieved (3 pts)" },
                        {
                          id: "Partly Achieved",
                          name: "Partly Achieved (2 pts)",
                        },
                        { id: "Not Achieved", name: "Not Achieved (0 pts)" },
                      ]}
                      disabled={!isSupervisor && !isAdmin}
                    />
                  </FormRow>
                </Row>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic text-center py-4">
            No objectives found
          </p>
        )}

        {/* Safeguarding Section */}
        <div className="mt-6 p-4 bg-white rounded-lg border">
          <h4 className="font-semibold text-gray-700 mb-3">Safeguarding</h4>

          <FormRow label="What have you done to promote a safer culture?">
            <textarea
              className="border-2 h-20 rounded-lg focus:outline-none p-3 w-full"
              value={
                (formData.safeguarding as SafeguardingType)?.actionsTaken || ""
              }
              onChange={(e) =>
                handleSafeguardingChange("actionsTaken", e.target.value)
              }
              placeholder="I followed due process and protocols..."
              disabled={!isStaff && !isAdmin}
            />
          </FormRow>

          <FormRow label="Have you completed the safeguarding training?">
            <div className="flex space-x-4">
              {["Yes", "Partly", "No"].map((option) => (
                <label key={option} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="trainingCompleted"
                    value={option}
                    checked={
                      (formData.safeguarding as SafeguardingType)
                        ?.trainingCompleted === option
                    }
                    onChange={(e) =>
                      handleSafeguardingChange(
                        "trainingCompleted",
                        e.target.value as "Yes" | "Partly" | "No"
                      )
                    }
                    className="h-4 w-4"
                    disabled={!isStaff && !isAdmin}
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </FormRow>

          <FormRow label="Areas not understood">
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={areasNotUnderstoodInput}
                  onChange={(e) => setAreasNotUnderstoodInput(e.target.value)}
                  placeholder="Add an area you don't understand"
                  className="flex-1"
                  disabled={!isStaff && !isAdmin}
                />
                <Button
                  type="button"
                  onClick={addAreaNotUnderstood}
                  size="small"
                  disabled={!isStaff && !isAdmin}
                >
                  Add
                </Button>
              </div>
              {(
                formData.safeguarding as SafeguardingType
              )?.areasNotUnderstood?.map((area, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between bg-gray-100 p-2 rounded"
                >
                  <span>{area}</span>
                  <button
                    type="button"
                    onClick={() => removeAreaNotUnderstood(idx)}
                    className="text-red-500 hover:text-red-700"
                    disabled={!isStaff && !isAdmin}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </FormRow>
        </div>
      </div>

      {/* Section 3: Performance Areas */}
      <div className="rounded-lg p-4 border bg-gray-50 border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-300">
          SECTION 3: SUPERVISOR'S ASSESSMENT
        </h3>

        <div className="space-y-3">
          {formData.performanceAreas?.map((area, index) => (
            <div
              key={index}
              className="flex flex-col md:flex-row md:items-center md:justify-between p-3 bg-white rounded-lg"
            >
              <span className="font-medium text-gray-700 mb-2 md:mb-0">
                {area.area}:
              </span>
              <Select
                id={`area-${index}`}
                customLabel=""
                value={area.rating}
                onChange={(value) => handlePerformanceAreaChange(index, value)}
                options={[
                  { id: "Needs Improvement", name: "Needs Improvement" },
                  { id: "Meets Expectations", name: "Meets Expectations" },
                  { id: "Exceeds Expectations", name: "Exceeds Expectations" },
                ]}
                className="w-full md:w-64"
                disabled={!isSupervisor && !isAdmin}
              />
            </div>
          ))}
        </div>

        <FormRow label="Supervisor's Comments" className="mt-4">
          <textarea
            className="border-2 h-24 rounded-lg focus:outline-none p-3 w-full"
            value={formData.supervisorComments}
            onChange={(e) =>
              handleFormChange("supervisorComments", e.target.value)
            }
            placeholder="Enter supervisor's comments..."
            disabled={!isSupervisor && !isAdmin}
          />
        </FormRow>

        <FormRow label="Overall Assessment" className="mt-4">
          <Select
            id="overallRating"
            customLabel="Select Overall Rating"
            value={formData.overallRating || ""}
            onChange={(value) => handleFormChange("overallRating", value)}
            options={[
              { id: "Meets Requirements", name: "Meets Requirements" },
              {
                id: "Partly Meets Requirements",
                name: "Partly Meets Requirements",
              },
              {
                id: "Does Not Meet Requirements",
                name: "Does Not Meet Requirements",
              },
            ]}
            disabled={!isSupervisor && !isAdmin}
          />
        </FormRow>
      </div>

      {/* Section 4: Future Goals */}
      <div className="rounded-lg p-4 border bg-gray-50 border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-300">
          SECTION 4: FUTURE GOALS
        </h3>

        <FormRow label="Future Goals for next appraisal period">
          <textarea
            className="border-2 h-24 rounded-lg focus:outline-none p-3 w-full"
            value={formData.futureGoals}
            onChange={(e) => handleFormChange("futureGoals", e.target.value)}
            placeholder="Enter future goals..."
            disabled={!isStaff && !isAdmin}
          />
        </FormRow>
      </div>

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
          <Button type="submit" size="medium" disabled={isUpdating}>
            {isUpdating ? <SpinnerMini /> : "Update Appraisal"}
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
        <span className="font-semibold uppercase">{appraisal.status}</span>
        {appraisal.status === "completed" && (
          <span className="ml-2 text-green-600">
            (Completed on{" "}
            {appraisal.completedAt
              ? new Date(appraisal.completedAt).toLocaleDateString()
              : ""}
            )
          </span>
        )}
      </div>
    </form>
  );
};

export default FormEditAppraisal;
