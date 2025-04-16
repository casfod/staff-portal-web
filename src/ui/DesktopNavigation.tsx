import Navigation from "./Navigation";

const DesktopNavigation = () => {
  return (
    <div className="hidden xl:flex max-w-[220px] 2xl:max-w-[250px] max-h-[600px] overflow-x-hidden overflow-y-scroll">
      <Navigation />
    </div>
  );
};

export default DesktopNavigation;
