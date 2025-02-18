import { useAuth } from "../contexts/AuthContext";
// import { Heart } from "lucide-react";
import logo from "../assets/logo.png";

export function Header() {
  const { user } = useAuth();

  return (
    <header className="border-b bg-white shadow-sm py-1">
      <div className="mx-auto px-4 sm:px-6 lg:px-5">
        <div className="flex justify-between items-center h-16">
          <img className="w-[190px] h-auto" src={logo} alt="Casfod logo" />

          <span className="ml-2 text-2xl  font-semibold text-gray-900">
            STAFF PORTAL
          </span>
          <div className="flex items-center space-x-4 lg:mr-3">
            <div className="flex flex-col lg:flex-row lg:gap-2 text-sm lg:text-base">
              <p className="text-gray-900 font-medium">
                {user?.name.toUpperCase()}
              </p>
              <div className="bg-secondary text-center px-2 rounded-md">
                <p className="text-gray-50">{user?.role}</p>
              </div>
            </div>
            {/* <button
              onClick={logout}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 hover:text-gray-700 focus:outline-none transition"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </button> */}
          </div>
        </div>
      </div>
    </header>
  );
}
