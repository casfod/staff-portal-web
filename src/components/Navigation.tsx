import {
  LayoutDashboard,
  FolderOpen,
  FileText,
  ShoppingCart,
  Wallet,
  Plane,
  Users,
  LogOut,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

interface NavigationProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

export function Navigation({ onNavigate, currentPage }: NavigationProps) {
  const { logout } = useAuth();
  const navigation = [
    { name: "Dashboard", icon: LayoutDashboard, id: "dashboard" },
    { name: "Projects", icon: FolderOpen, id: "projects" },
    { name: "Concept Notes", icon: FileText, id: "concept-notes" },
    { name: "Purchase Requests", icon: ShoppingCart, id: "purchase-requests" },
    { name: "Advance Requests", icon: Wallet, id: "advance-requests" },
    { name: "Travel Requests", icon: Plane, id: "travel-requests" },
    { name: "User Management", icon: Users, id: "user-management" },
  ];

  return (
    <nav className="flex flex-col items-center border w-64 bg-white shadow-sm min-h-screen">
      <div className="items-center space-y-1 py-4">
        {navigation.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`w-full flex items-center px-4 py-2 text-sm lg:text-base font-medium ${
              currentPage === item.id
                ? "text-primary bg-indigo-50"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <item.icon className="mr-3 h-6 w-6" />
            {item.name}
          </button>
        ))}
      </div>

      <div className="mt-auto mb-[40%]">
        <button
          onClick={logout}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm lg:text-base leading-4 font-medium rounded-md text-gray-500 hover:text-gray-700 focus:outline-none transition"
        >
          <LogOut className="h-6 w-6 mr-2" />
          Logout
        </button>
      </div>
    </nav>
  );
}
