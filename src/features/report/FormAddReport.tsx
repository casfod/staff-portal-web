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

const ACTIVITY_TYPES = ["Workshop", "Training", "Sector Meeting", "Other"];
const REPORT_TYPES = [
  "Weekly Report",
  "Monthly Report",
  "Quarterly Report",
  "Annual Report",
];

const FormAddReport: React.FC = () => {
  const [formData, setFormData] = useState<Partial<ReportType>>({
    activityType: undefined,
    reportType: undefined,
    reportTitle: "",
    reviewedBy: null,
    project: null,
  });

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const { saveReport, isPending: isSaving } = useSaveReport();
  const { sendReport, isPending: isSending } = useSendReport();

  const { data, isLoading } = useReviewers();
  const reviewers = useMemo(() => data?.data ?? [], [data]);

  const handleFormChange = (
    field: keyof ReportType,
    value: string | null
  ) => {
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
            value={formData.activityType || ""}
            onChange={(e) =>
              handleFormChange(
                "activityType",
                e.target.value as ReportType["activityType"]
              )
            }
          >
            <option value="">Select Activity Type</option>
            {ACTIVITY_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </Select>
        </FormRow>

        {/* Report Type */}
        <FormRow label="Report Type">
          <Select
            value={formData.reportType || ""}
            onChange={(e) =>
              handleFormChange(
                "reportType",
                e.target.value as ReportType["reportType"]
              )
            }
          >
            <option value="">Select Report Type</option>
            {REPORT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </Select>
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
          value={formData.reviewedBy || ""}
          onChange={(e) => handleFormChange("reviewedBy", e.target.value)}
          disabled={isLoading}
        >
          <option value="">Select Reviewer</option>
          {reviewers.map((reviewer) => (
            <option key={reviewer.id} value={reviewer.id}>
              {reviewer.first_name} {reviewer.last_name}
            </option>
          ))}
        </Select>
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

export default FormAddReport;
