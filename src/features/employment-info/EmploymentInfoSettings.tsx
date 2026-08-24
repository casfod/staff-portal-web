// src/features/employment-info/EmploymentInfoSettings.tsx
import { useGlobalSettings, useToggleGlobalUpdate } from './Hooks/useEmploymentInfo';
import Spinner from '../../components/custom/Spinner';
import NetworkErrorUI from '../../components/custom/NetworkErrorUI';
import { Switch } from '../../components/ui/switch';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../components/ui/alert-dialog';
import { AlertCircle, Info, Globe, Users } from 'lucide-react';
import { formatToDDMMYYYY } from '../../utils/formatToDDMMYYYY';
import { localStorageUser } from '../../utils/localStorageUser';
import { useCallback, useState, useEffect } from 'react';

const EmploymentInfoSettings = () => {
  const currentUser = localStorageUser();

  // Queries
  const {
    data: settingsData,
    isLoading: isLoadingSettings,
    isError: settingsError,
    refetch: refetchSettings,
  } = useGlobalSettings();

  // Mutations
  const { toggleGlobalUpdate, isPending: isTogglingGlobal } = useToggleGlobalUpdate();

  // DIRECT STATE FROM SERVER
  // true  = LOCKED (no updates)
  // false = UNLOCKED (unlocked users can update)
  const isGloballyLocked = settingsData?.data?.globalEmploymentInfoLock ?? true;
  const lastUpdatedAt = settingsData?.data?.updatedAt;
  const canModifySettings = currentUser?.role === 'SUPER-ADMIN';

  // Dialog state
  const [showDialog, setShowDialog] = useState(false);
  const [pendingLockState, setPendingLockState] = useState<boolean>(false);

  // Track the toggle state locally
  const [localLockedState, setLocalLockedState] = useState<boolean | null>(null);

  // Sync local state with server state
  useEffect(() => {
    setLocalLockedState(isGloballyLocked);
  }, [isGloballyLocked]);

  // Handle switch click - opens dialog
  const handleSwitchChange = useCallback((checked: boolean) => {
    // checked is the new state from the switch
    // If checked is true, we want to LOCK
    // If checked is false, we want to UNLOCK
    setPendingLockState(checked);
    setShowDialog(true);
  }, []);

  // Handle confirm action
  const handleConfirm = useCallback(() => {
    const willBeLocked = pendingLockState;

    // Optimistically update local state
    setLocalLockedState(willBeLocked);

    // The backend assigns `enabled` straight into globalEmploymentInfoLock
    // (see employment-info.service.ts: `settings.globalEmploymentInfoLock =
    // enabled`). Despite the name, it is NOT "should updates be enabled" —
    // it IS the lock flag. Send it through unchanged; do not negate it.
    const enabled = willBeLocked;

    console.log('📤 Sending to API:', {
      willBeLocked,
      enabled,
      action: willBeLocked ? 'LOCK' : 'UNLOCK',
    });

    toggleGlobalUpdate(enabled, {
      onSuccess: () => {
        // Refetch to get the latest state from server
        refetchSettings();
        setShowDialog(false);

        // Success message is handled by the mutation's onSuccess
      },
      onError: error => {
        // Revert local state on error
        setLocalLockedState(isGloballyLocked);

        console.error('❌ Toggle failed:', error);
        // Error message is handled by the mutation's onError
      },
    });
  }, [pendingLockState, toggleGlobalUpdate, refetchSettings, isGloballyLocked]);

  const handleCancel = useCallback(() => {
    setShowDialog(false);
    // Reset to current state
    setLocalLockedState(isGloballyLocked);
  }, [isGloballyLocked]);

  if (isLoadingSettings) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner />
      </div>
    );
  }

  if (settingsError) {
    return <NetworkErrorUI />;
  }

  // Use local state if available, otherwise use server state
  const displayLockedState = localLockedState !== null ? localLockedState : isGloballyLocked;

  return (
    <div className="border border-gray-300 p-4 sm:p-6 space-y-4 sm:space-y-6 shadow-md">
      {/* Header */}
      <div>
        <h1 className="text-lg sm:text-xl font-semibold text-gray-900">Employment Info Settings</h1>
        <p className="text-sm text-gray-600 mt-1">Control who can update employment info</p>
      </div>

      {/* Quick Rule */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-xs text-blue-800 flex items-center gap-2">
          <Info className="h-4 w-4 flex-shrink-0" />
          <span>
            <strong>Rule:</strong> Individual locks always override global
          </span>
        </p>
      </div>

      {/* Global Settings Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-4 sm:px-6 py-3 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-gray-600" />
            <h2 className="font-medium text-gray-900">Global Control</h2>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span
                  className={`text-sm font-semibold px-2 py-1 rounded ${
                    displayLockedState ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                  }`}
                >
                  {displayLockedState ? '🔒 LOCKED' : '🔓 UNLOCKED'}
                </span>
                {lastUpdatedAt && (
                  <span className="text-xs text-gray-500">
                    Updated: {formatToDDMMYYYY(lastUpdatedAt)}
                  </span>
                )}
                {isTogglingGlobal && (
                  <span className="text-xs text-blue-600 animate-pulse">Updating...</span>
                )}
              </div>
              <p className="text-sm text-gray-600">
                {displayLockedState
                  ? '❌ No updates allowed (all users locked)'
                  : '✅ Unlocked users can update'}
              </p>
            </div>

            <Switch
              checked={displayLockedState}
              onCheckedChange={handleSwitchChange}
              disabled={!canModifySettings || isTogglingGlobal}
            />
          </div>

          {!canModifySettings && (
            <div className="mt-4 p-2 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-xs text-yellow-800 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                Only SUPER-ADMIN can change this
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Reference */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-4 sm:px-6 py-3 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-gray-600" />
            <h2 className="font-medium text-gray-900">Quick Reference</h2>
          </div>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="border rounded p-2 bg-red-50">
              <p className="font-semibold flex items-center gap-1">🔒 Global LOCKED</p>
              <p className="text-gray-600 mt-1">All users → Cannot update</p>
            </div>
            <div className="border rounded p-2 bg-green-50">
              <p className="font-semibold flex items-center gap-1">🔓 Global UNLOCKED</p>
              <p className="text-gray-600 mt-1">Unlocked users → Can update</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3 text-center">
            🔒 Locked users cannot update regardless of global
          </p>
        </div>
      </div>

      {/* Alert Dialog for confirmation */}
      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingLockState ? '🔒 Lock' : '🔓 Unlock'} globally?
            </AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-3">
                <p>
                  Are you sure you want to <strong>{pendingLockState ? 'lock' : 'unlock'}</strong>{' '}
                  employment info updates for all users?
                </p>
                <div className="bg-blue-50 p-3 rounded text-xs space-y-1">
                  <p>• Individual locks always override global</p>
                  <p>• Unlocked users {pendingLockState ? 'cannot' : 'can'} update</p>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancel}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>
              Yes, {pendingLockState ? 'Lock' : 'Unlock'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EmploymentInfoSettings;
