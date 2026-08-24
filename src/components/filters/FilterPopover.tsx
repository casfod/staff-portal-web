// src/components/filters/FilterPopover.tsx
//
// Replaces FilterPanel.tsx (bottom drawer) for list pages that want the
// compact "Option A" layout. Built on Radix Popover rather than the
// Dialog-based Drawer — Popover is non-modal by default, so it doesn't set
// pointer-events: none on <body> the way Dialog does (the thing that broke
// SweetAlert2 buttons elsewhere). No staged local copy: every change calls
// onFilterChange directly, same as the simplified FilterPanel.

import { ChangeEvent } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { Filter, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { cn } from '../../lib/utils';
import { IFilterConfig, IFilterState } from '@/interfaces';
// Adjust this import path to wherever DatePicker actually lives in your tree
// (e.g. "@/components/ui/date-picker" or "@/components/custom/DatePicker").
import DatePicker from '../../features/datePicker/DatePicker';

type FilterValue = string | string[] | Date | null;

interface FilterPopoverProps {
  filters: IFilterState;
  onFilterChange: (key: string, value: FilterValue) => void;
  onClearFilters: () => void;
  filterConfigs: IFilterConfig[];
  activeFilterCount: number;
}

export function FilterPopover({
  filters,
  onFilterChange,
  onClearFilters,
  filterConfigs,
  activeFilterCount,
}: FilterPopoverProps) {
  const renderFilterInput = (config: IFilterConfig) => {
    const value = filters[config.key] ?? '';

    switch (config.type) {
      case 'select':
        return (
          <Select
            value={String(value)}
            onValueChange={(val: string) => onFilterChange(config.key, val)}
          >
            <SelectTrigger className="h-8 text-sm">
              <SelectValue placeholder={config.placeholder || 'All'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All</SelectItem>
              {config.options?.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'multiselect': {
        const selectedValues = Array.isArray(value) ? value : value ? [String(value)] : [];
        return (
          <Select
            value={selectedValues.join(',')}
            onValueChange={(val: string) => onFilterChange(config.key, val ? val.split(',') : [])}
          >
            <SelectTrigger className="h-8 text-sm">
              <SelectValue placeholder={config.placeholder || 'Select...'} />
            </SelectTrigger>
            <SelectContent>
              {config.options?.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      }

      case 'date':
        return (
          <DatePicker
            selected={value ? String(value) : null}
            onChange={date =>
              onFilterChange(
                config.key,
                // Keep the same YYYY-MM-DD shape the string-based filter
                // state (and dateFrom/dateTo query params) already expect.
                date ? date.toISOString().slice(0, 10) : null
              )
            }
            placeholder={config.placeholder || 'Select date'}
            size="sm"
            clearable
          />
        );

      case 'text':
      default:
        return (
          <Input
            type="text"
            className="h-8 text-sm"
            placeholder={config.placeholder || 'Any'}
            value={String(value)}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              onFilterChange(config.key, e.target.value)
            }
          />
        );
    }
  };

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <Button variant="outline" size={'sm'} className="relative">
          <Filter className=" h-3 w-3 lg:h-4 lg:w-4 lg:mr-2" />
          <span className="hidden lg:block">Filters</span>
          {activeFilterCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gray-900 px-1 text-[10px] font-medium text-white">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={8}
          collisionPadding={16}
          className={cn(
            'z-50 w-[calc(100vw-2rem)] max-w-[360px] rounded-md border border-gray-200 bg-white p-3 shadow-md outline-none',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95'
          )}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filterConfigs.map(config => (
              <div key={config.key} className="space-y-1">
                <Label htmlFor={config.key} className="text-xs text-gray-500">
                  {config.label}
                </Label>
                {renderFilterInput(config)}
              </div>
            ))}
          </div>

          <div className="mt-3 flex justify-end border-t border-gray-100 pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              disabled={activeFilterCount === 0}
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
              Clear all
            </Button>
          </div>

          <Popover.Arrow className="fill-white" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
