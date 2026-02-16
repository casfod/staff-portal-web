import React, { useState, useEffect } from "react";
import Input from "../../ui/Input";
import Button from "../../ui/Button";
import FormRow from "../../ui/FormRow";
import Row from "../../ui/Row";
import SpinnerMini from "../../ui/SpinnerMini";
import Select from "../../ui/Select";
import DatePicker from "../../ui/DatePicker";
import { EmploymentInfoType, UserType } from "../../interfaces";
import {
  useMyEmploymentInfo,
  useUpdateMyEmploymentInfo,
} from "./Hooks/useEmploymentInfo";
import { bankNames } from "../../assets/Banks";
import { localStorageUser } from "../../utils/localStorageUser";
// import { useSuperAdminUpdateEmploymentInfo } from "./Hooks/useEmploymentInfo"; // You'll need to create this hook

interface StaffInformationFormProps {
  onClose?: () => void;
  staffInfo?: UserType;
  isAdminView?: boolean;
}

const maritalStatusOptions = [
  { id: "Single", name: "Single" },
  { id: "Married", name: "Married" },
  { id: "Divorced", name: "Divorced" },
  { id: "Widowed", name: "Widowed" },
];

const relationshipOptions = [
  { id: "Spouse", name: "Spouse" },
  { id: "Parent", name: "Parent" },
  { id: "Sibling", name: "Sibling" },
  { id: "Child", name: "Child" },
  { id: "Friend", name: "Friend" },
  { id: "Other", name: "Other" },
];

const bankOptions = bankNames.map((bank) => ({
  id: bank.name,
  name: bank.name,
}));

const StaffInformationForm: React.FC<StaffInformationFormProps> = ({
  onClose,
  staffInfo,
  isAdminView = false,
}) => {
  const currentUser = localStorageUser();
  const isSuperAdmin = currentUser?.role === "SUPER-ADMIN";

  // For self-service mode
  const { data, isLoading: isLoadingSelfData } = useMyEmploymentInfo();
  const { updateEmploymentInfo, isPending: isUpdatingSelf } =
    useUpdateMyEmploymentInfo();

  // For super-admin updates (you'll need to create this hook)
  // const { superAdminUpdate, isPending: isSuperAdminUpdating } = useSuperAdminUpdateEmploymentInfo();

  const isPending = isUpdatingSelf; // Add isSuperAdminUpdating when available

  // Initialize form data
  const [formData, setFormData] = useState<EmploymentInfoType>(() => {
    const emptyForm: EmploymentInfoType = {
      personalDetails: {
        fullName: "",
        stateOfOrigin: "",
        lga: "",
        religion: "",
        address: "",
        homePhone: "",
        cellPhone: "",
        emailAddress: "",
        ninNumber: "",
        birthDate: undefined,
        maritalStatus: undefined,
        spouseName: "",
        spouseAddress: "",
        spousePhone: "",
        numberOfChildren: 0,
      },
      jobDetails: {
        title: "",
        idNo: "",
        workLocation: "",
        workEmail: "",
        workPhone: "",
        workCellPhone: "",
        startDate: undefined,
        endDate: undefined,
        supervisor: "",
      },
      emergencyContact: {
        fullName: "",
        address: "",
        primaryPhone: "",
        cellPhone: "",
        relationship: "",
      },
      bankDetails: {
        bankName: "",
        accountName: "",
        bankSortCode: "",
        accountNumber: "",
      },
    };

    // If we have staffInfo (for admin view or editing another user)
    if (staffInfo) {
      if (staffInfo.employmentInfo) {
        return {
          ...emptyForm,
          ...staffInfo.employmentInfo,
          personalDetails: {
            ...emptyForm.personalDetails,
            ...staffInfo.employmentInfo.personalDetails,
            fullName:
              staffInfo.employmentInfo.personalDetails?.fullName ||
              `${staffInfo.first_name} ${staffInfo.last_name}`,
          },
          jobDetails: {
            ...emptyForm.jobDetails,
            ...staffInfo.employmentInfo.jobDetails,
            title:
              staffInfo.employmentInfo.jobDetails?.title ||
              staffInfo.position ||
              "",
          },
          emergencyContact: {
            ...emptyForm.emergencyContact,
            ...staffInfo.employmentInfo.emergencyContact,
          },
          bankDetails: {
            ...emptyForm.bankDetails,
            ...staffInfo.employmentInfo.bankDetails,
          },
        };
      }

      // No existing employment info
      return {
        ...emptyForm,
        personalDetails: {
          ...emptyForm.personalDetails,
          fullName: `${staffInfo.first_name} ${staffInfo.last_name}`,
        },
        jobDetails: {
          ...emptyForm.jobDetails,
          title: staffInfo.position || "",
        },
      };
    }

    return emptyForm;
  });

  // For self-service mode, load existing data from API
  useEffect(() => {
    if (isAdminView) return; // Skip if admin view

    if (data?.data?.employmentInfo) {
      const existingData = data.data.employmentInfo;
      setFormData((prev) => ({
        ...prev,
        ...existingData,
        personalDetails: {
          ...prev.personalDetails,
          ...existingData.personalDetails,
        },
        jobDetails: {
          ...prev.jobDetails,
          ...existingData.jobDetails,
        },
        emergencyContact: {
          ...prev.emergencyContact,
          ...existingData.emergencyContact,
        },
        bankDetails: {
          ...prev.bankDetails,
          ...existingData.bankDetails,
        },
      }));
    }
  }, [data, isAdminView]);

  const handleFormChange = (
    section: keyof EmploymentInfoType,
    field: string,
    value: string | number | Date | null | undefined
  ) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...(prev[section] as object),
        [field]: value,
      },
    }));
  };

  const handleDateChange = (
    section: keyof EmploymentInfoType,
    field: string,
    date: Date | null
  ) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...(prev[section] as object),
        [field]: date,
      },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const isFormValid = form.reportValidity();

    if (!isFormValid) return;

    if (isAdminView && staffInfo?.id && isSuperAdmin) {
      // Super-admin updating another user
      // This would call superAdminUpdate
      console.log("Super-admin updating user:", staffInfo.id, formData);
      // superAdminUpdate({ userId: staffInfo.id, data: formData }, {
      //   onSuccess: () => {
      //     if (onClose) onClose();
      //   },
      // });
    } else {
      // Self-service update
      updateEmploymentInfo(formData, {
        onSuccess: () => {
          if (onClose) onClose();
        },
      });
    }
  };

  // Check if user can update
  const canUpdate = isAdminView
    ? isSuperAdmin // Only super-admin can update others
    : data?.data?.canUpdate !== false; // Self-service check

  if (!isAdminView && isLoadingSelfData) {
    return (
      <div className="flex justify-center items-center h-64">
        <SpinnerMini />
      </div>
    );
  }

  if (!canUpdate) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <h3 className="text-lg font-medium text-yellow-800 mb-2">
          Updates Currently Disabled
        </h3>
        <p className="text-yellow-700">
          {isAdminView
            ? "You don't have permission to update this user's information."
            : "Employment information updates are currently disabled. Please contact your administrator if you need to make changes."}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Personal Details Section */}
      <div className="border-b-2 border-gray-300 pb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Personal Details
        </h2>

        <div className="space-y-3">
          <Row cols="grid-cols-1 lg:grid-cols-2">
            <FormRow label="Full Name *">
              <Input
                type="text"
                id="fullName"
                required
                placeholder="Enter your full name"
                value={formData.personalDetails?.fullName || ""}
                onChange={(e) =>
                  handleFormChange(
                    "personalDetails",
                    "fullName",
                    e.target.value
                  )
                }
              />
            </FormRow>

            <FormRow label="Date of Birth">
              <DatePicker
                selected={
                  formData.personalDetails?.birthDate
                    ? new Date(formData.personalDetails.birthDate)
                    : null
                }
                onChange={(date) =>
                  handleDateChange("personalDetails", "birthDate", date)
                }
                variant="secondary"
                placeholder="Select date of birth"
              />
            </FormRow>
          </Row>

          <Row cols="grid-cols-1 lg:grid-cols-2">
            <FormRow label="State of Origin">
              <Input
                type="text"
                id="stateOfOrigin"
                placeholder="Enter state of origin"
                value={formData.personalDetails?.stateOfOrigin || ""}
                onChange={(e) =>
                  handleFormChange(
                    "personalDetails",
                    "stateOfOrigin",
                    e.target.value
                  )
                }
              />
            </FormRow>

            <FormRow label="LGA">
              <Input
                type="text"
                id="lga"
                placeholder="Enter local government area"
                value={formData.personalDetails?.lga || ""}
                onChange={(e) =>
                  handleFormChange("personalDetails", "lga", e.target.value)
                }
              />
            </FormRow>
          </Row>

          <Row cols="grid-cols-1 lg:grid-cols-2">
            <FormRow label="Religion">
              <Input
                type="text"
                id="religion"
                placeholder="Enter religion"
                value={formData.personalDetails?.religion || ""}
                onChange={(e) =>
                  handleFormChange(
                    "personalDetails",
                    "religion",
                    e.target.value
                  )
                }
              />
            </FormRow>

            <FormRow label="Marital Status">
              <Select
                clearable={true}
                id="maritalStatus"
                customLabel="Select marital status"
                value={formData.personalDetails?.maritalStatus || ""}
                onChange={(value) =>
                  handleFormChange("personalDetails", "maritalStatus", value)
                }
                options={maritalStatusOptions}
              />
            </FormRow>
          </Row>

          <Row>
            <FormRow label="Residential Address *" type="wide">
              <Input
                type="text"
                id="address"
                required
                placeholder="Enter your residential address"
                value={formData.personalDetails?.address || ""}
                onChange={(e) =>
                  handleFormChange("personalDetails", "address", e.target.value)
                }
              />
            </FormRow>
          </Row>

          <Row cols="grid-cols-1 lg:grid-cols-2">
            <FormRow label="Home Phone">
              <Input
                type="tel"
                id="homePhone"
                placeholder="Enter home phone number"
                value={formData.personalDetails?.homePhone || ""}
                onChange={(e) =>
                  handleFormChange(
                    "personalDetails",
                    "homePhone",
                    e.target.value
                  )
                }
              />
            </FormRow>

            <FormRow label="Cell Phone *">
              <Input
                type="tel"
                id="cellPhone"
                required
                placeholder="Enter mobile phone number"
                value={formData.personalDetails?.cellPhone || ""}
                onChange={(e) =>
                  handleFormChange(
                    "personalDetails",
                    "cellPhone",
                    e.target.value
                  )
                }
              />
            </FormRow>
          </Row>

          <Row cols="grid-cols-1 lg:grid-cols-2">
            <FormRow label="Personal Email">
              <Input
                type="email"
                id="emailAddress"
                placeholder="Enter personal email address"
                value={formData.personalDetails?.emailAddress || ""}
                onChange={(e) =>
                  handleFormChange(
                    "personalDetails",
                    "emailAddress",
                    e.target.value
                  )
                }
              />
            </FormRow>

            <FormRow label="NIN Number *">
              <Input
                type="text"
                id="ninNumber"
                required
                placeholder="Enter NIN number"
                value={formData.personalDetails?.ninNumber || ""}
                onChange={(e) =>
                  handleFormChange(
                    "personalDetails",
                    "ninNumber",
                    e.target.value
                  )
                }
              />
            </FormRow>
          </Row>
        </div>

        {/* Spouse Information - Conditional */}
        {formData.personalDetails?.maritalStatus === "Married" && (
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Spouse Information
            </h3>
            <div className="space-y-3">
              <Row cols="grid-cols-1 lg:grid-cols-2">
                <FormRow label="Spouse's Full Name">
                  <Input
                    type="text"
                    id="spouseName"
                    placeholder="Enter spouse's full name"
                    value={formData.personalDetails?.spouseName || ""}
                    onChange={(e) =>
                      handleFormChange(
                        "personalDetails",
                        "spouseName",
                        e.target.value
                      )
                    }
                  />
                </FormRow>

                <FormRow label="Spouse's Phone">
                  <Input
                    type="tel"
                    id="spousePhone"
                    placeholder="Enter spouse's phone number"
                    value={formData.personalDetails?.spousePhone || ""}
                    onChange={(e) =>
                      handleFormChange(
                        "personalDetails",
                        "spousePhone",
                        e.target.value
                      )
                    }
                  />
                </FormRow>
              </Row>

              <Row>
                <FormRow label="Spouse's Address" type="wide">
                  <Input
                    type="text"
                    id="spouseAddress"
                    placeholder="Enter spouse's address"
                    value={formData.personalDetails?.spouseAddress || ""}
                    onChange={(e) =>
                      handleFormChange(
                        "personalDetails",
                        "spouseAddress",
                        e.target.value
                      )
                    }
                  />
                </FormRow>
              </Row>

              <Row cols="grid-cols-1 lg:grid-cols-2">
                <FormRow label="Number of Children">
                  <Input
                    type="number"
                    id="numberOfChildren"
                    min="0"
                    placeholder="Enter number of children"
                    value={formData.personalDetails?.numberOfChildren || 0}
                    onChange={(e) =>
                      handleFormChange(
                        "personalDetails",
                        "numberOfChildren",
                        parseInt(e.target.value) || 0
                      )
                    }
                  />
                </FormRow>
              </Row>
            </div>
          </div>
        )}
      </div>

      {/* Job Information Section */}
      <div className="border-b-2 border-gray-300 pb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Job Information
        </h2>

        <div className="space-y-3">
          <Row cols="grid-cols-1 lg:grid-cols-2">
            <FormRow label="Job Title *">
              <Input
                type="text"
                id="jobTitle"
                required
                placeholder="Enter job title"
                value={formData.jobDetails?.title || ""}
                onChange={(e) =>
                  handleFormChange("jobDetails", "title", e.target.value)
                }
              />
            </FormRow>

            <FormRow label="Staff ID No.">
              <Input
                type="text"
                id="idNo"
                placeholder="Enter staff ID number"
                value={formData.jobDetails?.idNo || ""}
                onChange={(e) =>
                  handleFormChange("jobDetails", "idNo", e.target.value)
                }
              />
            </FormRow>
          </Row>

          <Row cols="grid-cols-1 lg:grid-cols-2">
            <FormRow label="Work Location">
              <Input
                type="text"
                id="workLocation"
                placeholder="Enter work location"
                value={formData.jobDetails?.workLocation || ""}
                onChange={(e) =>
                  handleFormChange("jobDetails", "workLocation", e.target.value)
                }
              />
            </FormRow>

            <FormRow label="Work Email">
              <Input
                type="email"
                id="workEmail"
                placeholder="Enter work email address"
                value={formData.jobDetails?.workEmail || ""}
                onChange={(e) =>
                  handleFormChange("jobDetails", "workEmail", e.target.value)
                }
              />
            </FormRow>
          </Row>

          <Row cols="grid-cols-1 lg:grid-cols-2">
            <FormRow label="Work Phone">
              <Input
                type="tel"
                id="workPhone"
                placeholder="Enter work phone number"
                value={formData.jobDetails?.workPhone || ""}
                onChange={(e) =>
                  handleFormChange("jobDetails", "workPhone", e.target.value)
                }
              />
            </FormRow>

            <FormRow label="Work Cell Phone">
              <Input
                type="tel"
                id="workCellPhone"
                placeholder="Enter work mobile number"
                value={formData.jobDetails?.workCellPhone || ""}
                onChange={(e) =>
                  handleFormChange(
                    "jobDetails",
                    "workCellPhone",
                    e.target.value
                  )
                }
              />
            </FormRow>
          </Row>

          <Row cols="grid-cols-1 lg:grid-cols-2">
            <FormRow label="Start Date *">
              <DatePicker
                selected={
                  formData.jobDetails?.startDate
                    ? new Date(formData.jobDetails.startDate)
                    : null
                }
                onChange={(date) =>
                  handleDateChange("jobDetails", "startDate", date)
                }
                variant="secondary"
                placeholder="Select start date"
              />
            </FormRow>

            <FormRow label="End Date (if applicable)">
              <DatePicker
                selected={
                  formData.jobDetails?.endDate
                    ? new Date(formData.jobDetails.endDate)
                    : null
                }
                onChange={(date) =>
                  handleDateChange("jobDetails", "endDate", date)
                }
                variant="secondary"
                placeholder="Select end date"
              />
            </FormRow>
          </Row>

          <Row cols="grid-cols-1 lg:grid-cols-2">
            <FormRow label="Supervisor">
              <Input
                type="text"
                id="supervisor"
                placeholder="Enter supervisor's name"
                value={formData.jobDetails?.supervisor || ""}
                onChange={(e) =>
                  handleFormChange("jobDetails", "supervisor", e.target.value)
                }
              />
            </FormRow>
          </Row>
        </div>
      </div>

      {/* Emergency Contact Section */}
      <div className="border-b-2 border-gray-300 pb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Emergency Contact
        </h2>

        <div className="space-y-3">
          <Row>
            <FormRow label="Emergency Contact Full Name *" type="wide">
              <Input
                type="text"
                id="emergencyFullName"
                required
                placeholder="Enter emergency contact's full name"
                value={formData.emergencyContact?.fullName || ""}
                onChange={(e) =>
                  handleFormChange(
                    "emergencyContact",
                    "fullName",
                    e.target.value
                  )
                }
              />
            </FormRow>
          </Row>

          <Row>
            <FormRow label="Emergency Contact Address *" type="wide">
              <Input
                type="text"
                id="emergencyAddress"
                required
                placeholder="Enter emergency contact's address"
                value={formData.emergencyContact?.address || ""}
                onChange={(e) =>
                  handleFormChange(
                    "emergencyContact",
                    "address",
                    e.target.value
                  )
                }
              />
            </FormRow>
          </Row>

          <Row cols="grid-cols-1 lg:grid-cols-2">
            <FormRow label="Primary Phone *">
              <Input
                type="tel"
                id="primaryPhone"
                required
                placeholder="Enter primary phone number"
                value={formData.emergencyContact?.primaryPhone || ""}
                onChange={(e) =>
                  handleFormChange(
                    "emergencyContact",
                    "primaryPhone",
                    e.target.value
                  )
                }
              />
            </FormRow>

            <FormRow label="Alternate Phone">
              <Input
                type="tel"
                id="emergencyCellPhone"
                placeholder="Enter alternate phone number"
                value={formData.emergencyContact?.cellPhone || ""}
                onChange={(e) =>
                  handleFormChange(
                    "emergencyContact",
                    "cellPhone",
                    e.target.value
                  )
                }
              />
            </FormRow>
          </Row>

          <Row cols="grid-cols-1 lg:grid-cols-2">
            <FormRow label="Relationship *">
              <Select
                clearable={true}
                id="relationship"
                customLabel="Select relationship"
                value={formData.emergencyContact?.relationship || ""}
                onChange={(value) =>
                  handleFormChange("emergencyContact", "relationship", value)
                }
                options={relationshipOptions}
                required
              />
            </FormRow>
          </Row>
        </div>
      </div>

      {/* Bank Details Section */}
      <div className="border-b-2 border-gray-300 pb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Bank Details
        </h2>
        <div className="space-y-3">
          <Row cols="grid-cols-1 lg:grid-cols-2">
            <FormRow label="Bank Name *">
              <Select
                clearable={true}
                id="bankName"
                customLabel="Select bank"
                value={formData.bankDetails?.bankName || ""}
                onChange={(value) =>
                  handleFormChange("bankDetails", "bankName", value)
                }
                options={bankOptions}
                required
              />
            </FormRow>

            <FormRow label="Account Name *">
              <Input
                type="text"
                id="accountName"
                required
                placeholder="Enter account holder's name"
                value={formData.bankDetails?.accountName || ""}
                onChange={(e) =>
                  handleFormChange("bankDetails", "accountName", e.target.value)
                }
              />
            </FormRow>
          </Row>

          <Row cols="grid-cols-1 lg:grid-cols-2">
            <FormRow label="Bank Sort Code">
              <Input
                type="text"
                id="bankSortCode"
                placeholder="Enter bank sort code"
                value={formData.bankDetails?.bankSortCode || ""}
                onChange={(e) =>
                  handleFormChange(
                    "bankDetails",
                    "bankSortCode",
                    e.target.value
                  )
                }
              />
            </FormRow>

            <FormRow label="Account Number *">
              <Input
                type="text"
                id="accountNumber"
                required
                placeholder="10-digit account number"
                value={formData.bankDetails?.accountNumber || ""}
                onChange={(e) =>
                  handleFormChange(
                    "bankDetails",
                    "accountNumber",
                    e.target.value
                  )
                }
                maxLength={10}
                minLength={10}
              />
            </FormRow>
          </Row>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end w-full gap-4 pt-4">
        {onClose && (
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        )}
        <Button size="medium" type="submit" disabled={isPending}>
          {isPending ? <SpinnerMini /> : "Save Information"}
        </Button>
      </div>
    </form>
  );
};

export default StaffInformationForm;
