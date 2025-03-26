import { useMemo, useState } from "react";
import { ConceptNote, Project } from "../../interfaces";
import FormRow from "../../ui/FormRow";
import Input from "../../ui/Input";
import Row from "../../ui/Row";
import { useSaveConceptNote } from "./Hooks/useSaveConceptNotes";
import { useProjects } from "../project/Hooks/useProjects";
import { useAdmins } from "../user/Hooks/useAdmins";
import SpinnerMini from "../../ui/SpinnerMini";
import Select from "../../ui/Select";
import Button from "../../ui/Button";
import NetworkErrorUI from "../../ui/NetworkErrorUI";
import { useUpdateConceptNote } from "./Hooks/useUpdateConceptNote";
import { useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { resetConceptNote } from "../../store/conceptNoteSlice";
// import { FaPlus, FaTrash } from "react-icons/fa";
interface FormEditConceptNotesProps {
  conceptNote: ConceptNote;
}

const FormEditConceptNotes = ({ conceptNote }: FormEditConceptNotesProps) => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const [formData, setFormData] = useState<Partial<ConceptNote>>({
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
    project_code: conceptNote.project_code, // Initialize as empty string
    approvedBy: null,
  });
  const param = useParams();
  const dispatch = useDispatch();

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
    if (selectedProject) {
    }

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
    updateConceptNote,
    isPending: isUpdating,
    isError: isErrorUpdate,
  } = useUpdateConceptNote(param.requestId!);

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
  // const handleUpdate = (e: React.FormEvent) => {
  //   e.preventDefault();

  //   const data = { ...formData };
  //   sendConceptNote(data);
  // };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();

    const data = { ...formData };
    updateConceptNote(data);
    dispatch(resetConceptNote());
  };

  if (isErrorSave || isErrorUpdate) {
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
              onChange={(e) => handelProjectsChange(e.target.value)}
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
                  onChange={(e) =>
                    handleFormChange("approvedBy", e.target.value)
                  }
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
                  {isSaving ? <SpinnerMini /> : "update"}
                </Button>
              )}
              {formData.approvedBy && (
                <Button size="medium" onClick={handleUpdate}>
                  {isUpdating ? <SpinnerMini /> : "update And Send"}
                </Button>
              )}
            </div>
          </div>
        </Row>
      )}
    </form>
  );
};

export default FormEditConceptNotes;
