// Header.tsx
import { Menu } from 'lucide-react';
import Profile from './Profile';
import { useNavigation } from '../../hooks/useNavigation';
import { infoConfig } from '../../config/config-info';

export function Header() {
  const { isMobileOpen, setMobileOpen, isDesktopOpen, setDesktopOpen } = useNavigation();

  return (
    <header className="sticky top-0 z-50 bg-white border-b shadow-md flex-shrink-0">
      <div className="mx-auto px-2 sm:px-4 md:px-6 py-3 xl:py-2 flex justify-between items-center">
        {/* Desktop: collapse/expand rail */}
        <button
          className="hidden xl:flex cursor-pointer hover:text-primary transition-colors"
          onClick={() => setDesktopOpen(!isDesktopOpen)}
          aria-label={isDesktopOpen ? 'Collapse navigation' : 'Expand navigation'}
          aria-pressed={isDesktopOpen}
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Mobile: open/close drawer */}
        <button
          className="xl:hidden cursor-pointer hover:text-primary transition-colors relative w-8 h-8 flex items-center justify-center"
          onClick={() => setMobileOpen(!isMobileOpen)}
          aria-label={isMobileOpen ? 'Close mobile navigation' : 'Open mobile navigation'}
          aria-expanded={isMobileOpen}
        >
          <div className="relative w-5 h-5">
            <span
              className={`absolute block h-0.5 w-5 bg-gray-700 transition-all duration-300 ease-in-out ${
                isMobileOpen ? 'rotate-45 top-2' : 'rotate-0 top-1'
              }`}
            />
            <span
              className={`absolute block h-0.5 w-5 bg-gray-700 transition-all duration-300 ease-in-out top-2 ${
                isMobileOpen ? 'opacity-0' : 'opacity-100'
              }`}
            />
            <span
              className={`absolute block h-0.5 w-5 bg-gray-700 transition-all duration-300 ease-in-out ${
                isMobileOpen ? '-rotate-45 top-2' : 'rotate-0 top-3.5'
              }`}
            />
          </div>
        </button>

        <div
          className="flex flex-col gap-1 items-center ml-2 font-extrabold text-xs xl:text-sm  text-primary tracking-[5px]"
          style={{ fontFamily: 'Sora' }}
        >
          <span className="hidden xl:block uppercase">{infoConfig.name}</span>
          <span className="xl:hidden">{infoConfig.abbriviation}</span>

          {/* <span className='hidden xl:block  text-xs capitalize'>( {infoConfig.subLocation} ) </span>
          <span className='xl:hidden text-[10px] capitalize'>( {infoConfig.subLocation.split(" ")[0]} ) </span> */}
        </div>

        <Profile />
      </div>
    </header>
  );
}
