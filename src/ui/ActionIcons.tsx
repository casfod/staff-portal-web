// ActionIcons.tsx - Updated with anchorRef for portal-based dropdowns
import { HiMiniEye, HiMiniEyeSlash } from "react-icons/hi2";
import { Download, Edit, Trash2, Users } from "lucide-react";
import LoadingDots from "./LoadingDots";
import { useDebounce } from "use-debounce";
import { useRef, useState } from "react";
import { useUsers } from "../features/user/Hooks/useUsers";
import { useVendorsByStatus } from "../features/Vendor/Hooks/useVendor";
import TagVendorsDropdown from "./TagVendorsDropdown";
import TagUsersDropdown from "./TagUsersDropdown";

// RFQ-specific status type
type RFQStatus = "draft" | "preview" | "sent" | "cancelled";

interface ActionIconsProps {
  copyTo?: ({ userIds }: { userIds: string[] }) => void;
  copyToVendors?: ({ vendorIds }: { vendorIds: string[] }) => void;
  isCopying?: boolean;
  canShareRequest?: boolean | undefined;
  isEditable?: boolean;
  isDeletable?: boolean;
  isGeneratingPDF?: boolean;
  requestId?: string;
  visibleItems?: Record<string, boolean>;
  onToggleView?: (requestId: string) => void;
  onEdit?: (request: any) => void;
  onDelete?: (requestId: string) => void;
  onDownloadPDF?: () => void;
  onPreviewPDF?: () => void;
  showTagDropdown?: boolean;
  setShowTagDropdown?: (isOpen: boolean) => void;
  request?: any;
  iconSize?: number | string;
  editIcon?: React.ReactNode;
  deleteIcon?: React.ReactNode;
  viewIcon?: React.ReactNode;
  hideIcon?: React.ReactNode;
  downloadIcon?: React.ReactNode;
  previewIcon?: React.ReactNode;
  TagIcon?: React.ReactNode;
  rfqStatus?: RFQStatus;
  mode?: "users" | "vendors" | "purchase-order";
  variant?: "list" | "detail";
  hideInspect?: boolean;
}

const ActionIcons = ({
  copyTo,
  copyToVendors,
  isCopying,
  canShareRequest,
  isEditable,
  isDeletable = true,
  isGeneratingPDF,
  requestId = "",
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
  mode = "users",
  variant = "list",
  hideInspect = false,
}: ActionIconsProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm] = useDebounce(searchTerm, 600);

  // Ref for the share button wrapper — used as portal anchor
  const tagWrapperRef = useRef<HTMLDivElement>(null);

  const {
    data: usersData,
    isLoading: usersLoading,
    isError: usersError,
  } = useUsers({ search: debouncedSearchTerm, limit: 9999 });

  const {
    data: vendorsData,
    isLoading: vendorsLoading,
    isError: vendorsError,
  } = useVendorsByStatus("approved", {
    page: 1,
    limit: 1000,
    search: debouncedSearchTerm,
  });

  const handleTagClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowTagDropdown!(!showTagDropdown);
    setSearchTerm("");
  };

  const handleSelectUsers = async (userIds: string[]) => {
    if (!requestId || userIds.length < 1) return;
    copyTo!({ userIds });
  };

  const handleSelectVendors = async (vendorIds: string[]) => {
    if (!requestId || vendorIds.length < 1) return;
    copyToVendors!({ vendorIds });
  };

  const isLoading = mode === "vendors" ? vendorsLoading : usersLoading;
  const isError = mode === "vendors" ? vendorsError : usersError;
  const data =
    mode === "vendors" ? vendorsData?.data?.vendors : usersData?.data?.users;

  const isRFQShareable =
    mode === "vendors" &&
    canShareRequest &&
    rfqStatus &&
    rfqStatus !== "sent" &&
    rfqStatus !== "cancelled";

  const shouldShowShareButton =
    setShowTagDropdown &&
    (mode === "users" ? canShareRequest : isRFQShareable) &&
    mode !== "purchase-order";

  const getShareButtonTooltip = () => {
    if (mode === "users") return "Share with users";
    if (!canShareRequest) return "You don't have permission to share this RFQ";
    switch (rfqStatus) {
      case "sent":
        return "RFQ already sent to vendors";
      case "cancelled":
        return "Cancelled RFQ cannot be shared";
      case "draft":
      case "preview":
        return "Share with vendors";
      default:
        return "Share with vendors";
    }
  };

  const getRFQDisabledState = () => {
    if (mode !== "vendors") return false;
    return !isRFQShareable && canShareRequest;
  };

  const isRFQDisabled = getRFQDisabledState();
  const shareButtonTooltip = getShareButtonTooltip();

  const shouldShowInspectButton =
    variant === "list" && !hideInspect && onToggleView;

  // Shared dropdown JSX — reused in both variants
  const tagDropdown =
    showTagDropdown &&
    !isRFQDisabled &&
    (mode === "vendors" ? (
      <TagVendorsDropdown
        vendors={data || []}
        isLoading={isLoading}
        isError={isError}
        onSelectVendors={handleSelectVendors}
        onClose={() => setShowTagDropdown!(false)}
        anchorRef={tagWrapperRef}
      />
    ) : (
      <TagUsersDropdown
        users={data || []}
        isLoading={isLoading}
        isError={isError}
        onSelectUsers={handleSelectUsers}
        onClose={() => setShowTagDropdown!(false)}
        anchorRef={tagWrapperRef}
      />
    ));

  // Shared share button JSX
  const shareButton = shouldShowShareButton && (
    <div ref={tagWrapperRef} className="relative">
      <button
        className={`hover:cursor-pointer ${
          mode === "vendors" && isRFQDisabled
            ? "text-gray-400 cursor-not-allowed"
            : "text-gray-700"
        }`}
        onClick={isRFQDisabled ? undefined : handleTagClick}
        title={shareButtonTooltip}
        disabled={isRFQDisabled}
      >
        {isCopying ? <LoadingDots /> : TagIcon}
      </button>

      {tagDropdown}
    </div>
  );

  // Detail variant
  if (variant === "detail") {
    return (
      <div className="flex space-x-4">
        {onDownloadPDF && (
          <button
            className="hover:cursor-pointer text-green-600"
            onClick={(e) => {
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

  // Default list variant
  return (
    <div className="flex space-x-4">
      {shouldShowInspectButton && (
        <span
          className="hover:cursor-pointer"
          onClick={() => onToggleView(requestId)}
        >
          {visibleItems[requestId] ? hideIcon : viewIcon}
        </span>
      )}

      {isEditable && (
        <div className="flex space-x-4">
          {onEdit && (
            <button
              className="hover:cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(request);
              }}
            >
              {editIcon}
            </button>
          )}

          {onDelete && isDeletable && (
            <button
              className="text-red-600 hover:text-red-900 hover:cursor-pointer"
              onClick={(e) => {
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
            onClick={(e) => {
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
            onClick={(e) => {
              e.stopPropagation();
              onDownloadPDF();
            }}
            title="Download PDF"
          >
            {downloadIcon}
          </button>
        )}

        {shareButton}

        {/* Disabled state for RFQs that can't be shared */}
        {mode === "vendors" && isRFQDisabled && (
          <span
            className={`text-xl font-extrabold h-${iconSize} w-${iconSize} text-gray-400 cursor-not-allowed`}
            title={shareButtonTooltip}
          >
            <Users className={`h-${iconSize} w-${iconSize} text-gray-400`} />
          </span>
        )}

        {/* Permission denied state */}
        {mode === "vendors" && !canShareRequest && (
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
