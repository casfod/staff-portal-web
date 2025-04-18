import { useMemo, useState } from "react";
import { ConceptNote, Project } from "../../interfaces";
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

// import { FaPlus, FaTrash } from "react-icons/fa";
const FormAddConceptNotes = () => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const [formData, setFormData] = useState<Partial<ConceptNote>>({
    activity_title: "",
    activity_location: "",
    activity_period: { from: "", to: "" },
    background_context: "",
    objectives_purpose: "",
    detailed_activity_description: "",
    strategic_plan: "",
    benefits_of_project: "",
    means_of_verification: "",
    activity_budget: 0,
    project_code: "", // Initialize as empty string
    approvedBy: null,
  });

  const { data: projectData, isLoading: isLoadingProjects } = useProjects();

  const projects = useMemo(
    () => projectData?.data?.projects ?? [],
    [projectData]
  );

  // Fetch admins data
  const { data: adminsData, isLoading: isLoadingAmins } = useAdmins();
  const admins = useMemo(() => adminsData?.data ?? [], [adminsData]);

  // Handle changes for top-level fields
  const handleFormChange = (
    field: keyof ConceptNote,
    value: string | string[] | number
  ) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleNestedChange = (
    parentField: keyof ConceptNote,
    field: string,
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [parentField]: {
        ...(prev[parentField] as object), // Explicitly cast to object
        [field]: value,
      },
    }));
  };

  const handelProjectsChange = (value: string) => {
    if (value) {
      const selectedProject = projects?.find(
        (project) =>
          `${project.project_title} - ${project.project_code}` === value
      );
      if (selectedProject) {
        setSelectedProject(selectedProject);
        // Update both the selected project AND the form data
        setFormData((prev) => ({
          ...prev,
          project_code: selectedProject.project_code,
        }));
      }
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
      project_code: selectedProject?.project_code || formData.project_code,
    };

    console.log("Submitting data:", data); // Verify project_code is included
    saveConceptNote(data);
  };

  // Handle form submission
  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();

    const data = { ...formData };
    sendConceptNote(data);
  };

  if (isErrorSave || isErrorSend) {
    return <NetworkErrorUI />;
  }

  return (
    <form className="space-y-6">
      <Row>
        <FormRow label="Projects" type="small">
          {isLoadingProjects ? (
            <SpinnerMini />
          ) : (
            <Select
              key={projects.length}
              id="projects"
              customLabel="Select Project"
              value={""}
              onChange={(value) => handelProjectsChange(value)}
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

        <FormRow label="Project Code *" type="small">
          <Input
            type="text"
            id="project_code"
            required
            readOnly
            value={
              selectedProject
                ? selectedProject.project_code
                : formData.project_code
            }
          />
        </FormRow>
      </Row>
      <Row>
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

      <Row>
        <FormRow label="Activity Period (From) *">
          <Input
            type="date"
            id="activity_period_from"
            required
            value={formData.activity_period?.from}
            onChange={(e) =>
              handleNestedChange("activity_period", "from", e.target.value)
            }
          />
        </FormRow>
        <FormRow label="Activity Period (To) *">
          <Input
            type="date"
            id="activity_period_to"
            required
            value={formData.activity_period?.to}
            onChange={(e) =>
              handleNestedChange("activity_period", "to", e.target.value)
            }
          />
        </FormRow>
      </Row>

      <Row>
        <FormRow label="Activity Budget *" type="small">
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
            className="border-2 h-32 min-h-32 rounded-lg focus:outline-none p-3 text-gray-600"
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
            className="border-2 h-32 min-h-32 rounded-lg focus:outline-none p-3 text-gray-600"
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
            className="border-2 h-32 min-h-32 rounded-lg focus:outline-none p-3 text-gray-600"
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
            className="border-2 h-32 min-h-32 rounded-lg focus:outline-none p-3 text-gray-600"
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
            className="border-2 h-32 min-h-32 rounded-lg focus:outline-none p-3 text-gray-600"
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
          <div className="w-full">
            <FormRow label="Approved By *" type="small">
              {isLoadingAmins ? (
                <SpinnerMini /> // Show a spinner while loading admins
              ) : (
                <Select
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
            <div className="flex justify-center w-full gap-4">
              {!formData.approvedBy && (
                <Button size="medium" onClick={handleSave}>
                  {isSaving ? <SpinnerMini /> : "Save"}
                </Button>
              )}
              {formData.approvedBy && (
                <Button size="medium" onClick={handleSend}>
                  {isSending ? <SpinnerMini /> : "Save And Send"}
                </Button>
              )}
            </div>
          </div>
        </Row>
      )}
    </form>
  );
};

export default FormAddConceptNotes;
