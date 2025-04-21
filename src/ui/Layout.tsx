import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import DesktopNavigation from "./DesktopNavigation";

export function Layout() {
  return (
    <div
      className="bg-[#F8F8F8]"
      style={{ fontFamily: "Cabin", letterSpacing: "0.9px" }}
    >
      {/* Make header sticky/fixed */}
      <div className="sticky top-0 z-50 bg-[#F8F8F8]">
        <Header />
      </div>

      <div className="flex">
        <DesktopNavigation />
        <main className="flex-1 px-4 md:px-6 pb-8 md:pb-24 overflow-y-auto h-[calc(100vh-header-height)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
