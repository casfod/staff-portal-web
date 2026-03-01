// src/features/appraisal/FormAddAppraisal.tsx
import { useState, useEffect } from "react";
import { AppraisalType, ObjectiveRatingType } from "../../interfaces";
import FormRow from "../../ui/FormRow";
import Input from "../../ui/Input";
import Row from "../../ui/Row";
import SpinnerMini from "../../ui/SpinnerMini";
import Select from "../../ui/Select";
import Button from "../../ui/Button";
import { FileUpload } from "../../ui/FileUpload";
import { useSaveAppraisalDraft } from "./Hooks/useAppraisal";
import { localStorageUser } from "../../utils/localStorageUser";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useStaffStrategies } from "../staff-strategy/Hooks/useStaffStrategy";
import { Calendar, ChevronDown, ChevronUp, FileText } from "lucide-react";

interface SafeguardingType {
  actionsTaken: string;
  trainingCompleted: "Yes" | "Partly" | "No";
  areasNotUnderstood: string[];
}

const FormAddAppraisal = () => {
  const currentUser = localStorageUser();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<Partial<AppraisalType>>({
    staffId: currentUser?.id || "",
    staffName: `${currentUser?.first_name || ""} ${
      currentUser?.last_name || ""
    }`.trim(),
    position: currentUser?.employmentInfo?.jobDetails?.title || "",
    department: "",
    lengthOfTimeInPosition: "",
    appraisalPeriod: "",
    dateOfAppraisal: new Date().toISOString().split("T")[0],
    supervisorId: currentUser?.employmentInfo?.jobDetails?.supervisorId || "",
    supervisorName: currentUser?.employmentInfo?.jobDetails?.supervisor || "",
    lengthOfTimeSupervised: "",
    objectives: [],
    safeguarding: {
      actionsTaken: "",
      trainingCompleted: "No" as const,
      areasNotUnderstood: [],
    },
    performanceAreas: [
      { area: "Job Knowledge", rating: "Meets Expectations" },
      { area: "Judgement", rating: "Meets Expectations" },
      { area: "Reliability", rating: "Meets Expectations" },
      { area: "Quality & Quantity of Work", rating: "Meets Expectations" },
      {
        area: "Interpersonal and Communication Skills",
        rating: "Meets Expectations",
      },
      { area: "Teamwork", rating: "Meets Expectations" },
    ],
    supervisorComments: "",
    overallRating: "Meets Requirements",
    futureGoals: "",
    signatures: {
      staffSignature: false,
      supervisorSignature: false,
    },
  });

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [showStaffStrategies, setShowStaffStrategies] = useState(false);
  const [availableStrategies, setAvailableStrategies] = useState<any[]>([]);
  const [selectedStrategyId, setSelectedStrategyId] = useState<string>("");
  const [areasNotUnderstoodInput, setAreasNotUnderstoodInput] = useState("");

  // Fetch staff strategies
  const { data: strategiesData, isLoading: isLoadingStrategies } =
    useStaffStrategies({
      search: "",
      sort: "-createdAt",
      page: 1,
      limit: 100,
    });

  // Filter strategies by selected period
  useEffect(() => {
    if (strategiesData?.data?.strategies && formData.appraisalPeriod) {
      const filtered = strategiesData.data.strategies.filter(
        (strategy: any) => strategy.period === formData.appraisalPeriod
      );
      setAvailableStrategies(filtered);
    } else {
      setAvailableStrategies([]);
    }
  }, [formData.appraisalPeriod, strategiesData]);

  // Load objectives from selected strategy
  const loadObjectivesFromStrategy = (strategyId: string) => {
    const strategy = availableStrategies.find((s) => s.id === strategyId);
    if (strategy && strategy.accountabilityAreas) {
      const allObjectives: ObjectiveRatingType[] = [];

      strategy.accountabilityAreas.forEach((area: any) => {
        area.objectives.forEach((obj: any) => {
          allObjectives.push({
            objective: obj.objective,
            employeeRating: "",
            supervisorRating: "",
            employeePoints: 0,
            supervisorPoints: 0,
          });
        });
      });

      // Add safeguarding as the last objective
      allObjectives.push({
        objective: "Safeguarding",
        employeeRating: "",
        supervisorRating: "",
        employeePoints: 0,
        supervisorPoints: 0,
      });

      setFormData({ ...formData, objectives: allObjectives });
      toast.success(`Loaded ${allObjectives.length} objectives from strategy`);
    }
  };

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

  const { saveAppraisalDraft, isPending: isSaving } = useSaveAppraisalDraft();

  const handleSaveDraft = (e: React.FormEvent) => {
    e.preventDefault();
    const isFormValid = (e.target as HTMLFormElement).reportValidity();

    if (!isFormValid) return;

    saveAppraisalDraft(formData);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isFormValid = (e.target as HTMLFormElement).reportValidity();

    if (!isFormValid) return;

    if (!formData.objectives || formData.objectives.length === 0) {
      toast.error(
        "Please load objectives from a staff strategy or add them manually"
      );
      return;
    }

    saveAppraisalDraft(formData);
  };

  if (!currentUser?.employmentInfo?.isProfileComplete) {
    return (
      <div className="text-center py-8">
        <span className="text-amber-600 font-extrabold">
          <span className="text-2xl">⚠️</span>
          Please complete your employment info to access appraisal form.
          <span
            onClick={() => navigate("/human-resources/staff-information")}
            className="underline hover:text-blue-600 cursor-pointer ml-2"
          >
            Click here
          </span>
        </span>
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
            />
          </FormRow>
        </Row>

        <Row cols="grid-cols-1 md:grid-cols-2">
          <FormRow label="Appraisal Period *">
            <Select
              id="appraisalPeriod"
              customLabel="Select Period"
              value={formData.appraisalPeriod || ""}
              onChange={(value) => handleFormChange("appraisalPeriod", value)}
              options={[
                { id: "January - March", name: "January - March (Q1)" },
                { id: "April - June", name: "April - June (Q2)" },
                { id: "July - September", name: "July - September (Q3)" },
                { id: "October - December", name: "October - December (Q4)" },
              ]}
              required
            />
          </FormRow>

          <FormRow label="Date of Appraisal">
            <Input
              type="date"
              value={formData.dateOfAppraisal}
              onChange={(e) =>
                handleFormChange("dateOfAppraisal", e.target.value)
              }
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
            />
          </FormRow>
        </Row>
      </div>

      {/* Staff Strategy Integration */}
      {formData.appraisalPeriod && (
        <div className="rounded-lg p-4 border bg-blue-50 border-blue-200">
          <div
            className="flex justify-between items-center cursor-pointer"
            onClick={() => setShowStaffStrategies(!showStaffStrategies)}
          >
            <h3 className="text-lg font-semibold text-blue-800 flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Load Objectives from Staff Strategy
            </h3>
            {showStaffStrategies ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </div>

          {showStaffStrategies && (
            <div className="mt-4 space-y-4">
              {isLoadingStrategies ? (
                <div className="flex justify-center py-4">
                  <SpinnerMini />
                </div>
              ) : availableStrategies.length > 0 ? (
                <>
                  <Select
                    id="strategySelect"
                    customLabel="Select a strategy to load objectives"
                    value={selectedStrategyId}
                    onChange={(value) => {
                      setSelectedStrategyId(value);
                      loadObjectivesFromStrategy(value);
                    }}
                    options={availableStrategies.map((s) => ({
                      id: s.id,
                      name: `${s.strategyCode} - ${s.department}`,
                    }))}
                  />
                  <p className="text-xs text-gray-600">
                    This will populate Section 2 with all objectives from the
                    selected strategy. Safeguarding will be added as the final
                    objective.
                  </p>
                </>
              ) : (
                <p className="text-gray-600">
                  No staff strategies found for period{" "}
                  {formData.appraisalPeriod}. You can still create objectives
                  manually below.
                </p>
              )}
            </div>
          )}
        </div>
      )}

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
                    />
                  </FormRow>
                </Row>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic text-center py-4">
            No objectives loaded. Select a period and load from staff strategy
            above.
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
                />
                <Button
                  type="button"
                  onClick={addAreaNotUnderstood}
                  size="small"
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
          <Button
            type="button"
            size="medium"
            variant="secondary"
            disabled={isSaving}
            onClick={handleSaveDraft}
          >
            {isSaving ? <SpinnerMini /> : "Save as Draft"}
          </Button>

          <Button type="submit" size="medium" disabled={isSaving}>
            {isSaving ? <SpinnerMini /> : "Create Appraisal"}
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

export default FormAddAppraisal;
