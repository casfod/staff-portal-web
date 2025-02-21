import { NavLink } from "react-router-dom";
import { LucideIcon } from "lucide-react";

interface NavLinkProps {
  to: string;
  label: string;
  icon: LucideIcon;
}

const Navlink: React.FC<NavLinkProps> = ({ to, label, icon: Icon }) => {
  // const location = useLocation();

  // const isDashboard = location.pathname === "dashboard";

  return (
    <div className="h-full">
      <NavLink
        to={to}
        className={({ isActive }) =>
          `w-full h-full flex items-center justify-center py-1 px-2 transition-colors duration-200 rounded-lg 
      
         ${
           isActive
             ? "text-gray-50  bg-buttonColor"
             : "text-gray-700 hover:text-gray-50 hover:bg-buttonColor hover:bg-opacity-75"
         }
          `
        }
        style={{ lineHeight: "24px", fontWeight: "500" }}
      >
        <Icon className="mr-2 h-7 w-7" />
        <span className="w-full text-xs md:text-base">{label}</span>
      </NavLink>
    </div>
  );
};

export default Navlink;
