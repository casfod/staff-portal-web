import Navigation from "./Navigation";

const DesktopNavigation = () => {
  return (
    <div className="hidden xl:flex w-fit 2xl:max-w-[250px] max-h-[600px] overflow-x-hidden overflow-y-scroll border-r ">
      <Navigation />
    </div>
  );
};

export default DesktopNavigation;
