// import { Heart } from "lucide-react";
import { Menu } from "lucide-react";
import logo from "../assets/logo.png";
// import { useUser } from "../features/user/userHooks/useUser";
import { useEffect, useRef, useState } from "react";
import MobileNavigation from "./MobileNavigation";
import Profile from "./Profile";
import useMediaQuery from "../hooks/useMediaQuery";

export function Header() {
  const [isNavigation, setIsNavigation] = useState<boolean>(false);
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
        setIsNavigation(false);
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
      setIsNavigation(false);
    }
  });

  return (
    <header className="sticky top-0 z-50 bg-white border-b shadow-md">
      <div className="mx-auto pl-4 md:pl-6 2xl:pl-3 pr-4 md:pr-6 py-3 xl:py-2 flex justify-between items-center">
        <div className="hidden xl:block border pl-2 py-2 px-2 rounded-md shadow">
          <img
            src={logo}
            alt="CASFOD"
            className="w-[180px] 2xl:w-[200px] h-10 2xl:h-14"
          />
        </div>

        <span
          ref={menuButtonRef}
          className="xl:hidden cursor-pointer"
          onClick={() => setIsNavigation(!isNavigation)}
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
      {isNavigation && (
        <div
          ref={navRef}
          className="min-h-screen w-fit bg-white absolute top-0 left-0 right-0 bg-white shadow-lg z-40"
        >
          <MobileNavigation />
        </div>
      )}
    </header>
  );
}
