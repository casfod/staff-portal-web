import { useState } from "react";
import { Project } from "../../interfaces";
import Row from "../../ui/Row";
import FormRow from "../../ui/FormRow";
import Input from "../../ui/Input";
import SpinnerMini from "../../ui/SpinnerMini";
import Button from "../../ui/Button";
import { FaPlus } from "react-icons/fa";
import { useUpdateProject } from "./Hooks/useUpdateProject";
import Select from "../../ui/Select";

interface FormEditProjectProps {
  project: Project;
}

// Define the sector options
const sectorOptions = [
  { id: "Education", name: "Education" },
  {
    id: "Protection",
    name: "Protection",
  },
  {
    id: "WASH",
    name: "WASH",
  },
  {
    id: "Nutrition/Health",
    name: "Nutrition/Health",
  },
  {
    id: "Livelihood",
    name: "Livelihood",
  },
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
    account_code: [...project.account_code],
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

  const handleAccountCodeChange = (
    index: number,
    field: keyof Project["account_code"][0], // Explicitly type the field
    value: string
  ) => {
    const updatedAccountCodes = [...formData.account_code];
    updatedAccountCodes[index][field] = value;
    setFormData({ ...formData, account_code: updatedAccountCodes });
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

  const addAccountCode = () => {
    setFormData({
      ...formData,
      account_code: [...formData.account_code, { name: "", code: "" }],
    });
  };

  const removeAccountCode = (index: number) => {
    const updatedAccountCodes = formData.account_code.filter(
      (_, i) => i !== index
    );
    setFormData({ ...formData, account_code: updatedAccountCodes });
  };

  const { updateProject, isPending } = useUpdateProject(project.id!);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("Project:", formData);

    updateProject(formData);
  };

  return (
    <form className="space-y-6 uppercase">
      {/* Project Title and Donor */}
      <Row cols="grid-cols-1 md:grid-cols-2">
        <FormRow label="Project Title *">
          <Input
            type="text"
            id="project_title"
            required
            value={formData.project_title}
            onChange={(e) => handleFormChange("project_title", e.target.value)}
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
      <Row cols="grid-cols-1 md:grid-cols-2">
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

      {/* Project Budget */}
      <Row>
        <FormRow label="Project Budget *">
          <Input
            type="number"
            id="project_budget"
            required
            value={formData.project_budget}
            onChange={(e) => handleFormChange("project_budget", e.target.value)}
          />
        </FormRow>
      </Row>

      {/* Account Code */}
      <div className="flex flex-col gap-2 scale-[85%]">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 justify-center gap-4 max-h-[450px] border-2 overflow-y-auto px-3 md:px-6 py-4 mdpy-8 rounded-lg">
          {formData.account_code.map((account, index) => (
            <div
              key={index}
              className="flex flex-col gap-3 bg-[#F8F8F8] bg-opacity-90 border-2  min-w-[200px] 
p-3 md:p-6 mb-3 rounded-lg shadow-md"
            >
              <FormRow label={`Account Code ${index + 1} *`} type="wide">
                <Input
                  type="text"
                  required
                  value={account.name}
                  onChange={(e) =>
                    handleAccountCodeChange(index, "name", e.target.value)
                  }
                />
              </FormRow>

              <div className="flex gap-2 mt-4">
                <button
                  type="button"
                  className="text-white bg-red-500 px-3 py-1 rounded-md hover:bg-red-600 transition-all"
                  onClick={() => removeAccountCode(index)}
                >
                  Delete Account {index + 1}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4 w-full">
          <Button type="button" onClick={addAccountCode}>
            <FaPlus className="h-4 w-4 mr-1 md:mr-2" /> Add
          </Button>
          <span className="text-gray-600 font-bold">
            {formData.account_code.length > 1
              ? formData.account_code.length + " Accounts "
              : formData.account_code.length + " Account"}
            Added
          </span>
        </div>
      </div>

      {/* Sectors */}
      <div className="flex flex-col gap-2 scale-[85%]">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 justify-center gap-4 max-h-[450px] border-2 overflow-y-auto px-3 md:px-6 py-4 mdpy-8 rounded-lg">
          {formData.sectors.map((sector, index) => (
            <div
              key={index}
              className="flex flex-col gap-3 bg-[#F8F8F8] bg-opacity-90 border-2  min-w-[200px] 
     p-3 md:p-6 mb-3 rounded-lg shadow-md"
            >
              <h4 className="text-gray-600 text-lg font-semibold">
                SECTOR {index + 1}
              </h4>

              <FormRow label="Sector Name *" type="wide">
                <Select
                  id="name"
                  value={sector.name}
                  required
                  customLabel="Select Sector Name"
                  onChange={(value) => handleSectorChange(index, "name", value)}
                  options={
                    sectorOptions
                      ? sectorOptions.map((option) => ({
                          id: `${option.name}`,
                          name: `${option.name}`,
                        }))
                      : []
                  }
                ></Select>
              </FormRow>

              <FormRow label="Percentage *">
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
            <FaPlus className="h-4 w-4 mr-1 md:mr-2" /> Add Sector
          </Button>
          <span className="text-gray-600 font-bold">
            {formData.sectors.length > 1
              ? formData.sectors.length + " Sectors "
              : formData.sectors.length + " Sector "}
            Added
          </span>
        </div>
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
              handleFormChange("project_locations", e.target.value.split(", "))
            }
          />
        </FormRow>
      </Row>

      <Row>
        <FormRow label="Target Beneficiaries *" type="wide">
          <textarea
            className="border-2 h-32 min-h-32 rounded-lg focus:outline-none p-3 text-gray-600"
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
          <textarea
            className="border-2 h-32 min-h-32 rounded-lg focus:outline-none p-3 text-gray-600"
            maxLength={4000}
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
      <Row cols="grid-cols-1 md:grid-cols-2">
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
              handleNestedChange("implementation_period", "to", e.target.value)
            }
          />
        </FormRow>
      </Row>

      {/* Project Summary */}
      <Row>
        <FormRow label="Project Summary *" type="wide">
          <textarea
            className="border-2 h-32 min-h-32 rounded-lg focus:outline-none p-3 text-gray-600"
            maxLength={4000}
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
          {isPending ? <SpinnerMini /> : "Update"}
        </Button>
      </div>
    </form>
  );
};
export default FormEditProject;
