import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../../ui/Input";
import Button from "../../ui/Button";
import FormRow from "../../ui/FormRow";
import Row from "../../ui/Row";
import { UpdateVendorType, VendorType } from "../../interfaces";
import SpinnerMini from "../../ui/SpinnerMini";
import Select from "../../ui/Select";
import { useUpdateVendor } from "./Hooks/useVendor";
import { FileUpload } from "../../ui/FileUpload";

interface FormEditVendorProps {
  vendor: VendorType | null;
}

const FormEditVendor: React.FC<FormEditVendorProps> = ({ vendor }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<UpdateVendorType>({
    businessName: vendor?.businessName,
    businessType: vendor?.businessType,
    address: vendor?.address,
    email: vendor?.email,
    businessPhoneNumber: vendor?.businessPhoneNumber,
    contactPhoneNumber: vendor?.contactPhoneNumber,
    categories: vendor?.categories || [], // Changed to array
    supplierNumber: vendor?.supplierNumber,
    contactPerson: vendor?.contactPerson,
    position: vendor?.position,
    tinNumber: vendor?.tinNumber,
  });

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    vendor?.categories || []
  );

  const { updateVendor, isPending } = useUpdateVendor();

  const businessTypes = [
    { id: "Sole Proprietorship", name: "Sole Proprietorship" },
    { id: "Partnership", name: "Partnership" },
    { id: "Corporation", name: "Corporation" },
    {
      id: "Limited Liability Company (LLC)",
      name: "Limited Liability Company (LLC)",
    },
    { id: "Non-Profit Organization", name: "Non-Profit Organization" },
  ];

  const categories = [
    { id: "technology", name: "Technology" },
    { id: "construction", name: "Construction" },
    { id: "consulting", name: "Consulting" },
    { id: "logistics", name: "Logistics" },
    { id: "office_supplies", name: "Office Supplies" },
    { id: "services", name: "Services" },
    { id: "other", name: "Other" },
  ];

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
        supplierNumber: vendor.supplierNumber,
        contactPerson: vendor.contactPerson,
        position: vendor.position,
        tinNumber: vendor.tinNumber,
      });
      setSelectedCategories(vendor.categories || []);
    }
  }, [vendor]);

  const handleFormChange = (field: keyof UpdateVendorType, value: string) => {
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

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
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
            value={formData.businessType!}
            onChange={(value) => handleFormChange("businessType", value)}
            options={businessTypes}
          />
        </FormRow>
      </Row>

      <Row cols="grid-cols-1 md:grid-cols-2">
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
                  <span className="text-sm text-gray-700">{category.name}</span>
                </label>
              ))}
            </div>
            {selectedCategories.length > 0 && (
              <p className="text-xs text-gray-500">
                Selected:{" "}
                {selectedCategories
                  .map((catId) => categories.find((c) => c.id === catId)?.name)
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

        <FormRow label="Supplier Number">
          <Input
            type="text"
            id="supplierNumber"
            value={formData.supplierNumber}
            onChange={(e) => handleFormChange("supplierNumber", e.target.value)}
            placeholder="Optional supplier number"
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
            onChange={(e) => handleFormChange("contactPerson", e.target.value)}
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

      <Row>
        <FormRow label="Vendor Code">
          <Input
            type="text"
            id="vendorCode"
            value={vendor?.vendorCode}
            readOnly
            disabled
            className="bg-gray-100"
          />
        </FormRow>
      </Row>

      <FileUpload
        selectedFiles={selectedFiles}
        setSelectedFiles={setSelectedFiles}
        accept=".jpg,.png,.pdf,.xlsx,.docx"
        multiple={true}
      />

      <div className="flex justify-center w-full gap-4 pt-6">
        <Button type="submit" size="medium" disabled={isPending}>
          {isPending ? <SpinnerMini /> : "Update Vendor"}
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

export default FormEditVendor;
