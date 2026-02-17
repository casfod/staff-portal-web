// src/features/employment-info/EmploymentInfoSettings.tsx
import {
  useGlobalSettings,
  useToggleGlobalUpdate,
} from "./Hooks/useEmploymentInfo";
import Spinner from "../../ui/Spinner";
import NetworkErrorUI from "../../ui/NetworkErrorUI";
import { ToggleSwitch } from "../../ui/ToggleSwitch";
import { AlertCircle, Info, Globe, Users } from "lucide-react";
import { formatToDDMMYYYY } from "../../utils/formatToDDMMYYYY";
import { localStorageUser } from "../../utils/localStorageUser";
import Swal from "sweetalert2";
import { useCallback } from "react";

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
  const { toggleGlobalUpdate, isPending: isTogglingGlobal } =
    useToggleGlobalUpdate();

  console.log(settingsData);

  const isLoading = isLoadingSettings;
  const isError = settingsError;

  // DIRECT STATE FROM SERVER
  // true  = LOCKED (no updates)
  // false = UNLOCKED (unlocked users can update)
  const isGloballyLocked = settingsData?.data?.globalEmploymentInfoLock ?? true;

  const lastUpdatedAt = settingsData?.data?.lastUpdatedAt;
  const canModifySettings = currentUser?.role === "SUPER-ADMIN";

  const handleGlobalToggle = useCallback(() => {
    const newLockedState = !isGloballyLocked;
    const action = newLockedState ? "LOCK" : "UNLOCK";
    const actionEmoji = newLockedState ? "🔒" : "🔓";

    Swal.fire({
      title: `${actionEmoji} ${action} globally?`,
      html: `
        <div class="text-left">
          <p class="mb-3">${actionEmoji} <span class="font-bold">${action}</span> employment info updates for all users?</p>
          <div class="bg-blue-50 p-2 text-xs rounded">
            • Individual locks always override<br>
            • Unlocked users ${newLockedState ? "cannot" : "can"} update
          </div>
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#1373B0",
      cancelButtonColor: "#DC3340",
      confirmButtonText: `Yes, ${action}`,
    }).then((result) => {
      if (result.isConfirmed) {
        // API: enabled=true = UNLOCK, enabled=false = LOCK
        toggleGlobalUpdate(!newLockedState, {
          onSuccess: () => {
            refetchSettings();
            Swal.fire({
              title: "Success!",
              text: `Globally ${newLockedState ? "locked" : "unlocked"}`,
              icon: "success",
              timer: 1500,
              showConfirmButton: false,
            });
          },
        });
      }
    });
  }, [isGloballyLocked, toggleGlobalUpdate, refetchSettings]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner />
      </div>
    );
  }

  if (isError) {
    return <NetworkErrorUI />;
  }

  return (
    <div className="border border-gray-300 p-4 sm:p-6 space-y-4 sm:space-y-6 shadow-md">
      {/* Header */}
      <div>
        <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
          Employment Info Settings
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Control who can update employment info
        </p>
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
                    isGloballyLocked
                      ? "bg-red-100 text-red-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {isGloballyLocked ? "🔒 LOCKED" : "🔓 UNLOCKED"}
                </span>
                {lastUpdatedAt && (
                  <span className="text-xs text-gray-500">
                    Updated: {formatToDDMMYYYY(lastUpdatedAt)}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600">
                {isGloballyLocked
                  ? "❌ No updates allowed (all users locked)"
                  : "✅ Unlocked users can update"}
              </p>
            </div>

            <ToggleSwitch
              checked={isGloballyLocked}
              onChange={handleGlobalToggle}
              disabled={!canModifySettings || isTogglingGlobal}
              size="md"
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
              <p className="font-semibold flex items-center gap-1">
                🔒 Global LOCKED
              </p>
              <p className="text-gray-600 mt-1">All users → Cannot update</p>
            </div>
            <div className="border rounded p-2 bg-green-50">
              <p className="font-semibold flex items-center gap-1">
                🔓 Global UNLOCKED
              </p>
              <p className="text-gray-600 mt-1">Unlocked users → Can update</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3 text-center">
            🔒 Locked users cannot update regardless of global
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmploymentInfoSettings;
