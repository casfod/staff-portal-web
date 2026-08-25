import { IPurchaseOrder, IItemGroup, IPOItemGroup, IVendor } from '../../interfaces';
import { useParams } from 'react-router-dom';
import DetailContainer from '../../components/custom/DetailContainer';
import { FileText, Tag, Users, Clock, Package, UserCheck } from 'lucide-react';
import { ReactElement } from 'react';
import FileAttachmentContainer from '../../components/custom/FileAttachmentContainer';
import { formatToDDMMYYYY } from '../../utils/formatToDDMMYYYY';
import RequestItemsTable from '@/components/custom/RequestItemsTable';

interface PurchaseOrderDetailsProps {
  purchaseOrder: IPurchaseOrder;
}

// Update the field interface to accept IPOItemGroup[] as well
interface PurchaseOrderField {
  id: string;
  label: string;
  content: string | number | IItemGroup | IItemGroup[] | IPOItemGroup[]; // Add IPOItemGroup[]
  icon?: ReactElement;
  isBlock?: boolean;
  isArray?: boolean;
  isItemGroups?: boolean;
}

interface PurchaseOrderSection {
  title: string;
  icon: ReactElement;
  fields: PurchaseOrderField[];
}

export const PurchaseOrderDetails = ({ purchaseOrder }: PurchaseOrderDetailsProps) => {
  const { purchaseOrderId } = useParams();

  // Get vendor name with proper type checking
  const getVendorName = (): string => {
    if (!purchaseOrder.selectedVendor) return 'No Vendor';
    if (
      typeof purchaseOrder.selectedVendor === 'object' &&
      'businessName' in purchaseOrder.selectedVendor
    ) {
      return purchaseOrder.selectedVendor.businessName;
    }
    // Handle case where it's a string (vendor ID)
    if (typeof purchaseOrder.selectedVendor === 'string') {
      // Try to find vendor in copiedTo array
      if (purchaseOrder.copiedTo && Array.isArray(purchaseOrder.copiedTo)) {
        const vendor = purchaseOrder.copiedTo.find(
          v =>
            typeof v === 'object' &&
            v !== null &&
            'id' in v &&
            v.id === purchaseOrder.selectedVendor?.id
        );
        if (vendor && typeof vendor === 'object' && 'businessName' in vendor) {
          return vendor.businessName;
        }
      }
      return 'Vendor';
    }
    return 'No Vendor';
  };

  const vendorName = getVendorName();

  // Use poCode if available, otherwise fall back to rfqCode
  const purchaseOrderCode = purchaseOrder.poCode;
  const RFQReferenceCode = purchaseOrder.rfqCode;

  const purchaseOrderSections: PurchaseOrderSection[] = [
    {
      title: 'Purchase Order Information',
      icon: <FileText className="w-4 h-4" />,
      fields: [
        {
          id: 'rfqTitle',
          label: 'PO Title',
          content: purchaseOrder.rfqTitle,
        },
        {
          id: 'status',
          label: 'Status',
          content: purchaseOrder.status ? purchaseOrder.status.toUpperCase() : 'N/A',
          icon: <Tag className="w-4 h-4" />,
        },
        {
          id: 'purchaseOrderCode',
          label: 'PO Code',
          content: purchaseOrderCode,
        },
        {
          id: 'RFQReferenceCode',
          label: 'RFQ Reference Code',
          content: RFQReferenceCode,
        },
        {
          id: 'casfodAddressId',
          label: 'CASFOD Address',
          content: purchaseOrder.casfodAddressId ? purchaseOrder.casfodAddressId.toUpperCase() : 'N/A',
        },
        {
          id: 'VAT',
          label: 'WHT (%)',
          content: `${purchaseOrder.vat ? purchaseOrder.vat.toLocaleString() : 0}`,
        },
        {
          id: 'grossTotal',
          label: 'Gross Total',
          content: `₦${purchaseOrder.totalAmount.toLocaleString()}`,
        },
        {
          id: 'WHT',
          label: 'WHT AMOUNT',
          content: `₦${
            purchaseOrder.vat
              ? ((purchaseOrder.totalAmount / 100) * purchaseOrder.vat).toLocaleString()
              : 0
          }`,
        },
        {
          id: 'netTotal',
          label: 'Net Total',
          content: `₦${
            purchaseOrder.vat
              ? (
                  purchaseOrder.totalAmount -
                  ((purchaseOrder.totalAmount / 100) * purchaseOrder.vat)
                ).toLocaleString()
              : purchaseOrder.totalAmount.toLocaleString()
          }`,
        },
      ],
    },
    {
      title: 'Vendor & Approval',
      icon: <UserCheck className="w-4 h-4" />,
      fields: [
        {
          id: 'vendor',
          label: 'Vendor',
          content: vendorName,
          icon: <Users className="w-4 h-4" />,
        },
        {
          id: 'approvedBy',
          label: 'Approved By',
          content: purchaseOrder.approvedBy
            ? purchaseOrder.status === 'approved'
              ? `${purchaseOrder.approvedBy.firstName} ${purchaseOrder.approvedBy.lastName}`
              : 'Pending Approval'
            : 'Pending Approval',
          icon: <UserCheck className="w-4 h-4" />,
        },
      ],
    },
    {
      title: 'Timeline',
      icon: <Clock className="w-4 h-4" />,
      fields: [
        {
          id: 'deliveryDate',
          label: 'Delivery Date',
          content: purchaseOrder?.deliveryDate
            ? formatToDDMMYYYY(purchaseOrder?.deliveryDate)
            : 'N/A',
          icon: <Clock className="w-4 h-4" />,
        },
      ],
    },
    {
      title: 'Items & Specifications',
      icon: <Package className="w-4 h-4" />,
      fields: [
        {
          id: 'itemGroups',
          label: 'Items',
          content: purchaseOrder.itemGroups, // This is IPOItemGroup[]
          icon: <Package className="w-4 h-4" />,
          isItemGroups: true,
          isBlock: true,
        },
      ],
    },
  ];

  const canManage = purchaseOrder.status !== 'approved';

  return (
    <DetailContainer>
      <div
        className={`flex flex-col gap-6 w-full ${
          !purchaseOrderId ? 'text-sm' : 'text-sm md:text-base'
        } break-words`}
      >
        {purchaseOrderSections.map((section, sectionIndex) => (
          <div
            key={sectionIndex}
            className={`rounded-lg p-4 border ${
              section.title === 'Timeline' || section.title === 'Vendor & Approval'
                ? 'bg-blue-50 border-slate-200'
                : 'bg-gray-50 border-gray-200'
            }`}
          >
            {/* Section Header */}
            <div
              className={`flex items-center gap-2 mb-3 pb-2 border-b ${
                section.title === 'Timeline' || section.title === 'Vendor & Approval'
                  ? 'border-slate-300'
                  : 'border-gray-300'
              }`}
            >
              <div
                className={
                  section.title === 'Timeline' || section.title === 'Vendor & Approval'
                    ? 'text-slate-600'
                    : 'text-gray-600'
                }
              >
                {section.icon}
              </div>
              <h3
                className={`text-lg font-semibold ${
                  section.title === 'Timeline' || section.title === 'Vendor & Approval'
                    ? 'text-slate-800'
                    : 'text-gray-800'
                }`}
              >
                {section.title}
              </h3>
            </div>

            {/* Section Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {section.fields.map(field => (
                <div
                  key={field.id}
                  className={`${field.isBlock ? 'md:col-span-2' : ''} ${
                    section.title === 'Timeline' || section.title === 'Vendor & Approval'
                      ? 'flex items-center gap-3'
                      : ''
                  }`}
                >
                  <div
                    className={`flex items-start gap-2 ${
                      section.title === 'Timeline' || section.title === 'Vendor & Approval'
                        ? 'w-full'
                        : ''
                    }`}
                  >
                    {field.icon && (
                      <div
                        className={`mt-0.5 ${
                          section.title === 'Timeline' || section.title === 'Vendor & Approval'
                            ? 'text-slate-700'
                            : 'text-gray-500'
                        }`}
                      >
                        {field.icon}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <label
                        className={`block font-bold text-sm mb-1 uppercase tracking-wide ${
                          section.title === 'Timeline' || section.title === 'Vendor & Approval'
                            ? 'text-slate-600'
                            : 'text-gray-600'
                        }`}
                      >
                        {field.label}
                      </label>

                      {/* Special handling for item groups */}
                      {field.isItemGroups && Array.isArray(field.content) ? (
                        <>
                          {/* Show RequestItemsTable for item groups */}
                          <RequestItemsTable
                            items={field.content as unknown as IItemGroup[]}
                            type="advance"
                          />
                        </>
                      ) : field.isArray && Array.isArray(field.content) ? (
                        <div className="flex flex-wrap gap-2">
                          {(field.content as unknown[]).length > 0 ? (
                            (field.content as unknown[]).map((item, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                              >
                                {typeof item === 'object' && item !== null && 'businessName' in item
                                  ? (item as IVendor).businessName
                                  : String(item)}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-500">No vendors selected</span>
                          )}
                        </div>
                      ) : (
                        <div
                          className={`${
                            field.isBlock
                              ? 'whitespace-pre-line bg-white p-3 rounded border'
                              : 'break-words'
                          } text-gray-800`}
                        >
                          {String(field.content)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* File Attachments Section */}
      <FileAttachmentContainer
        modelName="PurchaseOrder"
        id={purchaseOrder.id}
        status={purchaseOrder.status}
        canManage={canManage}
      />
    </DetailContainer>
  );
};
