import { Outlet } from "react-router-dom";
import { MaintenanceBanner } from "../ui/MaintenanceBanner";

export function ConceptNotes() {
  const isUnderMaintenance = false;
  return (
    <div className="space-y-2 md:space-y-4 xl:space-y-6">
      {isUnderMaintenance ? (
        <MaintenanceBanner
          title="Concept Notes Under Maintenance"
          message="We're addressing a purchase request error."
          expectedCompletion="Will Be Back Very soon "
        />
      ) : (
        <Outlet />
      )}
    </div>
  );
}
