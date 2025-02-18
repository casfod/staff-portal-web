import React from "react";
import { Navigation } from "./Navigation";
import { Header } from "./Header";
import { Dashboard } from "./pages/Dashboard";
import { Projects } from "./pages/Projects";
import { ConceptNotes } from "./pages/ConceptNotes";
import { PurchaseRequests } from "./pages/PurchaseRequests";
import { AdvanceRequests } from "./pages/AdvanceRequests";
import { TravelRequests } from "./pages/TravelRequests";
import { UserManagement } from "./pages/UserManagement";

export function Layout() {
  const [currentPage, setCurrentPage] = React.useState("dashboard");

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard />;
      case "projects":
        return <Projects />;
      case "concept-notes":
        return <ConceptNotes />;
      case "purchase-requests":
        return <PurchaseRequests />;
      case "advance-requests":
        return <AdvanceRequests />;
      case "travel-requests":
        return <TravelRequests />;
      case "user-management":
        return <UserManagement />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "Cabin" }}>
      <Header />
      <div className="flex">
        <Navigation onNavigate={setCurrentPage} currentPage={currentPage} />
        <main className="flex-1 p-6 lg:p-8">{renderPage()}</main>
      </div>
    </div>
  );
}
