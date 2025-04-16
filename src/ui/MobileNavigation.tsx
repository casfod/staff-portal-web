import Navigation from "./Navigation";
import logo from "../assets/logo.png";

const MobileNavigation = () => {
  return (
    <div className="fixed flex flex-col items-center top-[62px] left-0 right-0 z-40 bg-white shadow-lg min-h-screen w-[230px]  pt-3 border-r ">
      <div className="flex justify-center border border-gray-200 w-[170px] px-3 py-1 rounded-md shadow-md">
        <img src={logo} alt="CASFOD" className="self-center w-full h-15" />
      </div>

      <div className="absolute scale-[90%] top-[50px]">
        <Navigation />
      </div>
    </div>
  );
};

export default MobileNavigation;
