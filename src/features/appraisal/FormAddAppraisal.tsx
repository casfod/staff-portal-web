// src/features/appraisal/FormAddAppraisal.tsx
import { useState, useEffect, useCallback, useMemo } from "react";
import { AppraisalType, ObjectiveRatingType } from "../../interfaces";
import FormRow from "../../ui/FormRow";
import Input from "../../ui/Input";
import Row from "../../ui/Row";
import SpinnerMini from "../../ui/SpinnerMini";
import Select from "../../ui/Select";
import Button from "../../ui/Button";
import { FileUpload } from "../../ui/FileUpload";
import { useSaveAppraisalDraft } from "./Hooks/useAppraisal";
import { useSubmitAppraisal } from "./Hooks/useAppraisal";
import { localStorageUser } from "../../utils/localStorageUser";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useStaffStrategies } from "../staff-strategy/Hooks/useStaffStrategy";
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  FileText,
  AlertCircle,
  Save,
  Send,
} from "lucide-react";

// Types
interface SafeguardingType {
  actionsTaken: string;
  trainingCompleted: "Yes" | "Partly" | "No";
  areasNotUnderstood: string[];
}

interface FormErrors {
  [key: string]: string;
}

// Constants
const PERFORMANCE_AREAS = [
  { area: "Job Knowledge", rating: "Meets Expectations" },
  { area: "Judgement", rating: "Meets Expectations" },
  { area: "Reliability", rating: "Meets Expectations" },
  { area: "Quality & Quantity of Work", rating: "Meets Expectations" },
  {
    area: "Interpersonal and Communication Skills",
    rating: "Meets Expectations",
  },
  { area: "Teamwork", rating: "Meets Expectations" },
];

const APPRAISAL_PERIODS = [
  { id: "January - March", name: "January - March (Q1)" },
  { id: "April - June", name: "April - June (Q2)" },
  { id: "July - September", name: "July - September (Q3)" },
  { id: "October - December", name: "October - December (Q4)" },
];

const RATING_OPTIONS = [
  { id: "Achieved", name: "Achieved (3 pts)" },
  { id: "Partly Achieved", name: "Partly Achieved (2 pts)" },
  { id: "Not Achieved", name: "Not Achieved (0 pts)" },
];

const OVERALL_RATINGS = [
  { id: "Meets Requirements", name: "Meets Requirements" },
  { id: "Partly Meets Requirements", name: "Partly Meets Requirements" },
  { id: "Does Not Meet Requirements", name: "Does Not Meet Requirements" },
];

const FormAddAppraisal = () => {
  const currentUser = localStorageUser();
  const navigate = useNavigate();

  // State
  const [formData, setFormData] = useState<Partial<AppraisalType>>(() => ({
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
    performanceAreas: PERFORMANCE_AREAS,
    supervisorComments: "",
    overallRating: "Meets Requirements",
    futureGoals: "",
    staffStrategy: null,
    signatures: {
      staffSignature: false,
      supervisorSignature: false,
    },
  }));

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [showStaffStrategies, setShowStaffStrategies] = useState(false);
  const [selectedStrategyId, setSelectedStrategyId] = useState<string>("");
  const [areasNotUnderstoodInput, setAreasNotUnderstoodInput] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Queries
  const { data: strategiesData, isLoading: isLoadingStrategies } =
    useStaffStrategies({
      search: "",
      sort: "-createdAt",
      page: 1,
      limit: 100,
    });

  const { saveAppraisalDraft, isPending: isSaving } = useSaveAppraisalDraft({
    redirectToList: false,
  });

  const { submitAppraisal, isPending: isSubmitting } = useSubmitAppraisal({
    redirectToList: true,
  });

  // Memoized values
  const availableStrategies = useMemo(() => {
    if (!strategiesData?.strategies || !formData.appraisalPeriod) return [];
    return strategiesData.strategies.filter(
      (strategy: any) => strategy.period === formData.appraisalPeriod
    );
  }, [formData.appraisalPeriod, strategiesData]);

  const isFormValid = useMemo(() => {
    return (
      formData.department &&
      formData.appraisalPeriod &&
      selectedStrategyId &&
      formData.objectives &&
      formData.objectives.length > 0
    );
  }, [
    formData.department,
    formData.appraisalPeriod,
    selectedStrategyId,
    formData.objectives,
  ]);

  // Validation
  const validateField = useCallback((name: string, value: any): string => {
    switch (name) {
      case "department":
        return !value ? "Department is required" : "";
      case "appraisalPeriod":
        return !value ? "Appraisal period is required" : "";
      case "staffStrategy":
        return !value ? "Please select a staff strategy" : "";
      default:
        return "";
    }
  }, []);

  const validateForm = useCallback(() => {
    const newErrors: FormErrors = {};

    if (!formData.department) newErrors.department = "Department is required";
    if (!formData.appraisalPeriod)
      newErrors.appraisalPeriod = "Appraisal period is required";
    if (!selectedStrategyId)
      newErrors.staffStrategy = "Please select a staff strategy";
    if (!formData.objectives || formData.objectives.length === 0) {
      newErrors.objectives = "Please load objectives from a strategy";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [
    formData.department,
    formData.appraisalPeriod,
    selectedStrategyId,
    formData.objectives,
  ]);

  // Handlers
  const handleBlur = useCallback(
    (field: string) => {
      setTouched((prev) => ({ ...prev, [field]: true }));
      const error = validateField(
        field,
        formData[field as keyof AppraisalType]
      );
      setErrors((prev) => ({ ...prev, [field]: error }));
    },
    [formData, validateField]
  );

  const handleFormChange = useCallback(
    (field: keyof AppraisalType, value: any) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      if (touched[field]) {
        const error = validateField(field, value);
        setErrors((prev) => ({ ...prev, [field]: error }));
      }
    },
    [touched, validateField]
  );

  const loadObjectivesFromStrategy = useCallback(
    (strategyId: string) => {
      const strategy = availableStrategies.find((s) => s.id === strategyId);
      if (strategy?.accountabilityAreas) {
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

        setFormData((prev) => ({ ...prev, objectives: allObjectives }));
        toast.success(
          `Loaded ${allObjectives.length} objectives from strategy`
        );

        // Clear error if any
        setErrors((prev) => ({ ...prev, objectives: "" }));
      }
    },
    [availableStrategies]
  );

  const handleObjectiveRatingChange = useCallback(
    (
      index: number,
      field: "employeeRating" | "supervisorRating",
      value: string
    ) => {
      setFormData((prev) => {
        const updatedObjectives = [...(prev.objectives || [])];
        updatedObjectives[index] = {
          ...updatedObjectives[index],
          [field]: value,
        };
        return { ...prev, objectives: updatedObjectives };
      });
    },
    []
  );

  const handlePerformanceAreaChange = useCallback(
    (index: number, value: string) => {
      setFormData((prev) => {
        const updatedAreas = [...(prev.performanceAreas || [])];
        updatedAreas[index] = {
          ...updatedAreas[index],
          rating: value as any,
        };
        return { ...prev, performanceAreas: updatedAreas };
      });
    },
    []
  );

  const handleSafeguardingChange = useCallback(
    (field: keyof SafeguardingType, value: any) => {
      setFormData((prev) => ({
        ...prev,
        safeguarding: {
          ...(prev.safeguarding as SafeguardingType),
          [field]: value,
        },
      }));
    },
    []
  );

  const addAreaNotUnderstood = useCallback(() => {
    if (areasNotUnderstoodInput.trim()) {
      setFormData((prev) => {
        const currentAreas =
          (prev.safeguarding as SafeguardingType)?.areasNotUnderstood || [];
        return {
          ...prev,
          safeguarding: {
            ...(prev.safeguarding as SafeguardingType),
            areasNotUnderstood: [
              ...currentAreas,
              areasNotUnderstoodInput.trim(),
            ],
          },
        };
      });
      setAreasNotUnderstoodInput("");
    }
  }, [areasNotUnderstoodInput]);

  const removeAreaNotUnderstood = useCallback((index: number) => {
    setFormData((prev) => {
      const currentAreas =
        (prev.safeguarding as SafeguardingType)?.areasNotUnderstood || [];
      return {
        ...prev,
        safeguarding: {
          ...(prev.safeguarding as SafeguardingType),
          areasNotUnderstood: currentAreas.filter((_, i) => i !== index),
        },
      };
    });
  }, []);

  const handleSaveDraft = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      if (!validateForm()) {
        toast.error("Please fill in all required fields");
        return;
      }

      saveAppraisalDraft({ ...formData, staffStrategy: selectedStrategyId });
    },
    [formData, selectedStrategyId, saveAppraisalDraft, validateForm]
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      if (!validateForm()) {
        toast.error("Please fill in all required fields");
        return;
      }

      submitAppraisal({ ...formData, staffStrategy: selectedStrategyId });
    },
    [formData, selectedStrategyId, submitAppraisal, validateForm]
  );

  // Check profile completion
  if (!currentUser?.employmentInfo?.isProfileComplete) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
        <span className="text-amber-600 font-semibold text-lg">
          Please complete your employment info to access appraisal form.
        </span>
        <div className="mt-4">
          <Button
            onClick={() => navigate("/human-resources/staff-information")}
          >
            Complete Profile
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit} noValidate>
      {/* Section 1: Staff Information */}
      <div className="rounded-lg p-4 border bg-white border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-300 flex items-center">
          <FileText className="h-5 w-5 mr-2" />
          SECTION 1: STAFF INFORMATION
        </h3>

        <Row cols="grid-cols-1 md:grid-cols-2">
          <FormRow
            label="Department *"
            error={touched.department ? errors.department : undefined}
          >
            <Input
              type="text"
              required
              value={formData.department}
              onChange={(e) => handleFormChange("department", e.target.value)}
              onBlur={() => handleBlur("department")}
              placeholder="Enter department"
              className={
                errors.department && touched.department ? "border-red-500" : ""
              }
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
          <FormRow
            label="Appraisal Period *"
            error={touched.appraisalPeriod ? errors.appraisalPeriod : undefined}
          >
            <Select
              id="appraisalPeriod"
              customLabel="Select Period"
              value={formData.appraisalPeriod || ""}
              onChange={(value) => handleFormChange("appraisalPeriod", value)}
              onBlur={() => handleBlur("appraisalPeriod")}
              options={APPRAISAL_PERIODS}
              required
              className={
                errors.appraisalPeriod && touched.appraisalPeriod
                  ? "border-red-500"
                  : ""
              }
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
                  <FormRow
                    label="Select Strategy *"
                    error={
                      touched.staffStrategy ? errors.staffStrategy : undefined
                    }
                  >
                    <Select
                      id="strategySelect"
                      customLabel="Select a strategy to load objectives"
                      value={selectedStrategyId}
                      onChange={(value) => {
                        setSelectedStrategyId(value);
                        loadObjectivesFromStrategy(value);
                        if (touched.staffStrategy) {
                          setErrors((prev) => ({ ...prev, staffStrategy: "" }));
                        }
                      }}
                      onBlur={() => handleBlur("staffStrategy")}
                      options={availableStrategies.map((s) => ({
                        id: s.id,
                        name: `${s.strategyCode} - ${s.department}`,
                      }))}
                      className={
                        errors.staffStrategy && touched.staffStrategy
                          ? "border-red-500"
                          : ""
                      }
                    />
                  </FormRow>
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
      <div className="rounded-lg p-4 border bg-white border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-300">
          SECTION 2: PERFORMANCE OBJECTIVES
        </h3>

        {formData.objectives && formData.objectives.length > 0 ? (
          <div className="space-y-4">
            {formData.objectives.map((obj, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg border">
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
                      options={RATING_OPTIONS}
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
                      options={RATING_OPTIONS}
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
            <div className="flex flex-wrap gap-4">
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
                        e.target.value as any
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
                  onKeyPress={(e) =>
                    e.key === "Enter" &&
                    (e.preventDefault(), addAreaNotUnderstood())
                  }
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
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => removeAreaNotUnderstood(idx)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ×
                  </Button>
                </div>
              ))}
            </div>
          </FormRow>
        </div>
      </div>

      {/* Section 3: Performance Areas */}
      <div className="rounded-lg p-4 border bg-white border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-300">
          SECTION 3: SUPERVISOR'S ASSESSMENT
        </h3>

        <div className="space-y-3">
          {formData.performanceAreas?.map((area, index) => (
            <div
              key={index}
              className="flex flex-col md:flex-row md:items-center md:justify-between p-3 bg-gray-50 rounded-lg"
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
            options={OVERALL_RATINGS}
          />
        </FormRow>
      </div>

      {/* Section 4: Future Goals */}
      <div className="rounded-lg p-4 border bg-white border-gray-200 shadow-sm">
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
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            type="button"
            size="medium"
            variant="secondary"
            disabled={isSaving}
            onClick={handleSaveDraft}
            className="min-w-[140px]"
          >
            {isSaving ? (
              <SpinnerMini />
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Draft
              </>
            )}
          </Button>

          <Button
            type="submit"
            size="medium"
            disabled={isSubmitting || !isFormValid}
            className="min-w-[140px]"
          >
            {isSubmitting ? (
              <SpinnerMini />
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Create Appraisal
              </>
            )}
          </Button>

          <Button
            type="button"
            size="medium"
            variant="secondary"
            onClick={() => navigate(-1)}
          >
            Cancel
          </Button>
        </div>
      </div>

      {/* Form Status */}
      {!isFormValid && (
        <p className="text-center text-sm text-amber-600">
          Please complete all required fields (*) to create appraisal
        </p>
      )}
    </form>
  );
};

export default FormAddAppraisal;
