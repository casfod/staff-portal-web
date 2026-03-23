import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../../ui/Input";
import Button from "../../ui/Button";
import FormRow from "../../ui/FormRow";
import Row from "../../ui/Row";
import { UpdateVendorType, VendorType } from "../../interfaces";
import SpinnerMini from "../../ui/SpinnerMini";
import Select from "../../ui/Select";
import { useUpdateVendor, useUpdateVendorStatus } from "./Hooks/useVendor";
import { FileUpload } from "../../ui/FileUpload";
import { businessState, categories, businessTypes } from "./FormAddVendor";
import { bankNames } from "../../assets/Banks";
import toast from "react-hot-toast";
import StatusBadge from "../../ui/StatusBadge";
import { useAdmins } from "../user/Hooks/useUsers";

interface FormEditVendorProps {
  vendor: VendorType | null;
}

// Extend UpdateVendorType to include approvedBy for submission
interface VendorUpdateFormData extends UpdateVendorType {
  approvedBy?: string;
}

const FormEditVendor: React.FC<FormEditVendorProps> = ({ vendor }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<VendorUpdateFormData>({
    businessName: vendor?.businessName,
    businessType: vendor?.businessType,
    address: vendor?.address,
    email: vendor?.email,
    businessPhoneNumber: vendor?.businessPhoneNumber,
    contactPhoneNumber: vendor?.contactPhoneNumber,
    categories: vendor?.categories || [],
    contactPerson: vendor?.contactPerson,
    position: vendor?.position,
    tinNumber: vendor?.tinNumber,
    businessRegNumber: vendor?.businessRegNumber,
    bankName: vendor?.bankName,
    accountName: vendor?.accountName,
    accountNumber: vendor?.accountNumber,
    businessState: vendor?.businessState,
    operatingLGA: vendor?.operatingLGA,
    approvedBy: vendor?.approvedBy?.id || "",
  });

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    vendor?.categories || []
  );

  const { updateVendor, isPending: isUpdating } = useUpdateVendor();
  const { updateVendorStatus, isPending: isSubmitting } =
    useUpdateVendorStatus();

  // Fetch admins for approver selection
  const { data: adminsData, isLoading: isLoadingAdmins } = useAdmins();
  const admins = useMemo(() => adminsData?.data ?? [], [adminsData]);

  useEffect(() => {
    if (vendor) {
      setFormData({
        businessName: vendor.businessName,
        businessType: vendor.businessType,
        address: vendor.address,
        email: vendor.email,
        businessPhoneNumber: vendor.businessPhoneNumber,
        contactPhoneNumber: vendor.contactPhoneNumber,
        categories: vendor.categories || [],
        contactPerson: vendor.contactPerson,
        position: vendor.position,
        tinNumber: vendor.tinNumber,
        businessRegNumber: vendor.businessRegNumber,
        bankName: vendor.bankName,
        accountName: vendor.accountName,
        accountNumber: vendor.accountNumber,
        businessState: vendor.businessState,
        operatingLGA: vendor.operatingLGA,
        approvedBy: vendor.approvedBy?.id || "",
      });
      setSelectedCategories(vendor.categories || []);
    }
  }, [vendor]);

  const handleFormChange = (
    field: keyof VendorUpdateFormData,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategories((prev) => {
      const newCategoryIds = prev.includes(categoryId)
        ? prev.filter((cat) => cat !== categoryId)
        : [...prev, categoryId];

      const categoryNames = newCategoryIds.map((id) => {
        const category = categories.find((cat) => cat.id === id);
        return category?.name || id;
      });

      setFormData((prev) => ({
        ...prev,
        categories: categoryNames,
      }));

      return newCategoryIds;
    });
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    const isFormValid = (e.target as HTMLFormElement).reportValidity();
    if (!isFormValid) return;

    updateVendor(
      {
        vendorId: vendor?.id!,
        data: { ...formData, files: selectedFiles },
      },
      {
        onSuccess: () => {
          navigate("/procurement/vendor-management");
        },
      }
    );
  };

  const handleSubmitForApproval = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.approvedBy) {
      toast.error("Please select an approver");
      return;
    }

    // Update vendor and submit for approval
    updateVendor(
      {
        vendorId: vendor?.id!,
        data: { ...formData, files: selectedFiles },
      },
      {
        onSuccess: () => {
          // After update, submit for approval
          updateVendorStatus(
            {
              vendorId: vendor?.id!,
              data: { status: "pending" },
            },
            {
              onSuccess: () => {
                toast.success("Vendor submitted for approval successfully");
                navigate("/procurement/vendor-management");
              },
            }
          );
        },
      }
    );
  };

  const canEdit = vendor?.status === "draft" || vendor?.status === "rejected";
  const canSubmitForApproval = vendor?.status === "draft";

  if (!vendor) {
    return <div>No vendor data available.</div>;
  }

  return (
    <form className="space-y-6">
      <div className="space-y-6">
        {/* Status Badge */}
        <div className="flex justify-end">
          <StatusBadge status={vendor.status!} />
        </div>

        <Row cols="grid-cols-1 md:grid-cols-2">
          <FormRow label="Business Name *">
            <Input
              type="text"
              id="businessName"
              minLength={3}
              required
              disabled={!canEdit}
              value={formData.businessName}
              onChange={(e) => handleFormChange("businessName", e.target.value)}
              placeholder="Enter business name"
            />
          </FormRow>

          <FormRow label="Business Type *">
            <Select
              clearable={true}
              id="businessType"
              customLabel="Select Business Type"
              required
              disabled={!canEdit}
              value={formData.businessType || ""}
              onChange={(value) => handleFormChange("businessType", value)}
              options={businessTypes}
            />
          </FormRow>
        </Row>

        <Row>
          <FormRow label="Categories">
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <label
                    key={category.id}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      disabled={!canEdit}
                      checked={selectedCategories.includes(category.id)}
                      onChange={() => handleCategoryChange(category.id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">
                      {category.name}
                    </span>
                  </label>
                ))}
              </div>
              {selectedCategories.length > 0 && (
                <p className="text-xs text-gray-500">
                  Selected:{" "}
                  {selectedCategories
                    .map(
                      (catId) => categories.find((c) => c.id === catId)?.name
                    )
                    .join(", ")}
                </p>
              )}
            </div>
          </FormRow>
        </Row>

        <Row>
          <FormRow label="Business Address *" type="wide">
            <textarea
              className="border-2 h-24 min-h-24 rounded-lg focus:outline-none p-3 w-full"
              maxLength={500}
              placeholder="Enter full business address"
              id="address"
              disabled={!canEdit}
              value={formData.address}
              onChange={(e) => handleFormChange("address", e.target.value)}
              required
            />
          </FormRow>
        </Row>

        <Row cols="grid-cols-1 md:grid-cols-2">
          <FormRow label="Where Your Company does Business *">
            <Select
              clearable={true}
              id="businessState"
              customLabel="Select a State"
              disabled={!canEdit}
              value={formData.businessState || ""}
              onChange={(value) => handleFormChange("businessState", value)}
              options={
                businessState
                  ? businessState.map((state) => ({
                      id: state.name as string,
                      name: `${state.name}`,
                    }))
                  : []
              }
              optionsHeight={220}
              filterable={true}
              required
            />
          </FormRow>

          <FormRow label="Preferred LGA of Operation *">
            <Input
              type="text"
              id="operatingLGA"
              disabled={!canEdit}
              value={formData.operatingLGA}
              onChange={(e) => handleFormChange("operatingLGA", e.target.value)}
              placeholder="Enter Local Government Area"
            />
          </FormRow>
        </Row>

        <Row cols="grid-cols-1 md:grid-cols-2">
          <FormRow label="Email Address *">
            <Input
              type="email"
              id="email"
              required
              disabled={!canEdit}
              value={formData.email}
              onChange={(e) => handleFormChange("email", e.target.value)}
              placeholder="email@company.com"
            />
          </FormRow>
          <FormRow label="Business Registration Number *">
            <Input
              type="text"
              id="businessRegNumber"
              required
              disabled={!canEdit}
              value={formData.businessRegNumber}
              onChange={(e) =>
                handleFormChange("businessRegNumber", e.target.value)
              }
            />
          </FormRow>
        </Row>

        <Row cols="grid-cols-1 md:grid-cols-2">
          <FormRow label="Business Phone *">
            <Input
              type="tel"
              id="businessPhoneNumber"
              required
              disabled={!canEdit}
              value={formData.businessPhoneNumber}
              onChange={(e) =>
                handleFormChange("businessPhoneNumber", e.target.value)
              }
              placeholder="11-digit phone number"
              pattern="[0-9]{11}"
              maxLength={11}
            />
          </FormRow>
        </Row>

        <Row cols="grid-cols-1 md:grid-cols-2">
          <FormRow label="Contact Person *">
            <Input
              type="text"
              id="contactPerson"
              required
              disabled={!canEdit}
              value={formData.contactPerson}
              onChange={(e) =>
                handleFormChange("contactPerson", e.target.value)
              }
              placeholder="Full name of contact person"
            />
          </FormRow>

          <FormRow label="Position *">
            <Input
              type="text"
              id="position"
              required
              disabled={!canEdit}
              value={formData.position}
              onChange={(e) => handleFormChange("position", e.target.value)}
              placeholder="Position in company"
            />
          </FormRow>
        </Row>

        <Row cols="grid-cols-1 md:grid-cols-2">
          <FormRow label="Contact Phone *">
            <Input
              type="tel"
              id="contactPhoneNumber"
              required
              disabled={!canEdit}
              value={formData.contactPhoneNumber}
              onChange={(e) =>
                handleFormChange("contactPhoneNumber", e.target.value)
              }
              placeholder="11-digit phone number"
              pattern="[0-9]{11}"
              maxLength={11}
            />
          </FormRow>

          <FormRow label="TIN Number *">
            <Input
              type="text"
              id="tinNumber"
              required
              disabled={!canEdit}
              value={formData.tinNumber}
              onChange={(e) => handleFormChange("tinNumber", e.target.value)}
              placeholder="Tax Identification Number"
            />
          </FormRow>
        </Row>

        <Row cols="grid-cols-1 md:grid-cols-2">
          <FormRow label="Account Number*">
            <Input
              type="text"
              id="accountNumber"
              required
              disabled={!canEdit}
              value={formData.accountNumber}
              onChange={(e) =>
                handleFormChange("accountNumber", e.target.value)
              }
              placeholder="10-digit account number"
              maxLength={10}
              minLength={10}
            />
          </FormRow>
          <FormRow label="Account Name*">
            <Input
              type="text"
              id="accountName"
              required
              disabled={!canEdit}
              value={formData.accountName}
              onChange={(e) => handleFormChange("accountName", e.target.value)}
            />
          </FormRow>
        </Row>

        <Row>
          <FormRow label="Bank Name *">
            <Select
              clearable={true}
              id="bankName"
              customLabel="Select a Bank"
              disabled={!canEdit}
              value={formData.bankName || ""}
              onChange={(value) => handleFormChange("bankName", value)}
              options={
                bankNames
                  ? bankNames.map((bank) => ({
                      id: bank.name as string,
                      name: `${bank.name}`,
                    }))
                  : []
              }
              optionsHeight={220}
              filterable={true}
              required
            />
          </FormRow>
        </Row>

        {/* Approver Selection - Only show for draft vendors being submitted */}
        {canSubmitForApproval && (
          <Row>
            <FormRow label="Approved By *">
              {isLoadingAdmins ? (
                <SpinnerMini />
              ) : (
                <Select
                  clearable={true}
                  id="approvedBy"
                  customLabel="Select an approver"
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
        )}
      </div>

      <FileUpload
        selectedFiles={selectedFiles}
        setSelectedFiles={setSelectedFiles}
        accept=".jpg,.png,.pdf,.xlsx,.docx"
        multiple={true}
      />

      <div className="flex justify-center w-full gap-4 pt-6">
        {canEdit && (
          <Button size="medium" disabled={isUpdating} onClick={handleUpdate}>
            {isUpdating ? <SpinnerMini /> : "Update Vendor"}
          </Button>
        )}

        {canSubmitForApproval && (
          <Button
            size="medium"
            disabled={isSubmitting}
            onClick={handleSubmitForApproval}
            variant="primary"
          >
            {isSubmitting ? <SpinnerMini /> : "Submit for Approval"}
          </Button>
        )}

        <Button
          type="button"
          size="medium"
          variant="secondary"
          onClick={() => navigate("/procurement/vendor-management")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default FormEditVendor;
