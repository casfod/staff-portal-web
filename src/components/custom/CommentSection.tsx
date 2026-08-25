// CommentSection.tsx - Rewritten with Radix UI
import { useState } from 'react';
import { localStorageUser } from '../../utils/localStorageUser';
import { formatToDDMMYYYY } from '../../utils/formatToDDMMYYYY';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { IComment } from '../../interfaces';
import { Loader2 } from 'lucide-react';

interface CommentSectionProps {
  documentId?: string;
  comments: IComment[];
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
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // ✅ Local loading states for individual operations
  const [updatingCommentId, setUpdatingCommentId] = useState<string | null>(null);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);

  const handleAddComment = async () => {
    if (newComment.trim() === '') return;

    setIsAdding(true);
    try {
      await onAddComment(newComment);
      setNewComment('');
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleStartEdit = (comment: IComment) => {
    setEditingCommentId(comment.id);
    setEditingText(comment.text);
  };

  const handleUpdateComment = async () => {
    if (!editingCommentId || editingText.trim() === '') return;

    // ✅ Set local loading state for this specific comment
    setUpdatingCommentId(editingCommentId);

    try {
      await onUpdateComment(editingCommentId, editingText);
      setEditingCommentId(null);
      setEditingText('');
    } catch (error) {
      console.error('Failed to update comment:', error);
    } finally {
      setUpdatingCommentId(null);
    }
  };

  const handleDeleteComment = async () => {
    if (!deleteTargetId) return;

    // ✅ Set local loading state for this specific comment
    setDeletingCommentId(deleteTargetId);

    try {
      await onDeleteComment(deleteTargetId);
      setDeleteTargetId(null);
    } catch (error) {
      console.error('Failed to delete comment:', error);
    } finally {
      setDeletingCommentId(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditingText('');
  };

  // Filter out deleted comments
  const visibleComments = (comments || []).filter((comment: IComment) => {
    if (comment.deleted !== undefined) {
      return !comment.deleted;
    }
    return true;
  });

  const getCommentId = (comment: IComment) => comment.id;

  const isCommentOwner = (comment: IComment) => {
    const commentUserId = comment.user?.id;
    return currentUser.id === commentUserId;
  };

  const getUserDisplayName = (comment: IComment) => {
    if (comment.user?.firstName && comment.user?.lastName) {
      return `${comment.user.role}: ${comment.user.firstName} ${comment.user.lastName}`;
    }
    return 'Unknown User';
  };

  const getCreationDate = (comment: IComment) => {
    return comment.createdAt || new Date().toISOString();
  };

  const isEdited = (comment: IComment) => {
    return comment.edited || false;
  };

  const SpinnerMini = () => <Loader2 className="h-4 w-4 animate-spin" />;

  return (
    <div className="mt-6 border-t pt-6">
      <h3 className="text-lg font-semibold mb-4">Comments</h3>

      {/* Add comment section */}
      {canComment && (
        <div className="mb-6">
          <textarea
            className="w-full p-3 border rounded-lg mb-2 min-h-[100px] text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            placeholder="Add a comment..."
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            disabled={isAdding || isLoading}
          />
          <div className="flex justify-end">
            <Button
              onClick={handleAddComment}
              disabled={isAdding || isLoading || newComment.trim() === ''}
              size="sm"
            >
              {isAdding ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Comment'
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Comments list */}
      <div className="space-y-4">
        {visibleComments.map((comment, index) => {
          const commentId = getCommentId(comment);
          const isOwner = isCommentOwner(comment);
          const displayName = getUserDisplayName(comment);
          const createdDate = getCreationDate(comment);
          const edited = isEdited(comment);
          const key = commentId ?? `temp-comment-${index}`;

          // ✅ Check if this specific comment is being updated or deleted
          const isThisCommentUpdating = updatingCommentId === commentId;
          const isThisCommentDeleting = deletingCommentId === commentId;
          const isThisCommentEditing = editingCommentId === commentId;

          return (
            <div key={key} className="border rounded-lg p-4 bg-gray-50">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="font-semibold text-sm">{displayName}</span>
                  <span className="text-xs text-gray-500 ml-2">
                    {formatToDDMMYYYY(createdDate)}
                  </span>
                  {edited && <span className="text-xs text-gray-500 ml-2">(edited)</span>}
                </div>

                
                {isOwner && !isThisCommentDeleting && (
                  <div className="flex space-x-2">
                    {isThisCommentEditing ? (
                      <>
                        <button
                          onClick={handleUpdateComment}
                          disabled={isThisCommentUpdating || isUpdating}
                          className="text-xs text-blue-600 hover:text-blue-800 disabled:opacity-50"
                        >
                          {isThisCommentUpdating ? <SpinnerMini /> : 'Save'}
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          disabled={isThisCommentUpdating}
                          className="text-xs text-gray-600 hover:text-gray-800 disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleStartEdit(comment)}
                          className="text-xs text-blue-600 hover:text-blue-800"
                          disabled={isDeleting || !!deletingCommentId}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteTargetId(commentId)}
                          disabled={isDeleting || !!deletingCommentId}
                          className="text-xs text-red-600 hover:text-red-800 disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                )}
                {/* Show loading state for deletion */}
                {isOwner && isThisCommentDeleting && (
                  <div className="flex items-center space-x-2">
                    <SpinnerMini />
                    <span className="text-xs text-gray-500">Deleting...</span>
                  </div>
                )}
              </div>

              {isThisCommentEditing ? (
                <textarea
                  className="w-full p-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  value={editingText}
                  onChange={e => setEditingText(e.target.value)}
                  rows={3}
                  disabled={isThisCommentUpdating}
                />
              ) : (
                <p className="text-gray-700 text-sm break-words">{comment.text}</p>
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteTargetId} onOpenChange={() => setDeleteTargetId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              You won't be able to revert this comment deletion.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteComment}
              className="bg-red-600 hover:bg-red-700 disabled:opacity-50"
              disabled={!!deletingCommentId}
            >
              {deletingCommentId ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Deleting...
                              </>
                            ) : (
                              'Delete'
                            )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CommentSection;
