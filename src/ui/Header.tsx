// import { Heart } from "lucide-react";
import { Menu } from "lucide-react";
// import logo from "../assets/logo.webp";

// import { useUser } from "../features/user/userHooks/useUser";
import { useEffect, useRef } from "react";
import MobileNavigation from "./MobileNavigation";
import Profile from "./Profile";
import useMediaQuery from "../hooks/useMediaQuery";
import { useNavigation } from "../contexts/NavigationContext";

export function Header() {
  const { isMobileOpen, setIsMobileOpen, isDesktopOpen, setIsDesktopOpen } =
    useNavigation();
  const navRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLSpanElement>(null);

  // Close navigation when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      event.preventDefault();

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

  // Use the custom hook to handle xl viewport
  useMediaQuery("(min-width: 1280px)", (matches) => {
    if (matches) {
      setIsMobileOpen(false);
    }
  });

  return (
    <header className="sticky top-0 z-50 bg-white border-b shadow-md">
      <div className="mx-auto px-4 md:px-6 py-3 xl:py-2 flex justify-between items-center">
        {/* <div className="hidden xl:block border pl-2 py-2 px-2 rounded-md shadow">
          <img
            src={logo}
            alt="CASFOD"
            className="w-[180px] 2xl:w-[200px] h-10 2xl:h-14"
          />
        </div> */}
        {/* <div className="hidden xl:flex item-center justify-center p-1.5 rounded-full border-2 shadow-md">
          <img src={logo} alt="CASFOD" className="pt-1 h-11" />
        </div> */}

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
          <span className="sm:hidden">POSSIBILITY HUB</span>
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
