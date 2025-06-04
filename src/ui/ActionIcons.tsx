import { HiMiniEye, HiMiniEyeSlash } from "react-icons/hi2";
import { Download, Edit, Trash2, UserPlus } from "lucide-react";
import LoadingDots from "./LoadingDots";
import { useDebounce } from "use-debounce";
import { useState } from "react";
import { useCopy } from "../features/advance-request/Hooks/useCopy";
import { useUsers } from "../features/user/Hooks/useUsers";
import TagUsersDropdown from "./TagUsersDropdown";

interface ActionIconsProps {
  isCreator?: boolean;
  isEditable?: boolean;
  isGeneratingPDF?: boolean;
  requestId?: string;
  visibleItems?: Record<string, boolean>;
  onToggleView?: (requestId: string) => void;
  onEdit?: (request: any) => void;
  onDelete?: (requestId: string) => void;
  onDownloadPDF?: () => void;
  showTagDropdown?: boolean;
  setShowTagDropdown?: (isOpen: boolean) => void;
  request?: any;
  iconSize?: number | string;
  editIcon?: React.ReactNode;
  deleteIcon?: React.ReactNode;
  viewIcon?: React.ReactNode;
  hideIcon?: React.ReactNode;
  downloadIcon?: React.ReactNode;
  TagIcon?: React.ReactNode;
}

const ActionIcons = ({
  isCreator,
  isEditable,
  isGeneratingPDF,
  requestId = "",
  visibleItems = {},
  onToggleView,
  onEdit,
  onDelete,
  onDownloadPDF,
  showTagDropdown,
  setShowTagDropdown,
  request,
  iconSize = 5,
  editIcon = <Edit className={`h-${iconSize} w-${iconSize}`} />,
  deleteIcon = <Trash2 className={`h-${iconSize} w-${iconSize}`} />,
  viewIcon = <HiMiniEye className={`h-${iconSize} w-${iconSize}`} />,
  hideIcon = <HiMiniEyeSlash className={`h-${iconSize} w-${iconSize}`} />,
  TagIcon = <UserPlus className={`h-${iconSize} w-${iconSize}`} />,
  downloadIcon = isGeneratingPDF ? (
    <LoadingDots />
  ) : (
    <Download className={`h-${iconSize} w-${iconSize}`} />
  ),
}: ActionIconsProps) => {
  // const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm] = useDebounce(searchTerm, 600);

  const { copyto, isPending } = useCopy(requestId!);

  // Users query
  const {
    data: usersData,
    isLoading,
    isError,
  } = useUsers(
    debouncedSearchTerm,
    "", // sort (empty string if not needed)
    1, // page
    10 // limit
  );

  const handleTagClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowTagDropdown!(!showTagDropdown);
    setSearchTerm(""); // Reset search on open
  };

  const handleSelectUsers = async (userIds: string[]) => {
    console.log("userIds:===>", userIds);

    if (!requestId || userIds.length < 1) return;

    copyto({ userIds });
  };

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

          {onDelete && (
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
        {onDownloadPDF && (
          <button
            className="hidden lg:block hover:cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              onDownloadPDF();
            }}
          >
            {downloadIcon}
          </button>
        )}
        {isCreator && setShowTagDropdown && (
          <div className="relative">
            <button className="hover:cursor-pointer" onClick={handleTagClick}>
              {isPending ? <LoadingDots /> : TagIcon}
            </button>

            {showTagDropdown && (
              <TagUsersDropdown
                users={usersData?.data?.users || []}
                isLoading={isLoading}
                isError={isError}
                onSelectUsers={handleSelectUsers}
                onClose={() => setShowTagDropdown!(false)}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActionIcons;
