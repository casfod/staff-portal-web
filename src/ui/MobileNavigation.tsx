import Navigation from "./Navigation";
// import logo from "../assets/logo.webp";
import logo from "../assets/small-logo.webp";

const MobileNavigation = () => {
  return (
    <div className="fixed flex flex-col items-center top-[57px] left-0 right-0 z-40 bg-white shadow-lg min-h-screen w-[200px] sm:w-[230px]  pt-3 border-r ">
      {/* <div className="flex justify-center border border-gray-200 w-[170px] sm:w-[190px] px-3 py-1 rounded-md shadow-md">
        <img src={logo} alt="CASFOD" className="self-center w-full h-15" />
      </div> */}

      <div className="flex item-center justify-center p-1.5 rounded-full border-2 shadow-md">
        <img src={logo} alt="CASFOD" className="pt-0.5 h-11" />
      </div>

      <div className="absolute scale-[90%] sm:scale-[100%] top-[50px] sm:top-[64px] ">
        <Navigation />
      </div>
    </div>
  );
};

export default MobileNavigation;
