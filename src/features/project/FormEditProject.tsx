import { useState } from "react";
import { Project } from "../../interfaces";
import Row from "../../ui/Row";
import FormRow from "../../ui/FormRow";
import Input from "../../ui/Input";
import SpinnerMini from "../../ui/SpinnerMini";
import Button from "../../ui/Button";
import { FaPlus } from "react-icons/fa";
import { useUpdateProject } from "./Hooks/useUpdateProject";

interface FormEditProjectProps {
  project: Project;
}

// Define the sector options
const sectorOptions = [
  "Education",
  "Protection",
  "WASH",
  "Nutrition/Health",
  "Livelihood",
];

const FormEditProject: React.FC<FormEditProjectProps> = ({ project }) => {
  const [formData, setFormData] = useState<Project>({
    project_title: project.project_title,
    donor: project.donor,
    project_partners: [...project.project_partners],
    project_code: project.project_code,
    implementation_period: {
      from: project.implementation_period.from,
      to: project.implementation_period.to,
    },
    account_code: {
      name: project.account_code.name,
      code: project.account_code.code,
    },
    project_budget: project.project_budget,
    sectors: [...project.sectors],
    project_locations: [...project.project_locations],
    target_beneficiaries: [...project.target_beneficiaries],
    // target_beneficiaries: {
    //   women: project.target_beneficiaries.women,
    //   girls: project.target_beneficiaries.girls,
    //   boys: project.target_beneficiaries.boys,
    //   men: project.target_beneficiaries.men,
    // },
    project_objectives: project.project_objectives,
    project_summary: project.project_summary,
  });

  // Handle changes for top-level fields
  const handleFormChange = (
    field: keyof Project,
    value: string | string[] | number
  ) => {
    setFormData({ ...formData, [field]: value });
  };

  // Handle changes for nested objects (e.g., implementation_period, target_beneficiaries)
  const handleNestedChange = (
    parentField: keyof Project,
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

  // Handle changes for sectors
  const handleSectorChange = (
    index: number,
    field: keyof Project["sectors"][0], // Explicitly type the field
    value: string | number
  ) => {
    const updatedSectors = [...formData.sectors];
    updatedSectors[index][field] = value as never; // Cast to the correct type
    setFormData({ ...formData, sectors: updatedSectors });
  };

  // Add a new sector
  const addSector = () => {
    setFormData({
      ...formData,
      sectors: [...formData.sectors, { name: "", percentage: 0 }],
    });
  };

  // Remove a sector
  const removeSector = (index: number) => {
    const updatedSectors = formData.sectors.filter((_, i) => i !== index);
    setFormData({ ...formData, sectors: updatedSectors });
  };

  const { updateProject, isPending } = useUpdateProject(project._id!);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("Project:", formData);

    updateProject(formData);
  };

  return (
    <div>
      <form className="space-y-6 uppercase">
        {/* Project Title and Donor */}
        <Row>
          <FormRow label="Project Title *">
            <Input
              type="text"
              id="project_title"
              required
              value={formData.project_title}
              onChange={(e) =>
                handleFormChange("project_title", e.target.value)
              }
            />
          </FormRow>

          <FormRow label="Donor *">
            <Input
              type="text"
              id="donor"
              required
              value={formData.donor}
              onChange={(e) => handleFormChange("donor", e.target.value)}
            />
          </FormRow>
        </Row>

        {/* Project Partners and  Project Code*/}
        <Row>
          <FormRow label="Project Code *">
            <Input
              type="text"
              id="project_code"
              required
              value={formData.project_code}
              onChange={(e) => handleFormChange("project_code", e.target.value)}
            />
          </FormRow>

          <FormRow label="Project Partner(s) *">
            <Input
              type="text"
              id="project_partners"
              required
              value={formData.project_partners.join(", ")}
              onChange={(e) =>
                handleFormChange("project_partners", e.target.value.split(", "))
              }
            />
          </FormRow>
        </Row>

        {/* Account code*/}
        <Row>
          <FormRow label="Account Name *">
            <Input
              type="text"
              min="0"
              required
              value={formData.account_code.name}
              onChange={(e) =>
                handleNestedChange("account_code", "name", e.target.value)
              }
            />
          </FormRow>
          <FormRow label="Account code *">
            <Input
              type="text"
              min="0"
              required
              value={formData.account_code.code}
              onChange={(e) =>
                handleNestedChange("account_code", "code", e.target.value)
              }
            />
          </FormRow>
        </Row>

        {/* Implementation Period */}
        <Row>
          <FormRow label="Implementation Period (From) *">
            <Input
              type="date"
              id="implementation_period_from"
              required
              value={formData.implementation_period.from}
              onChange={(e) =>
                handleNestedChange(
                  "implementation_period",
                  "from",
                  e.target.value
                )
              }
            />
          </FormRow>
          <FormRow label="Implementation Period (To) *">
            <Input
              type="date"
              id="implementation_period_to"
              required
              value={formData.implementation_period.to}
              onChange={(e) =>
                handleNestedChange(
                  "implementation_period",
                  "to",
                  e.target.value
                )
              }
            />
          </FormRow>
        </Row>

        {/* Project Budget */}
        <Row>
          <FormRow label="Project Budget *">
            <Input
              type="number"
              id="project_budget"
              required
              value={formData.project_budget}
              onChange={(e) =>
                handleFormChange("project_budget", e.target.value)
              }
            />
          </FormRow>
        </Row>

        {/* Sectors */}
        <div className="flex flex-wrap justify-center gap-4 max-h-[450px] border-2 overflow-y-auto px-6 py-8 rounded-lg">
          {formData.sectors.map((sector, index) => (
            <div
              key={index}
              className="flex flex-col gap-3 bg-[#F8F8F8] bg-opacity-90 border-2 w-[32%] p-3 mb-3 rounded-lg shadow-md"
            >
              <h4 className="text-gray-600 text-lg font-semibold">
                SECTOR {index + 1}
              </h4>

              <FormRow label="Sector Name *" type="wide">
                <select
                  value={sector.name}
                  required
                  onChange={(e) =>
                    handleSectorChange(index, "name", e.target.value)
                  }
                  className="w-full p-2 text-gray-600  border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="" disabled>
                    Select a sector
                  </option>
                  {sectorOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </FormRow>

              <FormRow label="Percentage *" type="medium">
                <Input
                  placeholder=""
                  inputSize={100}
                  type="number"
                  min="0"
                  max="100"
                  required
                  value={sector.percentage}
                  onChange={(e) =>
                    handleSectorChange(index, "percentage", e.target.value)
                  }
                />
              </FormRow>

              <div className="flex gap-2 mt-4">
                <button
                  type="button"
                  className="text-white bg-red-500 px-3 py-1 rounded-md hover:bg-red-600 transition-all"
                  onClick={() => removeSector(index)}
                >
                  Delete Sector {index + 1}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4 w-full">
          <Button type="button" onClick={addSector}>
            <FaPlus /> Add Sector
          </Button>
          <span className="text-gray-700 font-bold">
            {formData.sectors.length > 1
              ? formData.sectors.length + " Sectors "
              : formData.sectors.length + " Sector "}
            Added
          </span>
        </div>

        {/* Project Locations */}
        <Row>
          <FormRow label="Project Locations *" type="wide">
            <Input
              type="text"
              id="project_locations"
              required
              value={formData.project_locations.join(", ")}
              onChange={(e) =>
                handleFormChange(
                  "project_locations",
                  e.target.value.split(", ")
                )
              }
            />
          </FormRow>
        </Row>

        {/* Target Beneficiaries */}
        {/* <Row>
          <FormRow label="Women *" type="small">
            <Input
              type="number"
              min="0"
              required
              value={formData.target_beneficiaries.women}
              onChange={(e) =>
                handleNestedChange(
                  "target_beneficiaries",
                  "women",
                  e.target.value
                )
              }
            />
          </FormRow>
          <FormRow label="Girls *" type="small">
            <Input
              type="number"
              min="0"
              required
              value={formData.target_beneficiaries.girls}
              onChange={(e) =>
                handleNestedChange(
                  "target_beneficiaries",
                  "girls",
                  e.target.value
                )
              }
            />
          </FormRow>
          <FormRow label="Boys *" type="small">
            <Input
              type="number"
              min="0"
              required
              value={formData.target_beneficiaries.boys}
              onChange={(e) =>
                handleNestedChange(
                  "target_beneficiaries",
                  "boys",
                  e.target.value
                )
              }
            />
          </FormRow>
          <FormRow label="Men *" type="small">
            <Input
              type="number"
              min="0"
              required
              value={formData.target_beneficiaries.men}
              onChange={(e) =>
                handleNestedChange(
                  "target_beneficiaries",
                  "men",
                  e.target.value
                )
              }
            />
          </FormRow>
        </Row> */}

        <Row>
          <FormRow label="Target Beneficiaries *" type="wide">
            <Input
              type="text"
              id="target_beneficiaries"
              required
              value={formData.target_beneficiaries.join(", ")}
              onChange={(e) =>
                handleFormChange(
                  "target_beneficiaries",
                  e.target.value.split(", ")
                )
              }
            />
          </FormRow>
        </Row>

        {/* Project Objectives */}
        <Row>
          <FormRow label="Project Objectives *" type="wide">
            <Input
              type="text"
              id="project_objectives"
              required
              value={formData.project_objectives}
              onChange={(e) =>
                handleFormChange("project_objectives", e.target.value)
              }
            />
          </FormRow>
        </Row>

        {/* Implementation Period */}
        <Row>
          <FormRow label="Implementation Period (From) *">
            <Input
              type="date"
              id="implementation_period_from"
              required
              value={formData.implementation_period.from}
              onChange={(e) =>
                handleNestedChange(
                  "implementation_period",
                  "from",
                  e.target.value
                )
              }
            />
          </FormRow>
          <FormRow label="Implementation Period (To) *">
            <Input
              type="date"
              id="implementation_period_to"
              required
              value={formData.implementation_period.to}
              onChange={(e) =>
                handleNestedChange(
                  "implementation_period",
                  "to",
                  e.target.value
                )
              }
            />
          </FormRow>
        </Row>

        {/* Project Summary */}
        <Row>
          <FormRow label="Project Summary *" type="wide">
            <Input
              type="text"
              id="project_summary"
              required
              value={formData.project_summary}
              onChange={(e) =>
                handleFormChange("project_summary", e.target.value)
              }
            />
          </FormRow>
        </Row>

        {/* Submit Button */}
        <div className="flex justify-center w-full gap-4">
          <Button size="medium" disabled={isPending} onClick={handleSubmit}>
            {isPending ? <SpinnerMini /> : "Submit"}
          </Button>
        </div>
      </form>
    </div>
  );
};
export default FormEditProject;
