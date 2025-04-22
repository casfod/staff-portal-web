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
  Banknote,
} from "lucide-react";
import SpinnerMini from "./SpinnerMini";
import { useLogout } from "../features/authentication/authHooks/useLogout";
import { BiLogOut } from "react-icons/bi";
// import { Link } from "react-router-dom";
import { localStorageUser } from "../utils/localStorageUser";
import logo from "../assets/small-logo.webp";
import Button from "./Button";

const Navigation: React.FC = () => {
  const localStorageUserX = localStorageUser();
  const { logout, isPending } = useLogout();
  // const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  // const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  // const timeoutRef = useRef<number | null>(null);

  const handleLogout = async () => {
    logout();
  };

  // const handleMouseEnter = (itemToOpen: string) => {
  //   if (timeoutRef.current) clearTimeout(timeoutRef.current);
  //   setOpenDropdown(itemToOpen);
  // };

  // const handleMouseLeave = () => {
  //   timeoutRef.current = setTimeout(() => {
  //     setOpenDropdown(null);
  //   }, 300);
  // };

  // Define the navigation items
  const navigation = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/projects", label: "Projects", icon: FolderOpen },
    { to: "/concept-notes", label: "Concept Notes", icon: FileText },
    {
      to: "/purchase-requests",
      label: "Purchase Requests",
      icon: ShoppingCart,
      dropdown: [
        {
          to: "/purchase-requests/create-purchase-request",
          label: "New Request",
        },
      ],
    },
    {
      to: "/payment-requests",
      label: "Payment Requests",
      icon: ReceiptTextIcon,
    },
    { to: "/advance-requests", label: "Advance Requests", icon: Wallet },
    { to: "/travel-requests", label: "Travel Requests", icon: Plane },
    { to: "/expense-claims", label: "Expense Claims", icon: Banknote },
    { to: "/user-management", label: "User Management", icon: Users },
  ];

  // Filter navigation items based on user role
  const filteredNavigation = navigation.filter((item) => {
    // Check if localStorageUserX is null or undefined
    if (!localStorageUserX) {
      return true; // Include all items if no user is logged in
    }

    if (item.label === "User Management") {
      return (
        localStorageUserX.role === "SUPER-ADMIN" ||
        localStorageUserX.role === "ADMIN"
      );
    }
    return true; // Include all other items
  });

  return (
    <div
      className="flex flex-col gap-2 items-center w-fit pt-2 "
      style={{ fontFamily: "Cabin" }}
    >
      <div className="flex item-center justify-center bg-white py-2 px-2 border-2 rounded-full shadow-lg ">
        <img src={logo} alt="CASFOD" className="pt-0.5 h-10" />
      </div>

      <nav className="">
        <ul className="flex flex-col items-center w-60 shadow-sm gap-2.5 2xl:gap-3 px-6 ">
          {filteredNavigation.map((item) => (
            <li
              className="bg-white border w-full rounded-lg shadow-md relative"
              key={item.to}
              style={{ letterSpacing: "0.5px" }}
              // onMouseEnter={() => handleMouseEnter(item.to)}
              // onMouseLeave={handleMouseLeave}
            >
              <Navlink to={item.to} label={item.label} icon={item.icon} />
              {/* {item.dropdown && openDropdown === item.to && (
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
                          className="block px-4 py-2 text-xs xl:text-sm text-gray-600 hover:bg-gray-100"
                        >
                          {dropdownItem.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )} */}
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-[10%]">
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
