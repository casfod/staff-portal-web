// hooks/useRequestPermissions.ts
import { useMemo } from 'react';
import {
  // getUserId,
  isAdmin as checkIsAdmin,
  isCreator as checkIsCreator,
  isReviewer as checkIsReviewer,
  isApprover as checkIsApprover,
  isCopiedTo as checkIsCopiedTo,
  isFinanceReviewer as checkIsFinanceReviewer,
  isProcurementReviewer as checkIsProcurementReviewer,
} from '../utils/userHelpers';
import { IUser, WorkflowStatus } from '../interfaces';

interface UseRequestPermissionsProps {
  request:
    | {
        createdBy?: Partial<IUser> | string | null;
        reviewedBy?: Partial<IUser> | string | null;
        approvedBy?: Partial<IUser> | string | null;
        status?: WorkflowStatus | string;
        copiedTo?: (Partial<IUser> | string)[];
        financeReviewBy?: Partial<IUser> | string | null;
        procurementReviewBy?: Partial<IUser> | string | null;
        financeReviewStatus?: 'pending' | 'approved' | 'rejected';
        procurementReviewStatus?: 'pending' | 'approved' | 'rejected';
      }
    | null
    | undefined;
  currentUser: IUser | null;
  isTwoStep?: boolean;
}

export const useRequestPermissions = ({
  request,
  currentUser,
  isTwoStep = false,
}: UseRequestPermissionsProps) => {
  const currentUserId = currentUser?.id;
  const userRole = currentUser?.role || 'STAFF';

  return useMemo(() => {
    if (!request || !currentUser) {
      return {
        isCreator: false,
        isReviewer: false,
        isApprover: false,
        isAdmin: false,
        isCopiedTo: false,
        isFinanceReviewer: false,
        isProcurementReviewer: false,
        canEdit: false,
        canDelete: false,
        canShare: false,
        canUploadFiles: false,
        canAddComments: false,
        canUpdateStatus: false,
        canApprove: false,
        showAdminApproval: false,
        // ✅ Add missing properties
        canReviewFinance: false,
        canReviewProcurement: false,
      };
    }

    const isCreator = checkIsCreator(request, currentUserId);
    const isReviewer = checkIsReviewer(request, currentUserId);
    const isApprover = checkIsApprover(request, currentUserId);
    const isAdmin = checkIsAdmin(currentUser);
    const isCopiedTo = checkIsCopiedTo(request, currentUserId);
    const isFinanceReviewer = isTwoStep ? checkIsFinanceReviewer(request, currentUserId) : false;
    const isProcurementReviewer = isTwoStep
      ? checkIsProcurementReviewer(request, currentUserId)
      : false;

    const requestStatus = request.status || 'draft';
    const isPending = requestStatus === 'pending';
    const isReviewed = requestStatus === 'reviewed';
    const isApproved = requestStatus === 'approved';
    const isRejected = requestStatus === 'rejected';
    const isDraft = requestStatus === 'draft';

    // Edit permissions
    const canEdit = (isDraft || isRejected) && isCreator;
    const canDelete = canEdit || isAdmin;

    // Share permissions
    const canShare = isCreator || isAdmin || userRole === 'REVIEWER';

    // File upload permissions
    const canUploadFiles = isCreator && isApproved;

    // Comment permissions
    const canAddComments =
      isCreator ||
      isReviewer ||
      isApprover ||
      isCopiedTo ||
      isAdmin ||
      (userRole === 'REVIEWER' && isPending);

    // Status update permissions
    let canUpdateStatus = false;
    let canApprove = false;
    let showAdminApproval = false;
    let canReviewFinance = false;
    let canReviewProcurement = false;

    if (isTwoStep) {
      const financeReviewStatus = request.financeReviewStatus || 'pending';
      const procurementReviewStatus = request.procurementReviewStatus || 'pending';

      // ✅ Set canReviewFinance and canReviewProcurement
      canReviewFinance = isFinanceReviewer && isPending && financeReviewStatus === 'pending';
      canReviewProcurement =
        isProcurementReviewer && isPending && procurementReviewStatus === 'pending';

      canUpdateStatus = canReviewFinance || canReviewProcurement || (isApprover && isReviewed) || (isApprover && isPending);

      canApprove =
        isApprover &&
        isReviewed &&
        financeReviewStatus === 'approved' &&
        procurementReviewStatus === 'approved';

      showAdminApproval =
        !request.approvedBy &&
        isReviewed &&
        financeReviewStatus === 'approved' &&
        procurementReviewStatus === 'approved' &&
        (isCreator || isApprover);
    } else {
      // For non-two-step requests (AdvanceRequest)
      canUpdateStatus =
        !isCreator && ((isReviewer && isPending) || (isAdmin && isReviewed && isApprover));

      showAdminApproval =
        !request.approvedBy &&
        isReviewed &&
        (isCreator || (isReviewer && !request.reviewedBy) || (isApprover && !request.approvedBy));
    }

    // Additional fix: For AdvanceRequest with pending status, reviewer should see status update
    if (!isTwoStep && isReviewer && isPending && !isCreator) {
      canUpdateStatus = true;
    }

    const result = {
      isCreator,
      isReviewer,
      isApprover,
      isAdmin,
      isCopiedTo,
      isFinanceReviewer,
      isProcurementReviewer,
      canEdit,
      canDelete,
      canShare,
      canUploadFiles,
      canAddComments,
      canUpdateStatus,
      canApprove,
      showAdminApproval,
      // ✅ Include these in the result
      canReviewFinance,
      canReviewProcurement,
    };

    // console.log('✅ Permission Result:', result);

    return result;
  }, [request, currentUser, currentUserId, userRole, isTwoStep]);
};
