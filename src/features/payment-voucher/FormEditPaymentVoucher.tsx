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
import { useAdmins } from "../user/Hooks/useAdmins";
import { useReviewers } from "../user/Hooks/useReviewers";
import Select from "../../ui/Select";
import { FileUpload } from "../../ui/FileUpload";
import { useSavePaymentVoucher, useSendPaymentVoucher } from "./Hooks/PVHook";
import { useProjects } from "../project/Hooks/useProjects";

interface FormEditVoucherProps {
  paymentVoucher: PaymentVoucherType;
}

const FormEditPaymentVoucher: React.FC<FormEditVoucherProps> = ({
  paymentVoucher,
}) => {
  const dispatch = useDispatch();

  const [formData, setFormData] = useState<PaymentVoucherFormData>({
    departmentalCode: paymentVoucher.departmentalCode,
    pvNumber: paymentVoucher.pvNumber,
    payingStation: paymentVoucher.payingStation,
    payTo: paymentVoucher.payTo,
    being: paymentVoucher.being,
    amountInWords: paymentVoucher.amountInWords,
    grantCode: paymentVoucher.grantCode,
    grossAmount: paymentVoucher.grossAmount,
    vat: paymentVoucher.vat,
    wht: paymentVoucher.wht,
    devLevy: paymentVoucher.devLevy,
    otherDeductions: paymentVoucher.otherDeductions,
    netAmount: paymentVoucher.netAmount,
    chartOfAccountCategories: paymentVoucher.chartOfAccountCategories,
    chartOfAccount: paymentVoucher.chartOfAccount,
    chartOfAccountCode: paymentVoucher.chartOfAccountCode,
    projBudgetLine: paymentVoucher.projBudgetLine,
    note: paymentVoucher.note,
    mandateReference: paymentVoucher.mandateReference,
    reviewedBy: paymentVoucher.reviewedBy?.id || null,
    approvedBy: paymentVoucher.approvedBy?.id || null,
  });

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const { savePaymentVoucher, isPending: isSaving } = useSavePaymentVoucher();
  const { sendPaymentVoucher, isPending: isSending } = useSendPaymentVoucher();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const { data: reviewersData, isLoading: isLoadingReviewers } = useReviewers();
  const { data: adminsData, isLoading: isLoadingAmins } = useAdmins();

  const admins = useMemo(() => adminsData?.data ?? [], [adminsData]);
  const reviewers = useMemo(() => reviewersData?.data ?? [], [reviewersData]);

  const { data: projectData, isLoading: isLoadingProjects } = useProjects();

  const projects = useMemo(
    () => projectData?.data?.projects ?? [],
    [projectData]
  );

  // Calculate net amount whenever financial fields change
  const calculateNetAmount = () => {
    const grossAmount = formData.grossAmount || 0;
    const vat = formData.vat || 0;
    const wht = formData.wht || 0;
    const devLevy = formData.devLevy || 0;
    const otherDeductions = formData.otherDeductions || 0;

    const netAmount = grossAmount - (vat + wht + devLevy + otherDeductions);

    setFormData((prev) => ({
      ...prev,
      netAmount: Math.max(0, netAmount),
    }));
  };

  useEffect(() => {
    calculateNetAmount();
  }, [
    formData.grossAmount,
    formData.vat,
    formData.wht,
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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const saveData: Partial<PaymentVoucherType> = {
      ...formData,
      reviewedBy: null,
      status: "draft" as const,
    };

    savePaymentVoucher(saveData);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();

    const sendData: Partial<PaymentVoucherType> = {
      ...formData,
      status: "pending" as const,
    };

    sendPaymentVoucher({ data: sendData, files: selectedFiles });
    dispatch(resetPaymentVoucher());
  };

  return (
    <form className="space-y-6 uppercase">
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
        <FormRow label="Departmental Code *">
          <Input
            type="text"
            id="departmentalCode"
            required
            value={formData.departmentalCode}
            onChange={(e) =>
              handleFormChange("departmentalCode", e.target.value)
            }
          />
        </FormRow>
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
          <Input
            id="being"
            required
            value={formData.being}
            onChange={(e) => handleFormChange("being", e.target.value)}
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
              optionsHeight={220}
              required
            />
          )}
        </FormRow>

        {/* Second Select: Account Code */}
        {selectedProject && (
          <FormRow label="Grant Code *">
            {isLoadingProjects ? (
              <SpinnerMini />
            ) : (
              <Select
                clearable={true}
                id="grantCode"
                customLabel="Select Grant Code"
                value={formData.grantCode || ""}
                onChange={(value) => handleFormChange("grantCode", value)}
                options={
                  selectedProject
                    ? selectedProject.account_code.map((account) => ({
                        id: `${account.name}`,
                        name: `${account.name}`,
                      }))
                    : []
                }
                optionsHeight={220}
                required
              />
            )}
          </FormRow>
        )}
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
        <FormRow label="VAT (₦)">
          <Input
            type="number"
            min="0"
            step="0.01"
            value={formData.vat}
            onChange={(e) =>
              handleFormChange("vat", parseFloat(e.target.value) || 0)
            }
          />
        </FormRow>
        <FormRow label="WHT (₦)">
          <Input
            type="number"
            min="0"
            step="0.01"
            value={formData.wht}
            onChange={(e) =>
              handleFormChange("wht", parseFloat(e.target.value) || 0)
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

      {/* Chart of Accounts */}
      <Row cols="grid-cols-1 md:grid-cols-2">
        <FormRow label="Chart of Account Categories *">
          <Input
            id="chartOfAccountCategories"
            required
            value={formData.chartOfAccountCategories}
            onChange={(e) =>
              handleFormChange("chartOfAccountCategories", e.target.value)
            }
          />
        </FormRow>
        <FormRow label="Chart of Account *">
          <Input
            id="chartOfAccount"
            required
            value={formData.chartOfAccount}
            onChange={(e) => handleFormChange("chartOfAccount", e.target.value)}
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
          />
        </FormRow>
        <FormRow label="Project Budget Line *">
          <Input
            id="projBudgetLine"
            required
            value={formData.projBudgetLine}
            onChange={(e) => handleFormChange("projBudgetLine", e.target.value)}
          />
        </FormRow>
      </Row>

      <Row cols="grid-cols-1 md:grid-cols-2">
        <FormRow label="Mandate Reference *">
          <Input
            id="mandateReference"
            required
            value={formData.mandateReference}
            onChange={(e) =>
              handleFormChange("mandateReference", e.target.value)
            }
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

      {/* Reviewer/Approver Selection */}
      {paymentVoucher.reviewedBy ? (
        <div>
          <p className="mb-2">
            <span className="font-bold mr-1 uppercase">Reviewed By :</span>
            {`${paymentVoucher?.reviewedBy?.first_name} ${paymentVoucher?.reviewedBy?.last_name}`}
          </p>

          {paymentVoucher?.comments && (
            <div className="mb-2">
              <span className="font-bold mr-1 uppercase">Comments :</span>
              {paymentVoucher?.comments?.map((comment, index) => (
                <div
                  key={index}
                  className="border-2 px-4 py-2 rounded-lg shadow-lg mb-2"
                >
                  <p className="text-base font-extrabold">
                    {`${comment.user.first_name} ${comment.user.last_name}`}
                  </p>
                  <p className="text-sm">{`${comment.text}`}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : paymentVoucher.status === "reviewed" ? (
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
      )}

      {paymentVoucher.status !== "rejected" && formData.reviewedBy && (
        <FileUpload
          selectedFiles={selectedFiles}
          setSelectedFiles={setSelectedFiles}
          accept=".jpg,.png,.pdf,.xlsx,.docx"
          multiple={true}
        />
      )}

      <div className="flex justify-center w-full gap-4">
        {(!formData.reviewedBy ||
          (paymentVoucher.status === "rejected" && formData.reviewedBy)) && (
          <Button size="medium" disabled={isSaving} onClick={handleSave}>
            {isSaving ? <SpinnerMini /> : "Update And Save"}
          </Button>
        )}
        {formData.reviewedBy && (
          <Button size="medium" disabled={isSending} onClick={handleSend}>
            {isSending ? <SpinnerMini /> : "Update And Send"}
          </Button>
        )}
      </div>
    </form>
  );
};

export default FormEditPaymentVoucher;
