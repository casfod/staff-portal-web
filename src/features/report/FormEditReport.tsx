import React, { useMemo, useState } from "react";
import Button from "../../ui/Button";
import FormRow from "../../ui/FormRow";
import Row from "../../ui/Row";
import { ReportType } from "../../interfaces";
import SpinnerMini from "../../ui/SpinnerMini";
import { useReviewers } from "../user/Hooks/useUsers";
import Select from "../../ui/Select";
import { FileUpload } from "../../ui/FileUpload";
import { useSaveReport, useSendReport } from "./Hooks/useReport";

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
];

interface Props {
  report: ReportType;
}

const FormEditReport: React.FC<Props> = ({ report }) => {
  const [formData, setFormData] = useState<Partial<ReportType>>({
    activityType: report.activityType,
    reportType: report.reportType,
    reportTitle: report.reportTitle,
    reviewedBy: report.reviewedBy?.id ?? report.reviewedBy ?? null,
    project: report.project ?? null,
  });

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const { saveReport, isPending: isSaving } = useSaveReport();
  const { sendReport, isPending: isSending } = useSendReport();

  const { data, isLoading } = useReviewers();
  const reviewers = useMemo(() => data?.data ?? [], [data]);

  const handleFormChange = (field: keyof ReportType, value: string | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveReport(formData);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    sendReport({ data: formData, files: selectedFiles });
  };

  return (
    <form className="space-y-6">
      <Row>
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

      {/* Report Title */}
      <FormRow label="Report Title">
        <input
          type="text"
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter report title here"
          value={formData.reportTitle || ""}
          onChange={(e) => handleFormChange("reportTitle", e.target.value)}
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
          options={reviewers.map((reviewer) => ({
            id: reviewer.id!,
            name: `${reviewer.first_name} ${reviewer.last_name}`,
          }))}
          customLabel="Select Reviewer"
          disabled={isLoading}
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
