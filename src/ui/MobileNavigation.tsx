import Navigation from "./Navigation";

const MobileNavigation = () => {
  return (
    <div className="fixed flex flex-col items-center top-[57px] left-0 right-0 z-40 bg-white shadow-lg min-h-screen w-[230px]  pt-3 border-r ">
      <div className="absolute  top-[0px]">
        <Navigation />
      </div>
    </div>
  );
};

export default MobileNavigation;
