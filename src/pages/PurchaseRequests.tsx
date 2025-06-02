import { Outlet } from "react-router-dom";
import { MaintenanceBanner } from "../ui/MaintenanceBanner";

export function PurchaseRequests() {
  const isUnderMaintenance = true; // Set this based on your maintenance status

  return (
    <div className="space-y-2 md:space-y-4 xl:space-y-6">
      {isUnderMaintenance ? (
        <MaintenanceBanner
          title="Purchase Requests Under Maintenance"
          message="We're addressing a purchase request error."
          expectedCompletion="Will Be Back Very soon "
        />
      ) : (
        <Outlet />
      )}
    </div>
  );
}
