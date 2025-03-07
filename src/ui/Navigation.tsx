import React from "react";
import Navlink from "./Navlink";
import {
  LayoutDashboard,
  FolderOpen,
  FileText,
  ShoppingCart,
  ReceiptTextIcon,
  Wallet,
  Plane,
  Users,
} from "lucide-react";
import SpinnerMini from "./SpinnerMini";
import { useLogout } from "../features/authentication/authHooks/useLogout";
import { BiLogOut } from "react-icons/bi";

const Navigation: React.FC = () => {
  const { logout, isPending } = useLogout();

  const handleLogout = async () => {
    logout();
  };
  const navigation = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/projects", label: "Projects", icon: FolderOpen },
    { to: "/concept-notes", label: "Concept Notes", icon: FileText },
    {
      to: "/purchase-requests",
      label: "Purchase Requests",
      icon: ShoppingCart,
    },
    {
      to: "/purchase-voucher",
      label: "Purchase Voucher",
      icon: ReceiptTextIcon,
    },
    { to: "/advance-requests", label: "Advance Requests", icon: Wallet },
    { to: "/travel-requests", label: "Travel Requests", icon: Plane },
    { to: "/user-management", label: "User Management", icon: Users },
  ];

  return (
    <div className="border hidden lg:flex flex-col items-center scale-95 md:scale-100 h-full">
      <nav className="">
        <ul className="flex flex-col items-center w-60 shadow-sm gap-2 px-6 py-6">
          {navigation.map((item) => (
            <li
              className="bg-white border w-full rounded-lg shadow-md"
              key={item.to}
              style={{ letterSpacing: "0.5px" }}
            >
              <Navlink to={item.to} label={item.label} icon={item.icon} />
            </li>
          ))}
        </ul>
      </nav>

      <button
        className=" px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-buttonColor hover:bg-buttonColorHover mt-[85%] mb-auto"
        onClick={handleLogout}
      >
        {isPending ? (
          <SpinnerMini />
        ) : (
          <span className="inline-flex gap-1 items-center">
            <BiLogOut />
            Log out
          </span>
        )}
      </button>
    </div>
  );
};

export default Navigation;
