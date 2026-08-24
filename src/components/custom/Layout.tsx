import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from './Header';
import DesktopNavigation from './DesktopNavigation';
import MobileNavigation from './MobileNavigation';

export default function Layout() {
  const { pathname } = useLocation();

  useEffect(() => {
    const mainElement = document.querySelector('main');
    if (mainElement) mainElement.scrollTo(0, 0);
  }, [pathname]);

  return (
    // `fixed inset-0` pins the whole app to the viewport regardless of what
    // html/body/#root do elsewhere (including third-party portals like
    // dialogs or toasts appended to <body>). This is what actually
    // guarantees no page-level scroll — h-screen alone only works if every
    // ancestor's height chain cooperates, which is fragile to rely on.
    <div
      className="fixed inset-0 flex flex-col overflow-hidden text-gray-700 bg-[#F8F8F8]"
      style={{ fontFamily: 'Cabin', letterSpacing: '0.9px' }}
    >
      <Header />

      <div className="flex flex-1 min-h-0">
        <DesktopNavigation />

        {/* The only scrollable region in the entire app. */}
        <main className="flex-1 min-h-0 overflow-y-auto p-4 md:p-6 pb-8 md:pb-24">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <MobileNavigation />
    </div>
  );
}
