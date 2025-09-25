import React, { useState, useRef } from "react";
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
  Banknote,
} from "lucide-react";
import SpinnerMini from "./SpinnerMini";
import { useLogout } from "../features/authentication/authHooks/useLogout";
import { BiLogOut } from "react-icons/bi";
import { Link } from "react-router-dom";
import { localStorageUser } from "../utils/localStorageUser";
import logo from "../assets/small-logo.webp";
import Button from "./Button";

const Navigation: React.FC = () => {
  const currentUser = localStorageUser();
  const { logout, isPending } = useLogout();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const handleLogout = async () => {
    logout();
  };

  const handleMouseEnter = (itemToOpen: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpenDropdown(itemToOpen);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setOpenDropdown(null);
    }, 300);
  };

  // Define the navigation items
  const navigation = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/projects", label: "Projects", icon: FolderOpen },
    { to: "/concept-notes", label: "Concept Notes", icon: FileText },
    {
      to: "/purchase-requests",
      label: "Purchase Requests",
      icon: ShoppingCart,
      // dropdown: [
      //   {
      //     to: "/purchase-requests/create-purchase-request",
      //     label: "New Request",
      //   },
      // ],
    },
    {
      to: "/payment-requests",
      label: "Payment Requests",
      icon: ReceiptTextIcon,
    },
    { to: "/advance-requests", label: "Advance Requests", icon: Wallet },
    { to: "/travel-requests", label: "Travel Requests", icon: Plane },
    { to: "/expense-claims", label: "Expense Claims", icon: Banknote },
    {
      to: "/procurement",
      label: "Procurement",
      icon: Banknote,
      dropdown: [
        { to: "/procurement/vendor-management", label: "Vendor Management" },
        { to: "/procurement/rfq", label: "RFQ" },
        { to: "/procurement/purchase-order", label: "Purchase Order" },
        { to: "/procurement/goods-received", label: "Goods Received" },
      ],
    },
    { to: "/user-management", label: "User Management", icon: Users },
  ];

  // Filter navigation items based on user role
  const filteredNavigation = navigation.filter((item) => {
    if (!currentUser) {
      return true;
    }

    // User Management - Only for SUPER-ADMIN and ADMIN
    if (item.label === "User Management") {
      return currentUser.role === "SUPER-ADMIN" || currentUser.role === "ADMIN";
    }

    // Procurement - Show if user has any procurement permission or is SUPER-ADMIN
    if (item.label === "Procurement") {
      // SUPER-ADMIN always has access to procurement
      if (currentUser.role === "SUPER-ADMIN") {
        return true;
      }

      // Check if user has any procurement permissions
      const hasProcurementPermission =
        currentUser.procurementRole && currentUser.procurementRole.canView;

      // const hasProcurementPermission =
      //   currentUser.procurementRole &&
      //   (currentUser.procurementRole.canCreate ||
      //     currentUser.procurementRole.canView ||
      //     currentUser.procurementRole.canUpdate ||
      //     currentUser.procurementRole.canDelete);

      return hasProcurementPermission;
    }

    return true;
  });

  return (
    <div
      className="flex flex-col gap-1.5 xl:gap-2 items-center w-fit pt-2 relative"
      style={{ fontFamily: "Cabin" }}
    >
      <div className="flex item-center justify-center h-11 xl:h-12 w-11 xl:w-12 bg-white py-1.5 px-1.5 border-2 rounded-full shadow-lg z-50">
        <img src={logo} alt="CASFOD" className="pt-0.5" />
      </div>

      <nav className="w-full">
        <ul className="flex flex-col items-center w-60 shadow-sm gap-2 2xl:gap-3 px-6">
          {filteredNavigation.map((item) => (
            <li
              className="bg-white border w-full rounded-lg shadow-md relative"
              key={item.to}
              style={{ letterSpacing: "0.5px" }}
              onMouseEnter={() => handleMouseEnter(item.to)}
              onMouseLeave={handleMouseLeave}
            >
              <Navlink to={item.to} label={item.label} icon={item.icon} />
              {item.dropdown && openDropdown === item.to && (
                <div
                  className="absolute left-full top-0 ml-2 bg-white border rounded-lg shadow-md w-48 z-50"
                  onMouseEnter={() => handleMouseEnter(item.to)}
                  onMouseLeave={handleMouseLeave}
                >
                  <ul>
                    {item.dropdown.map((dropdownItem) => (
                      <li key={dropdownItem.to}>
                        <Link
                          to={dropdownItem.to}
                          className="block border border-b px-4 py-2 text-xs xl:text-sm hover:bg-gray-100 transition-colors duration-200"
                          onClick={() => setOpenDropdown(null)}
                        >
                          {dropdownItem.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-[5%] xl:mt-[10%] z-10">
        <Button onClick={handleLogout}>
          {isPending ? (
            <SpinnerMini />
          ) : (
            <span className="inline-flex gap-1 items-center">
              <BiLogOut />
              Log out
            </span>
          )}
        </Button>
      </div>
    </div>
  );
};

export default Navigation;
