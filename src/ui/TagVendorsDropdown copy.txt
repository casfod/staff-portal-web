// ui/TagVendorsDropdown.tsx
import React, { useState } from "react";
import { Search, X } from "lucide-react";
import Input from "./Input";
import Button from "./Button";
import { VendorType } from "../interfaces";

interface TagVendorsDropdownProps {
  vendors: VendorType[] | any;
  isLoading: boolean;
  isError: boolean;
  onSelectVendors: (vendorIds: string[]) => void;
  onClose: () => void;
}

const TagVendorsDropdown: React.FC<TagVendorsDropdownProps> = ({
  vendors,
  isLoading,
  isError,
  onSelectVendors,
  onClose,
}) => {
  const [selectedVendorIds, setSelectedVendorIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredVendors = vendors.filter(
    (vendor: VendorType) =>
      vendor.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.vendorCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleVendorToggle = (vendorId: string) => {
    setSelectedVendorIds((prev) =>
      prev.includes(vendorId)
        ? prev.filter((id) => id !== vendorId)
        : [...prev, vendorId]
    );
  };

  const handleSubmit = () => {
    if (selectedVendorIds.length > 0) {
      onSelectVendors(selectedVendorIds);
      onClose();
    }
  };

  return (
    <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
      <div className="p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-gray-800">Share with Vendors</h3>
          <Button
            type="button"
            variant="secondary"
            size="small"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Search Input */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search vendors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Vendors List */}
        <div className="max-h-60 overflow-y-auto border rounded">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">
              Loading vendors...
            </div>
          ) : isError ? (
            <div className="p-4 text-center text-red-500">
              Error loading vendors
            </div>
          ) : filteredVendors.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No vendors found
            </div>
          ) : (
            filteredVendors.map((vendor: VendorType) => (
              <label
                key={vendor.id}
                className="flex items-center space-x-3 p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
              >
                <input
                  type="checkbox"
                  checked={selectedVendorIds.includes(vendor.id)}
                  onChange={() => handleVendorToggle(vendor.id)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {vendor.businessName} | {vendor.contactPerson}
                  </p>
                </div>
              </label>
            ))
          )}
        </div>

        {/* Selected Count and Submit */}
        <div className="mt-3 flex justify-between items-center">
          <span className="text-sm text-gray-500">
            {selectedVendorIds.length} selected
          </span>
          <Button
            type="button"
            size="small"
            onClick={handleSubmit}
            disabled={selectedVendorIds.length === 0}
          >
            Share
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TagVendorsDropdown;
