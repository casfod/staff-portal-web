// Navigation.tsx - Fixed Version (removed unused isMobileOpen)
import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  // LogOut,
  ChevronDown,
} from 'lucide-react';
import { motion } from 'framer-motion';
// import { useLogout } from "../../features/authentication/authHooks/useLogout";
import { localStorageUser } from '../../utils/localStorageUser';
import { cn } from '../../lib/utils';
import { navigationItems } from '../../config/navigation';
import { infoConfig } from '../../config/config-info';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '@/components/ui/navigation-menu';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
// import { Button } from "@/components/ui/button";

interface NavigationProps {
  /** Icon-only rail mode (desktop collapsed state). Labels hide, flyout still works via hover. */
  collapsed?: boolean;
  /** Called whenever a link is clicked — used by the mobile drawer to close itself. */
  onNavigate?: () => void;
  /** Show the user identity card (used in the mobile drawer, hidden on desktop rail). */
  showProfile?: boolean;
}

// Radix wraps portaled popper content (DropdownMenuContent renders into
// document.body) in an element carrying this attribute. Clicks landing
// inside it are logically "inside" the nav's dropdown even though they're
// outside navRef in the DOM tree.
const isInsideRadixPortal = (target: EventTarget | null) =>
  target instanceof Element && Boolean(target.closest('[data-radix-popper-content-wrapper]'));

// Main Navigation Component
const Navigation: React.FC<NavigationProps> = ({
  collapsed = false,
  onNavigate,
  showProfile = false,
}) => {
  const location = useLocation();
  const currentUser = localStorageUser();
  // const { logout, isPending } = useLogout();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navRef = useRef<HTMLDivElement>(null);

  // Check if mobile — must match the xl:hidden / hidden xl:block breakpoint
  // that DesktopNavigation/MobileNavigation use to decide which nav renders,
  // otherwise this component's own idea of "mobile" (hover vs. click-only)
  // falls out of sync with which nav is actually on screen.
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1280);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        navRef.current &&
        !navRef.current.contains(event.target as Node) &&
        !isInsideRadixPortal(event.target)
      ) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMouseEnter = (itemId: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (!isMobile) setOpenDropdown(itemId);
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      timeoutRef.current = setTimeout(() => {
        setOpenDropdown(null);
      }, 200);
    }
  };

  const handleDropdownToggle = (itemId: string) => {
    if (isMobile) {
      setOpenDropdown(openDropdown === itemId ? null : itemId);
    }
  };

  // const handleLogout = async () => {
  //   await logout();
  //   if (isMobile) setMobileOpen(false);
  // };

  // Filter items based on user permissions
  const filteredItems = navigationItems.filter(item => {
    if (!currentUser) return false;
    if (currentUser.role === 'SUPER-ADMIN') return true;
    if (item.permission) return item.permission(currentUser);
    return true;
  });

  // Check if a route is active
  const isRouteActive = (to: string, dropdown?: { to: string }[]) => {
    if (location.pathname === to) return true;
    if (dropdown) {
      return dropdown.some(item => location.pathname === item.to);
    }
    return false;
  };

  const getUserInitials = () => {
    if (!currentUser) return 'U';
    return `${currentUser.firstName?.charAt(0) || ''}${currentUser.lastName?.charAt(0) || ''}`;
  };

  return (
    <nav
      ref={navRef}
      className="flex flex-col h-full w-full bg-white/80 backdrop-blur-sm border-r border-gray-100/50 py-4 px-3 shadow-sm"
      style={{ fontFamily: 'Cabin' }}
      aria-label="Main navigation"
    >
      {/* Logo - Fixed height, no extra margin */}
      <div className="flex-shrink-0">
        <Link
          to="/dashboard"
          className="flex items-stretch justify-stretch overflow-hidden border w-32 h-12 p-0 rounded-2xl bg-white to-primary/5 hover:shadow-md transition-all duration-200 group mx-auto shadow-md"
          aria-label="Home"
          onClick={() => onNavigate?.()}
        >
          <img
            src={infoConfig.bigLogoUrl}
            alt="CASFOD"
            className={`${collapsed ? 'hidden' : 'block'} w-full h-full object-fill group-hover:scale-105 transition-transform duration-200`}
          />
          <img
            src={infoConfig.smallLogoUrl}
            alt="CASFOD"
            className={`${collapsed ? 'block' : 'hidden'} min-w-10 h-full object-fill group-hover:scale-105 transition-transform duration-200`}
          />
        </Link>
      </div>

      {/* User Profile - shown when the parent (mobile drawer) asks for it */}
      {showProfile && currentUser && (
        <div className="flex-shrink-0 flex items-center gap-3 w-full px-3 py-2 my-3 rounded-xl bg-gray-50/50 border border-gray-100/50">
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-primary/10 text-brand-900 text-xs font-medium">
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {currentUser.firstName} {currentUser.lastName}
            </p>
            <p className="text-xs text-gray-600 truncate">{currentUser.role}</p>
          </div>
        </div>
      )}

      {/* Navigation Items - Takes remaining space with flex-1, fills whatever width the sidebar actually has */}
      <div className="w-full flex-1 overflow-y-auto py-2">
        <NavigationMenu className="w-full max-w-none">
          <NavigationMenuList className="flex flex-col w-full space-y-1">
            {filteredItems.map(item => {
              const isActive = isRouteActive(item.to, item.dropdown);
              const isOpen = openDropdown === item.to;
              const hasDropdown = Boolean(item.dropdown && item.dropdown.length > 0);

              return (
                <NavigationMenuItem key={item.to} className="w-full">
                  {hasDropdown ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          onClick={() => handleDropdownToggle(item.to)}
                          onMouseEnter={() => handleMouseEnter(item.to)}
                          onMouseLeave={handleMouseLeave}
                          className={cn(
                            'flex items-center w-full px-4 py-2.5 text-sm font-medium transition-all duration-200 rounded-lg',
                            'hover:bg-primary/10 hover:text-primary',
                            isActive
                              ? 'bg-primary/10 text-primary shadow-sm'
                              : 'text-gray-700 hover:shadow-md',
                            'group relative cursor-pointer w-full text-left',
                            collapsed && 'justify-center px-0'
                          )}
                          aria-expanded={isOpen}
                          aria-haspopup="true"
                          title={collapsed ? item.label : undefined}
                        >
                          <item.icon
                            className={cn(
                              'w-5 h-5 flex-shrink-0 transition-colors duration-200',
                              !collapsed && 'mr-1.5 lg:mr-3',
                              isActive ? 'text-brand-800' : 'text-gray-500 group-hover:text-primary'
                            )}
                          />
                          {!collapsed && (
                            <>
                              <span className="flex-1 text-left">{item.label}</span>
                              <motion.div
                                animate={{ rotate: isOpen ? 180 : 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                <ChevronDown className="w-4 h-4 text-gray-400" />
                              </motion.div>
                            </>
                          )}
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="start"
                        // Matches the trigger's rendered width when expanded. In collapsed
                        // (icon-only) mode the trigger itself is too narrow to size off of,
                        // so fall back to a readable minimum instead.
                        className={cn(
                          'bg-white border border-gray-100/50 shadow-2xl rounded-xl',
                          collapsed
                            ? 'min-w-[200px]'
                            : 'min-w-[var(--radix-dropdown-menu-trigger-width)]'
                        )}
                      >
                        {item.dropdown?.map(subItem => (
                          <DropdownMenuItem key={subItem.to} asChild>
                            <Link
                              to={subItem.to}
                              onClick={() => {
                                setOpenDropdown(null);
                                onNavigate?.();
                              }}
                              className={cn(
                                'flex items-center px-4 py-2.5 text-sm transition-colors duration-150',
                                location.pathname === subItem.to
                                  ? 'bg-primary/5 text-primary font-medium'
                                  : 'text-gray-700 hover:bg-primary/5 hover:text-primary'
                              )}
                            >
                              <div className="w-1.5 h-1.5 rounded-full bg-brand-800 mr-3" />
                              {subItem.label}
                            </Link>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <NavigationMenuLink asChild>
                      <Link
                        to={item.to}
                        onClick={() => onNavigate?.()}
                        title={collapsed ? item.label : undefined}
                        className={cn(
                          'flex items-center w-full px-4 py-2.5 text-sm font-medium transition-all duration-200 rounded-lg',
                          'hover:bg-primary/10 hover:text-primary',
                          isActive
                            ? 'bg-primary/10 text-primary shadow-sm'
                            : 'text-gray-700 hover:shadow-md',
                          'group',
                          collapsed && 'justify-center p-2'
                        )}
                      >
                        <item.icon
                          className={cn(
                            'w-5 h-5 flex-shrink-0 transition-colors duration-200',
                            !collapsed && 'mr-1.5 lg:mr-3',
                            isActive ? 'text-brand-800' : 'text-gray-500 group-hover:text-primary'
                          )}
                        />
                        {!collapsed && <span>{item.label}</span>}
                      </Link>
                    </NavigationMenuLink>
                  )}
                </NavigationMenuItem>
              );
            })}
          </NavigationMenuList>
        </NavigationMenu>
      </div>

      {/* Logout Button - Fixed at bottom with flex-shrink-0 */}
      {/* <div className="flex-shrink-0 pt-2 border-t border-gray-100/50">
        <Button
          variant="ghost"
          onClick={handleLogout}
          disabled={isPending}
          className={cn(
            "flex items-center justify-center w-full px-4 py-2.5 text-sm font-medium transition-all duration-200 rounded-lg",
            "text-red-600 hover:bg-red-50 hover:text-red-700",
            "border border-red-200/50 hover:border-red-300",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "group"
          )}
        >
          {isPending ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
              Logging out...
            </div>
          ) : (
            <>
              <LogOut className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-0.5" />
              Logout
            </>
          )}
        </Button>
      </div> */}
    </nav>
  );
};

export default Navigation;
