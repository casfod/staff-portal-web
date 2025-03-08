// import React from "react";

import { Outlet } from "react-router-dom";

import Navigation from "./Navigation";
import { Header } from "./Header";

export function Layout() {
  return (
    <div className="min-h-screen bg-[#F8F8F8]" style={{ fontFamily: "Cabin" }}>
      <Header />
      <div className="flex text-gray-300 overflow-y-hidden">
        {/* <Navigation onNavigate={setCurrentPage} currentPage={currentPage}/> */}
        <Navigation />
        <main className="flex-1 mx-auto px-4 md:px-6 pt-4 md:pt-6 pb-8 md:pb-24 h-screen overflow-y-scroll">
          {<Outlet />}
        </main>
      </div>
    </div>
  );
}
