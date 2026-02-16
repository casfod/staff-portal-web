// components/payment-vouchers/FormEditPaymentVoucher.tsx
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
import { useDispatch } from "react-redux";
import { resetPaymentVoucher } from "../../store/paymentVoucherSlice";
import { useReviewers } from "../user/Hooks/useUsers";
import Select from "../../ui/Select";
import { FileUpload } from "../../ui/FileUpload";
import {
  useSavePaymentVoucher,
  useSendPaymentVoucher,
} from "./Hooks/usePaymentVoucher";
import { useProjects } from "../project/Hooks/useProjects";
import { accounts, categories } from "./data";
import { useNavigate } from "react-router-dom";
import DatePicker from "../../ui/DatePicker";
import toast from "react-hot-toast";

interface FormEditVoucherProps {
  paymentVoucher: PaymentVoucherType;
}

const FormEditPaymentVoucher: React.FC<FormEditVoucherProps> = ({
  paymentVoucher,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<PaymentVoucherFormData>({
    payingStation: paymentVoucher.payingStation || "",
    pvDate: paymentVoucher.pvDate || "",
    payTo: paymentVoucher.payTo || "",
    being: paymentVoucher.being || "",
    amountInWords: paymentVoucher.amountInWords || "",
    accountCode: paymentVoucher.accountCode || "",
    projectCode: paymentVoucher.projectCode || "",
    grossAmount: paymentVoucher.grossAmount || 0,
    vat: paymentVoucher.vat || 0,
    wht: paymentVoucher.wht || 0,
    devLevy: paymentVoucher.devLevy || 0,
    otherDeductions: paymentVoucher.otherDeductions || 0,
    netAmount: paymentVoucher.netAmount || 0,
    chartOfAccountCategories: paymentVoucher.chartOfAccountCategories || "",
    organisationalChartOfAccount:
      paymentVoucher.organisationalChartOfAccount || "",
    chartOfAccountCode: paymentVoucher.chartOfAccountCode || "",
    project: paymentVoucher.project || "",
    note: paymentVoucher.note || "",
    reviewedBy: Array.isArray(paymentVoucher.reviewedBy)
      ? paymentVoucher.reviewedBy[0]?.id || null
      : paymentVoucher.reviewedBy?.id || null,
    approvedBy: Array.isArray(paymentVoucher.approvedBy)
      ? paymentVoucher.approvedBy[0]?.id || null
      : paymentVoucher.approvedBy?.id || null,
  });

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [filteredAccounts, setFilteredAccounts] = useState<
    { position: string; code: string }[]
  >([]);
  const [vatPercentage, setVatPercentage] = useState(0);
  const [whtPercentage, setWhtPercentage] = useState(0);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const { savePaymentVoucher, isPending: isSaving } = useSavePaymentVoucher();
  const { sendPaymentVoucher, isPending: isSending } = useSendPaymentVoucher();

  const { data: reviewersData, isLoading: isLoadingReviewers } = useReviewers();
  const reviewers = useMemo(() => reviewersData?.data ?? [], [reviewersData]);

  const { data: projectData, isLoading: isLoadingProjects } = useProjects();
  const projects = useMemo(
    () => projectData?.data?.projects ?? [],
    [projectData]
  );

  // Initialize selected project when component mounts
  useEffect(() => {
    if (paymentVoucher.project && paymentVoucher.projectCode) {
      const existingProject = projects?.find(
        (project) =>
          project.project_title === paymentVoucher.project &&
          project.project_code === paymentVoucher.projectCode
      );
      if (existingProject) {
        setSelectedProject(existingProject);
      }
    }
  }, [paymentVoucher, projects]);

  // Validate form
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.payingStation.trim())
      errors.payingStation = "Paying Station is required";
    if (!formData.payTo.trim()) errors.payTo = "Pay To is required";
    if (!formData.being.trim()) errors.being = "Being description is required";
    if (!formData.amountInWords.trim())
      errors.amountInWords = "Amount in words is required";
    if (formData.grossAmount <= 0)
      errors.grossAmount = "Gross Amount must be greater than 0";
    if (!formData.chartOfAccountCategories)
      errors.chartOfAccountCategories = "Chart of Account Category is required";
    if (!formData.organisationalChartOfAccount)
      errors.organisationalChartOfAccount =
        "Organisational Chart of Account is required";
    if (!formData.chartOfAccountCode)
      errors.chartOfAccountCode = "Chart of Account Code is required";
    if (!formData.project.trim()) errors.project = "Project is required";
    if (!formData.projectCode.trim())
      errors.projectCode = "Project code is required";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

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
      vat: parseFloat(vatAmount.toFixed(2)),
      wht: parseFloat(whtAmount.toFixed(2)),
      netAmount: parseFloat(netAmount.toFixed(2)),
    }));

    if (totalDeductions > grossAmount) {
      console.warn("Total deductions exceed gross amount");
    }
  };

  // Initialize percentages from existing values
  useEffect(() => {
    if (paymentVoucher.grossAmount > 0) {
      const vatPct = (paymentVoucher.vat / paymentVoucher.grossAmount) * 100;
      const whtPct = (paymentVoucher.wht / paymentVoucher.grossAmount) * 100;
      setVatPercentage(isNaN(vatPct) ? 0 : vatPct);
      setWhtPercentage(isNaN(whtPct) ? 0 : whtPct);
    }
  }, [paymentVoucher]);

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

    // Clear error when field is updated
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
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
      if (
        formData.chartOfAccountCategories !==
        paymentVoucher.chartOfAccountCategories
      ) {
        setFormData((prev) => ({
          ...prev,
          organisationalChartOfAccount: "",
          chartOfAccountCode: "",
        }));
      }
    }
  }, [
    formData.chartOfAccountCategories,
    paymentVoucher.chartOfAccountCategories,
  ]);

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

  // Updated handleProjectsChange function with auto-set project field
  const handleProjectsChange = (value: string) => {
    if (value) {
      const selectedProject = projects?.find(
        (project) =>
          `${project.project_title} - ${project.project_code}` === value
      );
      if (selectedProject) {
        setSelectedProject(selectedProject);
        setFormData((prev) => ({
          ...prev,
          project: selectedProject.project_title, // Auto-set project title
          projectCode: selectedProject.project_code, // Auto-set project code
        }));
      }
    } else {
      setSelectedProject(null);
      setFormData((prev) => ({
        ...prev,
        project: "",
        projectCode: "",
        accountCode: "", // Reset account code when project is cleared
      }));
    }
  };

  const handleAccountCodeChange = (value: string) => {
    handleFormChange("accountCode", value);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      alert("Please fix the form errors before saving.");
      return;
    }

    const saveData: Partial<PaymentVoucherType> = {
      ...formData,
      reviewedBy: null,
      status: "draft" as const,
    };

    try {
      await savePaymentVoucher(saveData);
      dispatch(resetPaymentVoucher());
      navigate("/payment-vouchers");
    } catch (error) {
      console.error("Failed to save payment voucher:", error);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the form errors before sending.");
      return;
    }

    if (!formData.reviewedBy) {
      alert("Please select a reviewer before sending.");
      return;
    }

    const sendData: Partial<PaymentVoucherType> = {
      ...formData,
      status: "pending" as const,
    };

    try {
      await sendPaymentVoucher({ data: sendData, files: selectedFiles });
      dispatch(resetPaymentVoucher());
      navigate("/payment-vouchers");
    } catch (error) {
      console.error("Failed to send payment voucher:", error);
    }
  };

  return (
    <form className="space-y-6 uppercase" onSubmit={(e) => e.preventDefault()}>
      <Row>
        <p
          style={{ letterSpacing: "1px" }}
        >{`Status : ${paymentVoucher.status}`}</p>
        <p
          style={{ letterSpacing: "1px" }}
        >{`Voucher : ${paymentVoucher.pvNumber}`}</p>
      </Row>

      {/* Basic Information */}

      <Row cols="grid-cols-1 md:grid-cols-2">
        <FormRow label="PV Date*" error={formErrors.pvDate}>
          <DatePicker
            selected={formData.pvDate ? new Date(formData.pvDate) : new Date()}
            onChange={(date) =>
              handleFormChange(
                "pvDate",
                date ? date.toISOString().split("T")[0] : null
              )
            }
            variant="secondary"
            placeholder="Select date"
          />
        </FormRow>
      </Row>
      <Row cols="grid-cols-1 md:grid-cols-2">
        <FormRow label="Paying Station *" error={formErrors.payingStation}>
          <Input
            id="payingStation"
            required
            value={formData.payingStation}
            onChange={(e) => handleFormChange("payingStation", e.target.value)}
          />
        </FormRow>

        <FormRow label="Pay To *" error={formErrors.payTo}>
          <Input
            id="payTo"
            required
            value={formData.payTo}
            onChange={(e) => handleFormChange("payTo", e.target.value)}
          />
        </FormRow>
      </Row>

      <Row>
        <FormRow label="Being *" error={formErrors.being}>
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
        <FormRow
          label="Amount In Words *"
          type="wide"
          error={formErrors.amountInWords}
        >
          <textarea
            className="border-2 h-20 min-h-20 rounded-lg focus:outline-none p-3 w-full"
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
        <FormRow label="Projects *" error={formErrors.project}>
          {isLoadingProjects ? (
            <SpinnerMini />
          ) : (
            <Select
              clearable={true}
              key={projects.length}
              id="projects"
              customLabel="Select Project"
              value={
                selectedProject
                  ? `${selectedProject.project_title} - ${selectedProject.project_code}`
                  : ""
              }
              onChange={handleProjectsChange}
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

        {/* Project Title Display (Read-only) */}
        {selectedProject && (
          <FormRow label="Selected Project">
            <Input
              id="projectDisplay"
              value={formData.project}
              readOnly
              className="bg-gray-100 cursor-not-allowed"
              placeholder="Project will auto-populate when selected above"
            />
          </FormRow>
        )}
      </Row>

      {/* Account Code and Project Code */}
      {selectedProject && (
        <Row cols="grid-cols-1 md:grid-cols-2">
          <FormRow label="Account Code *">
            <Select
              clearable={true}
              key={projects.length}
              id="accountCode"
              customLabel="Select Account"
              value={formData.accountCode || ""}
              onChange={handleAccountCodeChange}
              options={
                selectedProject
                  ? selectedProject.account_code.map((account_code) => ({
                      id: account_code.name,
                      name: account_code.name,
                    }))
                  : []
              }
              optionsHeight={220}
            />
          </FormRow>

          {/* Project Code Display (Read-only) */}
          <FormRow label="Project Code">
            <Input
              id="projectCodeDisplay"
              value={formData.projectCode}
              readOnly
              className="bg-gray-100 cursor-not-allowed"
              placeholder="Project code will auto-populate"
            />
          </FormRow>
        </Row>
      )}

      {/* Financial Information */}
      <Row cols="grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <FormRow label="Gross Amount (₦) *" error={formErrors.grossAmount}>
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
        <FormRow
          label="Chart of Account Categories *"
          error={formErrors.chartOfAccountCategories}
        >
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

        <FormRow
          label="Organisational Chart of Account *"
          error={formErrors.organisationalChartOfAccount}
        >
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
        <FormRow
          label="Chart of Account Code *"
          error={formErrors.chartOfAccountCode}
        >
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
            className="border-2 h-32 min-h-32 rounded-lg focus:outline-none p-3 w-full"
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
          {isLoadingReviewers ? (
            <SpinnerMini />
          ) : (
            <Select
              clearable={true}
              key={reviewers.length}
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
        <Button
          size="medium"
          disabled={isSaving}
          onClick={handleSave}
          type="button"
        >
          {isSaving ? <SpinnerMini /> : "Save as Draft"}
        </Button>

        {formData.reviewedBy && (
          <Button
            size="medium"
            disabled={isSending}
            onClick={handleSend}
            type="button"
            variant="primary"
          >
            {isSending ? <SpinnerMini /> : "Save And Send"}
          </Button>
        )}
      </div>
    </form>
  );
};

export default FormEditPaymentVoucher;
