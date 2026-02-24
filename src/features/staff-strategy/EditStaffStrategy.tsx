import { List } from "lucide-react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import { RootState } from "../../store/store";
import { useStaffStrategy } from "./Hooks/useStaffStrategy";
import NetworkErrorUI from "../../ui/NetworkErrorUI";
import Spinner from "../../ui/Spinner";
import { DataStateContainer } from "../../ui/DataStateContainer";
import TextHeader from "../../ui/TextHeader";
import Button from "../../ui/Button";
import FormEditStaffStrategy from "./FormEditStaffStrategy";

const EditStaffStrategy = () => {
  const navigate = useNavigate();
  const { requestId } = useParams();

  // Data fetching
  const { data: remoteData, isLoading, isError } = useStaffStrategy(requestId!);

  const staffStrategy = useSelector(
    (state: RootState) => state.staffStrategy?.staffStrategy
  );

  // Redirect logic
  useEffect(() => {
    if (!requestId || (!isLoading && !remoteData && !staffStrategy)) {
      navigate("/staff-strategy");
    }
  }, [remoteData, staffStrategy, requestId, navigate, isLoading]);

  const requestData = remoteData?.data || staffStrategy;

  return (
    <div className="flex flex-col space-y-3 pb-80">
      <div className="sticky top-0 z-10 bg-[#F8F8F8] pt-4 md:pt-6 pb-3 space-y-1.5 border-b">
        <div className="flex justify-between items-center">
          <TextHeader>Edit Staff Strategy</TextHeader>
          <Button onClick={() => navigate("/staff-strategy")}>
            <List className="h-4 w-4 mr-1 md:mr-2" />
            List
          </Button>
        </div>
      </div>

      <DataStateContainer
        isLoading={isLoading}
        isError={isError}
        data={requestData}
        errorComponent={<NetworkErrorUI />}
        loadingComponent={<Spinner />}
        emptyComponent={<div>Staff Strategy not found</div>}
      >
        <div className="border w-full rounded-lg">
          <div className="bg-white bg-opacity-90 py-4 md:py-6 lg:py-10 px-2 md:px-6 lg:px-12 w-full rounded-lg">
            <FormEditStaffStrategy staffStrategy={requestData} />
          </div>
        </div>
      </DataStateContainer>
    </div>
  );
};

export default EditStaffStrategy;
