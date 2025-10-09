// GoodsReceivedList.tsx
import React from "react";
import { GoodsReceivedType } from "../../interfaces";
import { formatToDDMMYYYY } from "../../utils/formatToDDMMYYYY";
import { Package, Eye, Edit } from "lucide-react";
import Button from "../../ui/Button";
import { useNavigate } from "react-router-dom";

interface GoodsReceivedListProps {
  goodsReceivedNotes: GoodsReceivedType[];
  purchaseOrderId: string;
  onEditGRN?: (grn: GoodsReceivedType) => void; // Add edit callback
}

const GoodsReceivedList: React.FC<GoodsReceivedListProps> = ({
  goodsReceivedNotes,
  // purchaseOrderId,
  onEditGRN,
}) => {
  const navigate = useNavigate();

  const handleViewGRN = (grnId: string) => {
    navigate(`/procurement/goods-received/${grnId}`);
  };

  const calculateTotalReceived = (grn: GoodsReceivedType) => {
    return grn.GRNitems.reduce((sum, item) => sum + item.numberReceived, 0);
  };

  const calculateTotalOrdered = (grn: GoodsReceivedType) => {
    return grn.GRNitems.reduce((sum, item) => sum + item.numberOrdered, 0);
  };

  const getOverallStatus = (grn: GoodsReceivedType) => {
    const totalOrdered = calculateTotalOrdered(grn);
    const totalReceived = calculateTotalReceived(grn);

    if (totalReceived === 0)
      return { status: "Not Received", class: "bg-gray-100 text-gray-700" };
    if (totalReceived === totalOrdered)
      return { status: "Fully Received", class: "bg-green-100 text-green-700" };
    if (totalReceived > totalOrdered)
      return {
        status: "Over Received",
        class: "bg-orange-100 text-orange-700",
      };
    return {
      status: "Partially Received",
      class: "bg-yellow-100 text-yellow-700",
    };
  };

  return (
    <div className="bg-white rounded-lg border shadow-sm">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <Package className="h-5 w-5" />
          Goods Received Notes
        </h3>
      </div>

      <div className="divide-y">
        {goodsReceivedNotes.map((grn) => {
          const overallStatus = getOverallStatus(grn);
          return (
            <div key={grn.id} className="p-4 hover:bg-gray-50">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-semibold text-gray-700">
                      {grn.GRDCode}
                    </span>
                    <span className="text-sm text-gray-500">
                      {formatToDDMMYYYY(grn.createdAt)}
                    </span>
                    <span
                      className={`px-2 py-1 rounded text-xs ${overallStatus.class}`}
                    >
                      {overallStatus.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Items:</span>
                      <span className="ml-2 font-medium">
                        {grn.GRNitems.length}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Ordered:</span>
                      <span className="ml-2 font-medium">
                        {calculateTotalOrdered(grn)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Received:</span>
                      <span className="ml-2 font-medium text-green-600">
                        {calculateTotalReceived(grn)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Balance:</span>
                      <span className="ml-2 font-medium">
                        {calculateTotalOrdered(grn) -
                          calculateTotalReceived(grn)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  {onEditGRN && grn.isCompleted !== true && (
                    <Button
                      variant="primary"
                      size="small"
                      onClick={() => onEditGRN(grn)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  )}
                  <Button
                    variant="primary"
                    size="small"
                    onClick={() => handleViewGRN(grn.id)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GoodsReceivedList;
