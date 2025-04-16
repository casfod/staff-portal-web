// import { Heart } from "lucide-react";
import { Menu } from "lucide-react";
import logo from "../assets/logo.png";
// import { useUser } from "../features/user/userHooks/useUser";
import { localStorageUser } from "../utils/localStorageUser";
import RoleBadge from "./RoleBadge";
import { useEffect, useRef, useState } from "react";
import MobileNavigation from "./MobileNavigation";

export function Header() {
  const [isNavigation, setIsNavigation] = useState<boolean>(false);
  const localStorageUserX = localStorageUser();
  const user = localStorageUserX;
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

  // Close navigation when viewport reaches xl (1280px)
  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1280px)");

    const handleResize = (e: MediaQueryListEvent) => {
      if (e.matches) {
        setIsNavigation(false);
      }
    };

    // Initial check
    if (mediaQuery.matches) {
      setIsNavigation(false);
    }

    // Listen for changes
    mediaQuery.addEventListener("change", handleResize);

    return () => {
      mediaQuery.removeEventListener("change", handleResize);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white border-b shadow-md">
      <div className="mx-auto pl-6 xl:pl-3 pr-6 py-3 xl:py-2 flex justify-between items-center">
        <div className="hidden xl:block border pl-2 py-2 px-2 rounded-md shadow">
          <img src={logo} alt="CASFOD" className="w-[200px] h-14" />
        </div>

        <span
          ref={menuButtonRef}
          className="xl:hidden cursor-pointer"
          onClick={() => setIsNavigation(!isNavigation)}
        >
          <Menu />
        </span>

        <span
          className="ml-2 font-extrabold text-primary tracking-[5px]"
          style={{ fontFamily: "Sora" }}
        >
          CASFOD POSSIBILITY HUB
        </span>

        <div
          className="flex items-center space-x-4 text-sm"
          style={{ fontFamily: "Sora" }}
        >
          <RoleBadge role={user.role}>
            <div className="flex items-center gap-1 font-extrabold tracking-[1.5px]">
              <span>{user.first_name.toUpperCase()}</span>
              <span>{user.last_name.toUpperCase()}</span>
            </div>
          </RoleBadge>
        </div>
      </div>

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
