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
import Request from "./features/purchase-request/Request";
import AllRequests from "./features/purchase-request/AllRequests";
import { PaymentRequests } from "./pages/PaymentRequests";
import EditRequest from "./features/purchase-request/EditRequest";
import { AnimatePresence, motion } from "framer-motion";
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

const pageVariants = {
  initial: { opacity: 0, y: -20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.6, -0.05, 0.01, 0.99] },
  },
  exit: {
    opacity: 0,
    y: 20,
    transition: { duration: 0.2, ease: "easeInOut" },
  },
};

const AnimatedRoute = ({ element }: { element: React.ReactNode }) => (
  <AnimatePresence mode="wait">
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {element}
    </motion.div>
  </AnimatePresence>
);

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
            element: <AnimatedRoute element={<AllRequests />} />,
          },
          {
            path: "create-request",
            element: <AnimatedRoute element={<CreateRequest />} />,
          },
          {
            path: "request/:requestId",
            element: <AnimatedRoute element={<Request />} />,
          },
          {
            path: "edit-request/:requestId",
            element: <AnimatedRoute element={<EditRequest />} />,
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
        path: "advance-requests",
        element: <AnimatedRoute element={<AdvanceRequests />} />,
      },
      {
        path: "travel-requests",
        element: <AnimatedRoute element={<TravelRequests />} />,
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
