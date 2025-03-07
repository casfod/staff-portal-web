// import React from "react";

import { Outlet } from "react-router-dom";

import Navigation from "./Navigation";
import { Header } from "./Header";

export function Layout() {
  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "Cabin" }}>
      <Header />
      <div className="flex text-gray-300">
        {/* <Navigation onNavigate={setCurrentPage} currentPage={currentPage}/> */}
        <Navigation />
        <main className="flex-1 mx-auto p-4 md:p-6">{<Outlet />}</main>
      </div>
    </div>
  );
}
