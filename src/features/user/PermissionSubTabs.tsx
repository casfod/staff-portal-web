import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Badge } from '../../components/ui/badge';
import { ShoppingCart, DollarSign } from 'lucide-react';
import { EditedUser, PermissionItem, PermissionRole } from './user-card.types';
import { memo, useMemo } from 'react';

interface PermissionSubTabsProps {
  activeSubTab: string;
  setActiveSubTab: (value: string) => void;
  renderPermissionSection: (
    title: string,
    permissions: readonly PermissionItem[],
    roleType: PermissionRole
  ) => React.ReactNode;
  editedUser: EditedUser;
}

const PROCUREMENT_PERMISSIONS: readonly PermissionItem[] = [
  { key: 'canView', label: 'View', description: 'View procurement data' },
  { key: 'canCreate', label: 'Create', description: 'Create new procurement' },
  { key: 'canUpdate', label: 'Update', description: 'Update procurement' },
  { key: 'canDelete', label: 'Delete', description: 'Delete procurement' },
] as const;

const FINANCE_PERMISSIONS: readonly PermissionItem[] = [
  { key: 'canView', label: 'View', description: 'View finance data' },
  { key: 'canCreate', label: 'Create', description: 'Create new finance records' },
  { key: 'canUpdate', label: 'Update', description: 'Update finance records' },
  { key: 'canDelete', label: 'Delete', description: 'Delete finance records' },
] as const;

export const PermissionSubTabs = memo(
  ({
    activeSubTab,
    setActiveSubTab,
    renderPermissionSection,
    editedUser,
  }: PermissionSubTabsProps) => {
    const getPermissionCount = useMemo(() => {
      return (role: PermissionRole) => {
        const roleData = editedUser[role];
        if (!roleData) return 0;
        return Object.values(roleData).filter(Boolean).length;
      };
    }, [editedUser]);

    // Memoize sections to prevent unnecessary re-renders
    const procurementSection = useMemo(
      () => renderPermissionSection('', PROCUREMENT_PERMISSIONS, 'procurementRole'),
      [renderPermissionSection]
    );

    const financeSection = useMemo(
      () => renderPermissionSection('', FINANCE_PERMISSIONS, 'financeRole'),
      [renderPermissionSection]
    );

    return (
      <div className="space-y-3">
        <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="w-full">
          <TabsList className="grid grid-cols-2 h-10 p-1 bg-gray-100 rounded-lg">
            <TabsTrigger
              value="procurement"
              className="text-xs font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md px-3 py-1.5"
            >
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Procurement</span>
                <span className="sm:hidden">Proc.</span>
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                  {getPermissionCount('procurementRole')}/4
                </Badge>
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="finance"
              className="text-xs font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md px-3 py-1.5"
            >
              <div className="flex items-center gap-2">
                <DollarSign className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Finance</span>
                <span className="sm:hidden">Fin.</span>
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                  {getPermissionCount('financeRole')}/4
                </Badge>
              </div>
            </TabsTrigger>
          </TabsList>

          {/* Both TabsContent will render but only active one shows */}
          <TabsContent value="procurement" className="mt-3">
            <div className="max-h-[280px] overflow-y-auto pr-1 space-y-2">{procurementSection}</div>
          </TabsContent>

          <TabsContent value="finance" className="mt-3">
            <div className="max-h-[280px] overflow-y-auto pr-1 space-y-2">{financeSection}</div>
          </TabsContent>
        </Tabs>
      </div>
    );
  }
);

PermissionSubTabs.displayName = 'PermissionSubTabs';
