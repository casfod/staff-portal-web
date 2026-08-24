// MobileNavigation.tsx
import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigation } from '../../hooks/useNavigation';
import Navigation from './Navigation';

// Radix wraps portaled popper content (e.g. DropdownMenuContent, which renders
// into document.body) in an element carrying this attribute. Taps landing
// inside it are logically "inside" the nav even though they're outside
// panelRef in the DOM tree, so outside-click handlers need to ignore them.
const isInsideRadixPortal = (target: EventTarget | null) =>
  target instanceof Element && Boolean(target.closest('[data-radix-popper-content-wrapper]'));

const MobileNavigation = () => {
  const { isMobileOpen, setMobileOpen } = useNavigation();
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on outside click, Escape, or route-triggered scroll; lock body scroll while open.
  useEffect(() => {
    if (!isMobileOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node) &&
        !isInsideRadixPortal(event.target)
      ) {
        setMobileOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = previousOverflow;
    };
  }, [isMobileOpen, setMobileOpen]);

  // Close automatically if the viewport grows into desktop range.
  useEffect(() => {
    const mql = window.matchMedia('(min-width: 1280px)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (e.matches) setMobileOpen(false);
    };
    mql.addEventListener('change', handleChange);
    return () => mql.removeEventListener('change', handleChange);
  }, [setMobileOpen]);

  return (
    <AnimatePresence>
      {isMobileOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 xl:hidden"
            aria-hidden="true"
          />

          <motion.div
            ref={panelRef}
            initial={{ x: -320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -320, opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 350, mass: 0.8 }}
            className="fixed top-0 left-0 bottom-0 z-50 xl:hidden w-56 max-w-[80vw] overflow-y-auto bg-white shadow-2xl"
            role="dialog"
            aria-modal="true"
          >
            <div className="absolute top-2 left-1/2 -translate-x-1/2">
              <div className="w-12 h-1 bg-gray-300 rounded-full" />
            </div>
            <Navigation showProfile onNavigate={() => setMobileOpen(false)} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileNavigation;
