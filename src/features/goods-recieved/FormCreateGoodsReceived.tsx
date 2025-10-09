// FormCreateGoodsReceived.tsx - Fixed version
import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
import Input from "../../ui/Input";
import Button from "../../ui/Button";
import Row from "../../ui/Row";
import { PurchaseOrderType, GoodsReceivedType } from "../../interfaces";
import SpinnerMini from "../../ui/SpinnerMini";
import {
  useCreateGoodsReceived,
  useUpdateGoodsReceived,
} from "./Hooks/useGoodsReceived";
import { Package, Edit, Lock } from "lucide-react";
import toast from "react-hot-toast";

interface FormCreateGoodsReceivedProps {
  purchaseOrder: PurchaseOrderType;
  existingGoodsReceived?: GoodsReceivedType;
  onSuccess?: () => void;
  onCancel?: () => void;
  mode?: "create" | "edit";
}

const FormCreateGoodsReceived: React.FC<FormCreateGoodsReceivedProps> = ({
  purchaseOrder,
  existingGoodsReceived,
  onSuccess,
  onCancel,
  mode = "create",
}) => {
  // const navigate = useNavigate();

  // Helper function to get item name from itemid
  const getItemName = (itemid: string): string => {
    const item = purchaseOrder.itemGroups.find(
      (poItem) => poItem._id === itemid
    );
    return item?.itemName || "Unknown Item";
  };

  // Helper function to safely get item ID
  const getItemId = (item: any): string => {
    return item._id || item.id || "";
  };

  // Initialize GRNitems based on mode
  const [GRNitems, setGRNitems] = useState(() => {
    if (mode === "edit" && existingGoodsReceived) {
      // Prefill with existing data
      return existingGoodsReceived.GRNitems.map((item) => ({
        itemid: item.itemid,
        itemName: getItemName(item.itemid),
        numberOrdered: item.numberOrdered,
        numberReceived: item.numberReceived,
        difference: item.difference,
        isFullyReceived: item.isFullyReceived || item.difference === 0,
      }));
    } else {
      // Create mode - initialize from purchase order
      return purchaseOrder.itemGroups.map((item) => ({
        itemid: getItemId(item), // Use helper function to ensure string
        itemName: item.itemName,
        numberOrdered: item.quantity * item.frequency,
        numberReceived: 0,
        difference: item.quantity * item.frequency,
        isFullyReceived: false,
      }));
    }
  });

  const { createGoodsReceived, isPending: isCreating } =
    useCreateGoodsReceived();
  const { updateGoodsReceived, isPending: isUpdating } =
    useUpdateGoodsReceived();

  const handleItemChange = (
    index: number,
    field: keyof (typeof GRNitems)[0],
    value: number
  ) => {
    const updatedItems = [...GRNitems];
    const item = updatedItems[index];

    // If item is fully received, prevent changes
    if (item.isFullyReceived && field === "numberReceived") {
      toast.error("Cannot modify fully received items");
      return;
    }

    if (field === "numberReceived") {
      const numberReceived = Math.min(value, item.numberOrdered);
      updatedItems[index] = {
        ...item,
        numberReceived: numberReceived,
        difference: item.numberOrdered - numberReceived,
        isFullyReceived: item.numberOrdered - numberReceived === 0,
      };
    }

    setGRNitems(updatedItems);
  };

  const getItemStatus = (item: (typeof GRNitems)[0]) => {
    if (item.isFullyReceived) {
      return {
        status: "Fully Received",
        class: "bg-green-100 text-green-700 border border-green-200",
        icon: <Lock className="h-3 w-3 mr-1" />,
      };
    } else if (item.numberReceived === 0) {
      return {
        status: "Not Received",
        class: "bg-gray-100 text-gray-700 border border-gray-200",
        icon: null,
      };
    } else if (item.numberReceived > item.numberOrdered) {
      return {
        status: "Over Received",
        class: "bg-orange-100 text-orange-700 border border-orange-200",
        icon: null,
      };
    } else {
      return {
        status: "Partially Received",
        class: "bg-yellow-100 text-yellow-700 border border-yellow-200",
        icon: null,
      };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate that at least one item has received quantity or we're editing
    const hasReceivedItems = GRNitems.some((item) => item.numberReceived > 0);
    if (!hasReceivedItems && mode === "create") {
      toast.error("Please enter received quantities for at least one item");
      return;
    }

    // Validate that received quantities don't exceed ordered quantities
    const hasInvalidQuantities = GRNitems.some(
      (item) => item.numberReceived > item.numberOrdered
    );
    if (hasInvalidQuantities) {
      toast.error("Received quantity cannot exceed ordered quantity");
      return;
    }

    // Filter out any items with undefined itemid (shouldn't happen with our helper function)
    const validGRNitems = GRNitems.filter(
      (item) => item.itemid && item.itemid.trim() !== ""
    );

    if (validGRNitems.length === 0) {
      toast.error("No valid items found to process");
      return;
    }

    const submitData = {
      purchaseOrder: purchaseOrder.id!,
      GRNitems: validGRNitems.map((item) => ({
        itemid: item.itemid,
        numberOrdered: item.numberOrdered,
        numberReceived: item.numberReceived,
      })),
    };

    if (mode === "edit" && existingGoodsReceived) {
      // Update existing Goods Received
      updateGoodsReceived(
        {
          goodsReceivedId: existingGoodsReceived.id,
          data: submitData,
        },
        {
          onSuccess: (data: any) => {
            if (data.status === 200) {
              // toast.success("Goods Received Note updated successfully");
              onSuccess?.();
            }
          },
          onError: (error: any) => {
            toast.error(
              error.message || "Failed to update Goods Received Note"
            );
          },
        }
      );
    } else {
      // Create new Goods Received - FIXED: Pass as object with data property
      createGoodsReceived(
        {
          data: submitData,
        },
        {
          onSuccess: (data: any) => {
            if (data.status === 201) {
              // toast.success("Goods Received Note created successfully");
              onSuccess?.();
            }
          },
          onError: (error: any) => {
            toast.error(
              error.message || "Failed to create Goods Received Note"
            );
          },
        }
      );
    }
  };

  const isSubmitting = isCreating || isUpdating;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              {mode === "edit" ? (
                <Edit className="h-5 w-5 text-blue-600" />
              ) : (
                <Package className="h-5 w-5 text-blue-600" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {mode === "edit" ? "Edit" : "Create"} Goods Received Note
              </h2>
              <p className="text-sm text-gray-500">
                {mode === "edit"
                  ? "Update received quantities for items"
                  : "Record received items from purchase order"}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">
              {purchaseOrder.POCode}
            </p>
            <p className="text-sm text-gray-500">
              {purchaseOrder.selectedVendor?.businessName}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        <div className="space-y-6">
          {/* Items Table */}
          <div>
            <h3 className="text-md font-medium text-gray-900 mb-4">
              Received Items
            </h3>
            <div className="overflow-hidden border border-gray-200 rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Item Name
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ordered
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Received
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Difference
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {GRNitems.map((item, index) => {
                    const statusInfo = getItemStatus(item);
                    return (
                      <tr
                        key={item.itemid}
                        className={item.isFullyReceived ? "bg-green-50" : ""}
                      >
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.itemName}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-gray-500">
                          {item.numberOrdered}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                          <Input
                            type="number"
                            value={item.numberReceived}
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                "numberReceived",
                                parseInt(e.target.value) || 0
                              )
                            }
                            // disabled={item.isFullyReceived}
                            min="0"
                            max={item.numberOrdered}
                            className={`w-20 text-center ${
                              item.isFullyReceived
                                ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                                : ""
                            }`}
                          />
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              item.difference === 0
                                ? "bg-green-100 text-green-800"
                                : item.difference > 0
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {item.difference}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.class}`}
                          >
                            {statusInfo.icon}
                            {statusInfo.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Total Items</p>
                <p className="font-medium text-gray-900">{GRNitems.length}</p>
              </div>
              <div>
                <p className="text-gray-500">Fully Received</p>
                <p className="font-medium text-green-600">
                  {GRNitems.filter((item) => item.isFullyReceived).length}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Pending Items</p>
                <p className="font-medium text-yellow-600">
                  {GRNitems.filter((item) => !item.isFullyReceived).length}
                </p>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <Row>
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <SpinnerMini />
              ) : mode === "edit" ? (
                "Update GRN"
              ) : (
                "Create GRN"
              )}
            </Button>
          </Row>
        </div>
      </form>
    </div>
  );
};

export default FormCreateGoodsReceived;
