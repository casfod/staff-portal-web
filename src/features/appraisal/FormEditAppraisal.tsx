// src/features/appraisal/FormEditAppraisal.tsx
import { useState, useEffect, useMemo, useCallback } from "react";
import {
  AppraisalType,
  ObjectiveRatingType,
  SafeguardingType,
  PerformanceAreaType,
} from "../../interfaces";
import FormRow from "../../ui/FormRow";
import Input from "../../ui/Input";
import Row from "../../ui/Row";
import SpinnerMini from "../../ui/SpinnerMini";
import Select from "../../ui/Select";
import Button from "../../ui/Button";
import { FileUpload } from "../../ui/FileUpload";
import {
  useUpdateAppraisal,
  useSubmitExistingAppraisal,
} from "./Hooks/useAppraisal";
import { localStorageUser } from "../../utils/localStorageUser";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  AlertCircle,
  User,
  UserCog,
  Clock,
  Send,
  Save,
  Calendar,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { useStaffStrategies } from "../staff-strategy/Hooks/useStaffStrategy";
import toast from "react-hot-toast";
import { FormErrors } from "./FormAddAppraisal";

// Constants (same as FormAddAppraisal)
const PERFORMANCE_AREAS: PerformanceAreaType[] = [
  { area: "Job Knowledge", rating: "Pending" },
  { area: "Judgement", rating: "Pending" },
  { area: "Reliability", rating: "Pending" },
  { area: "Quality & Quantity of Work", rating: "Pending" },
  {
    area: "Interpersonal and Communication Skills",
    rating: "Pending",
  },
  { area: "Teamwork", rating: "Pending" },
];

const APPRAISAL_PERIODS = [
  { id: "January - March", name: "January - March (Q1)" },
  { id: "April - June", name: "April - June (Q2)" },
  { id: "July - September", name: "July - September (Q3)" },
  { id: "October - December", name: "October - December (Q4)" },
];

const RATING_OPTIONS = [
  { id: "", name: "Select Rating" },
  { id: "Achieved", name: "Achieved (3 pts)" },
  { id: "Partly Achieved", name: "Partly Achieved (2 pts)" },
  { id: "Not Achieved", name: "Not Achieved (0 pts)" },
];

const OVERALL_RATINGS = [
  { id: "Pending", name: "Pending" },
  { id: "Meets Requirements", name: "Meets Requirements" },
  { id: "Partly Meets Requirements", name: "Partly Meets Requirements" },
  { id: "Does Not Meet Requirements", name: "Does Not Meet Requirements" },
];

interface FormEditAppraisalProps {
  appraisal: AppraisalType | null;
}

const FormEditAppraisal = ({ appraisal }: FormEditAppraisalProps) => {
  const currentUser = localStorageUser();
  const navigate = useNavigate();

  // Determine user role and relationships
  const isAdmin = ["SUPER-ADMIN", "ADMIN"].includes(currentUser?.role || "");
  const currentUserId = currentUser?.id;

  // Check if current user is the staff member or supervisor for THIS appraisal
  const isStaff = appraisal?.staffId?.id === currentUserId;
  const isSupervisor = appraisal?.supervisorId?.id === currentUserId;

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
    performanceAreas: PERFORMANCE_AREAS, // Initialize with default performance areas
    supervisorComments: "",
    overallRating: "Pending",
    futureGoals: "",
    signatures: {
      staffSignature: false,
      supervisorSignature: false,
    },
  });

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [showStaffStrategies, setShowStaffStrategies] = useState(true);
  const [areasNotUnderstoodInput, setAreasNotUnderstoodInput] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [selectedStrategyId, setSelectedStrategyId] = useState<string>("");

  const { data: strategiesData, isLoading: isLoadingStrategies } =
    useStaffStrategies({
      search: "",
      sort: "-createdAt",
      page: 1,
      limit: 100,
    });

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
        performanceAreas: appraisal.performanceAreas || PERFORMANCE_AREAS,
        supervisorComments: appraisal.supervisorComments || "",
        overallRating: appraisal.overallRating || "Pending",
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

  const { submitExistingAppraisal, isPending: isSubmitting } =
    useSubmitExistingAppraisal();

  const availableStrategies = useMemo(() => {
    if (!strategiesData?.data?.strategies || !formData.appraisalPeriod)
      return [];
    return strategiesData.data.strategies.filter(
      (strategy: any) => strategy.period === formData.appraisalPeriod
    );
  }, [formData.appraisalPeriod, strategiesData]);

  // Validation
  const validateField = (name: string, value: any): string => {
    switch (name) {
      case "department":
        return !value ? "Department is required" : "";
      case "appraisalPeriod":
        return !value ? "Appraisal period is required" : "";
      default:
        return "";
    }
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateField(field, formData[field as keyof AppraisalType]);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleFormChange = (field: keyof AppraisalType, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (touched[field]) {
      const error = validateField(field, value);
      setErrors((prev) => ({ ...prev, [field]: error }));
    }
  };

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

        setErrors((prev) => ({ ...prev, objectives: "" }));
      }
    },
    [availableStrategies]
  );

  const validateForm = useCallback(() => {
    const newErrors: FormErrors = {};

    if (!formData.department) newErrors.department = "Department is required";
    if (!formData.appraisalPeriod)
      newErrors.appraisalPeriod = "Appraisal period is required";
    if (!formData.objectives || formData.objectives.length === 0) {
      newErrors.objectives = "Please load objectives from a strategy";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData.department, formData.appraisalPeriod, formData.objectives]);

  const handleObjectiveRatingChange = (
    index: number,
    field: "employeeRating" | "supervisorRating",
    value: string
  ) => {
    setFormData((prev) => {
      const updatedObjectives = [...(prev.objectives || [])];
      updatedObjectives[index] = {
        ...updatedObjectives[index],
        [field]: value,
        // Update points based on rating
        ...(field === "employeeRating" && {
          employeePoints:
            value === "Achieved" ? 3 : value === "Partly Achieved" ? 2 : 0,
        }),
        ...(field === "supervisorRating" && {
          supervisorPoints:
            value === "Achieved" ? 3 : value === "Partly Achieved" ? 2 : 0,
          supervisorRatingStatus: value ? "completed" : "pending",
        }),
      };
      return { ...prev, objectives: updatedObjectives };
    });
  };

  const handlePerformanceAreaChange = (index: number, value: string) => {
    setFormData((prev) => {
      const updatedAreas = [...(prev.performanceAreas || [])];
      updatedAreas[index] = {
        ...updatedAreas[index],
        rating: value as
          | "Pending"
          | "Needs Improvement"
          | "Meets Expectations"
          | "Exceeds Expectations",
        supervisorStatus:
          value && value !== "Pending" ? "completed" : "pending",
      };
      return { ...prev, performanceAreas: updatedAreas };
    });
  };

  const handleSafeguardingChange = (
    field: keyof SafeguardingType,
    value: any
  ) => {
    setFormData((prev) => ({
      ...prev,
      safeguarding: {
        ...(prev.safeguarding as SafeguardingType),
        [field]: value,
        ...(isSupervisor && {
          supervisorStatus: "completed",
        }),
      },
    }));
  };

  const addAreaNotUnderstood = () => {
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
  };

  const removeAreaNotUnderstood = (index: number) => {
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
  };

  // Check editability based on role and status
  const requestStatus = appraisal?.status;

  // FIXED: For draft status - staff should have same experience as FormAddAppraisal
  // For pending status - supervisors can do their part
  const isDraft = requestStatus === "draft";
  const isPending = requestStatus === "pending";

  // Staff can edit everything in draft mode (same as FormAddAppraisal)
  const canStaffEditDraft = isStaff && isDraft;

  // Staff cannot edit in pending mode (waiting for supervisor)
  const canStaffViewOnly = isStaff && isPending;

  // Supervisors can edit their sections in pending mode
  const canSupervisorEdit = isSupervisor && isPending;

  // Admins can edit everything in both draft and pending
  const canAdminEdit = isAdmin && (isDraft || isPending);

  // Overall edit permission
  const canEdit = canStaffEditDraft || canSupervisorEdit || canAdminEdit;

  // Can submit - only staff in draft mode
  const canSubmit = isStaff && isDraft;

  const isFormValid = useMemo(() => {
    // For draft, only basic info is required
    if (isDraft) {
      return formData.department && formData.appraisalPeriod;
    }
    // For pending, more validation might be needed
    return true;
  }, [formData.department, formData.appraisalPeriod, isDraft]);

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.department) {
      setErrors((prev) => ({ ...prev, department: "Department is required" }));
      setTouched((prev) => ({ ...prev, department: true }));
      return;
    }

    if (!formData.appraisalPeriod) {
      setErrors((prev) => ({
        ...prev,
        appraisalPeriod: "Appraisal period is required",
      }));
      setTouched((prev) => ({ ...prev, appraisalPeriod: true }));
      return;
    }

    updateAppraisal({ data: formData, files: selectedFiles });
  };

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      if (!validateForm()) {
        toast.error("Please fill in all required fields");
        return;
      }

      submitExistingAppraisal(appraisal?.id || "");
    },
    [appraisal?.id, submitExistingAppraisal, validateForm]
  );

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

  if (!canEdit && !canStaffViewOnly) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
        <p className="text-lg text-gray-600">
          This appraisal cannot be edited because it is{" "}
          <span className="font-semibold uppercase">{appraisal.status}</span>
          {appraisal.status === "approved" && " and has been approved."}
          {appraisal.status === "rejected" && " and has been rejected."}
        </p>
        <p className="text-sm text-gray-500 mt-2">
          {isStaff && isPending
            ? "Your appraisal is under review by your supervisor."
            : "Only draft or pending appraisals can be edited."}
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
    <form className="space-y-6" onSubmit={handleUpdate} noValidate>
      {/* Role and Status Indicator */}
      <div className="flex items-center gap-2 mb-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
        {isStaff && (
          <>
            <User className="h-5 w-5 text-blue-600" />
            <span className="text-sm text-blue-800">
              You are {canStaffEditDraft ? "editing" : "viewing"} as:{" "}
              <span className="font-semibold">Staff Member</span>
              {canStaffViewOnly && (
                <span className="ml-2 text-xs text-amber-600">
                  (View only - under supervisor review)
                </span>
              )}
            </span>
          </>
        )}
        {isSupervisor && (
          <>
            <UserCog className="h-5 w-5 text-green-600" />
            <span className="text-sm text-green-800">
              You are editing as:{" "}
              <span className="font-semibold">Supervisor</span>
            </span>
          </>
        )}
        {isAdmin && !isStaff && !isSupervisor && (
          <>
            <UserCog className="h-5 w-5 text-purple-600" />
            <span className="text-sm text-purple-800">
              You are editing as: <span className="font-semibold">Admin</span>
            </span>
          </>
        )}
        <div className="ml-auto flex items-center gap-1">
          <Clock className="h-4 w-4 text-gray-500" />
          <span className="text-xs text-gray-600">
            Status:{" "}
            <span className="font-semibold uppercase">{appraisal.status}</span>
          </span>
        </div>
      </div>

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
              disabled={!canStaffEditDraft && !canAdminEdit}
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
              disabled={!canStaffEditDraft && !canAdminEdit}
            />
          </FormRow>
        </Row>

        <Row cols="grid-cols-1 md:grid-cols-2">
          <FormRow
            label="Appraisal Period *"
            error={touched.appraisalPeriod ? errors.appraisalPeriod : undefined}
          >
            {canStaffEditDraft || canAdminEdit ? (
              <Select
                id="appraisalPeriod"
                customLabel="Select Period"
                value={formData.appraisalPeriod || ""}
                onChange={(value) => handleFormChange("appraisalPeriod", value)}
                options={APPRAISAL_PERIODS}
                required
                className={
                  errors.appraisalPeriod && touched.appraisalPeriod
                    ? "border-red-500"
                    : ""
                }
              />
            ) : (
              <Input
                type="text"
                value={formData.appraisalPeriod}
                disabled
                className="bg-gray-100"
              />
            )}
          </FormRow>

          <FormRow label="Date of Appraisal">
            <Input
              type="date"
              value={formData.dateOfAppraisal}
              onChange={(e) =>
                handleFormChange("dateOfAppraisal", e.target.value)
              }
              disabled={!canStaffEditDraft && !canAdminEdit}
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
              disabled={!canStaffEditDraft && !canAdminEdit}
            />
          </FormRow>
        </Row>
      </div>

      {/* Staff Strategy Integration - Only for staff in draft mode (same as FormAddAppraisal) */}
      {isStaff && isDraft && formData.appraisalPeriod && (
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
                    label="Select Strategy"
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
                  {/* Employee Rating - editable by staff in draft, view-only in pending */}
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
                      disabled={!canStaffEditDraft && !canAdminEdit}
                    />
                    {canStaffEditDraft && (
                      <span className="text-xs text-blue-500 ml-2">
                        (You can edit)
                      </span>
                    )}
                  </FormRow>

                  {/* Supervisor Rating - visible and editable only by supervisor or admin in pending mode */}
                  {(isSupervisor || isAdmin) && isPending && (
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
                        disabled={!canSupervisorEdit && !canAdminEdit}
                      />
                      {canSupervisorEdit && (
                        <span className="text-xs text-green-500 ml-2">
                          (You can edit)
                        </span>
                      )}
                    </FormRow>
                  )}
                </Row>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic text-center py-4">
            No objectives loaded.{" "}
            {isStaff &&
              isDraft &&
              "Select a period and load from staff strategy above."}
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
              disabled={!canStaffEditDraft && !canAdminEdit}
            />
            {canStaffEditDraft && (
              <span className="text-xs text-blue-500">(You can edit)</span>
            )}
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
                        e.target.value as "Yes" | "Partly" | "No"
                      )
                    }
                    className="h-4 w-4"
                    disabled={!canStaffEditDraft && !canAdminEdit}
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
                  disabled={!canStaffEditDraft && !canAdminEdit}
                  onKeyPress={(e) =>
                    e.key === "Enter" &&
                    (e.preventDefault(), addAreaNotUnderstood())
                  }
                />
                <Button
                  type="button"
                  onClick={addAreaNotUnderstood}
                  size="small"
                  disabled={!canStaffEditDraft && !canAdminEdit}
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
                    disabled={!canStaffEditDraft && !canAdminEdit}
                  >
                    ×
                  </Button>
                </div>
              ))}
            </div>
          </FormRow>
        </div>
      </div>

      {/* Section 3: Supervisor's Assessment - Only visible to supervisors and admins in pending mode */}
      {(isSupervisor || isAdmin) && isPending && (
        <div className="rounded-lg p-4 border bg-white border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-300 flex items-center">
            <UserCog className="h-5 w-5 mr-2" />
            SECTION 3: SUPERVISOR'S ASSESSMENT
            {canSupervisorEdit && (
              <span className="text-xs text-green-500 ml-2">
                (You can edit)
              </span>
            )}
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
                  onChange={(value) =>
                    handlePerformanceAreaChange(index, value)
                  }
                  options={[
                    { id: "Pending", name: "Pending" },
                    { id: "Needs Improvement", name: "Needs Improvement" },
                    { id: "Meets Expectations", name: "Meets Expectations" },
                    {
                      id: "Exceeds Expectations",
                      name: "Exceeds Expectations",
                    },
                  ]}
                  className="w-full md:w-64"
                  disabled={!canSupervisorEdit && !canAdminEdit}
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
              disabled={!canSupervisorEdit && !canAdminEdit}
            />
            {canSupervisorEdit && (
              <span className="text-xs text-green-500">(You can edit)</span>
            )}
          </FormRow>

          <FormRow label="Overall Assessment" className="mt-4">
            <Select
              id="overallRating"
              customLabel="Select Overall Rating"
              value={formData.overallRating || ""}
              onChange={(value) => handleFormChange("overallRating", value)}
              options={OVERALL_RATINGS}
              disabled={!canSupervisorEdit && !canAdminEdit}
            />
            {canSupervisorEdit && (
              <span className="text-xs text-green-500">(You can edit)</span>
            )}
          </FormRow>
        </div>
      )}

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
            disabled={!canStaffEditDraft && !canAdminEdit}
          />
          {canStaffEditDraft && (
            <span className="text-xs text-blue-500">(You can edit)</span>
          )}
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

      {/* Action Buttons - Same as FormAddAppraisal for draft mode */}
      <div className="flex justify-center w-full gap-4 pt-6">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Save Draft button - only for staff in draft mode */}
          {canStaffEditDraft && (
            <Button
              type="submit"
              size="medium"
              variant="secondary"
              disabled={isUpdating}
              className="min-w-[140px]"
            >
              {isUpdating ? (
                <SpinnerMini />
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Draft
                </>
              )}
            </Button>
          )}

          {/* Update button for supervisors/admins */}
          {(canSupervisorEdit || canAdminEdit) && !canStaffEditDraft && (
            <Button type="submit" size="medium" disabled={isUpdating}>
              {isUpdating ? <SpinnerMini /> : "Update Appraisal"}
            </Button>
          )}

          {/* Submit button - only for staff in draft mode */}
          {canSubmit && (
            <Button
              type="button"
              size="medium"
              disabled={isSubmitting || !isFormValid}
              className="min-w-[140px]"
              onClick={handleSubmit}
            >
              {isSubmitting ? (
                <SpinnerMini />
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Appraisal
                </>
              )}
            </Button>
          )}

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
      {isDraft && !isFormValid && (
        <p className="text-center text-sm text-amber-600">
          Please complete all required fields (*) to submit appraisal
        </p>
      )}
    </form>
  );
};

export default FormEditAppraisal;
