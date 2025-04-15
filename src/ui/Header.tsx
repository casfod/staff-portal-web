// import { Heart } from "lucide-react";
import logo from "../assets/logo.png";
// import { useUser } from "../features/user/userHooks/useUser";
import { localStorageUser } from "../utils/localStorageUser";
import RoleBadge from "./RoleBadge";

export function Header() {
  // const { user } = use();

  const localStorageUserX = localStorageUser();
  // const { data, isLoading } = useUser(localStorageUserX.id);

  const user = localStorageUserX;
  // const user = localStorageUserX;
  // const user = data?.data;

  return (
    <header className="border-b bg-white shadow-sm py-1 mx-auto pl-2  md:pr-8">
      <div className="">
        <div className="flex justify-between items-center h-16">
          <img className="w-[190px] h-auto" src={logo} alt="Casfod logo" />

          <span
            className="ml-2 font-extrabold text-primary"
            style={{ fontFamily: "Sora", letterSpacing: "5px" }}
          >
            CASFOD POSSIBILITY HUB
          </span>
          <div className="space-x-4 ">
            <div
              className="items-center flex flex-col lg:flex-row lg:gap-2 text-sm"
              style={{ fontFamily: "Sora", letterSpacing: "1px" }}
            >
              <RoleBadge role={user.role}>
                <div className=" flex items-center gap-1 lg:text-base text-center px-2 py-1 rounded-md">
                  <span className="font-extrabold text-sm tracking-[1.5px]">
                    {user?.first_name.toUpperCase()}
                  </span>

                  <span className="font-extrabold text-sm tracking-[1.5px]">
                    {user?.last_name.toUpperCase()}
                  </span>
                </div>
              </RoleBadge>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
