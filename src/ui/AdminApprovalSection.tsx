import React from "react";
import FormRow from "./FormRow";
import SpinnerMini from "./SpinnerMini";
import Select from "./Select";
import Button from "./Button";

const AdminApprovalSection = ({
  formData,
  handleFormChange,
  admins,
  isLoadingAmins,
  isUpdating,
  handleSend,
}: {
  formData: { approvedBy: string | null };
  handleFormChange: (field: string, value: string) => void;
  admins: any[];
  isLoadingAmins: boolean;
  isUpdating: boolean;
  handleSend: (e: React.FormEvent) => void;
}) => (
  <div className="relative z-10 mt-4">
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
          options={admins.map((admin) => ({
            id: admin.id,
            name: `${admin.first_name} ${admin.last_name}`,
          }))}
          required
          optionsHeight={200} // Set a fixed height for the dropdown
        />
      )}
    </FormRow>
    <div className="flex w-full justify-center p-4">
      {formData.approvedBy && (
        <Button size="medium" onClick={handleSend}>
          {isUpdating ? <SpinnerMini /> : "Request Approval"}
        </Button>
      )}
    </div>
  </div>
);

export default AdminApprovalSection;
