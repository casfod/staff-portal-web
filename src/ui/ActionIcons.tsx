import { HiMiniEye, HiMiniEyeSlash } from "react-icons/hi2";
import { Edit, Trash2 } from "lucide-react";

interface ActionIconsProps {
  isEditable: boolean;
  requestId?: string;
  visibleItems?: Record<string, boolean>;
  onToggleView?: (requestId: string) => void;
  onEdit?: (request: any) => void;
  onDelete?: (requestId: string) => void;
  request?: any;
  iconSize?: number | string;
  editIcon?: React.ReactNode;
  deleteIcon?: React.ReactNode;
  viewIcon?: React.ReactNode;
  hideIcon?: React.ReactNode;
}

const ActionIcons = ({
  isEditable,
  requestId = "",
  visibleItems = {},
  onToggleView,
  onEdit,
  onDelete,
  request,
  iconSize = 5,
  editIcon = <Edit className={`h-${iconSize} w-${iconSize}`} />,
  deleteIcon = <Trash2 className={`h-${iconSize} w-${iconSize}`} />,
  viewIcon = <HiMiniEye className={`h-${iconSize} w-${iconSize}`} />,
  hideIcon = <HiMiniEyeSlash className={`h-${iconSize} w-${iconSize}`} />,
}: ActionIconsProps) => {
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
    </div>
  );
};

export default ActionIcons;
