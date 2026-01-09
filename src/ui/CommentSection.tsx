import { useState } from "react";
import { localStorageUser } from "../utils/localStorageUser";
import { formatToDDMMYYYY } from "../utils/formatToDDMMYYYY";
import Button from "./Button";
import SpinnerMini from "./SpinnerMini";
import { Comment } from "../interfaces";
import Swal from "sweetalert2";

interface CommentSectionProps {
  documentId?: string;
  comments: Comment[] | any[];
  canComment: boolean;
  onAddComment: (text: string) => Promise<void>;
  onUpdateComment: (commentId: string, text: string) => Promise<void>;
  onDeleteComment: (commentId: string) => Promise<void>;
  isLoading?: boolean;
  isUpdating?: boolean;
  isDeleting?: boolean;
}

const CommentSection = ({
  comments,
  canComment,
  onAddComment,
  onUpdateComment,
  onDeleteComment,
  isLoading = false,
  isUpdating = false,
  isDeleting = false,
}: CommentSectionProps) => {
  const currentUser = localStorageUser();
  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleAddComment = async () => {
    if (newComment.trim() === "") return;

    setIsAdding(true);
    try {
      await onAddComment(newComment);
      setNewComment("");
    } catch (error) {
      console.error("Failed to add comment:", error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleStartEdit = (comment: any) => {
    setEditingCommentId(comment._id || comment.id);
    setEditingText(comment.text);
  };

  const handleUpdateComment = async () => {
    if (!editingCommentId || editingText.trim() === "") return;

    try {
      await onUpdateComment(editingCommentId, editingText);
      setEditingCommentId(null);
      setEditingText("");
    } catch (error) {
      console.error("Failed to update comment:", error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      reverseButtons: true,
      customClass: {
        confirmButton: "mr-2",
        cancelButton: "ml-2",
      },
    });

    if (result.isConfirmed) {
      try {
        await onDeleteComment(commentId);

        // Show success message
        Swal.fire({
          title: "Deleted!",
          text: "Comment has been deleted.",
          icon: "success",
          confirmButtonColor: "#3085d6",
          confirmButtonText: "OK",
          timer: 2000,
          timerProgressBar: true,
        });
      } catch (error) {
        console.error("Failed to delete comment:", error);

        // Show error message
        Swal.fire({
          title: "Error!",
          text: "Failed to delete comment. Please try again.",
          icon: "error",
          confirmButtonColor: "#3085d6",
          confirmButtonText: "OK",
        });
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditingText("");
  };

  // Filter out deleted comments if they exist and handle both old and new comment formats
  const visibleComments = (comments || []).filter((comment: any) => {
    // Check for new comment format with deleted field
    if (comment.deleted !== undefined) {
      return !comment.deleted;
    }
    // For old comment format, show all comments
    return true;
  });

  // Helper function to get comment ID
  const getCommentId = (comment: any) => {
    return comment._id || comment.id;
  };

  // Helper function to check if comment is editable (user is owner)
  const isCommentOwner = (comment: any) => {
    const commentUserId = comment.user?.id || comment.user?._id;
    return currentUser.id === commentUserId;
  };

  // Helper function to get user display name
  const getUserDisplayName = (comment: any) => {
    if (comment.user?.first_name && comment.user?.last_name) {
      return `${comment.user.role}: ${comment.user.first_name} ${comment.user.last_name}`;
    }
    return "Unknown User";
  };

  // Helper function to get creation date
  const getCreationDate = (comment: any) => {
    return comment.createdAt || comment.created_at || new Date().toISOString();
  };

  // Helper function to check if comment was edited
  const isEdited = (comment: any) => {
    return comment.edited || false;
  };

  return (
    <div className="mt-6 border-t pt-6">
      <h3 className="text-lg font-semibold mb-4">Comments</h3>

      {/* Add comment section */}
      {canComment && (
        <div className="mb-6">
          <textarea
            className="w-full p-3 border rounded-lg mb-2 min-h-[100px] text-sm"
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            disabled={isAdding || isLoading}
          />
          <div className="flex justify-end">
            <Button
              onClick={handleAddComment}
              disabled={isAdding || isLoading || newComment.trim() === ""}
              size="small"
            >
              {isAdding ? <SpinnerMini /> : "Add Comment"}
            </Button>
          </div>
        </div>
      )}

      {/* Comments list */}
      <div className="space-y-4">
        {visibleComments.map((comment) => {
          const commentId = getCommentId(comment);
          const isOwner = isCommentOwner(comment);
          const displayName = getUserDisplayName(comment);
          const createdDate = getCreationDate(comment);
          const edited = isEdited(comment);

          return (
            <div key={commentId} className="border rounded-lg p-4 bg-gray-50">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="font-semibold text-sm">{displayName}</span>
                  <span className="text-xs text-gray-500 ml-2">
                    {formatToDDMMYYYY(createdDate)}
                  </span>
                  {edited && (
                    <span className="text-xs text-gray-500 ml-2">(edited)</span>
                  )}
                </div>

                {isOwner && (
                  <div className="flex space-x-2">
                    {editingCommentId === commentId ? (
                      <>
                        <button
                          onClick={handleUpdateComment}
                          disabled={isUpdating}
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          {isUpdating ? <SpinnerMini /> : "Save"}
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="text-xs text-gray-600 hover:text-gray-800"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleStartEdit(comment)}
                          className="text-xs text-blue-600 hover:text-blue-800"
                          disabled={isDeleting}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteComment(commentId)}
                          disabled={isDeleting}
                          className="text-xs text-red-600 hover:text-red-800"
                        >
                          {isDeleting ? <SpinnerMini /> : "Delete"}
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>

              {editingCommentId === commentId ? (
                <textarea
                  className="w-full p-2 border rounded text-sm"
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  rows={3}
                />
              ) : (
                <p className="text-gray-700 text-sm break-words">
                  {comment.text}
                </p>
              )}
            </div>
          );
        })}

        {visibleComments.length === 0 && (
          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
            <svg
              className="w-12 h-12 mx-auto text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
            <p className="text-gray-500 mt-2 text-sm">No comments yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentSection;
