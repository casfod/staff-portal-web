// src/features/leave/FormAddLeave.tsx
import { useMemo, useState } from "react";
import { LEAVE_TYPE_CONFIG, LeaveFormData } from "../../interfaces";
import FormRow from "../../ui/FormRow";
import Input from "../../ui/Input";
import Row from "../../ui/Row";
import SpinnerMini from "../../ui/SpinnerMini";
import Select from "../../ui/Select";
import Button from "../../ui/Button";
import NetworkErrorUI from "../../ui/NetworkErrorUI";
import DatePicker from "../../ui/DatePicker";
import { FileUpload } from "../../ui/FileUpload";
import LeaveBalanceCard from "../../ui/LeaveBalanceCard";
import { useSaveLeaveDraft, useCreateLeaveApplication } from "./Hooks/useLeave";
import { useUsers } from "../user/Hooks/useUsers";
import { localStorageUser } from "../../utils/localStorageUser";
import { useMyLeaveBalance } from "./Hooks/useLeave";

const FormAddLeave = () => {
  const currentUser = localStorageUser();

  const [formData, setFormData] = useState<LeaveFormData>({
    leaveType: undefined,
    startDate: undefined,
    endDate: undefined,
    reasonForLeave: "",
    contactDuringLeave: "",
    reviewedById: null,
    approvedById: null,
    leaveCover: {
      nameOfCover: "",
      signature: "",
    },
  });

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  // const [showFullBalance, setShowFullBalance] = useState(false);
  const [showFullBalance] = useState(false);

  const { data: usersData, isLoading: isLoadingUsers } = useUsers({
    limit: 1000,
  });
  const { data: leaveBalanceData, isLoading: isLoadingBalance } =
    useMyLeaveBalance();

  const users = useMemo(
    () =>
      usersData?.data?.users.filter((user) => user.id !== currentUser.id) ?? [],
    [usersData, currentUser.id]
  );

  const leaveBalance = leaveBalanceData?.data;

  const leaveTypeOptions = Object.entries(LEAVE_TYPE_CONFIG).map(
    ([key, value]) => ({
      id: key,
      name: `${key} (Max: ${value.maxDays} days)`,
    })
  );

  const calculateDays = (
    startDate: string,
    endDate: string,
    leaveType: string
  ) => {
    if (!startDate || !endDate || !leaveType) return 0;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const config =
      LEAVE_TYPE_CONFIG[leaveType as keyof typeof LEAVE_TYPE_CONFIG];

    if (config?.isCalendarDays) {
      return diffDays;
    }

    let workingDays = 0;
    const currentDate = new Date(start);

    while (currentDate <= end) {
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        workingDays++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return workingDays;
  };

  const totalDays = useMemo(() => {
    if (formData.startDate && formData.endDate && formData.leaveType) {
      return calculateDays(
        formData.startDate.toString(),
        formData.endDate.toString(),
        formData.leaveType
      );
    }
    return 0;
  }, [formData.startDate, formData.endDate, formData.leaveType]);

  const getAvailableBalance = () => {
    if (!formData.leaveType || !leaveBalance) return 0;

    const balanceMap: any = {
      "Annual leave": leaveBalance?.annualLeave,
      "Compassionate leave": leaveBalance?.compassionateLeave,
      "Sick leave": leaveBalance?.sickLeave,
      "Maternity leave": leaveBalance?.maternityLeave,
      "Paternity leave": leaveBalance?.paternityLeave,
      "Emergency leave": leaveBalance?.emergencyLeave,
      "Study Leave": leaveBalance?.studyLeave,
      "Leave without pay": leaveBalance?.leaveWithoutPay,
    };

    return balanceMap[formData.leaveType]?.balance || 0;
  };

  const availableBalance = useMemo(
    () => getAvailableBalance(),
    [formData.leaveType, leaveBalance]
  );

  const handleFormChange = (field: keyof LeaveFormData, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleNestedChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      leaveCover: {
        ...formData.leaveCover,
        [field]: value,
      },
    });
  };

  const handleBalanceClick = (leaveType: string) => {
    const leaveTypeKey = Object.keys(LEAVE_TYPE_CONFIG).find((key) =>
      key.toLowerCase().includes(leaveType.toLowerCase())
    );
    if (leaveTypeKey) {
      handleFormChange("leaveType", leaveTypeKey);
    }
  };

  const {
    saveLeaveDraft,
    isPending: isSaving,
    isError: isErrorSave,
  } = useSaveLeaveDraft();

  const {
    createLeaveApplication,
    isPending: isSending,
    isError: isErrorSend,
  } = useCreateLeaveApplication();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const isFormValid = (e.target as HTMLFormElement).reportValidity();

    if (!isFormValid) return;

    // Clear reviewer for draft save (matching Concept Note)
    const data = { ...formData, reviewedById: null, approvedById: null };
    saveLeaveDraft(data);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const isFormValid = (e.target as HTMLFormElement).reportValidity();

    if (!isFormValid) return;

    // Validate reviewer is selected (matching Concept Note)
    if (!formData.reviewedById) {
      alert("Please select a reviewer before submitting");
      return;
    }

    if (!formData.leaveType) {
      alert("Please select a leave type");
      return;
    }

    if (!formData.startDate) {
      alert("Please select a start date");
      return;
    }

    if (!formData.endDate) {
      alert("Please select an end date");
      return;
    }

    if (!formData.reasonForLeave) {
      alert("Please provide a reason for leave");
      return;
    }

    // Balance validation (additional business logic)
    if (totalDays > availableBalance) {
      alert(
        `You only have ${availableBalance} days available for this leave type`
      );
      return;
    }

    const data = { ...formData };
    createLeaveApplication({ data, files: selectedFiles });
  };

  if (isErrorSave || isErrorSend) {
    return <NetworkErrorUI />;
  }

  return (
    <form className="space-y-6">
      {/* Leave Balance Card */}
      <LeaveBalanceCard
        leaveBalance={leaveBalance}
        isLoading={isLoadingBalance}
        showAllTypes={showFullBalance}
        onBalanceClick={handleBalanceClick}
        warningThreshold={0.2}
      />

      {/* Toggle for showing all leave types */}
      {/* {leaveBalance && (
        <button
          type="button"
          onClick={() => setShowFullBalance(!showFullBalance)}
          className="text-sm text-blue-600 hover:text-blue-800 transition"
        >
          {showFullBalance ? "Show less" : "Show all leave types"}
        </button>
      )} */}

      <div className="bg-gray-100 space-y-6 border-2 border-gray-200 p-4 rounded-lg">
        <Row cols="grid-cols-1 md:grid-cols-2">
          <FormRow label="Leave Type *">
            <Select
              filterable={true}
              clearable={true}
              id="leaveType"
              customLabel="Select Leave Type"
              value={formData.leaveType || ""}
              onChange={(value) => handleFormChange("leaveType", value)}
              options={leaveTypeOptions}
              required
            />
          </FormRow>

          <FormRow label="Reviewer *">
            {isLoadingUsers ? (
              <SpinnerMini />
            ) : (
              <Select
                filterable={true}
                clearable={true}
                id="reviewedById"
                customLabel="Select Reviewer"
                value={formData.reviewedById || ""}
                onChange={(value) => handleFormChange("reviewedById", value)}
                options={users.map((user) => ({
                  id: user.id as string,
                  name: `${user.first_name} ${user.last_name} (${user.role})`,
                }))}
                required
              />
            )}
          </FormRow>
        </Row>

        <Row cols="grid-cols-1 md:grid-cols-2">
          <FormRow label="Start Date *">
            <DatePicker
              selected={
                formData.startDate ? new Date(formData.startDate) : null
              }
              onChange={(date) =>
                handleFormChange("startDate", date ? date.toISOString() : "")
              }
              variant="secondary"
              placeholder="Select start date"
            />
          </FormRow>

          {formData.startDate && (
            <FormRow label="End Date *">
              <DatePicker
                selected={formData.endDate ? new Date(formData.endDate) : null}
                onChange={(date) =>
                  handleFormChange("endDate", date ? date.toISOString() : "")
                }
                variant="secondary"
                placeholder="Select end date"
                minDate={
                  formData.startDate ? new Date(formData.startDate) : undefined
                }
              />
            </FormRow>
          )}

          {totalDays > 0 && (
            <div className="col-span-2 flex items-end pb-3">
              <div
                className={`p-2 rounded ${
                  totalDays > availableBalance
                    ? "bg-red-100 text-red-800"
                    : "bg-green-100 text-green-800"
                }`}
              >
                Total Days: {totalDays} | Available: {availableBalance} days
              </div>
            </div>
          )}
        </Row>

        <Row>
          <FormRow label="Reason for Leave *" type="wide">
            <textarea
              className="border-2 h-24 min-h-24 rounded-lg focus:outline-none p-3 w-full"
              maxLength={1000}
              id="reasonForLeave"
              required
              value={formData.reasonForLeave}
              onChange={(e) =>
                handleFormChange("reasonForLeave", e.target.value)
              }
              placeholder="Please provide reason for your leave application"
            />
          </FormRow>
        </Row>

        <Row cols="grid-cols-1 md:grid-cols-2">
          <FormRow label="Contact During Leave">
            <Input
              type="text"
              id="contactDuringLeave"
              value={formData.contactDuringLeave}
              onChange={(e) =>
                handleFormChange("contactDuringLeave", e.target.value)
              }
              placeholder="Phone number or email"
            />
          </FormRow>

          <FormRow label="Name of Cover (Optional)">
            <Input
              type="text"
              id="nameOfCover"
              value={formData.leaveCover?.nameOfCover}
              onChange={(e) =>
                handleNestedChange("nameOfCover", e.target.value)
              }
              placeholder="Person covering your duties"
            />
          </FormRow>
        </Row>
      </div>

      {/* <Row cols="grid-cols-1 md:grid-cols-2">
        <FormRow label="Name of Cover (Optional)">
          <Input
            type="text"
            id="nameOfCover"
            value={formData.leaveCover?.nameOfCover}
            onChange={(e) => handleNestedChange("nameOfCover", e.target.value)}
            placeholder="Person covering your duties"
          />
        </FormRow>

        <FormRow label="Cover Signature (Optional)">
          <Input
            type="text"
            id="signature"
            value={formData.leaveCover?.signature}
            onChange={(e) => handleNestedChange("signature", e.target.value)}
            placeholder="Signature or acknowledgment"
          />
        </FormRow>
      </Row> */}

      {/* File upload only when reviewer is selected (matching Concept Note) */}
      {formData.reviewedById && (
        <FileUpload
          selectedFiles={selectedFiles}
          setSelectedFiles={setSelectedFiles}
          accept=".jpg,.png,.pdf,.docx"
          multiple={true}
        />
      )}

      <div className="flex justify-center w-full gap-4">
        {/* Save as Draft button - only when no reviewer (matching Concept Note) */}
        {!formData.reviewedById && (
          <Button disabled={isSaving} size="medium" onClick={handleSave}>
            {isSaving ? <SpinnerMini /> : "Save as Draft"}
          </Button>
        )}

        {/* Submit for Review button - only when reviewer selected (matching Concept Note) */}
        {formData.reviewedById && (
          <Button
            size="medium"
            disabled={isSending || totalDays > availableBalance}
            onClick={handleSend}
          >
            {isSending ? <SpinnerMini /> : "Submit for Review"}
          </Button>
        )}
      </div>
    </form>
  );
};

export default FormAddLeave;
