// Update the existing ActionIcons component to support vendors
import { HiMiniEye, HiMiniEyeSlash } from "react-icons/hi2";
import { Download, Edit, Trash2, Users } from "lucide-react";
import LoadingDots from "./LoadingDots";
import { useDebounce } from "use-debounce";
import { useState } from "react";
import { useUsers } from "../features/user/Hooks/useUsers";
import { useVendors } from "../features/Vendor/Hooks/useVendor";
import TagVendorsDropdown from "./TagVendorsDropdown";
import TagUsersDropdown from "./TagUsersDropdown";

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
  mode?: "users" | "vendors"; // New prop to specify dropdown mode
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
  TagIcon = <Users className={`h-${iconSize} w-${iconSize}`} />, // Changed to Users icon for vendors
  downloadIcon = isGeneratingPDF ? (
    <LoadingDots />
  ) : (
    <Download className={`h-${iconSize} w-${iconSize}`} />
  ),
  previewIcon = <HiMiniEye className={`h-${iconSize} w-${iconSize}`} />,
  mode = "users", // Default to vendors for RFQ
}: ActionIconsProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm] = useDebounce(searchTerm, 600);

  // Users query (for user sharing)
  const {
    data: usersData,
    isLoading: usersLoading,
    isError: usersError,
  } = useUsers(debouncedSearchTerm, "", 1, 9999);

  // Vendors query (for vendor sharing)
  const {
    data: vendorsData,
    isLoading: vendorsLoading,
    isError: vendorsError,
  } = useVendors({ page: 1, limit: 1000, search: debouncedSearchTerm });

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

  return (
    <div className="flex space-x-4">
      {onToggleView && (
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
        {/* PDF Preview Button */}
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

        {/* PDF Download Button */}
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

        {/* Share with Vendors Button */}
        {setShowTagDropdown && (
          <div className="relative">
            {canShareRequest ? (
              <button
                className="hover:cursor-pointer text-purple-600"
                onClick={handleTagClick}
                title={`Share with ${mode}`}
              >
                {isCopying ? <LoadingDots /> : TagIcon}
              </button>
            ) : (
              <span
                className={`text-xl font-extrabold h-${iconSize} w-${iconSize} text-gray-400`}
              >
                --
              </span>
            )}

            {showTagDropdown &&
              (mode === "vendors" ? (
                <TagVendorsDropdown
                  vendors={data || []}
                  isLoading={isLoading}
                  isError={isError}
                  onSelectVendors={handleSelectVendors}
                  onClose={() => setShowTagDropdown!(false)}
                />
              ) : (
                <TagUsersDropdown
                  users={data || []}
                  isLoading={isLoading}
                  isError={isError}
                  onSelectUsers={handleSelectUsers}
                  onClose={() => setShowTagDropdown!(false)}
                />
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActionIcons;
