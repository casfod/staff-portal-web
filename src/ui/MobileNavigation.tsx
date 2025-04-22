import Navigation from "./Navigation";

const MobileNavigation = () => {
  return (
    <div className="fixed flex flex-col items-center bg-[#f2f2f2] top-[57px] left-0 right-0 z-40 bg-white shadow-lg min-h-screen w-[200px]  pt-3 border-r ">
      <div className="absolute scale-[80%]  top-[-55px]">
        <Navigation />
      </div>
    </div>
  );
};

export default MobileNavigation;
