// src/components/ui/Drawer.tsx

import * as React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface DrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

interface DrawerContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  side?: 'bottom' | 'right' | 'left' | 'top';
}

interface DrawerHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

interface DrawerFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

interface DrawerTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
}

interface DrawerDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

export function Drawer({ open, onOpenChange, children }: DrawerProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      {children}
    </Dialog.Root>
  );
}

export function DrawerContent({
  children,
  className,
  side = 'bottom',
  ...props
}: DrawerContentProps) {
  const sideClasses = {
    bottom: 'inset-x-0 bottom-0 mt-24 rounded-t-[10px]',
    right: 'inset-y-0 right-0 w-full max-w-md',
    left: 'inset-y-0 left-0 w-full max-w-md',
    top: 'inset-x-0 top-0 mb-24 rounded-b-[10px]',
  };

  return (
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
      <Dialog.Content
        className={cn(
          'fixed z-50 flex flex-col bg-white shadow-lg outline-none data-[state=open]:animate-in data-[state=closed]:animate-out',
          side === 'bottom' && [
            'data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom',
            sideClasses.bottom,
          ],
          side === 'right' && [
            'data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right',
            sideClasses.right,
          ],
          side === 'left' && [
            'data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left',
            sideClasses.left,
          ],
          side === 'top' && [
            'data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top',
            sideClasses.top,
          ],
          className
        )}
        {...props}
      >
        {side === 'bottom' && <div className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-gray-300" />}
        {children}
      </Dialog.Content>
    </Dialog.Portal>
  );
}

export function DrawerHeader({ children, className, ...props }: DrawerHeaderProps) {
  return (
    <div className={cn('flex flex-col space-y-1.5 p-4 pb-0', className)} {...props}>
      {children}
    </div>
  );
}

export function DrawerTitle({ children, className, ...props }: DrawerTitleProps) {
  return (
    <Dialog.Title
      className={cn('text-lg font-semibold leading-none tracking-tight', className)}
      {...props}
    >
      {children}
    </Dialog.Title>
  );
}

export function DrawerDescription({ children, className, ...props }: DrawerDescriptionProps) {
  return (
    <Dialog.Description className={cn('text-sm text-gray-500', className)} {...props}>
      {children}
    </Dialog.Description>
  );
}

export function DrawerFooter({ children, className, ...props }: DrawerFooterProps) {
  return (
    <div
      className={cn(
        'flex flex-col-reverse p-4 pt-0 sm:flex-row sm:justify-end sm:space-x-2',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function DrawerClose({
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <Dialog.Close asChild>
      <button
        className={cn(
          'absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:pointer-events-none',
          className
        )}
        {...props}
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </button>
    </Dialog.Close>
  );
}

// Re-export Dialog components for more flexibility
export const DrawerTrigger = Dialog.Trigger;
export const DrawerPortal = Dialog.Portal;
export const DrawerOverlay = Dialog.Overlay;
