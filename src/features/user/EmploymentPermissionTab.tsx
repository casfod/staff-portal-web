// EmploymentPermissionTab.tsx
import { Lock, Unlock, Info, Globe, Shield } from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { Switch } from '../../components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { cn } from '../../lib/utils';
import { IUser } from '../../interfaces';
import { EditedUser } from './user-card.types';
import { ViewTabType, EditTabType } from '../../store/userSubTabSlice';

interface EmploymentPermissionTabProps {
  isEditing: boolean;
  isPending: boolean;
  globalLocked: boolean;
  editedUser: EditedUser;
  onToggle: () => void;
  originalUser: IUser;
  // Tab state props from Redux
  viewTab: ViewTabType;
  editTab: EditTabType;
  onViewTabChange: (tab: ViewTabType) => void;
  onEditTabChange: (tab: EditTabType) => void;
}

export const EmploymentPermissionTab = ({
  isEditing,
  isPending,
  globalLocked,
  editedUser,
  onToggle,
  originalUser,
  viewTab,
  editTab,
  onViewTabChange,
  onEditTabChange,
}: EmploymentPermissionTabProps) => {
  const isLocked = editedUser.isEmploymentInfoLocked;
  const originalLocked = originalUser.employmentInfo?.isEmploymentInfoLocked === true;

  // Wrapper functions to handle string -> union type conversion
  const handleViewTabChange = (value: string) => {
    // Type guard to ensure value is a valid ViewTabType
    if (value === 'status' || value === 'details') {
      onViewTabChange(value);
    }
  };

  const handleEditTabChange = (value: string) => {
    // Type guard to ensure value is a valid EditTabType
    if (value === 'toggle' || value === 'info') {
      onEditTabChange(value);
    }
  };

  // View Mode (Non-editing)
  if (!isEditing) {
    return (
      <div className="space-y-3">
        <Tabs value={viewTab} onValueChange={handleViewTabChange} className="w-full">
          <TabsList className="grid grid-cols-2 h-10 p-1 bg-gray-100 rounded-lg">
            <TabsTrigger
              value="status"
              className="text-xs font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md px-3 py-1.5"
            >
              <div className="flex items-center gap-2">
                <Lock className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Status</span>
                <span className="sm:hidden">Status</span>
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="details"
              className="text-xs font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md px-3 py-1.5"
            >
              <div className="flex items-center gap-2">
                <Info className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Details</span>
                <span className="sm:hidden">Details</span>
              </div>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="status" className="mt-3">
            <div
              className={cn(
                'flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 rounded-xl border',
                originalLocked ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
              )}
            >
              <div
                className={cn(
                  'flex items-center justify-center w-10 h-10 rounded-full flex-shrink-0',
                  originalLocked ? 'bg-red-500' : 'bg-green-500'
                )}
              >
                {originalLocked ? (
                  <Lock className="h-5 w-5 text-white" />
                ) : (
                  <Unlock className="h-5 w-5 text-white" />
                )}
              </div>
              <div className="flex-1 w-full min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-gray-900">
                    {originalLocked ? 'Employment Info: DISABLED' : 'Employment Info: ENABLED'}
                  </span>
                  <Badge
                    variant={originalLocked ? 'destructive' : 'success'}
                    className="text-xs px-2 py-0.5 flex-shrink-0"
                  >
                    {originalLocked ? 'Locked' : 'Unlocked'}
                  </Badge>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {originalLocked
                    ? 'Individually locked - cannot update employment info'
                    : 'Individually unlocked - can update employment info'}
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="details" className="mt-3">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="flex items-center gap-1 text-xs px-2 py-1">
                <Globe className="h-3 w-3 flex-shrink-0" />
                <span className="hidden sm:inline">Global:</span>
                <span>{globalLocked ? 'Locked' : 'Unlocked'}</span>
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1 text-xs px-2 py-1">
                {originalLocked ? (
                  <Lock className="h-3 w-3 text-red-600 flex-shrink-0" />
                ) : (
                  <Unlock className="h-3 w-3 text-green-600 flex-shrink-0" />
                )}
                <span className="hidden sm:inline">User:</span>
                <span>{originalLocked ? 'Locked' : 'Unlocked'}</span>
              </Badge>
              <Badge
                variant="secondary"
                className="flex items-center gap-1 text-xs px-2 py-1 bg-blue-100 text-blue-800"
              >
                <Info className="h-3 w-3 flex-shrink-0" />
                <span className="hidden sm:inline">Priority</span>
                <span className="sm:hidden">Priority</span>
              </Badge>
            </div>

            <div className="mt-3 p-3 bg-blue-50 rounded-xl border border-blue-200">
              <div className="flex items-start gap-2.5">
                <Shield className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-blue-800 mb-1">
                    Individual Settings Override Global
                  </h4>
                  <p className="text-xs text-blue-600">
                    This user's individual permission takes priority over the global setting.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  // Edit Mode
  return (
    <div className="space-y-3">
      <Tabs value={editTab} onValueChange={handleEditTabChange} className="w-full">
        <TabsList className="grid grid-cols-2 h-10 p-1 bg-gray-100 rounded-lg">
          <TabsTrigger
            value="toggle"
            className="text-xs font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md px-3 py-1.5"
          >
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline">Toggle</span>
              <span className="sm:hidden">Toggle</span>
            </div>
          </TabsTrigger>
          <TabsTrigger
            value="info"
            className="text-xs font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md px-3 py-1.5"
          >
            <div className="flex items-center gap-2">
              <Info className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Info</span>
              <span className="sm:hidden">Info</span>
            </div>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="toggle" className="mt-3">
          <div
            className={cn(
              'flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl border-2 transition-all duration-200 gap-3 sm:gap-0',
              isLocked ? 'border-red-300 bg-red-50' : 'border-green-300 bg-green-50'
            )}
          >
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div
                className={cn(
                  'flex items-center justify-center w-10 h-10 rounded-full transition-colors flex-shrink-0',
                  isLocked ? 'bg-red-500' : 'bg-green-500'
                )}
              >
                {isLocked ? (
                  <Lock className="h-5 w-5 text-white" />
                ) : (
                  <Unlock className="h-5 w-5 text-white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-semibold text-gray-900 block truncate">
                  {isLocked
                    ? 'User CANNOT update employment info'
                    : 'User CAN update employment info'}
                </span>
                <span className="text-xs text-gray-600 block">
                  {isLocked ? 'Individually LOCKED' : 'Individually UNLOCKED'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <Switch
                checked={!isLocked}
                onCheckedChange={onToggle}
                disabled={isPending}
                className="data-[state=checked]:bg-green-600 h-6 w-11 flex-shrink-0"
              />
              <span className="text-sm font-medium text-gray-500 min-w-[50px]">
                {isLocked ? 'Locked' : 'Unlocked'}
              </span>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="info" className="mt-3">
          <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
            <div className="flex flex-col sm:flex-row items-start gap-2.5">
              <div className="flex-1 w-full min-w-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="bg-white p-2 rounded-lg border border-blue-100">
                    <div className="flex items-center gap-1.5 text-xs text-blue-700">
                      <Globe className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
                      <span className="truncate">
                        Global: <strong>{globalLocked ? 'Locked' : 'Unlocked'}</strong>
                      </span>
                    </div>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-blue-100">
                    <div className="flex items-center gap-1.5 text-xs">
                      {isLocked ? (
                        <Lock className="h-3.5 w-3.5 text-red-500 flex-shrink-0" />
                      ) : (
                        <Unlock className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                      )}
                      <span className="text-gray-700 truncate">
                        User: <strong>{isLocked ? 'Locked' : 'Unlocked'}</strong>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 p-2 bg-white rounded-lg border border-blue-100">
                  <p className="text-xs text-gray-600">
                    <span className="font-semibold">Note:</span> Individual permissions ALWAYS take
                    priority over global settings.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
