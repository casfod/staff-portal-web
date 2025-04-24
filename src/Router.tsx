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
import { PaymentRequests } from "./pages/PaymentRequests";
import CreatePurchaseRequest from "./features/purchase-request/CreatePurchaseRequest";
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
import AllExpenseClaims from "./features/expense-claim/AllExpenseCliams.tsx";
import CreateExpenseClaim from "./features/expense-claim/CreateExpenseClaim.tsx";
import ExpenseClaim from "./features/expense-claim/ExpenseClaim.tsx";
import EditExpenseClaim from "./features/expense-claim/EditExpenseClaim.tsx";
import AllPurchaseRequests from "./features/purchase-request/AllPurchaseRequests.tsx";
import EditPurchaseRequest from "./features/purchase-request/EditRequest";

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
        element: <AnimatedRoute key="projects" element={<Projects />} />,
        children: [
          { index: true, element: <Navigate to="all-projects" /> },
          {
            path: "all-projects",
            element: (
              <AnimatedRoute key="all-projects" element={<AllProjects />} />
            ),
          },
          {
            path: "create-project",
            element: (
              <AnimatedRoute
                key="create-purchase"
                element={<CreateProject />}
              />
            ),
          },
          {
            path: "project/:projectId",
            element: (
              <AnimatedRoute key="project/:projectId" element={<Project />} />
            ),
          },
          {
            path: "edit-project/:projectId",
            element: (
              <AnimatedRoute
                key="edit-project/:projectId"
                element={<EditProject />}
              />
            ),
          },
        ],
      },
      {
        path: "concept-notes",
        element: (
          <AnimatedRoute key="concept-notes" element={<ConceptNotes />} />
        ),
        children: [
          { index: true, element: <Navigate to="concept-notes" /> },
          {
            path: "concept-notes",
            element: (
              <AnimatedRoute
                key="concept-notes"
                element={<AllConceptNotes />}
              />
            ),
          },
          {
            path: "create-concept-note",
            element: (
              <AnimatedRoute
                key="create-concept-note"
                element={<CreateConceptNote />}
              />
            ),
          },
          {
            path: "concept-note/:requestId",
            element: (
              <AnimatedRoute
                key="concept-note/:requestId"
                element={<ConceptNote />}
              />
            ),
          },
          {
            path: "edit-concept-note/:requestId",
            element: (
              <AnimatedRoute
                key="edit-concept-note/:requestId"
                element={<EditConceptNote />}
              />
            ),
          },
        ],
      },
      {
        path: "purchase-requests",
        element: (
          <AnimatedRoute
            key="purchase-requests"
            element={<PurchaseRequests />}
          />
        ),
        children: [
          { index: true, element: <Navigate to="all-request" /> },
          {
            path: "all-request",
            element: (
              <AnimatedRoute
                key="all-request"
                element={<AllPurchaseRequests />}
              />
            ),
          },
          {
            path: "create-purchase-request",
            element: (
              <AnimatedRoute
                key="create-purchase-request"
                element={<CreatePurchaseRequest />}
              />
            ),
          },
          {
            path: "request/:requestId",
            element: (
              <AnimatedRoute
                key="request/:requestId"
                element={<PurchaseRequest />}
              />
            ),
          },
          {
            path: "edit-request/:requestId",
            element: (
              <AnimatedRoute
                key="edit-request/:requestId"
                element={<EditPurchaseRequest />}
              />
            ),
          },
        ],
      },
      {
        path: "advance-requests",
        element: (
          <AnimatedRoute key="advance-requests" element={<AdvanceRequests />} />
        ),
        children: [
          { index: true, element: <Navigate to="all-advance-request" /> },
          {
            path: "all-advance-request",
            element: (
              <AnimatedRoute
                key="all-advance-request"
                element={<AllAdvanceRequests />}
              />
            ),
          },
          {
            path: "create-advance-request",
            element: (
              <AnimatedRoute
                key="create-advance-request"
                element={<CreateAdvanceRequest />}
              />
            ),
          },
          {
            path: "request/:requestId",
            element: (
              <AnimatedRoute
                key="request/:requestId"
                element={<AdvanceRequest />}
              />
            ),
          },
          {
            path: "edit-request/:requestId",
            element: (
              <AnimatedRoute
                key="edit-request/:requestId"
                element={<EditAdvanceRequest />}
              />
            ),
          },
        ],
      },
      {
        path: "payment-requests",
        element: (
          <AnimatedRoute key="payment-requests" element={<PaymentRequests />} />
        ),
        children: [
          { index: true, element: <Navigate to="all-payment-request" /> },
          {
            path: "all-payment-request",
            element: (
              <AnimatedRoute
                key="all-payment-request"
                element={<AllPaymentRequests />}
              />
            ),
          },
          {
            path: "create-payment-request",
            element: (
              <AnimatedRoute
                key="create-payment-request"
                element={<CreatePaymentRequest />}
              />
            ),
          },
          {
            path: "request/:requestId",
            element: (
              <AnimatedRoute
                key="request/:requestId"
                element={<PaymentRequest />}
              />
            ),
          },
          {
            path: "edit-request/:requestId",
            element: (
              <AnimatedRoute
                key="edit-request/:requestId"
                element={<EditPaymentRequest />}
              />
            ),
          },
        ],
      },

      {
        path: "travel-requests",
        element: (
          <AnimatedRoute key="travel-requests" element={<TravelRequests />} />
        ),
        children: [
          { index: true, element: <Navigate to="all-travel-request" /> },
          {
            path: "all-travel-request",
            element: (
              <AnimatedRoute
                key="all-travel-request"
                element={<AllTravelRequests />}
              />
            ),
          },
          {
            path: "create-travel-request",
            element: (
              <AnimatedRoute
                key="create-travel-request"
                element={<CreateTravelRequest />}
              />
            ),
          },
          {
            path: "request/:requestId",
            element: (
              <AnimatedRoute
                key="request/:requestId"
                element={<TravelRequest />}
              />
            ),
          },
          {
            path: "edit-request/:requestId",
            element: (
              <AnimatedRoute
                key="edit-request/:requestId"
                element={<EditTravelRequest />}
              />
            ),
          },
        ],
      },

      {
        path: "expense-claims",
        element: (
          <AnimatedRoute key="expense-claims" element={<ExpenseClaims />} />
        ),
        children: [
          { index: true, element: <Navigate to="all-expense-claim" /> },
          {
            path: "all-expense-claim",
            element: (
              <AnimatedRoute
                key="all-expense-claim"
                element={<AllExpenseClaims />}
              />
            ),
          },
          {
            path: "create-expense-claim",
            element: (
              <AnimatedRoute
                key="create-expense-claim"
                element={<CreateExpenseClaim />}
              />
            ),
          },
          {
            path: "request/:requestId",
            element: (
              <AnimatedRoute
                key="request/:requestId"
                element={<ExpenseClaim />}
              />
            ),
          },
          {
            path: "edit-request/:requestId",
            element: (
              <AnimatedRoute
                key="edit-request/:requestId"
                element={<EditExpenseClaim />}
              />
            ),
          },
        ],
      },

      {
        path: "user-management",
        element: (
          <AnimatedRoute key="user-management" element={<UserManagement />} />
        ),
      },
    ],
  },
  { path: "login", element: <AnimatedRoute key="" element={<Login />} /> },
  { path: "*", element: <AnimatedRoute key="" element={<PageNotFound />} /> },
]);

export default router;
