import Navigation from "./Navigation";

const MobileNavigation = () => {
  return (
    <div className="fixed flex flex-col items-center bg-[#f2f2f2] top-[57px] left-0 right-0 z-40 shadow-lg min-h-screen max-w-[210px]  pt-3 border-r ">
      <div className="absolute scale-[90%]  top-[-28px]">
        <Navigation />
      </div>
    </div>
  );
};

export default MobileNavigation;
