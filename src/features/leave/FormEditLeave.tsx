// src/features/leave/FormEditLeave.tsx
import { useMemo, useState } from "react";
import { LeaveType, LEAVE_TYPE_CONFIG, LeaveFormData } from "../../interfaces";
import FormRow from "../../ui/FormRow";
import Input from "../../ui/Input";
import Row from "../../ui/Row";
import SpinnerMini from "../../ui/SpinnerMini";
import Select from "../../ui/Select";
import Button from "../../ui/Button";
import NetworkErrorUI from "../../ui/NetworkErrorUI";
import DatePicker from "../../ui/DatePicker";
import { FileUpload } from "../../ui/FileUpload";
import { useSaveLeaveDraft, useUpdateLeaveApplication } from "./Hooks/useLeave";
import { useUsers } from "../user/Hooks/useUsers";
import { localStorageUser } from "../../utils/localStorageUser";
import { useMyLeaveBalance } from "./Hooks/useLeave";
import { useDispatch } from "react-redux";
import { resetLeave } from "../../store/leaveSlice";
import LeaveBalanceCard from "../../ui/LeaveBalanceCard";

interface FormEditLeaveProps {
  leave: LeaveType;
}

const FormEditLeave = ({ leave }: FormEditLeaveProps) => {
  const currentUser = localStorageUser();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState<LeaveFormData>({
    leaveType: leave.leaveType,
    startDate: leave.startDate,
    endDate: leave.endDate,
    reasonForLeave: leave.reasonForLeave || "",
    contactDuringLeave: leave.contactDuringLeave || "",
    reviewedById: leave.reviewedBy?.id || null,
    approvedById: leave.approvedBy?.id || null,
    leaveCover: leave.leaveCover || {
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

  const admins = useMemo(
    () => users.filter((u) => ["SUPER-ADMIN", "ADMIN"].includes(u.role)),
    [users]
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
    updateLeaveApplication,
    isPending: isUpdating,
    isError: isErrorUpdate,
  } = useUpdateLeaveApplication(leave.id!);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const isFormValid = (e.target as HTMLFormElement).reportValidity();

    if (!isFormValid) return;

    // Clear both reviewer and approver for draft save (matching Concept Note)
    const data = { ...formData, reviewedById: null, approvedById: null };
    saveLeaveDraft(data);
    dispatch(resetLeave());
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    const isFormValid = (e.target as HTMLFormElement).reportValidity();

    if (!isFormValid) return;

    // Validate based on current status (matching Concept Note)
    if (leave.status === "draft" || leave.status === "rejected") {
      if (!formData.reviewedById) {
        alert("Please select a reviewer before submitting");
        return;
      }
    }

    if (leave.status === "reviewed") {
      if (!formData.approvedById) {
        alert("Please select an approver before submitting");
        return;
      }
    }

    // Balance validation (additional business logic)
    if (totalDays > availableBalance && leave.status !== "approved") {
      alert(
        `You only have ${availableBalance} days available for this leave type`
      );
      return;
    }

    const data = { ...formData };
    updateLeaveApplication({ data, files: selectedFiles });
    dispatch(resetLeave());
  };

  if (isErrorSave || isErrorUpdate) {
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
        <h1 className="text-lg font-extrabold text-gray-800  text-center">
          <span>Leave Application Form</span>
        </h1>

        <Row>
          <p className="font-bold" style={{ letterSpacing: "1px" }}>
            {`Status : ${leave.status}`}
          </p>
          <p className="" style={{ letterSpacing: "1px" }}>
            {`Staff : ${leave.staff_name}`}
          </p>
        </Row>

        {/* {isLoadingBalance ? (
        <div className="flex justify-center py-4">
          <SpinnerMini />
        </div>
      ) : (
        leaveBalance && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-2">
              Current Leave Balance
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              <div>Annual: {leaveBalance.annualLeave.balance} days</div>
              <div>Sick: {leaveBalance.sickLeave.balance} days</div>
              <div>
                Compassionate: {leaveBalance.compassionateLeave.balance} days
              </div>
              <div>Emergency: {leaveBalance.emergencyLeave.balance} days</div>
            </div>
          </div>
        )
      )} */}

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
              disabled={leave.status !== "draft" && leave.status !== "rejected"}
            />
          </FormRow>

          {/* Conditional selection based on status - matching Concept Note */}
          {(leave.status === "draft" || leave.status === "rejected") && (
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
          )}

          {leave.status === "reviewed" && (
            <FormRow label="Approver *">
              {isLoadingUsers ? (
                <SpinnerMini />
              ) : (
                <Select
                  filterable={true}
                  clearable={true}
                  id="approvedById"
                  customLabel="Select Approver"
                  value={formData.approvedById || ""}
                  onChange={(value) => handleFormChange("approvedById", value)}
                  options={admins.map((user) => ({
                    id: user.id as string,
                    name: `${user.first_name} ${user.last_name} (${user.role})`,
                  }))}
                  required
                />
              )}
            </FormRow>
          )}

          {/* Show read-only info for other statuses */}
          {(leave.status === "approved" || leave.status === "pending") &&
            leave.reviewedBy && (
              <div className="space-y-2">
                <p className="mb-2">
                  <span className="font-bold mr-1 uppercase">Reviewed By:</span>
                  {`${leave.reviewedBy.first_name} ${leave.reviewedBy.last_name}`}
                </p>
              </div>
            )}

          {leave.status === "approved" && leave.approvedBy && (
            <p className="mb-2">
              <span className="font-bold mr-1 uppercase">Approved By:</span>
              {`${leave.approvedBy.first_name} ${leave.approvedBy.last_name}`}
            </p>
          )}
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
              disabled={leave.status !== "draft" && leave.status !== "rejected"}
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
                disabled={
                  leave.status !== "draft" && leave.status !== "rejected"
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
              disabled={leave.status !== "draft" && leave.status !== "rejected"}
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
              disabled={leave.status !== "draft" && leave.status !== "rejected"}
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
              disabled={leave.status !== "draft" && leave.status !== "rejected"}
            />
          </FormRow>
        </Row>

        {/* <Row cols="grid-cols-1 md:grid-cols-2">
        <FormRow label="Name of Cover (Optional)">
          <Input
            type="text"
            id="nameOfCover"
            value={formData.leaveCover?.nameOfCover}
            onChange={(e) => handleNestedChange("nameOfCover", e.target.value)}
            placeholder="Person covering your duties"
            disabled={leave.status !== "draft" && leave.status !== "rejected"}
          />
        </FormRow>

        <FormRow label="Cover Signature (Optional)">
          <Input
            type="text"
            id="signature"
            value={formData.leaveCover?.signature}
            onChange={(e) => handleNestedChange("signature", e.target.value)}
            placeholder="Signature or acknowledgment"
            disabled={leave.status !== "draft" && leave.status !== "rejected"}
          />
        </FormRow>
      </Row> */}
      </div>

      {/* File upload based on status and selections - matching Concept Note */}
      {(leave.status === "draft" || leave.status === "rejected") &&
        formData.reviewedById && (
          <FileUpload
            selectedFiles={selectedFiles}
            setSelectedFiles={setSelectedFiles}
            accept=".jpg,.png,.pdf,.docx"
            multiple={true}
          />
        )}

      {leave.status === "reviewed" && formData.approvedById && (
        <FileUpload
          selectedFiles={selectedFiles}
          setSelectedFiles={setSelectedFiles}
          accept=".jpg,.png,.pdf,.docx"
          multiple={true}
        />
      )}

      <div className="flex justify-center w-full gap-4">
        {/* Save as Draft button - for drafts/rejected without reviewer (matching Concept Note) */}
        {(leave.status === "draft" || leave.status === "rejected") &&
          !formData.reviewedById && (
            <Button size="medium" disabled={isSaving} onClick={handleSave}>
              {isSaving ? <SpinnerMini /> : "Update as Draft"}
            </Button>
          )}

        {/* Submit for Review button - for drafts/rejected with reviewer (matching Concept Note) */}
        {(leave.status === "draft" || leave.status === "rejected") &&
          formData.reviewedById && (
            <Button
              size="medium"
              disabled={isUpdating || totalDays > availableBalance}
              onClick={handleUpdate}
            >
              {isUpdating ? <SpinnerMini /> : "Submit for Review"}
            </Button>
          )}

        {/* Submit for Approval button - for reviewed with approver (matching Concept Note) */}
        {leave.status === "reviewed" && formData.approvedById && (
          <Button size="medium" disabled={isUpdating} onClick={handleUpdate}>
            {isUpdating ? <SpinnerMini /> : "Submit for Approval"}
          </Button>
        )}
      </div>
    </form>
  );
};

export default FormEditLeave;
