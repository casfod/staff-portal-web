import { IItemGroup, IRFQ, IVendor } from '../../interfaces';
import { useParams } from 'react-router-dom';
import { formatToDDMMYYYY } from '../../utils/formatToDDMMYYYY';
import DetailContainer from '../../components/custom/DetailContainer';
import { FileText, Tag, Users, Clock, Package, Info } from 'lucide-react';
import { ReactElement } from 'react';
import FileAttachmentContainer from '../../components/custom/FileAttachmentContainer';
import RequestItemsTable from '@/components/custom/RequestItemsTable';

interface RFQDetailsProps {
  rfq: IRFQ;
}

interface RFQField {
  id: string;
  label: string;
  content: string | number | IItemGroup | unknown[];
  icon?: ReactElement;
  isBlock?: boolean;
  isArray?: boolean;
  isItemGroups?: boolean;
}

interface RFQSection {
  title: string;
  icon: ReactElement;
  fields: RFQField[];
}

export const RFQDetails = ({ rfq }: RFQDetailsProps) => {
  const { rfqId } = useParams();

  // Calculate totals
  const totalAmount = rfq.itemGroups.reduce((sum, item) => sum + item.total, 0);
  // const totalItems = rfq.itemGroups.reduce(
  //   (sum, item) => sum + item.quantity,
  //   0
  // );

  const rfqSections: RFQSection[] = [
    {
      title: 'RFQ Information',
      icon: <FileText className="w-4 h-4" />,
      fields: [
        {
          id: 'rfqTitle',
          label: 'RFQ Title',
          content: rfq.rfqTitle,
        },
        {
          id: 'rfqCode',
          label: 'RFQ Code',
          content: rfq.rfqCode,
        },
        {
          id: 'status',
          label: 'Status',
          content: rfq.status.toUpperCase(),
          icon: <Tag className="w-4 h-4" />,
        },
        {
          id: 'totalAmount',
          label: 'Total Amount',
          content: `₦${totalAmount.toLocaleString()}`,
          // icon: <DollarSign className="w-4 h-4" />,
        },
        {
          id: 'casfodAddressId',
          label: 'CASFOD Address',
          content: rfq.casfodAddressId.toUpperCase(),
        },
      ],
    },
    {
      title: 'Timeline & Validity',
      icon: <Clock className="w-4 h-4" />,
      fields: [
        {
          id: 'rfqDate',
          label: 'RFQ Date',
          content: formatToDDMMYYYY(rfq.rfqDate) || 'N/A',
        },
        {
          id: 'deadlineDate',
          label: 'Deadline Date',
          content: formatToDDMMYYYY(rfq.deadlineDate) || 'N/A',
        },
      ],
    },
    {
      title: 'Specifications',
      icon: <Info className="w-4 h-4" />,
      fields: [
        {
          id: 'itemGroups',
          label: 'Items',
          content: rfq.itemGroups,
          icon: <Package className="w-4 h-4" />,
          isItemGroups: true,
          isBlock: true,
        },
      ],
    },
    {
      title: 'Vendor Distribution',
      icon: <Users className="w-4 h-4" />,
      fields: [
        {
          id: 'copiedTo',
          label: 'Vendors',
          content: Array.isArray(rfq.copiedTo) ? rfq.copiedTo : [],
          icon: <Users className="w-4 h-4" />,
          isArray: true,
          isBlock: true,
        },
      ],
    },
  ];

  return (
    <DetailContainer>
      <div
        className={`flex flex-col gap-6 w-full ${
          !rfqId ? 'text-sm' : 'text-sm md:text-base'
        } break-words`}
      >
        {rfqSections.map((section, sectionIndex) => (
          <div
            key={sectionIndex}
            className={`rounded-lg p-4 border ${
              section.title === 'Timeline & Validity' || section.title === 'Vendor Distribution'
                ? 'bg-blue-50 border-slate-200'
                : 'bg-gray-50 border-gray-200'
            }`}
          >
            {/* Section Header */}
            <div
              className={`flex items-center gap-2 mb-3 pb-2 border-b ${
                section.title === 'Timeline & Validity' || section.title === 'Vendor Distribution'
                  ? 'border-slate-300'
                  : 'border-gray-300'
              }`}
            >
              <div
                className={
                  section.title === 'Timeline & Validity' || section.title === 'Vendor Distribution'
                    ? 'text-slate-600'
                    : 'text-gray-600'
                }
              >
                {section.icon}
              </div>
              <h3
                className={`text-lg font-semibold ${
                  section.title === 'Timeline & Validity' || section.title === 'Vendor Distribution'
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
                    section.title === 'Timeline & Validity' ||
                    section.title === 'Vendor Distribution'
                      ? 'flex items-center gap-3'
                      : ''
                  }`}
                >
                  <div
                    className={`flex items-start gap-2 ${
                      section.title === 'Timeline & Validity' ||
                      section.title === 'Vendor Distribution'
                        ? 'w-full'
                        : ''
                    }`}
                  >
                    {field.icon && (
                      <div
                        className={`mt-0.5 ${
                          section.title === 'Timeline & Validity' ||
                          section.title === 'Vendor Distribution'
                            ? 'text-slate-700'
                            : 'text-gray-500'
                        }`}
                      >
                        {field.icon}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <label
                        className={`block fon text-sm font-extrabold mb-1 uppercase tracking-wide ${
                          section.title === 'Timeline & Validity' ||
                          section.title === 'Vendor Distribution'
                            ? 'text-slate-600'
                            : 'text-gray-600'
                        }`}
                      >
                        {field.label}
                      </label>

                      {/* Special handling for item groups */}
                      {field.isItemGroups ? (
                        <>
                          {/* Show mobile table on small screens, desktop table on larger screens */}
                          <RequestItemsTable items={field.content as IItemGroup[]} type="advance" />
                        </>
                      ) : field.isArray ? (
                        <div className="flex flex-wrap gap-2">
                          {(field.content as unknown[]).length > 0 ? (
                            (field.content as unknown[]).map((item, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                              >
                                {typeof item === 'object' && 'businessName' in item!
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
                          } ${
                            section.title === 'Timeline & Validity'
                              ? 'text-slate-800 font-medium'
                              : section.title === 'Vendor Distribution'
                                ? 'text-slate-800'
                                : 'text-gray-800'
                          }`}
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

      <FileAttachmentContainer modelName="RFQ" id={rfq.id} status={'draft'} canManage={true} />
    </DetailContainer>
  );
};
