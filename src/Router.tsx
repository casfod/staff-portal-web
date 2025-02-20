import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import { Login } from "./features/authentication/Login";
import AuthGuard from "./features/authentication/AuthGuard";
import { Dashboard } from "./pages/Dashboard";
import { Projects } from "./pages/Projects";
import { ConceptNotes } from "./pages/ConceptNotes";
import { PurchaseRequests } from "./pages/PurchaseRequests";
import { AdvanceRequests } from "./pages/AdvanceRequests";
import { TravelRequests } from "./pages/TravelRequests";
import { UserManagement } from "./pages/UserManagement";
import PageNotFound from "./pages/PageNotFound";
import { Layout } from "./ui/Layout";

const router = createBrowserRouter([
  {
    element: (
      <AuthGuard>
        <Layout />
      </AuthGuard>
    ),

    children: [
      { path: "/", element: <Navigate to="dashboard" /> },
      { path: "dashboard", element: <Dashboard /> },

      {
        path: "projects",
        element: <Projects />,
      },
      {
        path: "concept-notes",
        element: <ConceptNotes />,
      },
      {
        path: "purchase-requests",
        element: <PurchaseRequests />,
      },
      {
        path: "advance-requests",
        element: <AdvanceRequests />,
      },
      {
        path: "travel-requests",
        element: <TravelRequests />,
      },
      {
        path: "user-management",
        element: <UserManagement />,
      },
    ],
  },
  { path: "login", element: <Login /> },
  { path: "*", element: <PageNotFound /> },
]);

function Router() {
  return <RouterProvider router={router} />;
}

export default Router;
