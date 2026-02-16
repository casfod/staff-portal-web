// src/pages/HumanResources.tsx
import { Outlet } from "react-router-dom";
import { MaintenanceBanner } from "../ui/MaintenanceBanner";

const HumanResources = () => {
  const isUnderMaintenance = false;
  return (
    <div className="space-y-2 md:space-y-4 xl:space-y-6">
      {isUnderMaintenance ? (
        <MaintenanceBanner
          title="Procurement Under Maintenance"
          message="We're improving the procurement system."
          expectedCompletion="Will Be Back Soon"
        />
      ) : (
        <Outlet />
      )}
    </div>
  );
};

export default HumanResources;
