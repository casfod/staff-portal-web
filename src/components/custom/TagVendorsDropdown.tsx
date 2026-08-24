// TagVendorsDropdown.tsx - Fixed with proper positioning and search
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { IVendor } from '../../interfaces';
import {motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TagVendorsDropdownProps {
  vendors: IVendor[] | [];
  isLoading: boolean;
  isError: boolean;
  onSelectVendors: (recipients: string[]) => Promise<void>;
  onClose: () => void;
  anchorRef?: React.RefObject<HTMLDivElement>;
  errorMessage?: string;
  // Search state from parent (debounced)
  searchTerm: string;
  onSearchChange: (term: string) => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
}

const TagVendorsDropdown: React.FC<TagVendorsDropdownProps> = ({
  vendors,
  isLoading,
  isError,
  onSelectVendors,
  onClose,
  anchorRef,
  errorMessage,
  searchTerm,
  onSearchChange,
  hasMore = false,
  isLoadingMore = false,
  onLoadMore,
}) => {
  const [selectedrecipients, setSelectedrecipients] = useState<string[]>([]);
  const [coords, setCoords] = useState({ top: 0, right: 0, maxListHeight: 240 });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const isOpenRef = useRef(true);
  const timeoutIdRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Calculate position - FIXED: Use viewport-relative positioning
  const computeCoords = useCallback(() => {
    if (!anchorRef?.current) return;
    const rect = anchorRef.current.getBoundingClientRect();
    const OFFSET = 8;
    const BOTTOM_MARGIN = 16;
    const available = window.innerHeight - rect.bottom - OFFSET - BOTTOM_MARGIN;
    const maxListHeight = Math.max(120, Math.min(available, 320));

    setCoords({
      top: rect.bottom + OFFSET,
      right: window.innerWidth - rect.right,
      maxListHeight,
    });
  }, [anchorRef]);

  useEffect(() => {
    computeCoords();
    setIsInitialized(true);
  }, [computeCoords]);

  // Recalculate on scroll/resize
  useEffect(() => {
    window.addEventListener('scroll', computeCoords, true);
    window.addEventListener('resize', computeCoords);
    return () => {
      window.removeEventListener('scroll', computeCoords, true);
      window.removeEventListener('resize', computeCoords);
    };
  }, [computeCoords]);

  // Handle click outside - fixed with proper cleanup
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!isOpenRef.current) return;

      const target = event.target as Node;
      const isInsideDropdown = dropdownRef.current?.contains(target);
      const isInsideAnchor = anchorRef?.current?.contains(target);

      if (!isInsideDropdown && !isInsideAnchor) {
        isOpenRef.current = false;
        onClose();
      }
    };

    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = null;
    }

    if (isInitialized) {
      timeoutIdRef.current = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 200);
    }

    return () => {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
        timeoutIdRef.current = null;
      }
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isInitialized, onClose, anchorRef]);

  // Reset open state when dropdown mounts
  useEffect(() => {
    isOpenRef.current = true;
    return () => {
      isOpenRef.current = false;
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
        timeoutIdRef.current = null;
      }
    };
  }, []);

  const handleVendorToggle = (vendorId: string) => {
    setSelectedrecipients(prev =>
      prev.includes(vendorId) ? prev.filter(id => id !== vendorId) : [...prev, vendorId]
    );
    setSubmitError(null);
  };

  const toggleAllVendors = () => {
    const allrecipients = vendors.map(v => v.id);
    const allSelected = allrecipients.every(id => selectedrecipients.includes(id));

    if (allSelected) {
      setSelectedrecipients(prev => prev.filter(id => !allrecipients.includes(id)));
    } else {
      const currentSelectedIds = new Set(selectedrecipients);
      allrecipients.forEach(id => currentSelectedIds.add(id));
      setSelectedrecipients(Array.from(currentSelectedIds));
    }
    setSubmitError(null);
  };

  const handleSubmit = async () => {
    if (selectedrecipients.length === 0) {
      setSubmitError('Please select at least one vendor to share with.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await onSelectVendors(selectedrecipients);
      isOpenRef.current = false;
      onClose();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to share with vendors. Please try again.';
      setSubmitError(message);
      console.error('[TagVendorsDropdown] Submit failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDropdownClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
  }, []);

  const hasError = isError || !!errorMessage || !!submitError;
  const displayError = submitError || errorMessage || 'Error loading vendors';

  const isEmpty = vendors.length === 0;

  if (!isInitialized && anchorRef) {
    return null;
  }

  const dropdownContent = (
    <div
      ref={dropdownRef}
      style={{
        position: anchorRef ? 'fixed' : 'absolute',
        top: anchorRef ? coords.top : undefined,
        right: anchorRef ? coords.right : 0,
        zIndex: 99999,
        ...(anchorRef ? {} : { marginTop: '8px' }),
      }}
      onClick={handleDropdownClick}
      onMouseDown={handleDropdownClick}
    >
      <motion.div
        className="w-72 rounded-md bg-white shadow-lg border border-gray-200 overflow-hidden"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
      >
        <div className="p-3 border-b">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-gray-800 text-sm">Share with Vendors</h3>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                isOpenRef.current = false;
                onClose();
              }}
              className="h-8 w-8 p-0"
              disabled={isSubmitting}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              inputSize="sm"
              placeholder="Search vendors..."
              className="pl-9 pr-8"
              value={searchTerm}
              onChange={e => onSearchChange(e.target.value)}
              autoFocus
              onClick={e => e.stopPropagation()}
              onMouseDown={e => e.stopPropagation()}
              disabled={isSubmitting}
            />
            {searchTerm && (
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                onClick={e => {
                  e.stopPropagation();
                  onSearchChange('');
                }}
                onMouseDown={e => e.stopPropagation()}
                disabled={isSubmitting}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {hasError && (
          <div className="p-3 bg-red-50 border-b border-red-200">
            <div className="flex items-start text-red-600 text-sm">
              <X className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
              <span>{displayError}</span>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="overflow-y-auto p-2" style={{ maxHeight: coords.maxListHeight }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="animate-pulse mb-3">
                <div className="flex items-center p-2">
                  <div className="w-4 h-4 rounded-sm bg-gray-200 mr-3"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : isEmpty && searchTerm ? (
          <div
            className="p-8 text-center text-gray-500 overflow-y-auto"
            style={{ maxHeight: coords.maxListHeight }}
          >
            <div className="flex justify-center mb-2">
              <Search className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-sm">No vendors found matching "{searchTerm}"</p>
            <button
              className="text-blue-500 text-sm mt-2 hover:underline"
              onClick={e => {
                e.stopPropagation();
                onSearchChange('');
              }}
              disabled={isSubmitting}
            >
              Clear search
            </button>
          </div>
        ) : (
          <div className="overflow-y-auto" style={{ maxHeight: coords.maxListHeight }}>
            <div className="flex items-center px-3 py-2 bg-gray-50 border-b cursor-pointer hover:bg-gray-100 transition-colors">
              <div
                className="p-1 rounded-sm hover:bg-gray-200 mr-2 cursor-pointer"
                onClick={e => {
                  e.stopPropagation();
                  toggleAllVendors();
                }}
                onMouseDown={e => e.stopPropagation()}
              >
                <Checkbox
                  checked={
                    vendors.length > 0 && vendors.every(v => selectedrecipients.includes(v.id))
                  }
                  className={cn(
                    'h-4 w-4',
                    vendors.length > 0 &&
                      vendors.every(v => selectedrecipients.includes(v.id)) &&
                      'bg-blue-500 border-blue-500'
                  )}
                  disabled={isSubmitting}
                />
              </div>
              <span className="text-sm font-medium flex-1">
                All Vendors
                <span className="text-gray-500 text-xs ml-1">({vendors.length})</span>
              </span>
              {selectedrecipients.length > 0 && (
                <span className="text-xs bg-blue-100 text-blue-800 rounded-full px-2 py-0.5">
                  {selectedrecipients.length} selected
                </span>
              )}
            </div>

            {vendors.map(vendor => (
              <div
                key={vendor.id}
                className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer transition-colors border-b last:border-b-0"
                onClick={e => {
                  e.stopPropagation();
                  handleVendorToggle(vendor.id);
                }}
                onMouseDown={e => e.stopPropagation()}
              >
                <Checkbox
                  checked={selectedrecipients.includes(vendor.id)}
                  className="mr-3 h-4 w-4 flex-shrink-0"
                  disabled={isSubmitting}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {vendor.businessName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    Code: {vendor.vendorCode} | {vendor.contactPerson}
                  </p>
                </div>
              </div>
            ))}

            {hasMore && (
              <div className="p-2 border-t">
                <button
                  className="w-full text-center text-sm text-blue-600 hover:underline py-1 disabled:text-gray-400 disabled:no-underline"
                  onClick={e => {
                    e.stopPropagation();
                    onLoadMore?.();
                  }}
                  disabled={isLoadingMore || isSubmitting}
                >
                  {isLoadingMore ? 'Loading more…' : 'Load more vendors'}
                </button>
              </div>
            )}
          </div>
        )}

        <div className="p-3 border-t flex justify-between items-center bg-gray-50">
          <span className="text-sm text-gray-500">{selectedrecipients.length} selected</span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={e => {
                e.stopPropagation();
                isOpenRef.current = false;
                onClose();
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={e => {
                e.stopPropagation();
                handleSubmit();
              }}
              disabled={selectedrecipients.length === 0 || isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <span className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                  Sharing...
                </span>
              ) : (
                `Share ${selectedrecipients.length > 0 ? `(${selectedrecipients.length})` : ''}`
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );

  if (anchorRef) {
    return createPortal(dropdownContent, document.body);
  }

  return dropdownContent;
};

export default TagVendorsDropdown;
