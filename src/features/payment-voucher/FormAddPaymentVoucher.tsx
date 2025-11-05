// components/payment-vouchers/FormAddPaymentVoucher.tsx
import React, { useEffect, useMemo, useState } from "react";
import Input from "../../ui/Input";
import Button from "../../ui/Button";
import FormRow from "../../ui/FormRow";
import Row from "../../ui/Row";
import {
  PaymentVoucherFormData,
  PaymentVoucherType,
  Project,
} from "../../interfaces";
import SpinnerMini from "../../ui/SpinnerMini";
import { useReviewers } from "../user/Hooks/useReviewers";
import Select from "../../ui/Select";
import { FileUpload } from "../../ui/FileUpload";
import {
  useSavePaymentVoucher,
  useSendPaymentVoucher,
} from "./Hooks/usePaymentVoucher";
import { useProjects } from "../project/Hooks/useProjects";
import { categories, accounts } from "./data"; // Import the data

const FormAddPaymentVoucher: React.FC = () => {
  const [formData, setFormData] = useState<PaymentVoucherFormData>({
    payingStation: "",
    payTo: "",
    being: "",
    amountInWords: "",
    grantCode: "",
    grossAmount: 0,
    vat: 0,
    wht: 0,
    devLevy: 0,
    otherDeductions: 0,
    netAmount: 0,
    chartOfAccountCategories: "",
    organisationalChartOfAccount: "",
    chartOfAccountCode: "",
    project: "",
    note: "",
    reviewedBy: null,
    approvedBy: null,
  });

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [filteredAccounts, setFilteredAccounts] = useState<typeof accounts>([]);
  const [vatPercentage, setVatPercentage] = useState(0);
  const [whtPercentage, setWhtPercentage] = useState(0);

  const { savePaymentVoucher, isPending: isSaving } = useSavePaymentVoucher();
  const { sendPaymentVoucher, isPending: isSending } = useSendPaymentVoucher();

  const { data, isLoading } = useReviewers();
  const reviewers = useMemo(() => data?.data ?? [], [data]);

  const { data: projectData, isLoading: isLoadingProjects } = useProjects();

  const projects = useMemo(
    () => projectData?.data?.projects ?? [],
    [projectData]
  );

  // Calculate amounts based on percentages
  const calculateDeductionsFromPercentages = () => {
    const grossAmount = formData.grossAmount || 0;
    const vatAmount = grossAmount * (vatPercentage / 100);
    const whtAmount = grossAmount * (whtPercentage / 100);
    const devLevy = formData.devLevy || 0;
    const otherDeductions = formData.otherDeductions || 0;

    const totalDeductions = vatAmount + whtAmount + devLevy + otherDeductions;
    const netAmount = Math.max(0, grossAmount - totalDeductions);

    setFormData((prev) => ({
      ...prev,
      vat: vatAmount,
      wht: whtAmount,
      netAmount: netAmount,
    }));

    if (totalDeductions > grossAmount) {
      console.warn("Total deductions exceed gross amount");
    }
  };

  useEffect(() => {
    calculateDeductionsFromPercentages();
  }, [
    formData.grossAmount,
    vatPercentage,
    whtPercentage,
    formData.devLevy,
    formData.otherDeductions,
  ]);

  const handleFormChange = (
    field: keyof PaymentVoucherFormData,
    value: string | number | null
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePercentageChange = (type: "vat" | "wht", value: number) => {
    if (type === "vat") {
      setVatPercentage(value);
    } else {
      setWhtPercentage(value);
    }
  };

  // Filter accounts when category changes
  useEffect(() => {
    if (formData.chartOfAccountCategories) {
      const selectedCategory = categories.find(
        (cat) => cat.position === formData.chartOfAccountCategories
      );

      if (selectedCategory && selectedCategory.code !== "--") {
        const filtered = accounts.filter((account) =>
          account.code.includes(selectedCategory.code)
        );
        setFilteredAccounts(filtered);
      } else {
        setFilteredAccounts([]);
      }

      // Reset chart of account and code when category changes
      setFormData((prev) => ({
        ...prev,
        organisationalChartOfAccount: "",
        chartOfAccountCode: "",
      }));
    }
  }, [formData.chartOfAccountCategories]);

  // Set chart of account code when account is selected
  useEffect(() => {
    if (formData.organisationalChartOfAccount) {
      const selectedAccount = accounts.find(
        (acc) => acc.position === formData.organisationalChartOfAccount
      );

      if (selectedAccount) {
        setFormData((prev) => ({
          ...prev,
          chartOfAccountCode: selectedAccount.code,
        }));
      }
    }
  }, [formData.organisationalChartOfAccount]);

  const handelProjectsChange = (value: string) => {
    if (value) {
      const selectedProject = projects?.find(
        (project) =>
          `${project.project_title} - ${project.project_code}` === value
      );
      if (selectedProject) {
        setSelectedProject(selectedProject);
        setFormData((prev) => ({
          ...prev,
          project: `${selectedProject.project_title} - ${selectedProject.project_code}`,
          grantCode: selectedProject.project_code,
        }));
      }
    }
  };

  // Handle form submission for save (draft)
  const handleSave = (e: React.FormEvent) => {
    const isFormValid = (e.target as HTMLFormElement).reportValidity();
    if (!isFormValid) return;

    e.preventDefault();

    const saveData: Partial<PaymentVoucherType> = {
      ...formData,
      reviewedBy: null,
      status: "draft" as const,
      project: selectedProject ? selectedProject?.project_title : undefined,
    };

    savePaymentVoucher(saveData);
  };

  // Handle form submission for send (pending)
  const handleSend = (e: React.FormEvent) => {
    const isFormValid = (e.target as HTMLFormElement).reportValidity();
    if (!isFormValid) return;

    e.preventDefault();

    const sendData: Partial<PaymentVoucherType> = {
      ...formData,
      status: "pending" as const,
      project: selectedProject ? selectedProject?.project_title : undefined,
    };

    sendPaymentVoucher({ data: sendData, files: selectedFiles });
  };

  return (
    <form className="space-y-6">
      {/* Basic Information */}
      <Row cols="grid-cols-1 md:grid-cols-2">
        <FormRow label="Paying Station *">
          <Input
            id="payingStation"
            required
            value={formData.payingStation}
            onChange={(e) => handleFormChange("payingStation", e.target.value)}
          />
        </FormRow>
      </Row>

      <Row cols="grid-cols-1 md:grid-cols-2">
        <FormRow label="Pay To *">
          <Input
            id="payTo"
            required
            value={formData.payTo}
            onChange={(e) => handleFormChange("payTo", e.target.value)}
          />
        </FormRow>
        <FormRow label="Being *">
          <textarea
            className="border-2 h-16 min-h-16 rounded-lg focus:outline-none p-3 w-full"
            maxLength={500}
            placeholder=""
            id="being"
            value={formData.being}
            onChange={(e) => handleFormChange("being", e.target.value)}
            required
            rows={2}
          />
        </FormRow>
      </Row>

      <Row>
        <FormRow label="Amount In Words *" type="wide">
          <textarea
            className="border-2 h-20 min-h-20 rounded-lg focus:outline-none p-3"
            maxLength={1000}
            placeholder=""
            id="amountInWords"
            value={formData.amountInWords}
            onChange={(e) => handleFormChange("amountInWords", e.target.value)}
            required
          />
        </FormRow>
      </Row>

      <Row cols="grid-cols-1 md:grid-cols-2">
        <FormRow label="Projects">
          {isLoadingProjects ? (
            <SpinnerMini />
          ) : (
            <Select
              clearable={true}
              key={projects.length}
              id="projects"
              customLabel="Select Project"
              value={formData.project || ""}
              onChange={(value) => handelProjectsChange(value)}
              options={
                projects
                  ? projects
                      .filter((project) => project.id)
                      .map((project) => ({
                        id: `${project.project_title} - ${project.project_code}`,
                        name: `${project.project_title} - ${project.project_code}`,
                      }))
                  : []
              }
              optionsHeight={220}
              required
            />
          )}
        </FormRow>

        {/* Grant Code */}
        <FormRow label="Grant Code *">
          <Input
            id="grantCode"
            required
            value={formData.grantCode}
            onChange={(e) => handleFormChange("grantCode", e.target.value)}
          />
        </FormRow>
      </Row>

      {/* Financial Information */}
      <Row cols="grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <FormRow label="Gross Amount (₦) *">
          <Input
            type="number"
            min="0"
            step="0.01"
            required
            value={formData.grossAmount}
            onChange={(e) =>
              handleFormChange("grossAmount", parseFloat(e.target.value) || 0)
            }
          />
        </FormRow>
        <FormRow label="Net Amount (₦) *">
          <Input
            type="number"
            min="0"
            step="0.01"
            value={formData.netAmount}
            disabled
            className="bg-gray-100"
          />
        </FormRow>
      </Row>

      {/* Deductions */}
      <Row cols="grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <FormRow label="VAT (%)">
          <Input
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={vatPercentage}
            onChange={(e) =>
              handlePercentageChange("vat", parseFloat(e.target.value) || 0)
            }
          />
        </FormRow>
        <FormRow label="WHT (%)">
          <Input
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={whtPercentage}
            onChange={(e) =>
              handlePercentageChange("wht", parseFloat(e.target.value) || 0)
            }
          />
        </FormRow>
        <FormRow label="Dev Levy (₦)">
          <Input
            type="number"
            min="0"
            step="0.01"
            value={formData.devLevy}
            onChange={(e) =>
              handleFormChange("devLevy", parseFloat(e.target.value) || 0)
            }
          />
        </FormRow>
        <FormRow label="Other Deductions (₦)">
          <Input
            type="number"
            min="0"
            step="0.01"
            value={formData.otherDeductions}
            onChange={(e) =>
              handleFormChange(
                "otherDeductions",
                parseFloat(e.target.value) || 0
              )
            }
          />
        </FormRow>
      </Row>

      {/* Actual Deduction Amounts Display */}
      <Row cols="grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <FormRow label="VAT Amount (₦)">
          <Input
            type="number"
            value={formData.vat}
            disabled
            className="bg-gray-100"
          />
        </FormRow>
        <FormRow label="WHT Amount (₦)">
          <Input
            type="number"
            value={formData.wht}
            disabled
            className="bg-gray-100"
          />
        </FormRow>
      </Row>

      {/* Chart of Accounts */}
      <Row cols="grid-cols-1 md:grid-cols-2">
        <FormRow label="Chart of Account Categories *">
          <Select
            id="chartOfAccountCategories"
            customLabel="Select Category"
            value={formData.chartOfAccountCategories}
            onChange={(value) =>
              handleFormChange("chartOfAccountCategories", value)
            }
            options={categories.map((cat) => ({
              id: cat.position,
              name: cat.position,
            }))}
            required
          />
        </FormRow>

        <FormRow label="Chart of Account *">
          <Select
            id="chartOfAccount"
            customLabel="Select Account"
            value={formData.organisationalChartOfAccount}
            onChange={(value) =>
              handleFormChange("organisationalChartOfAccount", value)
            }
            options={filteredAccounts.map((acc) => ({
              id: acc.position,
              name: acc.position,
            }))}
            disabled={
              !formData.chartOfAccountCategories ||
              filteredAccounts.length === 0
            }
            required
          />
        </FormRow>
      </Row>

      <Row cols="grid-cols-1 md:grid-cols-2">
        <FormRow label="Chart of Account Code *">
          <Input
            id="chartOfAccountCode"
            required
            value={formData.chartOfAccountCode}
            onChange={(e) =>
              handleFormChange("chartOfAccountCode", e.target.value)
            }
            disabled // This field is auto-populated
            className="bg-gray-100"
          />
        </FormRow>
      </Row>

      <Row>
        <FormRow label="Note" type="wide">
          <textarea
            className="border-2 h-32 min-h-32 rounded-lg focus:outline-none p-3"
            maxLength={4000}
            placeholder=""
            id="note"
            value={formData.note}
            onChange={(e) => handleFormChange("note", e.target.value)}
          />
        </FormRow>
      </Row>

      {/* Reviewer Selection */}
      <Row>
        <FormRow label="Reviewed By *">
          {isLoading ? (
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

      {/* File Upload */}
      {formData.reviewedBy && (
        <FileUpload
          selectedFiles={selectedFiles}
          setSelectedFiles={setSelectedFiles}
          accept=".jpg,.png,.pdf,.xlsx,.docx"
          multiple={true}
        />
      )}

      {/* Action Buttons */}
      <div className="flex justify-center w-full gap-4">
        {!formData.reviewedBy && (
          <Button size="medium" disabled={isSaving} onClick={handleSave}>
            {isSaving ? <SpinnerMini /> : "Save"}
          </Button>
        )}
        {formData.reviewedBy && (
          <Button size="medium" disabled={isSending} onClick={handleSend}>
            {isSending ? <SpinnerMini /> : "Save And Send"}
          </Button>
        )}
      </div>
    </form>
  );
};

export default FormAddPaymentVoucher;
