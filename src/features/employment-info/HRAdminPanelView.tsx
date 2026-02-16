import TextHeader from "../../ui/TextHeader";
import EmploymentInfoSettings from "./EmploymentInfoSettings";

const HRAdminPanelView = () => {
  return (
    <div className="flex flex-col space-y-3 pb-80">
      <div className="sticky top-0 z-10 bg-[#F8F8F8] pt-4 md:pt-6 pb-3 space-y-1.5 border-b">
        <div className="flex flex-col">
          <TextHeader>HR Administration</TextHeader>

          {/* Header */}
          <div>
            <p className="text-gray-600 mt-1">
              Manage human resources settings and configurations
            </p>
          </div>
        </div>
      </div>
      <EmploymentInfoSettings />
    </div>
  );
};

export default HRAdminPanelView;
