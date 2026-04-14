import React, { useMemo, useState } from "react";
import Button from "../../ui/Button";
import FormRow from "../../ui/FormRow";
import Row from "../../ui/Row";
import { ReportType } from "../../interfaces";
import SpinnerMini from "../../ui/SpinnerMini";
import { useReviewers } from "../user/Hooks/useUsers";
import { useProjects } from "../project/Hooks/useProjects";
import Select from "../../ui/Select";
import { FileUpload } from "../../ui/FileUpload";
import { useSaveReport, useSendReport } from "./Hooks/useReport";
import DatePicker from "../../ui/DatePicker";

const ACTIVITY_TYPES = [
  { id: "Workshop", name: "Workshop" },
  { id: "Training", name: "Training" },
  { id: "Sector Meeting", name: "Sector Meeting" },
  { id: "Other", name: "Other" },
];

const REPORT_TYPES = [
  { id: "Weekly Report", name: "Weekly Report" },
  { id: "Monthly Report", name: "Monthly Report" },
  { id: "Quarterly Report", name: "Quarterly Report" },
  { id: "Annual Report", name: "Annual Report" },
  { id: "Activity report", name: "Activity report" },
];

interface Props {
  report: ReportType;
}

const FormEditReport: React.FC<Props> = ({ report }) => {
  // Helper to get project ID from various formats
  const getProjectId = (): string | null => {
    if (!report.project) return null;
    if (typeof report.project === "string") return report.project;
    return report.project.id || null;
  };

  const [formData, setFormData] = useState<Partial<ReportType>>({
    activityType: report.activityType,
    otherActivitySpecification: report.otherActivitySpecification || "",
    reportType: report.reportType,
    reportTitle: report.reportTitle,
    reportingPeriod: report.reportingPeriod || { from: null, to: null },
    reviewedBy: report.reviewedBy?.id ?? report.reviewedBy ?? null,
    project: getProjectId(),
  });

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const { saveReport, isPending: isSaving } = useSaveReport();
  const { sendReport, isPending: isSending } = useSendReport();

  const { data: reviewersData, isLoading: isLoadingReviewers } = useReviewers();
  const reviewers = useMemo(() => reviewersData?.data ?? [], [reviewersData]);

  const { data: projectsData, isLoading: isLoadingProjects } = useProjects();
  const projects = useMemo(
    () => projectsData?.data?.projects ?? [],
    [projectsData]
  );

  const handleFormChange = (field: keyof ReportType, value: string | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // FIXED: Using the same pattern as purchase request
  const handleNestedChange = (
    parentField: keyof ReportType,
    field: string,
    value: Date | string | number | null
  ) => {
    setFormData((prev) => ({
      ...prev,
      [parentField]: {
        ...(prev[parentField] as object),
        [field]: value instanceof Date ? value.toISOString() : value,
      },
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveReport(formData);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    sendReport({ data: formData, files: selectedFiles });
  };

  const isOtherActivity = formData.activityType === "Other";

  // Helper to get project value for Select component
  const getProjectValue = (): string => {
    if (!formData.project) return "";
    if (typeof formData.project === "string") return formData.project;
    return formData.project.id || "";
  };

  // Don't allow editing if report is not in draft or rejected status
  const isEditable = report.status === "draft" || report.status === "rejected";

  if (!isEditable) {
    return (
      <div className="text-center py-8 text-red-600">
        This report cannot be edited because it is {report.status}.
      </div>
    );
  }

  return (
    <form className="space-y-6">
      <Row>
        {/* Report Title */}
        <FormRow label="Report Title">
          <input
            type="text"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter report title here"
            value={formData.reportTitle || ""}
            onChange={(e) => handleFormChange("reportTitle", e.target.value)}
            required
          />
        </FormRow>

        {/* Report Type */}
        <FormRow label="Report Type">
          <Select
            id="report-type"
            value={formData.reportType || ""}
            onChange={(value) =>
              handleFormChange("reportType", value as ReportType["reportType"])
            }
            options={REPORT_TYPES}
            customLabel="Select Report Type"
            filterable={false}
          />
        </FormRow>
      </Row>

      {/* Reporting Period - FIXED: Using the same pattern as purchase request */}
      <Row cols="grid-cols-1 md:grid-cols-4">
        <FormRow label="Reporting Period From">
          <DatePicker
            selected={
              formData?.reportingPeriod?.from
                ? new Date(formData.reportingPeriod.from)
                : null
            }
            onChange={(date) =>
              handleNestedChange(
                "reportingPeriod",
                "from",
                date ? date.toISOString() : null
              )
            }
            variant="secondary"
            placeholder="Select date"
          />
        </FormRow>

        {formData.reportingPeriod?.from && (
          <FormRow label="Reporting Period To">
            <DatePicker
              selected={
                formData?.reportingPeriod?.to
                  ? new Date(formData.reportingPeriod.to)
                  : null
              }
              onChange={(date) =>
                handleNestedChange(
                  "reportingPeriod",
                  "to",
                  date ? date.toISOString() : null
                )
              }
              variant="secondary"
              placeholder="Select date"
              minDate={formData?.reportingPeriod?.from}
              // requiredTrigger={formData.reportingPeriod?.from}
            />
          </FormRow>
        )}
      </Row>

      {/* Activity Type */}
      <FormRow label="Activity Type">
        <Select
          id="activity-type"
          value={formData.activityType || ""}
          onChange={(value) =>
            handleFormChange(
              "activityType",
              value as ReportType["activityType"]
            )
          }
          options={ACTIVITY_TYPES}
          customLabel="Select Activity Type"
          filterable={false}
        />
      </FormRow>

      {/* Other Activity Specification - Conditional */}
      {isOtherActivity && (
        <FormRow label="Please Specify Activity">
          <input
            type="text"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter activity details..."
            value={formData.otherActivitySpecification || ""}
            onChange={(e) =>
              handleFormChange("otherActivitySpecification", e.target.value)
            }
            required
          />
        </FormRow>
      )}

      {/* Project Selection */}
      <FormRow label="Project">
        <Select
          id="project"
          value={getProjectValue()}
          onChange={(value) => handleFormChange("project", value)}
          options={projects.map((project: any) => ({
            id: project.id || project._id,
            name: project.project_title,
          }))}
          customLabel="Select Project"
          disabled={isLoadingProjects}
          filterable={true}
        />
      </FormRow>

      {/* Reviewed By */}
      <FormRow label="Reviewed By">
        <Select
          id="reviewed-by"
          value={
            typeof formData.reviewedBy === "string"
              ? formData.reviewedBy
              : formData.reviewedBy?.id ?? ""
          }
          onChange={(value) => handleFormChange("reviewedBy", value)}
          options={reviewers.map((reviewer: any) => ({
            id: reviewer.id!,
            name: `${reviewer.first_name} ${reviewer.last_name}`,
          }))}
          customLabel="Select Reviewer"
          disabled={isLoadingReviewers}
          filterable={true}
        />
      </FormRow>

      {/* Attach Files */}
      <FormRow label="Attach File">
        <FileUpload
          selectedFiles={selectedFiles}
          setSelectedFiles={setSelectedFiles}
          accept=".pdf,.docx,.doc"
        />
      </FormRow>

      {/* Action Buttons */}
      {/* Action Buttons */}
      <div className="flex gap-3 justify-end pt-2">
        <Button
          type="button"
          variant="secondary"
          onClick={handleSave}
          disabled={isSaving || isSending}
        >
          {isSaving ? <SpinnerMini /> : "Save Draft"}
        </Button>

        <Button
          type="submit"
          onClick={handleSend}
          disabled={isSaving || isSending}
        >
          {isSending ? <SpinnerMini /> : "Submit Report"}
        </Button>
      </div>
    </form>
  );
};

export default FormEditReport;
