import { useNavigation } from "../contexts/NavigationContext";
import Navigation from "./Navigation";

const DesktopNavigation = () => {
  const { isDesktopOpen } = useNavigation();

  return (
    <>
      {isDesktopOpen && (
        <div className="hidden xl:flex w-fit 2xl:max-w-[250px] max-h-fit overflow-x-hidden overflow-y-scroll border-r ">
          <Navigation />
        </div>
      )}
    </>
  );
};

export default DesktopNavigation;
