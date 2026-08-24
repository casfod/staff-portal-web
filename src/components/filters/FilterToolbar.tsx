// src/components/filters/FilterToolbar.tsx

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { FilterPopover } from './FilterPopover';
import { IFilterConfig, IFilterState } from '@/interfaces';

type FilterValue = string | string[] | Date | null;

interface FilterToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  filters: IFilterState;
  onFilterChange: (key: string, value: FilterValue) => void;
  filterConfigs: IFilterConfig[];
  activeFilterCount: number;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  searchPlaceholder?: string;
}

export function FilterToolbar({
  searchValue,
  onSearchChange,
  filters,
  onFilterChange,
  filterConfigs,
  activeFilterCount,
  onClearFilters,
  hasActiveFilters,
  searchPlaceholder = 'Search...',
}: FilterToolbarProps) {
  // Active filter labels for the chip row.
  const activeFilterLabels = Object.entries(filters)
    .filter(([_, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => {
      const label = filterConfigs.find(c => c.key === key)?.label ?? key;
      if (Array.isArray(value)) return `${label}: ${value.join(', ')}`;
      if (value instanceof Date) return `${label}: ${value.toLocaleDateString()}`;
      return `${label}: ${String(value)}`;
    });

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[140px] sm:min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            inputSize={'sm'}
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={e => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        <FilterPopover
          filters={filters}
          onFilterChange={onFilterChange}
          onClearFilters={onClearFilters}
          filterConfigs={filterConfigs}
          activeFilterCount={activeFilterCount}
        />
      </div>

      {/* Active filter chips — only takes space once something is set */}
      {hasActiveFilters && activeFilterLabels.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          {activeFilterLabels.map((label, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {label}
            </Badge>
          ))}
          <Button variant="ghost" size="sm" onClick={onClearFilters} className="text-xs h-6 px-2">
            <X className="h-3 w-3 mr-1" />
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}
