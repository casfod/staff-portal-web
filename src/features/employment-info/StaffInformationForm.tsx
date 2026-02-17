import React, { useState, useEffect, useMemo } from "react";
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
  useSuperAdminUpdateEmploymentInfo,
} from "./Hooks/useEmploymentInfo";
import { bankNames } from "../../assets/Banks";
import { localStorageUser } from "../../utils/localStorageUser";
import {
  CheckCircle,
  AlertCircle,
  Save,
  X,
  User,
  Briefcase,
  Phone,
  Banknote,
  MapPin,
  Calendar,
  Mail,
  PhoneCall,
  CreditCard,
  Shield,
} from "lucide-react";
import { GoPeople } from "react-icons/go";
import {
  nigerianStates,
  lgaByState,
  nigerianReligions,
} from "../../assets/nigerianData";
import { useUsers } from "../user/Hooks/useUsers";

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

// Nigerian states for select dropdown
const nigeriaStateOptions = nigerianStates.map((state) => ({
  id: state,
  name: state,
}));

// Nigerian religions for select dropdown
const religionOptions = nigerianReligions.map((religion) => ({
  id: religion,
  name: religion,
}));

const StaffInformationForm: React.FC<StaffInformationFormProps> = ({
  onClose,
  staffInfo,
  isAdminView = false,
}) => {
  const currentUser = localStorageUser();
  const isSuperAdmin = currentUser?.role === "SUPER-ADMIN";

  // Track which sections are completed
  const [completedSections, setCompletedSections] = useState({
    personal: false,
    job: false,
    emergency: false,
    bank: false,
  });

  // Track form validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // For self-service mode
  const { data, isLoading: isLoadingSelfData } = useMyEmploymentInfo();
  const { updateEmploymentInfo, isPending: isUpdatingSelf } =
    useUpdateMyEmploymentInfo();

  const { superAdminUpdate, isPending: isUpdatingAdmin } =
    useSuperAdminUpdateEmploymentInfo();

  const {
    data: usersData,
    isLoading: isLoadingUsers,
    // isError,
  } = useUsers({ limit: 1000 });
  const users = useMemo(() => usersData?.data.users ?? [], [data]);

  const isPending = isUpdatingSelf || isUpdatingAdmin;

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

  // Get available LGAs based on selected state
  const getLgaOptions = () => {
    const selectedState = formData.personalDetails?.stateOfOrigin;
    if (selectedState && lgaByState[selectedState]) {
      return lgaByState[selectedState].map((lga) => ({
        id: lga,
        name: lga,
      }));
    }
    return [];
  };

  // Check section completion
  useEffect(() => {
    // Personal section validation
    const personalComplete = !!(
      formData.personalDetails?.fullName &&
      formData.personalDetails?.cellPhone &&
      formData.personalDetails?.address &&
      formData.personalDetails?.ninNumber
    );

    // Job section validation
    const jobComplete = !!(
      formData.jobDetails?.title && formData.jobDetails?.startDate
    );

    // Emergency contact validation
    const emergencyComplete = !!(
      formData.emergencyContact?.fullName &&
      formData.emergencyContact?.primaryPhone &&
      formData.emergencyContact?.address &&
      formData.emergencyContact?.relationship
    );

    // Bank details validation
    const bankComplete = !!(
      formData.bankDetails?.bankName &&
      formData.bankDetails?.accountName &&
      formData.bankDetails?.accountNumber &&
      formData.bankDetails?.accountNumber.length === 10
    );

    setCompletedSections({
      personal: personalComplete,
      job: jobComplete,
      emergency: emergencyComplete,
      bank: bankComplete,
    });
  }, [formData]);

  // For self-service mode, load existing data from API
  useEffect(() => {
    if (isAdminView) return;

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
    // Convert null to undefined for string fields to match EmploymentInfoType
    const safeValue = value === null ? undefined : value;

    // Clear error for this field
    if (errors[`${section}.${field}`]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[`${section}.${field}`];
        return newErrors;
      });
    }

    // Special handling for LGA - reset when state changes
    if (section === "personalDetails" && field === "stateOfOrigin") {
      // Reset LGA when state changes
      setFormData((prev) => ({
        ...prev,
        personalDetails: {
          ...(prev.personalDetails || {
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
          }),
          [field]: safeValue as string | undefined,
          lga: "", // Reset LGA
        },
      }));
    } else {
      setFormData((prev) => {
        // Get the current section or create an empty object if it doesn't exist
        const currentSection = prev[section];
        // Create a base object that we know is an object
        const baseObject =
          currentSection && typeof currentSection === "object"
            ? currentSection
            : {};

        return {
          ...prev,
          [section]: {
            ...baseObject,
            [field]: safeValue,
          },
        };
      });
    }
  };
  const handleDateChange = (
    section: keyof EmploymentInfoType,
    field: string,
    date: Date | null
  ) => {
    handleFormChange(section, field, date);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate personal details
    if (!formData.personalDetails?.fullName) {
      newErrors["personalDetails.fullName"] = "Full name is required";
    }
    if (!formData.personalDetails?.cellPhone) {
      newErrors["personalDetails.cellPhone"] = "Cell phone is required";
    } else if (!/^[0-9]{11}$/.test(formData.personalDetails.cellPhone)) {
      newErrors["personalDetails.cellPhone"] =
        "Enter a valid 11-digit phone number";
    }
    if (!formData.personalDetails?.address) {
      newErrors["personalDetails.address"] = "Address is required";
    }
    if (!formData.personalDetails?.ninNumber) {
      newErrors["personalDetails.ninNumber"] = "NIN number is required";
    } else if (!/^[0-9]{11}$/.test(formData.personalDetails.ninNumber)) {
      newErrors["personalDetails.ninNumber"] = "NIN must be 11 digits";
    }

    // Validate job details
    if (!formData.jobDetails?.title) {
      newErrors["jobDetails.title"] = "Job title is required";
    }
    if (!formData.jobDetails?.startDate) {
      newErrors["jobDetails.startDate"] = "Start date is required";
    }

    // Validate emergency contact
    if (!formData.emergencyContact?.fullName) {
      newErrors["emergencyContact.fullName"] =
        "Emergency contact name is required";
    }
    if (!formData.emergencyContact?.primaryPhone) {
      newErrors["emergencyContact.primaryPhone"] = "Primary phone is required";
    } else if (!/^[0-9]{11}$/.test(formData.emergencyContact.primaryPhone)) {
      newErrors["emergencyContact.primaryPhone"] =
        "Enter a valid 11-digit phone number";
    }
    if (!formData.emergencyContact?.address) {
      newErrors["emergencyContact.address"] =
        "Emergency contact address is required";
    }
    if (!formData.emergencyContact?.relationship) {
      newErrors["emergencyContact.relationship"] = "Relationship is required";
    }

    // Validate bank details
    if (!formData.bankDetails?.bankName) {
      newErrors["bankDetails.bankName"] = "Bank name is required";
    }
    if (!formData.bankDetails?.accountName) {
      newErrors["bankDetails.accountName"] = "Account name is required";
    }
    if (!formData.bankDetails?.accountNumber) {
      newErrors["bankDetails.accountNumber"] = "Account number is required";
    } else if (!/^[0-9]{10}$/.test(formData.bankDetails.accountNumber)) {
      newErrors["bankDetails.accountNumber"] =
        "Account number must be 10 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      // Scroll to first error
      const firstError = document.querySelector(".border-red-500");
      firstError?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    if (isAdminView && staffInfo?.id && isSuperAdmin) {
      // console.log("Super-admin updating user:", staffInfo.id, formData);

      superAdminUpdate(
        { userId: staffInfo.id, data: formData },
        {
          onSuccess: () => {
            if (onClose) onClose();
          },
        }
      );
    } else {
      updateEmploymentInfo(formData, {
        onSuccess: () => {
          if (onClose) onClose();
        },
      });
    }
  };

  // Check if user can update
  const canUpdate = isAdminView
    ? isSuperAdmin
    : data?.data?.canUpdate !== false;

  // const allSectionsCompleted = Object.values(completedSections).every((v) => v);
  const completionPercentage = Math.round(
    (Object.values(completedSections).filter((v) => v).length / 4) * 100
  );

  if (!isAdminView && isLoadingSelfData) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <SpinnerMini />
          <p className="text-gray-500 mt-2">Loading your information...</p>
        </div>
      </div>
    );
  }

  if (!canUpdate) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-8 text-center max-w-2xl mx-auto">
        <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-amber-800 mb-2">
          Updates Currently Disabled
        </h3>
        <p className="text-amber-700">
          {isAdminView
            ? "You don't have permission to update this user's information."
            : "Employment information updates are currently disabled. Please contact your administrator if you need to make changes."}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl mx-auto">
      {/* Personal Details Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Personal Details
            </h2>
            {completedSections.personal && (
              <CheckCircle className="h-5 w-5 text-green-500 ml-auto" />
            )}
          </div>
        </div>

        <div className="p-6 space-y-4">
          <Row cols="grid-cols-1 lg:grid-cols-2">
            <FormRow
              label="Full Name *"
              error={errors["personalDetails.fullName"]}
              icon={<User className="h-4 w-4 text-gray-400" />}
            >
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
                className={
                  errors["personalDetails.fullName"] ? "border-red-500" : ""
                }
              />
            </FormRow>

            <FormRow
              label="Date of Birth"
              icon={<Calendar className="h-4 w-4 text-gray-400" />}
            >
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
            <FormRow
              label="State of Origin"
              icon={<MapPin className="h-4 w-4 text-gray-400" />}
            >
              <Select
                clearable={true}
                id="stateOfOrigin"
                customLabel="Select state"
                value={formData.personalDetails?.stateOfOrigin || ""}
                onChange={(value) =>
                  handleFormChange("personalDetails", "stateOfOrigin", value)
                }
                options={nigeriaStateOptions}
              />
            </FormRow>

            {formData.personalDetails?.stateOfOrigin && (
              <FormRow label="LGA">
                <Select
                  clearable={true}
                  // filterable={true}
                  id="lga"
                  customLabel="Select LGA"
                  value={formData.personalDetails?.lga || ""}
                  onChange={(value) =>
                    handleFormChange("personalDetails", "lga", value)
                  }
                  options={getLgaOptions()}
                />
                {!formData.personalDetails?.stateOfOrigin && (
                  <p className="text-xs text-gray-500 mt-1">
                    Please select a state first
                  </p>
                )}
              </FormRow>
            )}
          </Row>

          <Row cols="grid-cols-1 lg:grid-cols-2">
            <FormRow label="Religion">
              <Select
                clearable={true}
                id="religion"
                customLabel="Select religion"
                value={formData.personalDetails?.religion || ""}
                onChange={(value) =>
                  handleFormChange("personalDetails", "religion", value)
                }
                options={religionOptions}
              />
            </FormRow>

            <FormRow label="Marital Status" className="">
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
            <FormRow
              label="Residential Address *"
              type="wide"
              error={errors["personalDetails.address"]}
              icon={<MapPin className="h-4 w-4 text-gray-400" />}
            >
              {/* <Input
                type="text"
                id="address"
                required
                placeholder="Enter your residential address"
                value={formData.personalDetails?.address || ""}
                onChange={(e) =>
                  handleFormChange("personalDetails", "address", e.target.value)
                }
                className={
                  errors["personalDetails.address"] ? "border-red-500" : ""
                }
              /> */}

              <textarea
                className="border-2 h-32 min-h-32 rounded-lg focus:outline-none p-3"
                maxLength={4000}
                id="address"
                required
                value={formData.personalDetails?.address || ""}
                onChange={(e) =>
                  handleFormChange("personalDetails", "address", e.target.value)
                }
              />
            </FormRow>
          </Row>

          <Row cols="grid-cols-1 lg:grid-cols-2">
            <FormRow
              label="Home Phone"
              icon={<Phone className="h-4 w-4 text-gray-400" />}
            >
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

            <FormRow
              label="Cell Phone *"
              error={errors["personalDetails.cellPhone"]}
              icon={<PhoneCall className="h-4 w-4 text-gray-400" />}
            >
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
                maxLength={11}
                className={
                  errors["personalDetails.cellPhone"] ? "border-red-500" : ""
                }
              />
            </FormRow>
          </Row>

          <Row cols="grid-cols-1 lg:grid-cols-2">
            <FormRow
              label="Personal Email"
              icon={<Mail className="h-4 w-4 text-gray-400" />}
            >
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

            <FormRow
              label="NIN Number *"
              error={errors["personalDetails.ninNumber"]}
              icon={<Shield className="h-4 w-4 text-gray-400" />}
            >
              <Input
                type="text"
                id="ninNumber"
                required
                placeholder="Enter 11-digit NIN number"
                value={formData.personalDetails?.ninNumber || ""}
                onChange={(e) =>
                  handleFormChange(
                    "personalDetails",
                    "ninNumber",
                    e.target.value
                  )
                }
                maxLength={11}
                className={
                  errors["personalDetails.ninNumber"] ? "border-red-500" : ""
                }
              />
            </FormRow>
          </Row>

          {/* Spouse Information - Conditional */}
          {formData.personalDetails?.maritalStatus === "Married" && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <GoPeople className="h-5 w-5 text-blue-500" />
                <h3 className="text-md font-medium text-gray-900">
                  Spouse Information
                </h3>
              </div>
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
                      maxLength={11}
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
      </div>

      {/* Job Information Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Job Information
            </h2>
            {completedSections.job && (
              <CheckCircle className="h-5 w-5 text-green-500 ml-auto" />
            )}
          </div>
        </div>

        <div className="p-6 space-y-4">
          {isLoadingUsers ? (
            <SpinnerMini />
          ) : (
            <Row cols="grid-cols-1 lg:grid-cols-2">
              <FormRow label="Supervisor">
                {/* <Input
                type="text"
                id="supervisor"
                placeholder="Enter supervisor's name"
                value={formData.jobDetails?.supervisor || ""}
                onChange={(e) =>
                  handleFormChange("jobDetails", "supervisor", e.target.value)
                }
              /> */}

                <Select
                  clearable={true}
                  id="supervisor"
                  customLabel="Enter supervisor's name"
                  value={formData.jobDetails?.supervisor || ""}
                  onChange={(value) =>
                    handleFormChange("jobDetails", "supervisor", value)
                  }
                  options={
                    users
                      ? users
                          .filter((user) => user.id)
                          .map((user) => ({
                            id: user.id as string,
                            name: `${user.first_name} ${user.last_name}`,
                          }))
                      : []
                  }
                />
              </FormRow>
            </Row>
          )}

          <Row cols="grid-cols-1 lg:grid-cols-2">
            <FormRow label="Job Title *" error={errors["jobDetails.title"]}>
              <Input
                type="text"
                id="jobTitle"
                required
                placeholder="Enter job title"
                value={formData.jobDetails?.title || ""}
                onChange={(e) =>
                  handleFormChange("jobDetails", "title", e.target.value)
                }
                className={errors["jobDetails.title"] ? "border-red-500" : ""}
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
            <FormRow
              label="Start Date *"
              error={errors["jobDetails.startDate"]}
            >
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
        </div>
      </div>

      {/* Emergency Contact Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Emergency Contact
            </h2>
            {completedSections.emergency && (
              <CheckCircle className="h-5 w-5 text-green-500 ml-auto" />
            )}
          </div>
        </div>

        <div className="p-6 space-y-4">
          <Row cols="grid-cols-1 lg:grid-cols-2">
            <FormRow
              label="Relationship *"
              error={errors["emergencyContact.relationship"]}
            >
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

          <Row>
            <FormRow
              label="Emergency Contact Full Name *"
              type="wide"
              error={errors["emergencyContact.fullName"]}
            >
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
                className={
                  errors["emergencyContact.fullName"] ? "border-red-500" : ""
                }
              />
            </FormRow>
          </Row>

          <Row>
            <FormRow
              label="Emergency Contact Address *"
              type="wide"
              error={errors["emergencyContact.address"]}
            >
              {/* <Input
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
                className={
                  errors["emergencyContact.address"] ? "border-red-500" : ""
                }
              /> */}

              <textarea
                className="border-2 h-32 min-h-32 rounded-lg focus:outline-none p-3"
                maxLength={4000}
                id="emergencyAddress"
                required
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
            <FormRow
              label="Primary Phone *"
              error={errors["emergencyContact.primaryPhone"]}
            >
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
                maxLength={11}
                className={
                  errors["emergencyContact.primaryPhone"]
                    ? "border-red-500"
                    : ""
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
                maxLength={11}
              />
            </FormRow>
          </Row>
        </div>
      </div>

      {/* Bank Details Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Banknote className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Bank Details
            </h2>
            {completedSections.bank && (
              <CheckCircle className="h-5 w-5 text-green-500 ml-auto" />
            )}
          </div>
        </div>

        <div className="p-6 pb-36 space-y-4">
          <Row cols="grid-cols-1 lg:grid-cols-2">
            <FormRow label="Bank Name *" error={errors["bankDetails.bankName"]}>
              <Select
                clearable={true}
                filterable={true}
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

            <FormRow
              label="Account Name *"
              error={errors["bankDetails.accountName"]}
            >
              <Input
                type="text"
                id="accountName"
                required
                placeholder="Enter account holder's name"
                value={formData.bankDetails?.accountName || ""}
                onChange={(e) =>
                  handleFormChange("bankDetails", "accountName", e.target.value)
                }
                className={
                  errors["bankDetails.accountName"] ? "border-red-500" : ""
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

            <FormRow
              label="Account Number *"
              error={errors["bankDetails.accountNumber"]}
              icon={<CreditCard className="h-4 w-4 text-gray-400" />}
            >
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
                className={
                  errors["bankDetails.accountNumber"] ? "border-red-500" : ""
                }
              />
            </FormRow>
          </Row>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 z-20 backdrop-blur-sm bg-white/90">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs sm:text-sm font-medium text-gray-700">
            Profile Completion
          </span>
          <span className="text-sm sm:text-base font-semibold text-blue-600">
            {completionPercentage}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 sm:h-2.5">
          <div
            className="bg-blue-600 h-2 sm:h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>

        {/* Section Indicators - Responsive Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-2 mt-4">
          {[
            {
              key: "personal",
              label: "Personal",
              icon: User,
              completed: completedSections.personal,
            },
            {
              key: "job",
              label: "Job",
              icon: Briefcase,
              completed: completedSections.job,
            },
            {
              key: "emergency",
              label: "Emergency",
              icon: Phone,
              completed: completedSections.emergency,
            },
            {
              key: "bank",
              label: "Bank",
              icon: Banknote,
              completed: completedSections.bank,
            },
          ].map(({ key, label, icon: Icon, completed }) => (
            <div
              key={key}
              className={`flex items-center gap-2 sm:gap-1.5 ${
                // On mobile, first two items align left, last two align right
                key === "emergency" || key === "bank"
                  ? "sm:justify-start justify-end"
                  : "justify-start"
              }`}
            >
              <div
                className={`p-1.5 sm:p-1 rounded-full flex-shrink-0 ${
                  completed ? "bg-green-100" : "bg-gray-100"
                }`}
              >
                <Icon
                  className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${
                    completed ? "text-green-600" : "text-gray-400"
                  }`}
                />
              </div>
              <span
                className={`text-xs whitespace-nowrap ${
                  completed ? "text-green-600 font-medium" : "text-gray-500"
                }`}
              >
                {label}
              </span>

              {/* Optional: Show checkmark on mobile for completed sections */}
              {completed && (
                <span className="text-green-600 text-xs sm:hidden">✓</span>
              )}
            </div>
          ))}
        </div>

        {/* Optional: Compact view for very small screens */}
        <div className="sm:hidden mt-3 text-center">
          <p className="text-xs text-gray-500">
            {completedSections.personal &&
            completedSections.job &&
            completedSections.emergency &&
            completedSections.bank
              ? "✨ Profile complete!"
              : `${
                  Object.values(completedSections).filter(Boolean).length
                }/4 sections completed`}
          </p>
        </div>
      </div>

      {/* Form Actions */}
      <div className=" bg-white border-t border-gray-200 p-4 flex justify-end gap-3 rounded-b-xl">
        {onClose && (
          <Button
            size="small"
            type="button"
            variant="secondary"
            onClick={onClose}
            className="flex items-center gap-2 px-6"
          >
            <X className="h-4 w-4" />
            Cancel
          </Button>
        )}
        <Button
          size="small"
          type="submit"
          disabled={isPending}
          className="flex items-center gap-2 px-6 bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isPending ? (
            <>
              <SpinnerMini />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default StaffInformationForm;
