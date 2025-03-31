import { useState } from "react";
import { Plus } from "lucide-react";
import { Outlet } from "react-router-dom";

export function PaymentRequests() {
  return (
    <div className="space-y-6">
      <Outlet />
    </div>
  );
}
