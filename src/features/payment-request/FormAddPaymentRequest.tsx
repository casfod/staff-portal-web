import { useMemo, useState } from "react";
import { PaymentRequestType, Project } from "../../interfaces";
import FormRow from "../../ui/FormRow";
import Input from "../../ui/Input";
import Row from "../../ui/Row";
import { useSavePaymentRequest } from "./Hooks/useSavePaymentRequest";
import { useSendPaymentRequest } from "./Hooks/useSendPaymentRequest";
import { useProjects } from "../project/Hooks/useProjects";
import { bankNames } from "./data/Banks";
import { useAdmins } from "../user/Hooks/useAdmins";
import SpinnerMini from "../../ui/SpinnerMini";
import Select from "../../ui/Select";
import Button from "../../ui/Button";
import NetworkErrorUI from "../../ui/NetworkErrorUI";
// import { FaPlus, FaTrash } from "react-icons/fa";
const FormAddPaymentRequest = () => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const [formData, setFormData] = useState<Partial<PaymentRequestType>>({
    purposeOfExpense: "",
    amountInWords: "",
    amountInFigure: 0,
    grantCode: "", // Initialize as empty string
    dateOfExpense: "",
    specialInstruction: "",
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
    field: keyof PaymentRequestType,
    value: string | string[] | number
  ) => {
    if (selectedProject) {
    }

    setFormData({ ...formData, [field]: value });
  };

  const {
    savePaymentRequest,
    isPending: isSaving,
    isError: isErrorSave,
  } = useSavePaymentRequest();
  const {
    sendPaymentRequest,
    isPending: isSending,
    isError: isErrorSend,
  } = useSendPaymentRequest();

  // Handle form submission

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
          grantCode: selectedProject.project_code,
        }));
      }
    }
  };

  // Handle form submission
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const isFormValid = (e.target as HTMLFormElement).reportValidity();

    if (!isFormValid) return;

    if (formData.approvedBy === "") {
      formData.approvedBy = null;
    }

    // Make sure grantCode is included
    const data = {
      ...formData,
      // grantCode: selectedProject?.grantCode || formData.grantCode,
    };

    console.log("Submitting data:", data); // Verify grantCode is included
    savePaymentRequest(data);
  };

  // Handle form submission
  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();

    const data = { ...formData };
    sendPaymentRequest(data);
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

        <FormRow label="Grant Code *" type="small">
          <Input
            type="text"
            id="grantCode"
            required
            readOnly
            value={
              selectedProject
                ? selectedProject.project_code
                : formData.grantCode
            }
          />
        </FormRow>
      </Row>
      <Row>
        <FormRow label="Date Of Expense*">
          <Input
            type="date"
            id="dateOfExpense"
            required
            value={formData.dateOfExpense}
            onChange={(e) => handleFormChange("dateOfExpense", e.target.value)}
          />
        </FormRow>
      </Row>
      <Row>
        <FormRow label="Purpose Of Expense *" type="wide">
          <textarea
            className="border-2 h-32 min-h-32 rounded-lg focus:outline-none p-3 text-gray-600"
            maxLength={4000}
            id="purposeOfExpense"
            required
            value={formData.purposeOfExpense}
            onChange={(e) =>
              handleFormChange("purposeOfExpense", e.target.value)
            }
          />
        </FormRow>
      </Row>

      <Row>
        <FormRow label="Amount In Figure *" type="small">
          <Input
            type="number"
            id="amountInFigure"
            required
            value={formData.amountInFigure}
            onChange={(e) => handleFormChange("amountInFigure", e.target.value)}
          />
        </FormRow>
      </Row>

      <Row>
        <FormRow label="Amount In Words*" type="wide">
          <Input
            type="text"
            id="amountInWords"
            required
            value={formData.amountInWords}
            onChange={(e) => handleFormChange("amountInWords", e.target.value)}
          />
        </FormRow>
      </Row>
      <Row>
        <FormRow label="Account Number*">
          <Input
            type="text"
            id="accountNumber"
            required
            value={formData.accountNumber}
            onChange={(e) => handleFormChange("accountNumber", e.target.value)}
          />
        </FormRow>
        <FormRow label="Account Name*">
          <Input
            type="text"
            id="accountName"
            required
            value={formData.accountName}
            onChange={(e) => handleFormChange("accountName", e.target.value)}
          />
        </FormRow>
      </Row>
      <Row>
        <FormRow label="Bank Name *" type="small">
          <Select
            id="bankName"
            customLabel="Select a Bank"
            value={formData.bankName || ""} // Use empty string if null
            onChange={(e) => handleFormChange("bankName", e.target.value)}
            options={
              bankNames
                ? bankNames.map((bank) => ({
                    id: bank.name as string, // Assert that bank.id is a string
                    name: `${bank.name}`,
                  }))
                : []
            }
            required
          />
        </FormRow>
      </Row>

      {/* Background Context */}

      <Row>
        <FormRow label="Special Instruction*" type="wide">
          <textarea
            className="border-2 h-32 min-h-32 rounded-lg focus:outline-none p-3 text-gray-600"
            maxLength={4000}
            id="specialInstruction"
            required
            value={formData.specialInstruction}
            onChange={(e) =>
              handleFormChange("specialInstruction", e.target.value)
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

export default FormAddPaymentRequest;
