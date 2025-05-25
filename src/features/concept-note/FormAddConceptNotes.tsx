import { useMemo, useState } from "react";
import { ConceptNoteType, Project } from "../../interfaces";
import FormRow from "../../ui/FormRow";
import Input from "../../ui/Input";
import Row from "../../ui/Row";
import { useSaveConceptNote } from "./Hooks/useSaveConceptNotes";
import { useSendConceptNote } from "./Hooks/useSendConceptNotes";
import { useProjects } from "../project/Hooks/useProjects";
import { useAdmins } from "../user/Hooks/useAdmins";
import SpinnerMini from "../../ui/SpinnerMini";
import Select from "../../ui/Select";
import Button from "../../ui/Button";
import NetworkErrorUI from "../../ui/NetworkErrorUI";
import DatePicker from "../../ui/DatePicker";
import { FileUpload } from "../../ui/FileUpload";

// import { FaPlus, FaTrash } from "react-icons/fa";
const FormAddConceptNotes = () => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const [formData, setFormData] = useState<Partial<ConceptNoteType>>({
    activity_title: "",
    activity_location: "",
    activity_period: { from: null, to: null },
    background_context: "",
    objectives_purpose: "",
    detailed_activity_description: "",
    strategic_plan: "",
    benefits_of_project: "",
    means_of_verification: "",
    project: null,
    activity_budget: 0,
    expense_Charged_To: "", // Initialize as empty string
    account_Code: "", // Initialize as empty string
    approvedBy: null,
  });

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const { data: projectData, isLoading: isLoadingProjects } = useProjects();

  const projects = useMemo(
    () => projectData?.data?.projects ?? [],
    [projectData]
  );

  // Fetch admins data
  const { data: adminsData, isLoading: isLoadingAmins } = useAdmins();
  const admins = useMemo(() => adminsData?.data ?? [], [adminsData]);

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

  const handleFormChange = (field: keyof ConceptNoteType, value: string) => {
    if (field === "expense_Charged_To") {
      // Find the selected project
      const selectedProject = projects.find(
        (project) =>
          `${project.project_title} - ${project.project_code}` === value
      );

      formData.project = selectedProject?.id;
      // Update the selected project state
      setSelectedProject(selectedProject || null);

      // Update the form data with the selected project title and code
      setFormData({
        ...formData,
        expense_Charged_To: value,
        account_Code: "", // Reset account code when project changes
      });
    } else if (field === "account_Code") {
      // Update the selected account code
      setFormData({
        ...formData,
        account_Code: value,
      });
    } else {
      // Handle other fields
      setFormData({ ...formData, [field]: value });
    }
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

  // Handle form submission
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const isFormValid = (e.target as HTMLFormElement).reportValidity();

    if (!isFormValid) return;

    if (formData.approvedBy === "") {
      formData.approvedBy = null;
    }

    // Make sure project_code is included
    const data = {
      ...formData,
      // project: selectedProject?.project_code || formData.project_code,
    };

    console.log("Submitting data:", data); // Verify project_code is included
    saveConceptNote(data);
  };

  // Handle form submission
  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();

    const data = { ...formData };
    sendConceptNote({ data, files: selectedFiles });
  };

  if (isErrorSave || isErrorSend) {
    return <NetworkErrorUI />;
  }

  return (
    <form className="space-y-6">
      <Row cols="grid-cols-1 md:grid-cols-2">
        {/* First Select: Projects */}
        <FormRow label="Expense Charged To *">
          {isLoadingProjects ? (
            <SpinnerMini />
          ) : (
            <Select
              clearable={true}
              key={projects.length} // Force re-render when projects change
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
                        // name: `${project.project_title} - ${project.project_code}`,
                      }))
                  : []
              }
              required
            />
          )}
        </FormRow>

        {/* Second Select: Account Code */}
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
            // minDate={new Date()}
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

      {/* Background Context */}
      <Row>
        <FormRow label="Background Context *" type="wide">
          <textarea
            className="border-2 h-32 min-h-32 rounded-lg focus:outline-none p-3  "
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
            className="border-2 h-32 min-h-32 rounded-lg focus:outline-none p-3  "
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
            className="border-2 h-32 min-h-32 rounded-lg focus:outline-none p-3  "
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

      {/* Strategic Plan */}
      <Row>
        <FormRow label="Strategic Plan *" type="wide">
          <textarea
            className="border-2 h-32 min-h-32 rounded-lg focus:outline-none p-3  "
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
            className="border-2 h-32 min-h-32 rounded-lg focus:outline-none p-3  "
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

      {/* Approver Selection */}
      {!isLoadingAmins && (
        <Row>
          <FormRow label="Approved By *">
            {isLoadingAmins ? (
              <SpinnerMini /> // Show a spinner while loading admins
            ) : (
              <Select
                clearable={true}
                id="approvedBy"
                customLabel="Select an admin"
                value={formData.approvedBy || ""} // Use empty string if null
                onChange={(value) => handleFormChange("approvedBy", value)}
                options={
                  admins
                    ? admins
                        .filter((admin) => admin.id) // Filter out admins with undefined IDs
                        .map((admin) => ({
                          id: admin.id as string, // Assert that admin.id is a string
                          name: `${admin.first_name} ${admin.last_name}`,
                        }))
                    : []
                }
                required
              />
            )}
          </FormRow>
          {formData.approvedBy && (
            <FileUpload
              selectedFiles={selectedFiles}
              setSelectedFiles={setSelectedFiles}
              accept=".jpg,.png,.pdf,.xlsx,.docx"
              multiple={true}
            />
          )}

          <div className="flex justify-center w-full gap-4">
            {!formData.approvedBy && (
              <Button disabled={isSaving} size="medium" onClick={handleSave}>
                {isSaving ? <SpinnerMini /> : "Save"}
              </Button>
            )}
            {formData.approvedBy && (
              <Button size="medium" disabled={isSending} onClick={handleSend}>
                {isSending ? <SpinnerMini /> : "Save And Send"}
              </Button>
            )}
          </div>
        </Row>
      )}
    </form>
  );
};

export default FormAddConceptNotes;
