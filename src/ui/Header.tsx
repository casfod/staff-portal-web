import { Menu } from "lucide-react";
import { useEffect, useRef } from "react";
import MobileNavigation from "./MobileNavigation";
import Profile from "./Profile";
import useMediaQuery from "../hooks/useMediaQuery";
import { useNavigation } from "../hooks/useNavigation";

export function Header() {
  const { isMobileOpen, setIsMobileOpen, isDesktopOpen, setIsDesktopOpen } =
    useNavigation();
  const navRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLSpanElement>(null);

  // Close navigation when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        navRef.current &&
        !navRef.current.contains(event.target as Node) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(event.target as Node)
      ) {
        setIsMobileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Close navigation when scrolling
  useEffect(() => {
    const handleScroll = () => {
      if (isMobileOpen) {
        setIsMobileOpen(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isMobileOpen]); // Only run when isMobileOpen changes

  // Use the custom hook to handle xl viewport
  useMediaQuery("(min-width: 1280px)", (matches) => {
    if (matches) {
      setIsMobileOpen(false);
    }
  });

  return (
    <header className="sticky top-0 z-50 bg-white border-b shadow-md">
      <div className="mx-auto px-4 md:px-6 py-3 xl:py-2 flex justify-between items-center">
        <span
          className="hidden xl:flex cursor-pointer"
          onClick={() => setIsDesktopOpen(!isDesktopOpen)}
        >
          <Menu />
        </span>
        <span
          ref={menuButtonRef}
          className="xl:hidden cursor-pointer"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
        >
          <Menu />
        </span>

        <div
          className="ml-2 font-extrabold text-xs md:text-sm 2xl:text-base text-primary tracking-[5px]"
          style={{ fontFamily: "Sora" }}
        >
          <span className="hidden sm:block">CASFOD POSSIBILITY HUB</span>
          <span className="sm:hidden">CASFOD HUB</span>
        </div>

        <Profile />
      </div>

      {/* MOBILE NAVIGATION */}
      {isMobileOpen && (
        <div
          ref={navRef}
          className="min-h-screen w-fit absolute top-0 left-0 right-0 shadow-lg z-40"
        >
          <MobileNavigation />
        </div>
      )}
    </header>
  );
}
