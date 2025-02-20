// import { Heart } from "lucide-react";
import logo from "../assets/logo.png";
// import { useUser } from "../features/user/userHooks/useUser";
import { localStorageUser } from "../utils/localStorageUser";

export function Header() {
  // const { user } = use();

  const localStorageUserX = localStorageUser();
  // const { data, isLoading } = useUser(localStorageUserX.id);

  const user = localStorageUserX;
  // const user = localStorageUserX;
  // const user = data?.data;

  return (
    <header className="border-b bg-white shadow-sm py-1">
      <div className="mx-auto px-4 sm:px-6 lg:px-4">
        <div className="flex justify-between items-center h-16">
          <img className="w-[190px] h-auto" src={logo} alt="Casfod logo" />

          <span
            className="ml-2 text-xl  font-extrabold text-primary"
            style={{ fontFamily: "Lato", letterSpacing: "2px" }}
          >
            STAFF PORTAL
          </span>
          <div className="space-x-4 lg:mr-3">
            <div className="items-center flex flex-col lg:flex-row lg:gap-2 text-sm lg:text-base">
              <p className="inline-flex gap-1 text-gray-800 font-medium">
                <span>{user?.first_name.toUpperCase()}</span>

                <span>{user?.last_name.toUpperCase()}</span>
              </p>
              <div className="bg-secondary text-sm text-center px-2 py-1 rounded-md">
                <p className="text-gray-50">{user?.role}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
