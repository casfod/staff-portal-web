import { Outlet } from "react-router-dom";

export function TravelRequests() {
  return (
    <div className="space-y-2 md:space-y-4 space-y-6">
      {" "}
      <Outlet />
    </div>
  );
}
