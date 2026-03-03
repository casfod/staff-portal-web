// src/features/appraisal/FormEditAppraisal.tsx
import { useState, useEffect, useMemo, useCallback } from "react";
import { AppraisalType, ObjectiveRatingType } from "../../interfaces";
import FormRow from "../../ui/FormRow";
import Input from "../../ui/Input";
import Row from "../../ui/Row";
import SpinnerMini from "../../ui/SpinnerMini";
import Select from "../../ui/Select";
import Button from "../../ui/Button";
import { FileUpload } from "../../ui/FileUpload";
import {
  useCreateAndSubmitAppraisal,
  useUpdateAppraisal,
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
  Calendar,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { useStaffStrategies } from "../staff-strategy/Hooks/useStaffStrategy";
import toast from "react-hot-toast";
import { FormErrors } from "./FormAddAppraisal";

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

  // FIXED: Determine user role and relationships
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
      trainingCompleted: "No" as const,
      areasNotUnderstood: [],
    },
    performanceAreas: [],
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
        performanceAreas: appraisal.performanceAreas || [],
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

  const { createAndSubmitAppraisal, isPending: isSubmitting } =
    useCreateAndSubmitAppraisal();

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

        // Clear error if any
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

  // FIXED: Role-based edit permissions with correct status mapping
  const canEditStaffSections =
    isStaff && (requestStatus === "draft" || requestStatus === "pending");
  const canEditSupervisorSections = isSupervisor && requestStatus === "pending";
  const canEditAdmin =
    isAdmin && (requestStatus === "draft" || requestStatus === "pending");

  const canSend = isStaff && requestStatus === "draft";

  const canEdit =
    canEditStaffSections || canEditSupervisorSections || canEditAdmin;

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

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.department) {
      setErrors((prev) => ({ ...prev, department: "Department is required" }));
      setTouched((prev) => ({ ...prev, department: true }));
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

      createAndSubmitAppraisal({
        ...formData,
        staffStrategy: selectedStrategyId,
      });
    },
    [formData, selectedStrategyId, createAndSubmitAppraisal, validateForm]
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

  if (!canEdit) {
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
    <form className="space-y-6" onSubmit={handleUpdate} noValidate>
      {/* FIXED: Role indicator */}
      <div className="flex items-center gap-2 mb-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
        {isStaff && (
          <>
            <User className="h-5 w-5 text-blue-600" />
            <span className="text-sm text-blue-800">
              You are editing as:{" "}
              <span className="font-semibold">Staff Member</span>
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
      <div className="rounded-lg p-4 border bg-gray-50 border-gray-200">
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
              disabled={!isAdmin && !isSupervisor}
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

      {/* Staff Strategy Integration */}
      {isStaff && formData.appraisalPeriod && (
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
                  {/* FIXED: Employee Rating - editable only by staff or admin */}
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
                        { id: "", name: "Select Rating" },
                        { id: "Achieved", name: "Achieved (3 pts)" },
                        {
                          id: "Partly Achieved",
                          name: "Partly Achieved (2 pts)",
                        },
                        { id: "Not Achieved", name: "Not Achieved (0 pts)" },
                      ]}
                      disabled={!canEditStaffSections && !isAdmin}
                    />
                    {canEditStaffSections && (
                      <span className="text-xs text-blue-500 ml-2">
                        (You can edit)
                      </span>
                    )}
                  </FormRow>

                  {/* FIXED: Supervisor Rating - visible and editable only by supervisor or admin */}
                  {(isSupervisor || isAdmin) && (
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
                          { id: "", name: "Select Rating" },
                          { id: "Achieved", name: "Achieved (3 pts)" },
                          {
                            id: "Partly Achieved",
                            name: "Partly Achieved (2 pts)",
                          },
                          { id: "Not Achieved", name: "Not Achieved (0 pts)" },
                        ]}
                        disabled={!canEditSupervisorSections && !isAdmin}
                      />
                      {canEditSupervisorSections && (
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
            No objectives found
          </p>
        )}

        {/* Safeguarding Section - Visible to both staff and supervisor */}
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
              disabled={!canEditStaffSections && !isAdmin}
            />
            {canEditStaffSections && (
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
                    disabled={!canEditStaffSections && !isAdmin}
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
                  disabled={!canEditStaffSections && !isAdmin}
                />
                <Button
                  type="button"
                  onClick={addAreaNotUnderstood}
                  size="small"
                  disabled={!canEditStaffSections && !isAdmin}
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
                    disabled={!canEditStaffSections && !isAdmin}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </FormRow>
        </div>
      </div>

      {/* FIXED: Section 3: Performance Areas - Only visible to supervisors and admins */}
      {(isSupervisor || isAdmin) && (
        <div className="rounded-lg p-4 border bg-gray-50 border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-300 flex items-center">
            <UserCog className="h-5 w-5 mr-2" />
            SECTION 3: SUPERVISOR'S ASSESSMENT{" "}
            {canEditSupervisorSections && (
              <span className="text-xs text-green-500 ml-2">
                (You can edit)
              </span>
            )}
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
                  disabled={!canEditSupervisorSections && !isAdmin}
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
              disabled={!canEditSupervisorSections && !isAdmin}
            />
            {canEditSupervisorSections && (
              <span className="text-xs text-green-500">(You can edit)</span>
            )}
          </FormRow>

          <FormRow label="Overall Assessment" className="mt-4">
            <Select
              id="overallRating"
              customLabel="Select Overall Rating"
              value={formData.overallRating || ""}
              onChange={(value) => handleFormChange("overallRating", value)}
              options={[
                { id: "Pending", name: "Pending" },
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
              disabled={!canEditSupervisorSections && !isAdmin}
            />
            {canEditSupervisorSections && (
              <span className="text-xs text-green-500">(You can edit)</span>
            )}
          </FormRow>
        </div>
      )}

      {/* Section 4: Future Goals - Visible to both */}
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
            disabled={!canEditStaffSections && !isAdmin}
          />
          {canEditStaffSections && (
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

      {/* Action Buttons */}
      <div className="flex justify-center w-full gap-4 pt-6">
        <div className="flex flex-col md:flex-row gap-4">
          <Button type="submit" size="medium" disabled={isUpdating}>
            {isUpdating ? <SpinnerMini /> : "Update Appraisal"}
          </Button>

          {canSend && (
            <Button
              type="submit"
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
                  Create Appraisal
                </>
              )}
            </Button>
          )}

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

export default FormEditAppraisal;
