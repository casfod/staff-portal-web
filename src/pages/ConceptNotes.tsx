import { Outlet } from "react-router-dom";

export function ConceptNotes() {
  return (
    <div className="space-y-2 md:space-y-4 xl:space-y-6">
      {" "}
      <Outlet />
    </div>
  );
}
