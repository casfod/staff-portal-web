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
          `w-full h-full flex items-center justify-center py-1 xl:py-1.5 px-2 transition-colors duration-200 rounded-lg 
      
         ${
           isActive
             ? "text-gray-50  bg-gradient-to-br from-buttonColor to-[#08527A]"
             : "  hover:text-gray-50 hover:bg-[#0077b6] hover:bg-opacity-[90%]"
         }
          `
        }
        style={{ lineHeight: "24px", fontWeight: "500" }}
      >
        <Icon className="mr-2 h-4 2xl:h-5 w-5" />
        <span className="w-full tracking-[0.8px] text-xs lg:text-sm">
          {label}
        </span>
      </NavLink>
    </div>
  );
};

export default Navlink;
