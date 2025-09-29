import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../../ui/Input";
import Button from "../../ui/Button";
import FormRow from "../../ui/FormRow";
import Row from "../../ui/Row";
import { CreateVendorType } from "../../interfaces";
import SpinnerMini from "../../ui/SpinnerMini";
import Select from "../../ui/Select";
import { useCreateVendor } from "./Hooks/useVendor";
import { FileUpload } from "../../ui/FileUpload";
import { bankNames } from "../../assets/Banks";

export const categories = [
  {
    id: "General Supplies and Non Food Items",
    name: "General Supplies and Non Food Items",
  },
  { id: "Outdoor Catering Services", name: "Outdoor Catering Services" },
  {
    id: "Hall Rental and Catering Services",
    name: "Hall Rental and Catering Services",
  },
  {
    id: "Furniture Supplies and Repairs",
    name: "Furniture Supplies and Repairs",
  },
  { id: "Automobile Repairs", name: "Automobile Repairs" },
  { id: "Health and Medical", name: "Health and Medical" },
  {
    id: "Construction and Building Materials",
    name: "Construction and Building Materials",
  },
  {
    id: "Generator Services and Maintenance",
    name: "Generator Services and Maintenance",
  },
  { id: "Printings", name: "Printings" },
  { id: "Stationary Supplies", name: "Stationary Supplies" },
  { id: "Beverages", name: "Beverages" },
  { id: "Electrical and AC Repairs", name: "Electrical and AC Repairs" },
  { id: "Media Corporation", name: "Media Corporation" },
  { id: "Petroleum Products", name: "Petroleum Products" },
  { id: " Hotels and Hospitality", name: " Hotels and Hospitality" },
  { id: "Travel Agents and Agency", name: "Travel Agents and Agency" },
  {
    id: "Car/Vehicle Hire and Leasing",
    name: "Car/Vehicle Hire and Leasing",
  },
];

export const businessState = [
  { id: "Adamawa", name: "Adamawa" },
  { id: "Borno", name: "Borno" },
  { id: "Yobe", name: "Yobe" },
  { id: "Sokoto", name: "Sokoto" },
  { id: "Abuja", name: "Abuja" },
];

export const businessTypes = [
  { id: "Sole Proprietorship", name: "Sole Proprietorship" },
  { id: "Partnership", name: "Partnership" },
  { id: "Corporation", name: "Corporation" },
  {
    id: "Limited Liability Company (LLC)",
    name: "Limited Liability Company (LLC)",
  },
  { id: "Non-Profit Organization", name: "Non-Profit Organization" },
];

const FormAddVendor: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CreateVendorType>({
    businessName: "",
    businessType: "",
    address: "",
    email: "",
    businessPhoneNumber: "",
    contactPhoneNumber: "",
    categories: [],
    contactPerson: "",
    position: "",
    businessRegNumber: "",
    bankName: "",
    accountName: "",
    accountNumber: "",
    businessState: "",
    operatingLGA: "",
    tinNumber: "",
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const { createVendor, isPending } = useCreateVendor();

  const handleFormChange = (field: keyof CreateVendorType, value: string) => {
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

      // Convert IDs to names
      const categoryNames = newCategoryIds.map((id) => {
        const category = categories.find((cat) => cat.id === id);
        return category?.name || id; // Use name or fallback to ID
      });

      // Update form data
      setFormData((prev) => ({
        ...prev,
        categories: categoryNames,
      }));

      return newCategoryIds;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isFormValid = (e.target as HTMLFormElement).reportValidity();
    if (!isFormValid) return;

    createVendor(
      { ...formData, files: selectedFiles },
      {
        onSuccess: (data: any) => {
          if (data.status === 200) {
            navigate("/procurement/vendor-management");
          }
        },
      }
    );
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="space-y-6">
        <Row cols="grid-cols-1 md:grid-cols-2">
          <FormRow label="Business Name *">
            <Input
              type="text"
              id="businessName"
              minLength={3}
              required
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
              value={formData.businessType}
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
              value={formData.businessState || ""}
              onChange={(value) => handleFormChange("businessState", value)} // Direct value now
              options={
                businessState
                  ? businessState.map((bank) => ({
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

          <FormRow label="Preferred LGA of Operation *">
            <Input
              type="text" // Use standard text type
              id="operatingLGA"
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
              value={formData.email}
              onChange={(e) => handleFormChange("email", e.target.value)}
              placeholder="email@company.com"
            />
          </FormRow>
          <FormRow label="Business Registration Number *">
            <Input
              type="businessRegNumber"
              id="businessRegNumber"
              required
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
              value={formData.bankName || ""}
              onChange={(value) => handleFormChange("bankName", value)} // Direct value now
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
      </div>

      <FileUpload
        selectedFiles={selectedFiles}
        setSelectedFiles={setSelectedFiles}
        accept=".jpg,.png,.pdf,.xlsx,.docx"
        multiple={true}
      />

      <div className="flex justify-center w-full gap-4 pt-6">
        <Button type="submit" size="medium" disabled={isPending}>
          {isPending ? <SpinnerMini /> : "Create Vendor"}
        </Button>

        <Button
          type="button"
          size="medium"
          variant="secondary"
          onClick={() => navigate(-1)}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default FormAddVendor;
