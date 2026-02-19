// src/pages/LeaveManagement.tsx
import { Outlet } from "react-router-dom";
// import AnimatedRoute from "../ui/AnimatedRoute";

const LeaveManagement = () => {
  return (
    <div className="h-full">
      <Outlet />
    </div>
  );
};

export default LeaveManagement;
