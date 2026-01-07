import { useMemo, useState } from "react";
import { ConceptNoteType, Project } from "../../interfaces";
import FormRow from "../../ui/FormRow";
import Input from "../../ui/Input";
import Row from "../../ui/Row";
import { useProjects } from "../project/Hooks/useProjects";
import { useAdmins } from "../user/Hooks/useAdmins";
import { useReviewers } from "../user/Hooks/useReviewers"; // ADD THIS
import SpinnerMini from "../../ui/SpinnerMini";
import Select from "../../ui/Select";
import Button from "../../ui/Button";
import NetworkErrorUI from "../../ui/NetworkErrorUI";
import { useDispatch } from "react-redux";
import { resetConceptNote } from "../../store/conceptNoteSlice";
import DatePicker from "../../ui/DatePicker";
import { FileUpload } from "../../ui/FileUpload";
import {
  useSaveConceptNote,
  useSendConceptNote,
} from "./Hooks/useConceptNotes";

interface FormEditConceptNotesProps {
  conceptNote: ConceptNoteType;
}

const FormEditConceptNotes = ({ conceptNote }: FormEditConceptNotesProps) => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const [formData, setFormData] = useState<Partial<ConceptNoteType>>({
    activity_title: conceptNote.activity_title,
    activity_location: conceptNote.activity_location,
    activity_period: {
      from: conceptNote.activity_period.from,
      to: conceptNote.activity_period.to,
    },
    background_context: conceptNote.background_context,
    objectives_purpose: conceptNote.objectives_purpose,
    detailed_activity_description: conceptNote.detailed_activity_description,
    strategic_plan: conceptNote.strategic_plan,
    benefits_of_project: conceptNote.benefits_of_project,
    means_of_verification: conceptNote.means_of_verification,
    activity_budget: conceptNote.activity_budget,
    account_Code: conceptNote.account_Code,
    expense_Charged_To: conceptNote.expense_Charged_To,
    reviewedBy: conceptNote.reviewedBy?.id || null, // ADD THIS
    approvedBy: conceptNote.approvedBy?.id || null,
  });

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const dispatch = useDispatch();

  const { data: projectData, isLoading: isLoadingProjects } = useProjects();
  const projects = useMemo(
    () => projectData?.data?.projects ?? [],
    [projectData]
  );

  // Fetch reviewers data
  const { data: reviewersData, isLoading: isLoadingReviewers } = useReviewers(); // ADD THIS
  const reviewers = useMemo(() => reviewersData?.data ?? [], [reviewersData]);

  // Fetch admins data
  const { data: adminsData, isLoading: isLoadingAmins } = useAdmins();
  const admins = useMemo(() => adminsData?.data ?? [], [adminsData]);

  const handleFormChange = (field: keyof ConceptNoteType, value: string) => {
    if (field === "expense_Charged_To") {
      const selectedProject = projects.find(
        (project) =>
          `${project.project_title} - ${project.project_code}` === value
      );

      formData.project = selectedProject?.id;
      setSelectedProject(selectedProject || null);

      setFormData({
        ...formData,
        expense_Charged_To: value,
        account_Code: "",
      });
    } else if (field === "account_Code") {
      setFormData({
        ...formData,
        account_Code: value,
      });
    } else {
      setFormData({ ...formData, [field]: value });
    }
  };

  const handleNestedChange = (
    parentField: keyof ConceptNoteType,
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

  const {
    saveConceptNote,
    isPending: isSaving,
    isError: isErrorSave,
  } = useSaveConceptNote();
  const {
    sendConceptNote,
    isPending: isSending,
    isError: isErrorSend,
  } = useSendConceptNote();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const isFormValid = (e.target as HTMLFormElement).reportValidity();

    if (!isFormValid) return;

    // Clear both reviewer and approver for draft save
    formData.reviewedBy = null;
    formData.approvedBy = null;

    const data = { ...formData };
    saveConceptNote(data);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const isFormValid = (e.target as HTMLFormElement).reportValidity();

    if (!isFormValid) return;

    // Validate based on current status
    if (conceptNote.status === "draft" && !formData.reviewedBy) {
      alert("Please select a reviewer before submitting");
      return;
    }

    if (conceptNote.status === "reviewed" && !formData.approvedBy) {
      alert("Please select an approver before submitting");
      return;
    }

    const data = { ...formData };
    sendConceptNote({ data, files: selectedFiles });
    dispatch(resetConceptNote());
  };

  if (isErrorSave || isErrorSend) {
    return <NetworkErrorUI />;
  }

  return (
    <form className="space-y-6">
      {/* Show current status and prepared by info */}
      <Row>
        <p className="font-bold" style={{ letterSpacing: "1px" }}>
          {`Status : ${conceptNote.status}`}
        </p>
        <p className="" style={{ letterSpacing: "1px" }}>
          {`Prepared By : ${conceptNote.preparedBy?.first_name} ${conceptNote.preparedBy?.last_name}`}
        </p>
      </Row>

      {/* Project and Account Code Selection - Same as before */}
      <Row cols="grid-cols-1 md:grid-cols-2">
        <FormRow label="Expense Charged To *">
          {isLoadingProjects ? (
            <SpinnerMini />
          ) : (
            <Select
              clearable={true}
              key={projects.length}
              id="expenseChargedTo"
              customLabel="Select Project"
              value={formData.expense_Charged_To || ""}
              onChange={(value) =>
                handleFormChange("expense_Charged_To", value)
              }
              options={
                projects
                  ? projects
                      .filter((project) => project.id)
                      .map((project) => ({
                        id: `${project.project_title} - ${project.project_code}`,
                        name: `${project.project_code}`,
                      }))
                  : []
              }
              required
            />
          )}
        </FormRow>

        {selectedProject && (
          <FormRow label="Account Code *">
            {isLoadingProjects ? (
              <SpinnerMini />
            ) : (
              <Select
                clearable={true}
                id="accountCode"
                customLabel="Select Account Code"
                value={formData.account_Code || ""}
                onChange={(value) => handleFormChange("account_Code", value)}
                options={
                  selectedProject
                    ? selectedProject.account_code.map((account) => ({
                        id: `${account.name}`,
                        name: `${account.name}`,
                      }))
                    : []
                }
                required
              />
            )}
          </FormRow>
        )}
      </Row>

      {/* Other form fields remain the same as FormAddConceptNotes */}
      <Row cols="grid-cols-1 md:grid-cols-2">
        <FormRow label="Activity Title *">
          <Input
            type="text"
            id="activity_title"
            required
            value={formData.activity_title}
            onChange={(e) => handleFormChange("activity_title", e.target.value)}
          />
        </FormRow>

        <FormRow label="Activity Location *">
          <Input
            type="text"
            id="activity_location"
            required
            value={formData.activity_location}
            onChange={(e) =>
              handleFormChange("activity_location", e.target.value)
            }
          />
        </FormRow>
      </Row>

      <Row cols="grid-cols-1 md:grid-cols-4">
        <FormRow label="Activity Period (From) *">
          <DatePicker
            selected={
              formData?.activity_period?.from
                ? new Date(formData.activity_period.from)
                : null
            }
            onChange={(date) =>
              handleNestedChange(
                "activity_period",
                "from",
                date ? date.toISOString() : null
              )
            }
            variant="secondary"
            placeholder="Select date"
          />
        </FormRow>
        {formData.activity_period?.from && (
          <FormRow label="Activity Period (To) *">
            <DatePicker
              selected={
                formData?.activity_period?.to
                  ? new Date(formData.activity_period.to)
                  : null
              }
              onChange={(date) =>
                handleNestedChange(
                  "activity_period",
                  "to",
                  date ? date.toISOString() : null
                )
              }
              variant="secondary"
              placeholder="Select date"
              minDate={formData.activity_period?.from}
              requiredTrigger={formData.activity_period?.from}
            />
          </FormRow>
        )}
      </Row>

      <Row cols="grid-cols-1 md:grid-cols-2">
        <FormRow label="Activity Budget *">
          <Input
            type="number"
            id="activity_budget"
            required
            value={formData.activity_budget}
            onChange={(e) =>
              handleFormChange("activity_budget", e.target.value)
            }
          />
        </FormRow>
      </Row>

      {/* All text area fields remain the same */}
      <Row>
        <FormRow label="Background Context *" type="wide">
          <textarea
            className="border-2 h-32 min-h-32 rounded-lg focus:outline-none p-3"
            maxLength={4000}
            id="background_context"
            required
            value={formData.background_context}
            onChange={(e) =>
              handleFormChange("background_context", e.target.value)
            }
          />
        </FormRow>
      </Row>

      <Row>
        <FormRow label="Objectives/Purpose *" type="wide">
          <textarea
            className="border-2 h-32 min-h-32 rounded-lg focus:outline-none p-3"
            maxLength={4000}
            id="objectives_purpose"
            required
            value={formData.objectives_purpose}
            onChange={(e) =>
              handleFormChange("objectives_purpose", e.target.value)
            }
          />
        </FormRow>
      </Row>

      <Row>
        <FormRow label="Detailed Activity Description *" type="wide">
          <textarea
            className="border-2 h-32 min-h-32 rounded-lg focus:outline-none p-3"
            maxLength={4000}
            id="detailed_activity_description"
            required
            value={formData.detailed_activity_description}
            onChange={(e) =>
              handleFormChange("detailed_activity_description", e.target.value)
            }
          />
        </FormRow>
      </Row>

      <Row>
        <FormRow label="Strategic Plan *" type="wide">
          <textarea
            className="border-2 h-32 min-h-32 rounded-lg focus:outline-none p-3"
            maxLength={4000}
            id="strategic_plan"
            required
            value={formData.strategic_plan}
            onChange={(e) => handleFormChange("strategic_plan", e.target.value)}
          />
        </FormRow>
      </Row>

      <Row>
        <FormRow label="Benefits of Project *" type="wide">
          <textarea
            className="border-2 h-32 min-h-32 rounded-lg focus:outline-none p-3"
            maxLength={4000}
            id="benefits_of_project"
            required
            value={formData.benefits_of_project}
            onChange={(e) =>
              handleFormChange("benefits_of_project", e.target.value)
            }
          />
        </FormRow>
      </Row>

      <Row>
        <FormRow label="Means Of Verification *" type="wide">
          <Input
            type="text"
            id="means_of_verification"
            required
            value={formData.means_of_verification}
            onChange={(e) =>
              handleFormChange("means_of_verification", e.target.value)
            }
          />
        </FormRow>
      </Row>

      {/* Conditional fields based on current status */}
      {conceptNote.status === "draft" || conceptNote.status === "rejected" ? (
        // Show reviewer selection for drafts or rejected notes
        <Row>
          <FormRow label="Reviewed By *">
            {isLoadingReviewers ? (
              <SpinnerMini />
            ) : (
              <Select
                clearable={true}
                id="reviewedBy"
                customLabel="Select Reviewer"
                value={formData.reviewedBy || ""}
                onChange={(value) => handleFormChange("reviewedBy", value)}
                options={
                  reviewers
                    ? reviewers
                        .filter((reviewer) => reviewer.id)
                        .map((reviewer) => ({
                          id: reviewer.id as string,
                          name: `${reviewer.first_name} ${reviewer.last_name}`,
                        }))
                    : []
                }
                required
              />
            )}
          </FormRow>
        </Row>
      ) : conceptNote.status === "reviewed" ? (
        // Show approver selection for reviewed notes
        <Row>
          <FormRow label="Approved By *">
            {isLoadingAmins ? (
              <SpinnerMini />
            ) : (
              <Select
                clearable={true}
                id="approvedBy"
                customLabel="Select an admin"
                value={formData.approvedBy || ""}
                onChange={(value) => handleFormChange("approvedBy", value)}
                options={
                  admins
                    ? admins
                        .filter((admin) => admin.id)
                        .map((admin) => ({
                          id: admin.id as string,
                          name: `${admin.first_name} ${admin.last_name}`,
                        }))
                    : []
                }
                required
              />
            )}
          </FormRow>
        </Row>
      ) : (
        // Show read-only info for other statuses
        <div className="space-y-2">
          {conceptNote.reviewedBy && (
            <p className="mb-2">
              <span className="font-bold mr-1 uppercase">Reviewed By:</span>
              {`${conceptNote.reviewedBy.first_name} ${conceptNote.reviewedBy.last_name}`}
            </p>
          )}
          {conceptNote.approvedBy && (
            <p className="mb-2">
              <span className="font-bold mr-1 uppercase">Approved By:</span>
              {`${conceptNote.approvedBy.first_name} ${conceptNote.approvedBy.last_name}`}
            </p>
          )}
        </div>
      )}

      {/* File upload - only for certain statuses */}
      {(conceptNote.status === "draft" || conceptNote.status === "rejected") &&
        formData.reviewedBy && (
          <FileUpload
            selectedFiles={selectedFiles}
            setSelectedFiles={setSelectedFiles}
            accept=".jpg,.png,.pdf,.xlsx,.docx"
            multiple={true}
          />
        )}

      <div className="flex justify-center w-full gap-4">
        {/* Save as Draft button - for drafts or rejected notes without reviewer */}
        {(conceptNote.status === "draft" ||
          conceptNote.status === "rejected") &&
          !formData.reviewedBy && (
            <Button size="medium" disabled={isSaving} onClick={handleSave}>
              {isSaving ? <SpinnerMini /> : "Update as Draft"}
            </Button>
          )}

        {/* Submit button - when reviewer/approver is selected based on status */}
        {(conceptNote.status === "draft" ||
          conceptNote.status === "rejected") &&
          formData.reviewedBy && (
            <Button size="medium" disabled={isSending} onClick={handleSend}>
              {isSending ? <SpinnerMini /> : "Submit for Review"}
            </Button>
          )}

        {conceptNote.status === "reviewed" && formData.approvedBy && (
          <Button size="medium" disabled={isSending} onClick={handleSend}>
            {isSending ? <SpinnerMini /> : "Submit for Approval"}
          </Button>
        )}
      </div>
    </form>
  );
};

export default FormEditConceptNotes;
