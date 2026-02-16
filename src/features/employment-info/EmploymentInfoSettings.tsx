// src/features/employment-info/EmploymentInfoSettings.tsx
import {
  useGlobalSettings,
  useToggleGlobalUpdate,
} from "./Hooks/useEmploymentInfo";
import Spinner from "../../ui/Spinner";
import NetworkErrorUI from "../../ui/NetworkErrorUI";
import { ToggleSwitch } from "../../ui/ToggleSwitch";
import { AlertCircle } from "lucide-react";

import { formatToDDMMYYYY } from "../../utils/formatToDDMMYYYY";
import { localStorageUser } from "../../utils/localStorageUser";
import Swal from "sweetalert2";

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

  const isLoading = isLoadingSettings;
  const isError = settingsError;

  const handleGlobalToggle = (checked: boolean) => {
    Swal.fire({
      title: `Are you sure?`,
      text: `This will ${
        checked ? "enable" : "disable"
      } employment information updates for ALL users.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#1373B0",
      cancelButtonColor: "#DC3340",
      confirmButtonText: "Yes, proceed",
    }).then((result) => {
      if (result.isConfirmed) {
        // When toggle is ON (checked=true), we want globalLock=false (enabled)
        // When toggle is OFF (checked=false), we want globalLock=true (disabled)
        toggleGlobalUpdate(checked, {
          onSuccess: () => {
            refetchSettings();
          },
        });
      }
    });
  };

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

  // globalEmploymentInfoLock = true means updates are DISABLED globally
  // So toggle should be ON (checked=true) when globalLock is false (enabled)
  const isGloballyEnabled = !settingsData?.data?.globalEmploymentInfoLock;
  const lastUpdatedBy = settingsData?.data?.lastUpdatedBy;
  const lastUpdatedAt = settingsData?.data?.lastUpdatedAt;

  return (
    <div className="border border-gray-300 p-6 space-y-6 shadow-md">
      {/* Header */}
      <div>
        <h1 className="text-lg font-semibold text-gray-900">
          Employment Information Settings
        </h1>
        <p className="text-gray-600 mt-1">
          Control who can update their employment information
        </p>
      </div>

      {/* Global Settings Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Global Settings</h2>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-base font-medium text-gray-900">
                Employment Info Updates
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                When enabled, users can update their employment information.
                When disabled, no one can make updates regardless of individual
                settings.
              </p>
              {lastUpdatedBy && lastUpdatedAt && (
                <p className="text-xs text-gray-500 mt-2">
                  Last updated by: {lastUpdatedBy} on{" "}
                  {formatToDDMMYYYY(lastUpdatedAt)}
                </p>
              )}
            </div>
            <div className="ml-4">
              <ToggleSwitch
                checked={isGloballyEnabled}
                onChange={handleGlobalToggle}
                disabled={
                  isTogglingGlobal || currentUser?.role !== "SUPER-ADMIN"
                }
                size="md"
              />
            </div>
          </div>

          {currentUser?.role !== "SUPER-ADMIN" && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800 flex items-center">
                <AlertCircle className="h-4 w-4 mr-2" />
                Only SUPER-ADMIN can modify global settings
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmploymentInfoSettings;
