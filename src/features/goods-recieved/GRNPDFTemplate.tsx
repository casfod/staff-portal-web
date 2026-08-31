// GRNPDFTemplate.tsx - Fixed with signature support
import React, { RefObject } from 'react';
import logo from '../../assets/logo.webp';
import { IGoodsReceived, IUser } from '../../interfaces';
import { formatToDDMMYYYY } from '../../utils/formatToDDMMYYYY';
import { getAddress, infoConfig } from '@/config/config-info';

interface GRNPDFTemplateProps {
  pdfRef?: RefObject<HTMLDivElement | null> | null;
  isGenerating?: boolean;
  grnData: IGoodsReceived;
}

const GRNPDFTemplate: React.FC<GRNPDFTemplateProps> = ({
  grnData,
  pdfRef,
}) => {
  const purchaseOrder = typeof grnData.purchaseOrder === 'object' ? grnData.purchaseOrder : null;

  const address = getAddress(grnData);

  const getItemName = (itemId: string): string => {
    if (!purchaseOrder) return 'Unknown Item';
    const item = purchaseOrder.itemGroups.find(poItem => poItem._id === itemId);
    return item?.itemName || 'Unknown Item';
  };

  const getItemDescription = (itemId: string): string => {
    if (!purchaseOrder) return '';
    const item = purchaseOrder.itemGroups.find(poItem => poItem._id === itemId);
    return item?.description || '';
  };

  const totalOrdered = grnData.grnItems.reduce((sum, item) => sum + item.numberOrdered, 0);
  const totalReceived = grnData.grnItems.reduce((sum, item) => sum + item.numberReceived, 0);
  const totalDifference = grnData.grnItems.reduce((sum, item) => sum + item.difference, 0);

  // Helper to render signature if available
  const renderSignature = (user: Partial<IUser> | null , label?: string) => {
    if (!user) {
      return (
        <div className="mt-2">
          <div className="h-12 border-b border-gray-400"></div>
          <p className="text-xs text-gray-500 mt-1 text-center">{label || 'Signature'}</p>
        </div>
      );
    }
    
    // Check if user has a signature URL
    const signatureUrl = user?.signature?.url;
    
    if (signatureUrl) {
      return (
        <div className="mt-2">
          <img 
            src={signatureUrl} 
            alt="Signature" 
            className="max-h-12 max-w-32 object-contain mx-auto"
            style={{ maxWidth: '120px' }}
          />
          <p className="text-xs text-gray-500 mt-1 text-center">{label || 'Signature'}</p>
        </div>
      );
    }
    
    // Fallback: empty line for handwritten signature
    return (
      <div className="mt-2">
        <div className="h-12 border-b border-gray-400"></div>
        <p className="text-xs text-gray-500 mt-1 text-center">{label || 'Signature'}</p>
      </div>
    );
  };

  // Helper to render user info with signature
  const renderUserSection = (user: Partial<IUser>, title: string, showPosition: boolean = true) => {
    if (!user) {
      return (
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">Name</p>
            <div className="h-6 border-b border-gray-400"></div>
          </div>
          {showPosition && (
            <div>
              <p className="text-sm text-gray-600 mb-1">Position</p>
              <div className="h-6 border-b border-gray-400"></div>
            </div>
          )}
          {renderSignature(null, `${title}'s Signature`)}
          {/* <div>
            <p className="text-sm text-gray-600 mb-1">Date</p>
            <div className="h-6 border-b border-gray-400"></div>
          </div> */}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-600 mb-1">Name</p>
          <div className="h-6 border-b border-gray-400 text-center font-medium">
            {user.firstName} {user.lastName}
          </div>
        </div>
        {showPosition && (
          <div>
            <p className="text-sm text-gray-600 mb-1">Position</p>
            <div className="h-6 border-b border-gray-400 text-center">
              {user.position || user.role || 'N/A'}
            </div>
          </div>
        )}
        {renderSignature(user, `${title}'s Signature`)}
        {/* <div>
          <p className="text-sm text-gray-600 mb-1">Date</p>
          <div className="h-6 border-b border-gray-400 text-center">
            {new Date().toLocaleDateString()}
          </div>
        </div> */}
      </div>
    );
  };

  return (
    <div
      ref={pdfRef as React.LegacyRef<HTMLDivElement>}
      className="pdf-container bg-white p-8"
      style={{
        fontFamily: 'Arial, sans-serif',
        width: '210mm',
        minHeight: '297mm',
        margin: '0 auto',
      }}
    >
      {/* Header with Logo */}
      <div className="flex justify-between items-start mb-8 border-b-2 border-gray-300 pb-4">
        <div className="flex items-start">
          <div className="mr-4">
            <img src={logo} alt="logo" className="w-44 h-22" />
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-lg font-bold text-gray-700">Goods Received Note</h2>
          <p className="text-md font-semibold text-blue-600 mt-1">{grnData.grdCode}</p>
        </div>
      </div>

      {/* Purchase Order Information */}
      <div className="mb-6 p-4 bg-gray-50 border-l-4 border-blue-500">
        <h3 className="font-bold mb-2 text-lg text-gray-700">Purchase Order Information:</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <strong>PO Number:</strong> {purchaseOrder?.poCode || 'N/A'}
          </div>
          <div>
            <strong>Vendor:</strong> {purchaseOrder?.selectedVendor?.businessName || 'N/A'}
          </div>
          <div>
            <strong>PO Date:</strong>{' '}
            {purchaseOrder?.poDate ? formatToDDMMYYYY(purchaseOrder.poDate) : 'N/A'}
          </div>
          <div>
            <strong>Delivery Date:</strong>{' '}
            {purchaseOrder?.deliveryDate ? formatToDDMMYYYY(purchaseOrder.deliveryDate) : 'N/A'}
          </div>
        </div>
      </div>

      {/* Delivery Address */}
      <div className="mb-6 p-4 bg-gray-50 border-l-4 border-green-500">
        <h3 className="font-bold mb-2 text-lg text-gray-700">{infoConfig.abbriviation} Delivery address:</h3>
        <p className="text-md text-gray-600">
          {infoConfig.name}
          <br />
          {address.street}
          <br />
          {address.city}
          <br />
          {address.state}
          <br />
          {address.country}
        </p>
      </div>

      {/* GRN Details */}
      <div className="mb-6">
        <p className="leading-relaxed text-md text-gray-700 mb-4">
          This Goods Received Note confirms receipt of the following items as per the referenced
          Purchase Order.
        </p>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <strong>GRN Number:</strong> {grnData.grdCode}
          </div>
          <div>
            <strong>Status:</strong>{' '}
            <span className={`font-semibold ${grnData.isCompleted ? 'text-green-600' : 'text-yellow-600'}`}>
              {grnData.isCompleted ? 'COMPLETED' : 'IN PROGRESS'}
            </span>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-6">
        <table className="w-full border-collapse border border-gray-300 text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-2 text-left font-bold">SN</th>
              <th className="border border-gray-300 p-2 text-left font-bold">ITEM NAME</th>
              <th className="border border-gray-300 p-2 text-left font-bold">ORDERED QTY</th>
              <th className="border border-gray-300 p-2 text-left font-bold">RECEIVED QTY</th>
              <th className="border border-gray-300 p-2 text-left font-bold">DIFFERENCE</th>
              <th className="border border-gray-300 p-2 text-left font-bold">STATUS</th>
            </tr>
          </thead>
          <tbody>
            {grnData.grnItems.map((item, index) => (
              <React.Fragment key={index}>
                <tr className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="border border-gray-300 p-2 text-sm">{index + 1}</td>
                  <td className="border border-gray-300 p-2 text-sm">{getItemName(item.itemId)}</td>
                  <td className="border border-gray-300 p-2 text-sm text-right">
                    {item.numberOrdered.toLocaleString()}
                  </td>
                  <td className="border border-gray-300 p-2 text-sm text-right">
                    {item.numberReceived.toLocaleString()}
                  </td>
                  <td className="border border-gray-300 p-2 text-sm text-right">
                    {item.difference.toLocaleString()}
                  </td>
                  <td className="border border-gray-300 p-2 text-sm text-center">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.isFullyReceived
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {item.isFullyReceived ? 'Fully Received' : 'Partial'}
                    </span>
                  </td>
                </tr>
                {/* Item Description Row */}
                {getItemDescription(item.itemId) && (
                  <tr className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td
                      colSpan={6}
                      className="border border-gray-300 p-2 text-sm text-gray-600 italic"
                    >
                      <strong>Description:</strong> {getItemDescription(item.itemId)}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}

            {/* Summary Row */}
            <tr className="bg-gray-100 font-bold">
              <td colSpan={2} className="border border-gray-300 p-2 text-right text-sm">
                TOTALS:
              </td>
              <td className="border border-gray-300 p-2 text-right text-sm">
                {totalOrdered.toLocaleString()}
              </td>
              <td className="border border-gray-300 p-2 text-right text-sm">
                {totalReceived.toLocaleString()}
              </td>
              <td className="border border-gray-300 p-2 text-right text-sm">
                {totalDifference.toLocaleString()}
              </td>
              <td className="border border-gray-300 p-2 text-center text-sm">
                {grnData.isCompleted ? 'COMPLETED' : 'IN PROGRESS'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Receipt Confirmation - Three Sections with Signatures */}
      <div className="mt-12 pt-8 border-t border-gray-300">
        <div className="grid grid-cols-3 gap-6">
          {/* Delivered By (Vendor) */}
          <div>
            <p className="font-semibold mb-3 text-gray-700">DELIVERED BY (VENDOR):</p>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Vendor Name</p>
                <div className="h-6 border-b border-gray-400 text-center font-medium">
                  {purchaseOrder?.selectedVendor?.businessName || 'N/A'}
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Contact Person</p>
                <div className="h-6 border-b border-gray-400 text-center">
                  {purchaseOrder?.selectedVendor?.contactPerson || 'N/A'}
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Phone Number</p>
                <div className="h-6 border-b border-gray-400 text-center">
                  {purchaseOrder?.selectedVendor?.contactPhoneNumber || 'N/A'}
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-1">Signature</p>
                <div className="h-12 border-b border-gray-400"></div>
                <p className="text-xs text-gray-500 mt-1 text-center">(Vendor's Signature)</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Date</p>
                <div className="h-6 border-b border-gray-400"></div>
              </div>
            </div>
          </div>

          {/* Verified By (CASFOD) */}
          <div>
            <p className="font-semibold mb-3 text-gray-700">VERIFIED BY (CASFOD):</p>
            <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">Name</p>
            <div className="h-6 border-b border-gray-400"></div>
          </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Position</p>
              <div className="h-6 border-b border-gray-400"></div>
            </div>
          {renderSignature(null)}
        </div>
            
          </div>

          {/* Received By (CASFOD) */}
          <div>
            <p className="font-semibold mb-3 text-gray-700">RECEIVED BY ({infoConfig.abbriviation}):</p>
            {renderUserSection(grnData.createdBy, 'Receiver', true)}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-4 border-t border-gray-300 text-center">
        <p className="text-sm text-gray-700">
          {infoConfig.name} |{' '}
          <span className="font-semibold text-blue-600">procurement@casfod.org</span>
        </p>
      </div>
    </div>
  );
};

export default GRNPDFTemplate;