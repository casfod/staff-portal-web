// BaseRequestCard.tsx - Shared visual chrome for every request-type card
//
// This component ONLY knows how to lay out and style a card. It has no idea
// what a "purchase request" or a "leave" is, and it never guesses which
// field on a request object is the "name" or the "amount" — that mapping
// lives in the thin per-type wrapper (ProjectCard, ReportCard, LeaveCard...)
// that sits in each feature folder and passes in already-resolved values.
import { ReactNode } from 'react';
import { moneyFormat } from '../../utils/moneyFormat';
import { formatToDDMMYYYY } from '../../utils/formatToDDMMYYYY';
import StatusBadge from './StatusBadge';
import ActionIcons from './ActionIcons';

export interface RequestCardActionIconsProps {
  copyTo?: ({ recipients }: { recipients: string[] }) => void;
  isCopying?: boolean;
  canShareRequest?: boolean;
  isGeneratingPDF?: boolean;
  onDownloadPDF?: () => void;
  showTagDropdown?: boolean;
  setShowTagDropdown?: (value: boolean) => void;
  variant?: 'list' | 'detail';
  hideInspect?: boolean;
  [key: string]: unknown;
}

export interface BaseRequestCardProps {
  /** Heading text — staff name, business name, activity title, etc. */
  displayName: string;
  /** Reference code shown next to/under the name (e.g. PCR-0001) */
  identifier?: string;
  /** Rendered as a StatusBadge. Omit entirely to hide the badge. */
  status?: string;
  /** Raw date value, formatted internally to DD/MM/YYYY */
  date?: string | Date;
  /** Monetary total, formatted as NGN currency when provided */
  totalAmount?: number;
  requestId: string;
  actionIconsProps: RequestCardActionIconsProps;
  additionalInfo?: ReactNode;
  context?: 'list' | 'detail';
  showActions?: boolean;
  showStatus?: boolean;
  showIdentifier?: boolean;
  showDate?: boolean;
  className?: string;
}

/**
 * Props every per-type wrapper card re-exposes to its own caller.
 * (Everything BaseRequestCard needs, minus the fields the wrapper resolves
 * itself from its typed entity, plus an optional requestId override.)
 */
export type RequestCardWrapperProps = Omit<
  BaseRequestCardProps,
  'displayName' | 'identifier' | 'status' | 'date' | 'totalAmount' | 'requestId'
> & {
  requestId?: string;
};

const BaseRequestCard = ({
  displayName,
  identifier,
  status,
  date,
  totalAmount,
  requestId,
  actionIconsProps,
  additionalInfo,
  context = 'detail',
  showActions = true,
  showStatus = true,
  showIdentifier = true,
  showDate = true,
  className = '',
}: BaseRequestCardProps) => {
  const formattedDate = date ? formatToDDMMYYYY(date) : '';

  const renderStatus = () => {
    if (!showStatus || !status) return null;
    return <StatusBadge status={status} size={context === 'list' ? 'sm' : 'md'} />;
  };

  // List view (mobile cards)
  if (context === 'list') {
    return (
      <div
        className={`bg-gray-50/50 rounded-lg border border-gray-200 p-4 shadow-md space-y-3 ${className}`}
      >
        {/* Top Row - Main Info */}
        <div className="flex flex-col items-center gap-1">
          <div className="mt-1">{renderStatus()}</div>
          <h3 className="text-center text-wrap font-semibold text-gray-900 truncate">
            {displayName}
          </h3>
        </div>

        <div className="text-center">
          {totalAmount !== undefined && (
            <div className="text-xs font-bold">{moneyFormat(totalAmount, 'NGN')}</div>
          )}
          {showDate && formattedDate && (
            <div className="text-xs text-gray-500 mt-1">{formattedDate}</div>
          )}
          {additionalInfo}
        </div>

        {/* Bottom Row - Actions */}
        {showActions && (
          <div className="flex justify-between items-center pt-2 border-t border-gray-100">
            {showIdentifier && identifier && (
              <span className="text-sm text-gray-600">{identifier}</span>
            )}
            <div className="flex items-center space-x-2">
              <ActionIcons requestId={requestId} {...actionIconsProps} />
            </div>
          </div>
        )}
      </div>
    );
  }

  // Detail view
  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 mb-4 shadow-sm ${className}`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left Side: Status and Basic Info */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div>{renderStatus()}</div>
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">{displayName}</h3>
            {showIdentifier && identifier && (
              <div className="text-sm text-gray-600">{identifier}</div>
            )}
          </div>
          {totalAmount !== undefined && (
            <div className="font-bold text-gray-900">{moneyFormat(totalAmount, 'NGN')}</div>
          )}
        </div>

        {/* Right Side: Date and Actions */}
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-4">
            {showDate && formattedDate && (
              <div className="text-sm text-gray-500">{formattedDate}</div>
            )}
            {additionalInfo}
          </div>
          {showActions && <ActionIcons requestId={requestId} {...actionIconsProps} />}
        </div>
      </div>
    </div>
  );
};

export default BaseRequestCard;
