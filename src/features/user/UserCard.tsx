// UserCard.tsx - Fully Responsive with Enhanced Mobile Support & All Tabs
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { IUser } from '../../interfaces';
import Swal from 'sweetalert2';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { User, Shield, Briefcase, Loader2 } from 'lucide-react';
import { useUpdateUser, useActivateUser } from './Hooks/useUsers';
import { useToggleUserUpdate, useGlobalSettings } from '../employment-info/Hooks/useEmploymentInfo';
import NetworkErrorUI from '../../components/custom/NetworkErrorUI';
import { USER_POSITIONS, USER_ROLES } from '../../config/user.config';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { setViewTab, setEditTab, ViewTabType, EditTabType } from '../../store/userSubTabSlice';

// Import sub-components
import { UserHeader } from './UserHeader';
import { BasicInfoTab } from './BasicInfoTab';
import { PermissionSubTabs } from './PermissionSubTabs';
import { PermissionSection } from './PermissionSection';
import { EmploymentPermissionTab } from './EmploymentPermissionTab';
import { ActionButtons } from './ActionButtons';
import { EditedUser, PermissionItem, PermissionKey, PermissionRole } from './user-card.types';
import { updatePermission } from './user-card.types';

interface UserCardProps {
  user: IUser;
}

// Loading state component
const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-8">
    <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
    <span className="ml-3 text-sm text-gray-500">Loading user data...</span>
  </div>
);

const UserCard: React.FC<UserCardProps> = ({ user }) => {
  const dispatch = useDispatch();

  // Get tab state from Redux
  const viewTab = useSelector((state: RootState) => state.userSubTab.viewTab);
  const editTab = useSelector((state: RootState) => state.userSubTab.editTab);
  // Hooks
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [activeSubTab, setActiveSubTab] = useState('procurement');
  const [isSwalOpen, setIsSwalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const swalTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { UpdateUser, isPending: isUpdatingUser } = useUpdateUser(user.id);
  const { activateUser, isActivating } = useActivateUser();
  const { toggleUserUpdate, isPending: isTogglingPermission } = useToggleUserUpdate();
  const {
    data: settingsData,
    isLoading: isLoadingSettings,
    isError: settingsError,
  } = useGlobalSettings();

  const isPending = useMemo(
    () => isUpdatingUser || isTogglingPermission || isActivating,
    [isUpdatingUser, isTogglingPermission, isActivating]
  );

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Initial state - using isActive for activation status
  const [editedUser, setEditedUser] = useState<EditedUser>(() => ({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    position: user.position || '',
    procurementRole: {
      canCreate: user.procurementRole?.canCreate || false,
      canView: user.procurementRole?.canView || false,
      canUpdate: user.procurementRole?.canUpdate || false,
      canDelete: user.procurementRole?.canDelete || false,
    },
    financeRole: {
      canCreate: user.financeRole?.canCreate || false,
      canView: user.financeRole?.canView || false,
      canUpdate: user.financeRole?.canUpdate || false,
      canDelete: user.financeRole?.canDelete || false,
    },
    isDeleted: user.isDeleted || false, // Keep for compatibility
    isActive: user.isActive ?? true,
    isEmploymentInfoLocked: user.employmentInfo?.isEmploymentInfoLocked === true,
  }));

  // Cleanup timeout on unmount
  useEffect(() => {
    const timeoutId = swalTimeoutRef.current;
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  // Update state when user prop changes
  useEffect(() => {
    if (!isSwalOpen) {
      setEditedUser({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        position: user.position || '',
        procurementRole: {
          canCreate: user.procurementRole?.canCreate || false,
          canView: user.procurementRole?.canView || false,
          canUpdate: user.procurementRole?.canUpdate || false,
          canDelete: user.procurementRole?.canDelete || false,
        },
        financeRole: {
          canCreate: user.financeRole?.canCreate || false,
          canView: user.financeRole?.canView || false,
          canUpdate: user.financeRole?.canUpdate || false,
          canDelete: user.financeRole?.canDelete || false,
        },
        isDeleted: user.isDeleted || false,
        isActive: user.isActive ?? true,
        isEmploymentInfoLocked: user.employmentInfo?.isEmploymentInfoLocked === true,
      });
    }
  }, [user, isSwalOpen]);

  // Handlers
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedUser(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSelectChange = useCallback(
    (field: string) => (value: string) => {
      setEditedUser(prev => ({ ...prev, [field]: value }));
    },
    []
  );

  const handlePermissionToggle = useCallback(
    (roleType: PermissionRole, key: PermissionKey) => {
      if (!isEditing) return;
      setEditedUser(prev => updatePermission(prev, roleType, key));
    },
    [isEditing]
  );

  // Handle reactivation toggle - when checked, set isActive to true
  const handleReactivateToggle = useCallback((checked: boolean) => {
    setEditedUser(prev => ({
      ...prev,
      isActive: checked, // checked = true means reactivate
      isDeleted: !checked, // Keep in sync for compatibility
    }));
  }, []);

  const resetForm = useCallback(() => {
    setEditedUser({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      position: user.position || '',
      procurementRole: {
        canCreate: user.procurementRole?.canCreate || false,
        canView: user.procurementRole?.canView || false,
        canUpdate: user.procurementRole?.canUpdate || false,
        canDelete: user.procurementRole?.canDelete || false,
      },
      financeRole: {
        canCreate: user.financeRole?.canCreate || false,
        canView: user.financeRole?.canView || false,
        canUpdate: user.financeRole?.canUpdate || false,
        canDelete: user.financeRole?.canDelete || false,
      },
      isDeleted: user.isDeleted || false,
      isActive: user.isActive ?? true,
      isEmploymentInfoLocked: user.employmentInfo?.isEmploymentInfoLocked === true,
    });
  }, [user]);

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
    resetForm();
    dispatch(setEditTab('toggle'));
  }, [resetForm, dispatch]);

  const handleEmploymentInfoPermissionToggle = useCallback(() => {
    if (!isEditing) return;

    const willBeLocked = !editedUser.isEmploymentInfoLocked;
    const actionText = willBeLocked ? 'BLOCK' : 'ALLOW';

    setIsSwalOpen(true);
    Swal.fire({
      title: willBeLocked ? '🔒 Block Employment Updates' : '🔓 Allow Employment Updates',
      html: `
        <div class="text-left" style="font-size: 14px;">
          <p class="mb-3">Are you sure you want to <strong style="color: ${willBeLocked ? '#DC2626' : '#16A34A'};">${actionText}</strong> this user from updating their employment information?</p>
          <div style="background: #EFF6FF; padding: 12px; border-radius: 8px; font-size: 13px;">
            <p style="font-weight: 600; color: #1E40AF; margin-bottom: 6px;">ℹ️ How this works:</p>
            <ul style="color: #1E40AF; padding-left: 20px; margin: 0;">
              <li style="margin-bottom: 4px;">• Individual permissions ALWAYS take priority</li>
              <li>• ${willBeLocked ? 'User will NOT be able to update even if global is unlocked' : 'User WILL be able to update even if global is locked'}</li>
            </ul>
          </div>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: willBeLocked ? '#1378B0' : '#16A34A',
      cancelButtonColor: '#DC3340',
      confirmButtonText: `Yes, ${actionText}`,
      cancelButtonText: 'Cancel',
      backdrop: true,
      allowOutsideClick: false,
      buttonsStyling: true,
      customClass: {
        container: 'swal2-container',
        popup: 'swal2-popup',
        confirmButton: 'swal2-confirm',
        cancelButton: 'swal2-cancel',
      },
    }).then(result => {
      setIsSwalOpen(false);
      if (result.isConfirmed) {
        setEditedUser(prev => ({
          ...prev,
          isEmploymentInfoLocked: willBeLocked,
        }));

        toggleUserUpdate({ userId: user.id!, enabled: !willBeLocked });
      }
    });
  }, [isEditing, editedUser.isEmploymentInfoLocked, toggleUserUpdate, user.id]);

  const handleSaveChanges = useCallback(() => {
    setIsSwalOpen(true);

    // Check if this is a reactivation
    const isReactivation = !user.isActive && editedUser.isActive;

    Swal.fire({
      title: isReactivation ? '🔄 Reactivate Account?' : '💾 Save Changes?',
      html: isReactivation
        ? `
        <div style="text-align: left; font-size: 14px;">
          <p style="margin-bottom: 12px;">Are you sure you want to reactivate this user's account?</p>
          <div style="background: #EFF6FF; padding: 12px; border-radius: 8px; font-size: 13px;">
            <p style="font-weight: 600; color: #1E40AF; margin-bottom: 8px;">ℹ️ This will:</p>
            <ul style="padding-left: 20px; margin: 0; color: #1E40AF;">
              <li>• Restore access to the platform</li>
              <li>• Keep all existing permissions</li>
              <li>• Preserve employment information</li>
            </ul>
          </div>
        </div>
      `
        : `
        <div style="text-align: left; font-size: 14px;">
          <p style="margin-bottom: 12px;">Do you want to update this user's information?</p>
          <div style="background: #F3F4F6; padding: 12px; border-radius: 8px; font-size: 13px;">
            <p style="font-weight: 600; color: #374151; margin-bottom: 8px;">Changes to be applied:</p>
            <ul style="padding-left: 20px; margin: 0; color: #4B5563;">
              <li>• Role: <strong>${editedUser.role}</strong></li>
              <li>• Position: <strong>${editedUser.position || 'Not specified'}</strong></li>
              <li>• Permissions will be updated</li>
            </ul>
          </div>
        </div>
      `,
      icon: isReactivation ? 'info' : 'question',
      showCancelButton: true,
      confirmButtonColor: isReactivation ? '#16A34A' : '#1373B0',
      cancelButtonColor: '#6B7280',
      confirmButtonText: isReactivation ? 'Yes, reactivate!' : 'Yes, update it!',
      cancelButtonText: 'Cancel',
      backdrop: true,
      allowOutsideClick: false,
    }).then(result => {
      setIsSwalOpen(false);
      if (result.isConfirmed) {
        if (isReactivation) {
          // Use the dedicated activation function
          activateUser(user.id!, {
            onSuccess: () => {
              setIsEditing(false);
            },
          });
        } else {
          // Regular update - only send fields that exist in the backend
          const updateData: Partial<EditedUser> = {
            role: editedUser.role,
            position: editedUser.position,
            procurementRole: editedUser.procurementRole,
            financeRole: editedUser.financeRole,
            firstName: editedUser.firstName,
            lastName: editedUser.lastName,
            email: editedUser.email,
          };

          // Only include isActive if it changed
          if (editedUser.isActive !== user.isActive) {
            updateData.isActive = editedUser.isActive;
          }

          UpdateUser(updateData);
        }
      }
    });
  }, [UpdateUser, activateUser, editedUser, user.id, user.isActive]);

  const handleEdit = useCallback(() => {
    setIsEditing(true);
    dispatch(setEditTab('toggle'));
  }, [dispatch]);

  // Tab change handlers
  const handleViewTabChange = useCallback(
    (tab: ViewTabType) => {
      dispatch(setViewTab(tab));
    },
    [dispatch]
  );

  const handleEditTabChange = useCallback(
    (tab: EditTabType) => {
      dispatch(setEditTab(tab));
    },
    [dispatch]
  );

  const renderPermissionSection = useCallback(
    (title: string, permissions: readonly PermissionItem[], roleType: PermissionRole) => {
      return (
        <PermissionSection
          title={title}
          permissions={permissions}
          roleType={roleType}
          editedUser={editedUser}
          isEditing={isEditing}
          isMobile={isMobile}
          onPermissionToggle={handlePermissionToggle}
        />
      );
    },
    [isEditing, editedUser, handlePermissionToggle, isMobile]
  );

  const getRoleColor = useCallback((role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'manager':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  }, []);

  // Loading and error states
  if (isLoadingSettings) {
    return <LoadingSpinner />;
  }

  if (settingsError) {
    return <NetworkErrorUI />;
  }

  const globalLocked = settingsData?.data?.globalEmploymentInfoLock ?? false;
  const roleOptions = USER_ROLES.map(r => r.value);
  const positionOptions = Array.from(USER_POSITIONS);

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden w-full max-w-3xl mx-auto">
      <UserHeader
        user={user}
        isEditing={isEditing}
        isPending={isPending}
        editedUser={editedUser}
        onInputChange={handleInputChange}
        getRoleColor={getRoleColor}
      />

      {/* Tabs Section - Responsive */}
      <div className="px-3 sm:px-6 pt-3 sm:pt-4 pb-2">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="flex gap-2 sm:gap-0 sm:grid sm:grid-cols-3 h-9 sm:h-9 p-1 bg-gray-100 rounded-lg">
            <TabsTrigger
              value="basic"
              className="text-[11px] sm:text-xs font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md px-2 sm:px-3 py-1"
            >
              <User className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 sm:mr-1.5" />
              <span className="hidden sm:inline">Basic Info</span>
              <span className="sm:hidden">Info</span>
            </TabsTrigger>
            <TabsTrigger
              value="permissions"
              className="text-[11px] sm:text-xs font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md px-2 sm:px-3 py-1"
            >
              <Shield className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 sm:mr-1.5" />
              <span className="hidden sm:inline">Permissions</span>
              <span className="sm:hidden">Perms</span>
            </TabsTrigger>
            <TabsTrigger
              value="employment"
              className="text-[11px] sm:text-xs font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md px-2 sm:px-3 py-1"
            >
              <Briefcase className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 sm:mr-1.5" />
              <span className="hidden sm:inline">Employment</span>
              <span className="sm:hidden">Employ</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic">
            <BasicInfoTab
              isEditing={isEditing}
              isPending={isPending}
              editedUser={editedUser}
              user={user}
              roleOptions={roleOptions}
              positionOptions={positionOptions}
              onSelectChange={handleSelectChange}
              onCheckboxChange={handleReactivateToggle}
            />
          </TabsContent>

          <TabsContent value="permissions">
            <PermissionSubTabs
              activeSubTab={activeSubTab}
              setActiveSubTab={setActiveSubTab}
              renderPermissionSection={renderPermissionSection}
              editedUser={editedUser}
            />
          </TabsContent>

          <TabsContent value="employment">
            <EmploymentPermissionTab
              isEditing={isEditing}
              isPending={isPending}
              globalLocked={globalLocked}
              editedUser={editedUser}
              onToggle={handleEmploymentInfoPermissionToggle}
              originalUser={user}
              viewTab={viewTab}
              editTab={editTab}
              onViewTabChange={handleViewTabChange}
              onEditTabChange={handleEditTabChange}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Action Buttons */}
      <div className="px-4 sm:px-6 py-4 bg-gray-50 border-t border-gray-200">
        <ActionButtons
          isEditing={isEditing}
          isPending={isPending}
          onSave={handleSaveChanges}
          onCancel={handleCancelEdit}
          onEdit={handleEdit}
        />
      </div>

      {/* Add custom styles for SweetAlert2 - Responsive */}
      <style>{`
        .swal2-container {
          z-index: 9999 !important;
          pointer-events: auto !important;
        }
        .swal2-popup {
          pointer-events: auto !important;
          border-radius: 12px !important;
          padding: 20px !important;
          margin: 10px !important;
        }
        .swal2-confirm {
          border-radius: 8px !important;
          font-weight: 600 !important;
          padding: 10px 20px !important;
          font-size: 14px !important;
          min-height: 44px !important;
        }
        .swal2-cancel {
          border-radius: 8px !important;
          font-weight: 600 !important;
          padding: 10px 20px !important;
          font-size: 14px !important;
          min-height: 44px !important;
        }
        .swal2-title {
          font-size: 18px !important;
          font-weight: 700 !important;
        }
        .swal2-html-container {
          font-size: 13px !important;
        }
        .swal2-actions {
          flex-wrap: wrap !important;
          gap: 8px !important;
        }
        .swal2-actions .swal2-confirm,
        .swal2-actions .swal2-cancel {
          flex: 1 1 auto !important;
          min-width: 120px !important;
        }
        @media (max-width: 480px) {
          .swal2-popup {
            padding: 16px !important;
            margin: 8px !important;
            width: 95% !important;
          }
          .swal2-title {
            font-size: 16px !important;
          }
          .swal2-html-container {
            font-size: 12px !important;
          }
          .swal2-actions .swal2-confirm,
          .swal2-actions .swal2-cancel {
            font-size: 13px !important;
            padding: 8px 16px !important;
            min-width: 100px !important;
            min-height: 40px !important;
            width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
};

export default UserCard;
