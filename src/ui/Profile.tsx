import RoleBadge from "./RoleBadge";
import profilePlaceHolder from "../assets/img/profile2.jpeg";
import { localStorageUser } from "../utils/localStorageUser";
import { useEffect, useRef, useState } from "react";
import useMediaQuery from "../hooks/useMediaQuery";

const Profile = () => {
  const [isDropDown, setIsDropdown] = useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);

  const currentUser = localStorageUser();
  const user = currentUser;

  const handleClickOutside = (event: MouseEvent) => {
    if (
      avatarRef.current &&
      !avatarRef.current.contains(event.target as Node)
    ) {
      setIsDropdown(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useMediaQuery("(min-width: 768px)", (matches) => {
    if (matches) {
      setIsDropdown(false);
    }
  });

  return (
    <div ref={avatarRef}>
      <div
        className="hidden md:block flex items-center space-x-4 text-[8px] md:text-xs 2xl:text-sm"
        style={{ fontFamily: "Sora" }}
      >
        <RoleBadge role={user.role}>
          <div className="flex items-center gap-1 font-extrabold tracking-[1.5px]">
            <span>{user.first_name.toUpperCase()}</span>
            <span>{user.last_name.toUpperCase()}</span>
          </div>
        </RoleBadge>
      </div>

      <div onClick={() => setIsDropdown(!isDropDown)} className="md:hidden">
        <img
          className="w-8 h-8 rounded-full"
          src={profilePlaceHolder}
          alt="Avatar Placeholder"
        />
      </div>

      {isDropDown && (
        <div className="absolute transform -translate-x-[146px] translate-y-4 flex items-center justify-center bg-white rounded-md border p-1 shadow-lg">
          <RoleBadge role={user.role}>
            <div className="w-[150px] font-extrabold tracking-[1.5px]">
              <p className="text-center text-[10px]">
                {`${user.first_name.toUpperCase()} ${user.last_name.toUpperCase()}`}
              </p>
            </div>
          </RoleBadge>
        </div>
      )}
    </div>
  );
};

export default Profile;
