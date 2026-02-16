import { useParams } from "react-router-dom";
import NetworkErrorUI from "../../ui/NetworkErrorUI";
import Spinner from "../../ui/Spinner";
import { localStorageUser } from "../../utils/localStorageUser";
import { useUserById } from "../user/Hooks/useUsers";
import StaffDetails from "./StaffDetails";
import TextHeader from "../../ui/TextHeader";

const StaffInformationView = () => {
  const currentUser = localStorageUser();
  const { userId } = useParams();

  // If userId param exists, show that user, otherwise show current user
  const staffId = userId || currentUser?.id;

  const {
    data: userData,
    isLoading: isLoadingUser,
    isError,
    error,
  } = useUserById(staffId!);

  if (isLoadingUser) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner />
      </div>
    );
  }

  if (isError) {
    return <NetworkErrorUI error={error} />;
  }

  if (!userData?.data) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">No user data available</p>
      </div>
    );
  }

  const displayName = userId
    ? `${userData.data.first_name} ${userData.data.last_name}'s Information`
    : "My Staff Information";

  return (
    <div className="flex flex-col space-y-3 pb-80">
      <div className="sticky top-0 z-10 bg-[#F8F8F8] pt-4 md:pt-6 pb-3 space-y-1.5 border-b">
        <TextHeader>{displayName}</TextHeader>
      </div>
      <StaffDetails staffInfo={userData.data} />
    </div>
  );
};

export default StaffInformationView;
