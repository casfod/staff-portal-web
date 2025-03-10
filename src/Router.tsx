import { createBrowserRouter, Navigate } from "react-router-dom";
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
import Request from "./features/purchase-request/Request";
import AllRequests from "./features/purchase-request/AllRequests";
import { PurchaseVoucher } from "./pages/PurchaseVoucher";
import EditRequest from "./features/purchase-request/EditRequest";
import { AnimatePresence, motion } from "framer-motion";
import CreateRequest from "./features/purchase-request/CreateRequest";

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
    transition: { duration: 0.3, ease: "easeInOut" },
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
      },
      {
        path: "concept-notes",
        element: <AnimatedRoute element={<ConceptNotes />} />,
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
        path: "payment-voucher",
        element: <AnimatedRoute element={<PurchaseVoucher />} />,
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
        path: "user-management",
        element: <AnimatedRoute element={<UserManagement />} />,
      },
    ],
  },
  { path: "login", element: <AnimatedRoute element={<Login />} /> },
  { path: "*", element: <AnimatedRoute element={<PageNotFound />} /> },
]);

export default router;
