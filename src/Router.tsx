import { createBrowserRouter, Navigate } from "react-router-dom";
import { Login } from "./features/authentication/Login";
import AuthGuard from "./features/authentication/AuthGuard";
import { Dashboard } from "./pages/Dashboard";
import { Projects } from "./pages/Projects.tsx";
import { ConceptNotes } from "./pages/ConceptNotes";
import { PurchaseRequests } from "./pages/PurchaseRequests";
import { AdvanceRequests } from "./pages/AdvanceRequests";
import { TravelRequests } from "./pages/TravelRequests";
import { UserManagement } from "./pages/UserManagement";
import PageNotFound from "./pages/PageNotFound";
import { Layout } from "./ui/Layout";
import PurchaseRequest from "./features/purchase-request/PurchaseRequest.tsx";
import AllPurchaseRequests from "./features/purchase-request/AllPurchaseRequests.tsx";
import { PaymentRequests } from "./pages/PaymentRequests";
import EditRequest from "./features/purchase-request/EditRequest";
import CreateRequest from "./features/purchase-request/CreateRequest";
import { AllProjects } from "./features/project/AllProjects";
import Project from "./features/project/Project";
import CreateProject from "./features/project/CreateProject.tsx";
import EditProject from "./features/project/EditProject.tsx";
import AllConceptNotes from "./features/concept-note/AllConceptNotes.tsx";
import CreateConceptNote from "./features/concept-note/CreateConceptNote.tsx";
import ConceptNote from "./features/concept-note/ConceptNote.tsx";
import EditConceptNote from "./features/concept-note/EditConceptNote.tsx";
import AllPaymentRequests from "./features/payment-request/AllPaymentRequests.tsx";
import CreatePaymentRequest from "./features/payment-request/CreatePaymentRequest.tsx";
import PaymentRequest from "./features/payment-request/PaymentRequest.tsx";
import EditPaymentRequest from "./features/payment-request/EditPaymentRequest.tsx";
import { ExpenseClaims } from "./pages/ExpenseClaims.tsx";
import AllAdvanceRequests from "./features/advance-request/AllAdvanceRequests.tsx";
import AdvanceRequest from "./features/advance-request/AdvanceRequest.tsx";
import CreateAdvanceRequest from "./features/advance-request/CreateAdvanceRequest.tsx";
import EditAdvanceRequest from "./features/advance-request/EditAdvanceRequest.tsx";
import AllTravelRequests from "./features/travel-request/AllTravelRequests.tsx";
import CreateTravelRequest from "./features/travel-request/CreateTravelRequest.tsx";
import TravelRequest from "./features/travel-request/TravelRequest.tsx";
import EditTravelRequest from "./features/travel-request/EditTravelRequest.tsx";
import AnimatedRoute from "./ui/AnimatedRoute.tsx";

const router = createBrowserRouter([
  {
    element: (
      <AuthGuard>
        <Layout />
      </AuthGuard>
    ),
    children: [
      { path: "/", element: <Navigate to="dashboard" /> },
      { path: "dashboard", element: <AnimatedRoute element={<Dashboard />} /> },
      {
        path: "projects",
        element: <AnimatedRoute element={<Projects />} />,
        children: [
          { index: true, element: <Navigate to="all-projects" /> },
          {
            path: "all-projects",
            element: <AnimatedRoute element={<AllProjects />} />,
          },
          {
            path: "create-project",
            element: <AnimatedRoute element={<CreateProject />} />,
          },
          {
            path: "project/:projectId",
            element: <AnimatedRoute element={<Project />} />,
          },
          {
            path: "edit-project/:projectId",
            element: <AnimatedRoute element={<EditProject />} />,
          },
        ],
      },
      {
        path: "concept-notes",
        element: <AnimatedRoute element={<ConceptNotes />} />,
        children: [
          { index: true, element: <Navigate to="concept-notes" /> },
          {
            path: "concept-notes",
            element: <AnimatedRoute element={<AllConceptNotes />} />,
          },
          {
            path: "create-concept-note",
            element: <AnimatedRoute element={<CreateConceptNote />} />,
          },
          {
            path: "concept-note/:requestId",
            element: <AnimatedRoute element={<ConceptNote />} />,
          },
          {
            path: "edit-concept-note/:requestId",
            element: <AnimatedRoute element={<EditConceptNote />} />,
          },
        ],
      },
      {
        path: "purchase-requests",
        element: <AnimatedRoute element={<PurchaseRequests />} />,
        children: [
          { index: true, element: <Navigate to="all-request" /> },
          {
            path: "all-request",
            element: <AnimatedRoute element={<AllPurchaseRequests />} />,
          },
          {
            path: "create-request",
            element: <AnimatedRoute element={<CreateRequest />} />,
          },
          {
            path: "request/:requestId",
            element: <AnimatedRoute element={<PurchaseRequest />} />,
          },
          {
            path: "edit-request/:requestId",
            element: <AnimatedRoute element={<EditRequest />} />,
          },
        ],
      },
      {
        path: "advance-requests",
        element: <AnimatedRoute element={<AdvanceRequests />} />,
        children: [
          { index: true, element: <Navigate to="all-advance-request" /> },
          {
            path: "all-advance-request",
            element: <AnimatedRoute element={<AllAdvanceRequests />} />,
          },
          {
            path: "create-request",
            element: <AnimatedRoute element={<CreateAdvanceRequest />} />,
          },
          {
            path: "request/:requestId",
            element: <AnimatedRoute element={<AdvanceRequest />} />,
          },
          {
            path: "edit-request/:requestId",
            element: <AnimatedRoute element={<EditAdvanceRequest />} />,
          },
        ],
      },
      {
        path: "payment-requests",
        element: <AnimatedRoute element={<PaymentRequests />} />,
        children: [
          { index: true, element: <Navigate to="all-payment-request" /> },
          {
            path: "all-payment-request",
            element: <AnimatedRoute element={<AllPaymentRequests />} />,
          },
          {
            path: "create-payment-request",
            element: <AnimatedRoute element={<CreatePaymentRequest />} />,
          },
          {
            path: "request/:requestId",
            element: <AnimatedRoute element={<PaymentRequest />} />,
          },
          {
            path: "edit-request/:requestId",
            element: <AnimatedRoute element={<EditPaymentRequest />} />,
          },
        ],
      },

      {
        path: "travel-requests",
        element: <AnimatedRoute element={<TravelRequests />} />,
        children: [
          { index: true, element: <Navigate to="all-travel-request" /> },
          {
            path: "all-travel-request",
            element: <AnimatedRoute element={<AllTravelRequests />} />,
          },
          {
            path: "create-request",
            element: <AnimatedRoute element={<CreateTravelRequest />} />,
          },
          {
            path: "request/:requestId",
            element: <AnimatedRoute element={<TravelRequest />} />,
          },
          {
            path: "edit-request/:requestId",
            element: <AnimatedRoute element={<EditTravelRequest />} />,
          },
        ],
      },

      {
        path: "expense-claims",
        element: <AnimatedRoute element={<ExpenseClaims />} />,
      },
      {
        path: "user-management",
        element: <AnimatedRoute element={<UserManagement />} />,
      },
    ],
  },
  { path: "login", element: <AnimatedRoute element={<Login />} /> },
  { path: "*", element: <AnimatedRoute element={<PageNotFound />} /> },
]);

export default router;
