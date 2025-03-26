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
    project_code: "",
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
      setSelectedProject(selectedProject!);
    }
  };

  // Handle adding objective
  // const addObjective = () => {
  //   setFormData({
  //     ...formData,
  //     objectives_purpose: [...(formData.objectives_purpose || []), ""],
  //   });
  // };

  // Handle objective change
  // const handleObjectiveChange = (index: number, value: string) => {
  //   const newObjectives = [...(formData.objectives_purpose || [])];
  //   newObjectives[index] = value;
  //   setFormData({ ...formData, objectives_purpose: newObjectives });
  // };

  // Handle removing objective
  // const removeObjective = (index: number) => {
  //   const newObjectives = (formData.objectives_purpose || []).filter(
  //     (_, i) => i !== index
  //   );
  //   setFormData({ ...formData, objectives_purpose: newObjectives });
  // };

  // Handle adding activity description
  // const addActivityDescription = () => {
  //   setFormData({
  //     ...formData,
  //     detailed_activity_description: [
  //       ...(formData.detailed_activity_description || []),
  //       { title: "", description: "" },
  //     ],
  //   });
  // };

  // Handle activity description change
  // const handleActivityDescriptionChange = (
  //   index: number,
  //   field: "title" | "description",
  //   value: string
  // ) => {
  //   const newDescriptions = [...(formData.detailed_activity_description || [])];
  //   newDescriptions[index] = { ...newDescriptions[index], [field]: value };
  //   setFormData({
  //     ...formData,
  //     detailed_activity_description: newDescriptions,
  //   });
  // };

  // Handle removing activity description
  // const removeActivityDescription = (index: number) => {
  //   const newDescriptions = (
  //     formData.detailed_activity_description || []
  //   ).filter((_, i) => i !== index);
  //   setFormData({
  //     ...formData,
  //     detailed_activity_description: newDescriptions,
  //   });
  // };

  // Handle adding benefit
  // const addBenefit = () => {
  //   setFormData({
  //     ...formData,
  //     benefits_of_project: [...(formData.benefits_of_project || []), ""],
  //   });
  // };

  // Handle benefit change
  // const handleBenefitChange = (index: number, value: string) => {
  //   const newBenefits = [...(formData.benefits_of_project || [])];
  //   newBenefits[index] = value;
  //   setFormData({ ...formData, benefits_of_project: newBenefits });
  // };

  // Handle removing benefit
  // const removeBenefit = (index: number) => {
  //   const newBenefits = (formData.benefits_of_project || []).filter(
  //     (_, i) => i !== index
  //   );
  //   setFormData({ ...formData, benefits_of_project: newBenefits });
  // };

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
    const isFormValid = (e.target as HTMLFormElement).reportValidity();
    console.log("Is form valid?", isFormValid);
    if (formData.approvedBy === "") {
      formData.approvedBy = null;
    }

    if (!isFormValid) return; // Stop if form is invalid
    e.preventDefault();
    const data = { ...formData };

    console.log(data);

    return;
    saveConceptNote(data);
  };
  // Handle form submission
  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();

    const data = { ...formData, project_code: selectedProject?.project_code };
    sendConceptNote(data);
  };

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
            value={selectedProject ? selectedProject.project_code : ""}
            onChange={(e) => handleFormChange("project_code", e.target.value)}
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

      {/* Objectives/Purpose */}
      {/* <div className="flex flex-col w-full space-y-4 ">
        <h3 className="text-lg text-gray-600 font-semibold">
          Objectives/Purpose
        </h3>
        {(formData.objectives_purpose || []).map((objective, index) => (
          <Row key={index}>
            <FormRow label={`Objective ${index + 1}`} type="wide">
              <div className="w-full flex gap-2">
                <input
                  className="w-full text-gray-600 text-[16px] border-2 border-gray-300 bg-white rounded-lg px-2 py-1 focus:outline-none"
                  type="text"
                  value={objective}
                  onChange={(e) => handleObjectiveChange(index, e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => removeObjective(index)}
                  className="text-red-500"
                >
                  <FaTrash />
                </button>
              </div>
            </FormRow>
          </Row>
        ))}
        <Button type="button" onClick={addObjective}>
          <FaPlus /> Add Objective
        </Button>
      </div> */}

      {/* Detailed Activity Description */}
      {/* <div className="space-y-4">
        <h3 className="text-lg font-semibold">Detailed Activity Description</h3>
        {(formData.detailed_activity_description || []).map((item, index) => (
          <div key={index} className="space-y-2 border p-4 rounded-lg">
            <Row>
              <FormRow label="Title *">
                <Input
                  type="text"
                  value={item.title}
                  onChange={(e) =>
                    handleActivityDescriptionChange(
                      index,
                      "title",
                      e.target.value
                    )
                  }
                  required
                />
              </FormRow>
            </Row>
            <Row>
              <FormRow label="Description *" type="wide">
                <Input
                  type="text"
                  value={item.description}
                  onChange={(e) =>
                    handleActivityDescriptionChange(
                      index,
                      "description",
                      e.target.value
                    )
                  }
                  required
                />
              </FormRow>
            </Row>

            <button
              type="button"
              className="inline-flex items-center gap-2 text-white  px-3 py-1 rounded-md hover: transition-all"
              onClick={() => removeActivityDescription(index)}
            >
              <FaTrash /> Remove Description
            </button>
          </div>
        ))}
        <Button type="button" onClick={addActivityDescription}>
          <FaPlus /> Add Activity Description
        </Button>
      </div> */}

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

      {/* Benefits of Project */}
      {/* <div className="space-y-4">
        <h3 className="text-lg font-semibold">Benefits of Project</h3>
        {(formData.benefits_of_project || []).map((benefit, index) => (
          <Row key={index}>
            <FormRow label={`Benefit ${index + 1}`} type="wide">
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={benefit}
                  onChange={(e) => handleBenefitChange(index, e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => removeBenefit(index)}
                  className="text-red-500"
                >
                  <FaTrash />
                </button>
              </div>
            </FormRow>
          </Row>
        ))}
        <Button type="button" onClick={addBenefit}>
          <FaPlus /> Add Benefit
        </Button>
      </div> */}

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
