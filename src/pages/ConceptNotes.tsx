import { Outlet } from "react-router-dom";

export function ConceptNotes() {
  return (
    <div className="space-y-6">
      <Outlet />
    </div>
  );
}
