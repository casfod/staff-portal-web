// ActionIcons.tsx - Fixed undefined request handling with both dropdowns
import { HiMiniEye, HiMiniEyeSlash } from 'react-icons/hi2';
import { Download, Edit, Trash2, Users } from 'lucide-react';
import LoadingDots from './LoadingDots';
import { useRef, useState } from 'react';
import { useTagSharing } from '../../hooks/useTagSharing';
import TagVendorsDropdown from './TagVendorsDropdown';
import TagUsersDropdown from './TagUsersDropdown';
import { IUser, IVendor } from '../../interfaces';

// RFQ-specific status type
type RFQStatus = 'draft' | 'preview' | 'sent' | 'cancelled';

interface BaseRequest {
  id: string;
}

interface ActionIconsProps {
  copyTo?: ({ recipients }: { recipients: string[] }) => void;
  copyToVendors?: ({ recipients }: { recipients: string[] }) => void;
  isCopying?: boolean;
  canShareRequest?: boolean | undefined;
  isEditable?: boolean;
  isDeletable?: boolean;
  isGeneratingPDF?: boolean;
  requestId?: string;
  visibleItems?: Record<string, boolean>;
  onToggleView?: (requestId: string) => void;
  onEdit?: (request: BaseRequest) => void;
  onDelete?: (requestId: string) => void;
  onDownloadPDF?: () => void;
  onPreviewPDF?: () => void;
  showTagDropdown?: boolean;
  setShowTagDropdown?: (isOpen: boolean) => void;
  //   setShowTagDropdown?: React.Dispatch<
  //   React.SetStateAction<boolean>
  // >;
  request?: BaseRequest;
  iconSize?: number | string;
  editIcon?: React.ReactNode;
  deleteIcon?: React.ReactNode;
  viewIcon?: React.ReactNode;
  hideIcon?: React.ReactNode;
  downloadIcon?: React.ReactNode;
  previewIcon?: React.ReactNode;
  TagIcon?: React.ReactNode;
  rfqStatus?: RFQStatus;
  mode?: 'users' | 'vendors' | 'purchase-order';
  variant?: 'list' | 'detail';
  hideInspect?: boolean;
  onShareError?: (error: Error) => void;
}

const ActionIcons = ({
  copyTo,
  copyToVendors,
  isCopying,
  canShareRequest,
  isEditable,
  isDeletable = true,
  isGeneratingPDF,
  requestId = '',
  visibleItems = {},
  onToggleView,
  onEdit,
  onDelete,
  onDownloadPDF,
  onPreviewPDF,
  showTagDropdown,
  setShowTagDropdown,
  request,
  iconSize = 5,
  editIcon = <Edit className={`h-${iconSize} w-${iconSize}`} />,
  deleteIcon = <Trash2 className={`h-${iconSize} w-${iconSize}`} />,
  viewIcon = <HiMiniEye className={`h-${iconSize} w-${iconSize}`} />,
  hideIcon = <HiMiniEyeSlash className={`h-${iconSize} w-${iconSize}`} />,
  TagIcon = <Users className={`h-${iconSize} w-${iconSize}`} />,
  downloadIcon = isGeneratingPDF ? (
    <LoadingDots />
  ) : (
    <Download className={`h-${iconSize} w-${iconSize}`} />
  ),
  previewIcon = <HiMiniEye className={`h-${iconSize} w-${iconSize}`} />,
  rfqStatus,
  mode = 'users',
  variant = 'list',
  hideInspect = false,
  onShareError,
}: ActionIconsProps) => {
  const tagWrapperRef = useRef<HTMLDivElement>(null);
  const [shareError, setShareError] = useState<string | null>(null);

  const {
    searchTerm,
    setSearchTerm,
    users,
    vendors,
    isLoading,
    isError,
    isRFQShareable,
    isRFQDisabled,
    tooltip: shareButtonTooltip,
    hasMore,
    isLoadingMore,
    loadMore,
  } = useTagSharing({
    mode,
    isOpen: !!showTagDropdown,
    canShareRequest,
    rfqStatus,
  });

  // const handleTagClick = (e: React.MouseEvent) => {
  //   e.stopPropagation();
  //   setShowTagDropdown!(!showTagDropdown);
  //   setSearchTerm("");
  //   setShareError(null);
  // };

  //   const handleTagClick = (e: React.MouseEvent) => {
  //   e.stopPropagation();

  //   setSearchTerm("");
  //   setShareError(null);

  //   setShowTagDropdown?.((prev) => !prev);
  // };

  const handleTagClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    setSearchTerm('');
    setShareError(null);

    if (setShowTagDropdown) {
      setShowTagDropdown(!showTagDropdown);
    }
  };

  const handleSelectUsers = async (recipients: string[]) => {
    // Validate requestId
    if (!requestId) {
      const error = new Error('Cannot share: No request ID available');
      console.error('[ActionIcons] Share failed:', error.message);
      setShareError('Request ID is missing. Please refresh and try again.');
      onShareError?.(error);
      return;
    }

    if (!copyTo) {
      const error = new Error('Cannot share: copyTo function is not defined');
      console.error('[ActionIcons] Share failed:', error.message);
      setShareError('Sharing is not available for this request.');
      onShareError?.(error);
      return;
    }

    if (recipients.length < 1) {
      const error = new Error('No users selected to share with');
      console.warn('[ActionIcons] Share attempted with empty user list');
      setShareError('Please select at least one user.');
      onShareError?.(error);
      return;
    }

    try {
      await copyTo({ recipients });
      setShareError(null);
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error');
      console.error('[ActionIcons] Share failed:', err);
      setShareError('Failed to share request. Please try again.');
      onShareError?.(err);
      throw err;
    }
  };

  const handleSelectVendors = async (recipients: string[]) => {
    // Validate requestId
    if (!requestId) {
      const error = new Error('Cannot share: No request ID available');
      console.error('[ActionIcons] Share failed:', error.message);
      setShareError('Request ID is missing. Please refresh and try again.');
      onShareError?.(error);
      return;
    }

    if (!copyToVendors) {
      const error = new Error('Cannot share: copyToVendors function is not defined');
      console.error('[ActionIcons] Share failed:', error.message);
      setShareError('Vendor sharing is not available for this request.');
      onShareError?.(error);
      return;
    }

    if (recipients.length < 1) {
      const error = new Error('No vendors selected to share with');
      console.warn('[ActionIcons] Share attempted with empty vendor list');
      setShareError('Please select at least one vendor.');
      onShareError?.(error);
      return;
    }

    try {
      await copyToVendors({ recipients });
      setShareError(null);
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error');
      console.error('[ActionIcons] Share failed:', err);
      setShareError('Failed to share with vendors. Please try again.');
      onShareError?.(err);
      throw err;
    }
  };

  const shouldShowShareButton =
    setShowTagDropdown &&
    (mode === 'users' ? canShareRequest : isRFQShareable) &&
    mode !== 'purchase-order';

  const shouldShowInspectButton = variant === 'list' && !hideInspect && onToggleView;

  // Shared dropdown JSX with error state handling
  const tagDropdown =
    showTagDropdown &&
    !isRFQDisabled &&
    (mode === 'vendors' ? (
      <TagVendorsDropdown
        vendors={vendors as IVendor[]}
        isLoading={isLoading}
        isError={isError || !!shareError}
        onSelectVendors={handleSelectVendors}
        onClose={() => {
          setShowTagDropdown!(false);
          setShareError(null);
        }}
        anchorRef={tagWrapperRef}
        errorMessage={shareError || undefined}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        hasMore={hasMore}
        isLoadingMore={isLoadingMore}
        onLoadMore={loadMore}
      />
    ) : (
      <TagUsersDropdown
        users={users as IUser[]}
        isLoading={isLoading}
        isError={isError || !!shareError}
        onSelectUsers={handleSelectUsers}
        onClose={() => {
          setShowTagDropdown!(false);
          setShareError(null);
        }}
        anchorRef={tagWrapperRef}
        errorMessage={shareError || undefined}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        hasMore={hasMore}
        isLoadingMore={isLoadingMore}
        onLoadMore={loadMore}
      />
    ));

  const shareButton = shouldShowShareButton && (
    <div ref={tagWrapperRef} className="relative">
      <button
        className={`hover:cursor-pointer ${
          mode === 'vendors' && isRFQDisabled ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700'
        }`}
        onClick={isRFQDisabled ? undefined : handleTagClick}
        title={shareButtonTooltip}
        disabled={isRFQDisabled}
      >
        {isCopying ? <LoadingDots /> : TagIcon}
      </button>
      {tagDropdown}
      {shareError && !showTagDropdown && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs px-3 py-2 text-xs text-white bg-red-500 rounded shadow-lg z-50">
          {shareError}
        </div>
      )}
    </div>
  );

  if (variant === 'detail') {
    return (
      <div className="flex space-x-4">
        {onDownloadPDF && (
          <button
            className="hover:cursor-pointer text-green-600"
            onClick={e => {
              e.stopPropagation();
              onDownloadPDF();
            }}
            title="Download PDF"
          >
            {downloadIcon}
          </button>
        )}
        {shareButton}
      </div>
    );
  }

  return (
    <div className="flex space-x-4">
      {shouldShowInspectButton && (
        <span className="hover:cursor-pointer" onClick={() => onToggleView(requestId)}>
          {visibleItems[requestId] ? hideIcon : viewIcon}
        </span>
      )}

      {isEditable && (
        <div className="flex space-x-4">
          {onEdit && (
            <button
              className="hover:cursor-pointer"
              onClick={e => {
                e.stopPropagation();
                onEdit(request || ({} as BaseRequest));
              }}
            >
              {editIcon}
            </button>
          )}

          {onDelete && isDeletable && (
            <button
              className="text-red-600 hover:text-red-900 hover:cursor-pointer"
              onClick={e => {
                e.stopPropagation();
                onDelete(requestId);
              }}
            >
              {deleteIcon}
            </button>
          )}
        </div>
      )}

      <div className="flex space-x-4">
        {onPreviewPDF && (
          <button
            className="hover:cursor-pointer text-blue-600"
            onClick={e => {
              e.stopPropagation();
              onPreviewPDF();
            }}
            title="Preview PDF"
          >
            {previewIcon}
          </button>
        )}

        {onDownloadPDF && (
          <button
            className="hover:cursor-pointer text-green-600"
            onClick={e => {
              e.stopPropagation();
              onDownloadPDF();
            }}
            title="Download PDF"
          >
            {downloadIcon}
          </button>
        )}

        {shareButton}

        {mode === 'vendors' && isRFQDisabled && (
          <span
            className={`text-xl font-extrabold h-${iconSize} w-${iconSize} text-gray-400 cursor-not-allowed`}
            title={shareButtonTooltip}
          >
            <Users className={`h-${iconSize} w-${iconSize} text-gray-400`} />
          </span>
        )}

        {mode === 'vendors' && !canShareRequest && (
          <span
            className={`text-xl font-extrabold h-${iconSize} w-${iconSize} text-gray-400 cursor-not-allowed`}
            title={shareButtonTooltip}
          >
            --
          </span>
        )}
      </div>
    </div>
  );
};

export default ActionIcons;
