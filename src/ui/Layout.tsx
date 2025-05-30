import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import DesktopNavigation from "./DesktopNavigation";

export function Layout() {
  return (
    <div
      className="text-gray-700 max-h-screen bg-[#F8F8F8]"
      style={{ fontFamily: "Cabin", letterSpacing: "1.2px" }}
    >
      <Header />

      <div className="flex">
        <DesktopNavigation />

        <main className="flex-1 px-4 md:px-6 pb-8 md:pb-24 overflow-y-auto h-screen">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
