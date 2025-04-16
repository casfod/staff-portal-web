import Navigation from "./Navigation";
import logo from "../assets/logo.png";

const MobileNavigation = () => {
  return (
    <div className="fixed flex flex-col items-center top-[58px] left-0 right-0 z-40 bg-white shadow-lg min-h-screen w-fit pt-3">
      <div className="flex justify-center border border-gray-200 px-3 py-1 rounded-md shadow-md">
        <img src={logo} alt="CASFOD" className="self-center w-full h-16" />
      </div>

      <Navigation />
    </div>
  );
};

export default MobileNavigation;
