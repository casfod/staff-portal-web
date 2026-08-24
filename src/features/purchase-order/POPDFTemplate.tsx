// components/PurchaseOrder/POPDFTemplate.tsx
import React, { RefObject } from 'react';
import logo from '../../assets/logo.webp';
import { IPurchaseOrder, IUser, IVendor } from '../../interfaces';
import { formatToDDMMYYYY } from '../../utils/formatToDDMMYYYY';
import { getAddress, infoConfig } from '@/config/config-info';

interface POPDFTemplateProps {
  pdfRef?: RefObject<HTMLDivElement | null> | null;
  isGenerating?: boolean;
  poData: IPurchaseOrder;
}

const POPDFTemplate: React.FC<POPDFTemplateProps> = ({ isGenerating = false, poData, pdfRef }) => {
  const grandTotal = poData.itemGroups.reduce((sum, item) => sum + item.total, 0);

  const address = getAddress(poData);

  // Get vendor object - handle both string and IVendor
  const getVendor = (): IVendor | null => {
    if (!poData.selectedVendor) return null;
    if (typeof poData.selectedVendor === 'object' && 'businessName' in poData.selectedVendor) {
      return poData.selectedVendor as IVendor;
    }
    return null;
  };

  const vendor = getVendor();

  // Helper to render signature if available
  const renderSignature = (user: Partial<IUser>) => {
    if (!user) return null;
    
    // Check if user has a signature URL
    const signatureUrl = user?.signature?.url;
    
    if (signatureUrl) {
      return (
        <div className="mt-2">
          <img 
            src={signatureUrl} 
            alt="Signature" 
            className="max-h-12 max-w-32 object-contain"
            style={{ maxWidth: '120px' }}
          />
          <p className="text-xs text-gray-500 mt-1">Signature</p>
        </div>
      );
    }
    
    // Fallback: empty line for handwritten signature
    return (
      <div className="border-t border-gray-300 pt-8 mt-2">
        <p className="text-xs text-gray-500">Signature</p>
      </div>
    );
  };

  return (
    <div
      ref={pdfRef as React.Ref<HTMLDivElement> | undefined}
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
          <h2 className="text-lg font-bold text-gray-700">Purchase Order</h2>
          <p className="text-md font-semibold text-blue-600 mt-1">{poData.poCode}</p>
          <p className="text-sm text-gray-500 mt-1">
            PO Date: {poData?.poDate ? formatToDDMMYYYY(poData?.poDate || '') : 'N/A'}
          </p>
        </div>
      </div>

      {/* Vendor Information */}
      <div className="mb-6 p-4 bg-gray-50 border-l-4 border-blue-500">
        <h3 className="font-bold mb-2 text-lg text-gray-700">Vendor Information:</h3>
        {vendor ? (
          <p className="text-md text-gray-600">
            {vendor.businessName ?? 'N/A'}
            <br />
            {vendor.contactPerson && `Attn: ${vendor.contactPerson}`}
            <br />
            {vendor.email}
            <br />
            {vendor.businessPhoneNumber && `Tel: ${vendor.businessPhoneNumber}`}
            <br />
            {vendor.address}
          </p>
        ) : (
          <p className="text-md text-gray-400 italic">Vendor information unavailable</p>
        )}
      </div>

      {/* Delivery Address */}
      {address && (
        <div className="mb-6 p-4 bg-gray-50 border-l-4 border-green-500">
          <h3 className="font-bold mb-2 text-lg text-gray-700">${infoConfig.abbriviation} Delivery address:</h3>
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
      )}

      {/* Purchase Order Details */}
      <div className="mb-6">
        <p className="leading-relaxed text-md text-gray-700 mb-4">
          This Purchase Order confirms our order for the following items. Please deliver as per the
          terms and conditions specified below.
        </p>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <strong>PO Number:</strong> {poData.poCode}
          </div>
          <div>
            <strong>RFQ Reference:</strong> {poData.rfqCode ? poData.rfqCode : 'N/A'}
          </div>

          {poData.deliveryDate && (
            <div>
              <strong>Delivery Date:</strong> {formatToDDMMYYYY(poData.deliveryDate)}
            </div>
          )}
        </div>
      </div>

      {/* Terms and Conditions */}
      <div className="mb-6">
        <h3 className="font-bold mb-3 text-gray-800 border-b pb-1">Terms and Conditions</h3>
        <ul className="text-md text-gray-700 space-y-2">
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>
              All goods must be delivered in accordance with the specifications and delivery
              schedule mentioned above.
            </span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Payment will be made upon satisfactory delivery and acceptance of goods.</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>All invoices must reference this Purchase Order number.</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>${infoConfig.abbriviation} reserves the right to cancel this order if terms are not met.</span>
          </li>
          {poData.deliveryDate && (
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>
                Goods are guaranteed for delivery on {formatToDDMMYYYY(poData.deliveryDate)}.
              </span>
            </li>
          )}
        </ul>
      </div>

      {isGenerating && <div className="h-80"></div>}

      {/* Items Table */}
      <div className="mb-6">
        <table className="w-full border-collapse border border-gray-300 text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-2 text-left font-bold">SN</th>
              <th className="border border-gray-300 p-2 text-left font-bold">ITEM NAME</th>
              <th className="border border-gray-300 p-2 text-left font-bold">QUANTITY</th>
              <th className="border border-gray-300 p-2 text-left font-bold">FREQUENCY</th>
              <th className="border border-gray-300 p-2 text-left font-bold">UNIT</th>
              <th className="border border-gray-300 p-2 text-left font-bold">UNIT COST (₦)</th>
              <th className="border border-gray-300 p-2 text-left font-bold">TOTAL COST (₦)</th>
            </tr>
          </thead>
          <tbody>
            {poData.itemGroups.map((item, index) => (
              <React.Fragment key={index}>
                <tr className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="border border-gray-300 p-2 text-sm">{index + 1}</td>
                  <td className="border border-gray-300 p-2 text-sm">{item.itemName}</td>
                  <td className="border border-gray-300 p-2 text-sm text-right">
                    {item.quantity.toLocaleString()}
                  </td>
                  <td className="border border-gray-300 p-2 text-sm text-right">
                    {item.frequency.toLocaleString()}
                  </td>
                  <td className="border border-gray-300 p-2 text-sm">{item.unit || '-'}</td>
                  <td className="border border-gray-300 p-2 text-sm text-right">
                    {item.unitCost > 0 ? item.unitCost.toLocaleString() : ''}
                  </td>
                  <td className="border border-gray-300 p-2 text-sm text-right">
                    {item.total > 0 ? item.total.toLocaleString() : ''}
                  </td>
                </tr>
                {/* Description row spanning all columns */}
                {item.description && (
                  <tr>
                    <td colSpan={7} className="border border-gray-300 p-2 text-sm">
                      <div className="w-full">
                        <span className="font-semibold text-gray-600">Detailed Description:</span>
                        <p className="mt-1">{item.description}</p>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}

            {/* Grand Total Row */}
            <tr className="bg-gray-100 font-bold">
              <td colSpan={6} className="border border-gray-300 p-2 text-right text-sm">
                GROSS TOTAL:
              </td>
              <td className="border border-gray-300 p-2 text-right text-sm">
                ₦{grandTotal.toLocaleString()}
              </td>
            </tr>

            <tr className="bg-gray-100 font-bold">
              <td colSpan={6} className="border border-gray-300 p-2 text-right text-sm">
                WHT:
              </td>
              <td className="border border-gray-300 p-2 text-right text-sm">
                ₦{poData.vat ? ((grandTotal / 100) * poData.vat).toLocaleString() : 0}
              </td>
            </tr>

            <tr className="bg-gray-100 font-bold">
              <td colSpan={6} className="border border-gray-300 p-2 text-right text-sm">
                NET TOTAL:
              </td>
              <td className="border border-gray-300 p-2 text-right text-sm">
                ₦
                {poData.vat
                  ? (grandTotal - (grandTotal / 100) * poData.vat).toLocaleString()
                  : grandTotal.toLocaleString()}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Approval Section with Signatures */}
      <div className="mt-12 pt-8 border-t border-gray-300">
        <div className="grid grid-cols-3 gap-8">
          {/* Prepared By */}
          <div>
            <p className="font-semibold mb-2">Prepared By:</p>
            <div className="mt-2">
              <p>
                {poData.createdBy?.firstName} {poData.createdBy?.lastName}
              </p>
              <p className="text-sm text-gray-600">{poData.createdBy?.email}</p>
              {renderSignature(poData.createdBy)}
            </div>
          </div>

          {/* Approved By */}
          <div>
            <p className="font-semibold mb-2">Approved By:</p>
            <div className="mt-2">
              {poData.approvedBy ? (
                <>
                  <p>
                    {poData.approvedBy.firstName} {poData.approvedBy.lastName}
                  </p>
                  <p className="text-sm text-gray-600">{poData.approvedBy.email}</p>
                  {renderSignature(poData.approvedBy)}
                </>
              ) : (
                <div className="border-t border-gray-300 pt-8 mt-2">
                  <p className="text-xs text-gray-500">Signature</p>
                </div>
              )}
            </div>
          </div>

          {/* Vendor Representative Section - For Handwritten Input */}
          <div>
            <p className="font-semibold mb-2">Vendor Representative:</p>
            <div className="border-t border-gray-300 pt-8 mt-2 space-y-6">
              <div>
                <p className="font-medium text-sm text-gray-700 mb-2">Name</p>
                <div className="h-8 border-b border-gray-400"></div>
              </div>
              <div>
                <p className="font-medium text-sm text-gray-700 mb-2">Signature</p>
                <div className="h-12 border-b border-gray-400"></div>
                <p className="text-xs text-gray-500 mt-1">(Sign here)</p>
              </div>
            </div>
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

export default POPDFTemplate;