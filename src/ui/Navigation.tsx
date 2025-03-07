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
} from "lucide-react";
import SpinnerMini from "./SpinnerMini";
import { useLogout } from "../features/authentication/authHooks/useLogout";
import { BiLogOut } from "react-icons/bi";
import { Link } from "react-router-dom";

const Navigation: React.FC = () => {
  const { logout, isPending } = useLogout();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const handleLogout = async () => {
    await logout();
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

  const navigation = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/projects", label: "Projects", icon: FolderOpen },
    { to: "/concept-notes", label: "Concept Notes", icon: FileText },
    {
      to: "/purchase-requests",
      label: "Purchase Requests",
      icon: ShoppingCart,
      dropdown: [{ to: "/purchase-requests/request", label: "New Request" }],
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
      <nav>
        <ul className="flex flex-col items-center w-60 shadow-sm gap-2 px-6 py-6">
          {navigation.map((item) => (
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
                  className="absolute left-full top-0 ml-2 bg-white border rounded-lg shadow-md w-48"
                  onMouseEnter={() => handleMouseEnter(item.to)}
                  onMouseLeave={handleMouseLeave}
                >
                  <ul>
                    {item.dropdown.map((dropdownItem) => (
                      <li key={dropdownItem.to}>
                        <Link
                          to={dropdownItem.to}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
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

      <button
        className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-buttonColor hover:bg-buttonColorHover mt-[70%] mb-auto"
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
