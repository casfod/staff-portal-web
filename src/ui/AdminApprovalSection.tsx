import React from "react";
import FormRow from "./FormRow";
import SpinnerMini from "./SpinnerMini";
import Select from "./Select";
import Button from "./Button";
import { PurChaseRequestType } from "../interfaces";

interface AdminApprovalSectionProps {
  formData: Partial<PurChaseRequestType>;
  handleFormChange: (field: string, value: string) => void;
  admins: any[];
  isLoadingAmins: boolean;
  isUpdating: boolean;
  handleSend: (e: React.FormEvent) => void;
}

const AdminApprovalSection = ({
  formData,
  handleFormChange,
  admins,
  isLoadingAmins,
  isUpdating,
  handleSend,
}: AdminApprovalSectionProps) => {
  console.log("AdminApprovalSection::::", formData);

  // Safely get the approvedBy value
  const approvedByValue =
    typeof formData.approvedBy === "string"
      ? formData.approvedBy
      : (formData.approvedBy as any)?.id || "";

  return (
    <div className="relative z-10 mt-4">
      <FormRow label="Approved By *">
        {isLoadingAmins ? (
          <SpinnerMini />
        ) : (
          <Select
            clearable={true}
            id="approvedBy"
            customLabel="Select an admin"
            value={approvedByValue}
            onChange={(value) => handleFormChange("approvedBy", value)}
            options={admins.map((admin) => ({
              id: admin.id,
              name: `${admin.first_name} ${admin.last_name}`,
            }))}
            required
            optionsHeight={200}
          />
        )}
      </FormRow>
      <div className="flex w-full justify-center p-4">
        {approvedByValue && (
          <Button disabled={isUpdating} size="medium" onClick={handleSend}>
            {isUpdating ? <SpinnerMini /> : "Request Approval"}
          </Button>
        )}
      </div>
    </div>
  );
};

export default AdminApprovalSection;
