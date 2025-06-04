import { Outlet, ScrollRestoration } from "react-router-dom";
import { Header } from "./Header";
import DesktopNavigation from "./DesktopNavigation";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function Layout() {
  const { pathname } = useLocation();

  // Custom scroll restoration for the main content area
  useEffect(() => {
    const mainElement = document.querySelector("main");
    if (mainElement) {
      mainElement.scrollTo(0, 0);
    }
  }, [pathname]);

  return (
    <div
      className="text-gray-700 max-h-screen bg-[#F8F8F8]"
      style={{ fontFamily: "Cabin", letterSpacing: "0.9px" }}
    >
      <Header />

      <div className="flex">
        <DesktopNavigation />

        <main className="flex-1 px-4 md:px-6 pb-8 md:pb-24 overflow-y-auto h-screen">
          <ScrollRestoration />
          <Outlet />
        </main>
      </div>
    </div>
  );
}
